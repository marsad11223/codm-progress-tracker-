import { setGoldTarget } from "@/lib/data/camos";
import {
  findChallenge,
  listChallengeState,
  listChallengesInCategory,
} from "@/lib/data/challenges";
import {
  findWeaponProgress,
  updateDiamondProgress,
  upsertChallengeProgress,
  upsertWeaponProgress,
} from "@/lib/data/progress";
import { runTransaction, type Db } from "@/lib/db/prisma";
import { AppError } from "@/lib/app-error";
import { DIAMOND_MATCH_TARGET } from "@/lib/constants";
import { clampPercent, roundHalfUp } from "@/lib/format";
import type { CamoCategory } from "@/types";

export type RecomputedProgress = {
  progressPercentage: number;
  goldUnlocked: boolean;
};

export async function recomputeWeaponProgress(
  db: Db,
  userId: string,
  weaponId: string,
  now = new Date(),
): Promise<RecomputedProgress> {
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
  const diamondUnlocked =
    goldUnlocked &&
    (existing?.diamondTracked ?? false) &&
    (existing?.diamondMatches ?? 0) >= DIAMOND_MATCH_TARGET;

  await upsertWeaponProgress(db, {
    userId,
    weaponId,
    progressPercentage,
    goldUnlocked,
    diamondUnlocked,
    startedAt,
    completedAt,
  });

  return { progressPercentage, goldUnlocked };
}

export async function toggleChallenge(input: {
  userId: string;
  challengeId: string;
  completed: boolean;
}): Promise<void> {
  await runTransaction(async (db) => {
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
    await recomputeWeaponProgress(db, input.userId, challenge.weaponId, now);
  });
}

export async function setCamoCategoryCompleted(input: {
  userId: string;
  weaponId: string;
  category: CamoCategory;
  completed: boolean;
}): Promise<void> {
  if (input.category === "GOLD") {
    throw new AppError("Gold fills itself when every base challenge is done.");
  }
  await runTransaction(async (db) => {
    const challenges = await listChallengesInCategory(
      db,
      input.weaponId,
      input.category,
    );
    if (challenges.length === 0) {
      throw new AppError("That camo category has no challenges.");
    }
    const ids = challenges.map((challenge) => challenge.id);
    await db.userChallengeProgress.deleteMany({
      where: { userId: input.userId, challengeId: { in: ids } },
    });
    await db.userChallengeProgress.createMany({
      data: challenges.map((challenge) => ({
        userId: input.userId,
        challengeId: challenge.id,
        completed: input.completed,
        currentValue: input.completed ? challenge.target : 0,
        targetValue: challenge.target,
      })),
    });
    await recomputeWeaponProgress(db, input.userId, input.weaponId);
  }, { timeout: 20_000 });
}

function diamondState(goldUnlocked: boolean, tracked: boolean, matches: number) {
  const clamped = Math.min(DIAMOND_MATCH_TARGET, Math.max(0, Math.trunc(matches)));
  return {
    matches: clamped,
    unlocked: goldUnlocked && tracked && clamped >= DIAMOND_MATCH_TARGET,
  };
}

export async function setDiamondTracking(input: {
  userId: string;
  weaponId: string;
  tracked: boolean;
}): Promise<void> {
  await runTransaction(async (db) => {
    const weapon = await db.weapon.findFirst({
      where: { id: input.weaponId, active: true },
      select: { id: true },
    });
    if (!weapon) throw new AppError("Weapon not found.");
    const existing = await findWeaponProgress(db, input.userId, input.weaponId);
    const goldUnlocked = existing?.goldUnlocked ?? false;
    if (input.tracked && !goldUnlocked) {
      throw new AppError("Diamond tracking unlocks after Gold.");
    }
    const next = diamondState(
      goldUnlocked,
      input.tracked,
      existing?.diamondMatches ?? 0,
    );
    await updateDiamondProgress(db, {
      userId: input.userId,
      weaponId: input.weaponId,
      diamondTracked: input.tracked,
      diamondMatches: next.matches,
      diamondUnlocked: next.unlocked,
    });
  }, { timeout: 20_000 });
}

export async function setDiamondMatches(input: {
  userId: string;
  weaponId: string;
  matches: number;
}): Promise<void> {
  if (!Number.isFinite(input.matches)) {
    throw new AppError("Enter a match count.");
  }
  await runTransaction(async (db) => {
    const existing = await findWeaponProgress(db, input.userId, input.weaponId);
    if (!existing?.goldUnlocked) {
      throw new AppError("Finish Gold before logging Diamond matches.");
    }
    if (!existing.diamondTracked) {
      throw new AppError("Add this weapon to the Diamond tracker first.");
    }
    const next = diamondState(true, true, input.matches);
    await updateDiamondProgress(db, {
      userId: input.userId,
      weaponId: input.weaponId,
      diamondTracked: true,
      diamondMatches: next.matches,
      diamondUnlocked: next.unlocked,
    });
  }, { timeout: 20_000 });
}
