import { setGoldTarget } from "@/lib/data/camos";
import { findChallenge, listChallengeState } from "@/lib/data/challenges";
import {
  findWeaponProgress,
  upsertChallengeProgress,
  upsertWeaponProgress,
} from "@/lib/data/progress";
import { getWeaponDetail } from "@/lib/data/weapons";
import { runTransaction, type Db } from "@/lib/db/prisma";
import { AppError } from "@/lib/app-error";
import { clampPercent, roundHalfUp } from "@/lib/format";
import { getDashboard } from "@/lib/services/dashboard";
import type { DashboardSummary, WeaponDetailDTO } from "@/types";

export type ToggleResult = {
  weapon: WeaponDetailDTO;
  summary: DashboardSummary;
};

export async function recomputeWeaponProgress(
  db: Db,
  userId: string,
  weaponId: string,
  now = new Date(),
): Promise<WeaponDetailDTO> {
  const challenges = await listChallengeState(db, userId, weaponId);
  const total = challenges.length;
  const done = challenges.filter((challenge) => challenge.completed).length;
  const progressPercentage =
    total === 0 ? 0 : clampPercent(roundHalfUp((done / total) * 100));
  const goldUnlocked = total > 0 && done === total;
  const anyProgress = challenges.some(
    (challenge) => challenge.completed || challenge.currentValue > 0,
  );

  await setGoldTarget(db, weaponId, total);

  const existing = await findWeaponProgress(db, userId, weaponId);
  const startedAt = existing?.startedAt ?? (anyProgress ? now : null);
  const completedAt = goldUnlocked
    ? existing?.goldUnlocked
      ? (existing.completedAt ?? now)
      : now
    : null;

  await upsertWeaponProgress(db, {
    userId,
    weaponId,
    progressPercentage,
    goldUnlocked,
    startedAt,
    completedAt,
  });

  const weapon = await getWeaponDetail(db, userId, { id: weaponId });
  if (!weapon) {
    throw new AppError("Weapon not found.");
  }
  return weapon;
}

export async function toggleChallenge(input: {
  userId: string;
  challengeId: string;
  completed: boolean;
  category?: string;
}): Promise<ToggleResult> {
  return runTransaction(async (db) => {
    const challenge = await findChallenge(db, input.challengeId);
    if (!challenge) {
      throw new AppError("Challenge not found.");
    }
    const now = new Date();
    await upsertChallengeProgress(db, {
      userId: input.userId,
      challengeId: challenge.id,
      completed: input.completed,
      currentValue: input.completed ? challenge.target : 0,
      targetValue: challenge.target,
    });
    const weapon = await recomputeWeaponProgress(
      db,
      input.userId,
      challenge.weaponId,
      now,
    );
    const summary = await getDashboard(input.userId, input.category ?? "all", db);
    return { weapon, summary };
  });
}
