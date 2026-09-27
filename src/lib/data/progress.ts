import type { Db } from "@/lib/db/prisma";
import type { ChallengeProgressDTO, WeaponProgressDTO } from "@/types";

export async function upsertChallengeProgress(
  db: Db,
  input: {
    userId: string;
    challengeId: string;
    completed: boolean;
    currentValue: number;
    targetValue: number;
  },
): Promise<void> {
  await db.userChallengeProgress.upsert({
    where: {
      userId_challengeId: {
        userId: input.userId,
        challengeId: input.challengeId,
      },
    },
    create: input,
    update: {
      completed: input.completed,
      currentValue: input.currentValue,
      targetValue: input.targetValue,
    },
  });
}

export async function findWeaponProgress(
  db: Db,
  userId: string,
  weaponId: string,
): Promise<{
  progressPercentage: number;
  goldUnlocked: boolean;
  diamondTracked: boolean;
  diamondMatches: number;
  startedAt: Date | null;
  completedAt: Date | null;
} | null> {
  return db.userWeaponProgress.findUnique({
    where: { userId_weaponId: { userId, weaponId } },
    select: {
      progressPercentage: true,
      goldUnlocked: true,
      diamondTracked: true,
      diamondMatches: true,
      startedAt: true,
      completedAt: true,
    },
  });
}

export async function upsertWeaponProgress(
  db: Db,
  input: {
    userId: string;
    weaponId: string;
    progressPercentage: number;
    goldUnlocked: boolean;
    diamondUnlocked: boolean;
    startedAt: Date | null;
    completedAt: Date | null;
  },
): Promise<void> {
  await db.userWeaponProgress.upsert({
    where: {
      userId_weaponId: { userId: input.userId, weaponId: input.weaponId },
    },
    create: input,
    update: {
      progressPercentage: input.progressPercentage,
      goldUnlocked: input.goldUnlocked,
      diamondUnlocked: input.diamondUnlocked,
      startedAt: input.startedAt,
      completedAt: input.completedAt,
    },
  });
}

export async function updateDiamondProgress(
  db: Db,
  input: {
    userId: string;
    weaponId: string;
    diamondTracked: boolean;
    diamondMatches: number;
    diamondUnlocked: boolean;
  },
): Promise<void> {
  const existing = await findWeaponProgress(db, input.userId, input.weaponId);
  await db.userWeaponProgress.upsert({
    where: {
      userId_weaponId: { userId: input.userId, weaponId: input.weaponId },
    },
    create: {
      userId: input.userId,
      weaponId: input.weaponId,
      progressPercentage: existing?.progressPercentage ?? 0,
      goldUnlocked: existing?.goldUnlocked ?? false,
      startedAt: existing?.startedAt ?? null,
      completedAt: existing?.completedAt ?? null,
      diamondTracked: input.diamondTracked,
      diamondMatches: input.diamondMatches,
      diamondUnlocked: input.diamondUnlocked,
    },
    update: {
      diamondTracked: input.diamondTracked,
      diamondMatches: input.diamondMatches,
      diamondUnlocked: input.diamondUnlocked,
    },
  });
}

export async function listWeaponProgress(
  db: Db,
  userId: string,
): Promise<WeaponProgressDTO[]> {
  const rows = await db.userWeaponProgress.findMany({
    where: { userId },
  });
  return rows.map((row) => ({
    weaponId: row.weaponId,
    progressPercentage: row.progressPercentage,
    goldUnlocked: row.goldUnlocked,
    diamondTracked: row.diamondTracked,
    diamondMatches: row.diamondMatches,
    diamondUnlocked: row.diamondUnlocked,
    startedAt: row.startedAt?.toISOString() ?? null,
    completedAt: row.completedAt?.toISOString() ?? null,
    updatedAt: row.updatedAt.toISOString(),
  }));
}

export async function listChallengeProgress(
  db: Db,
  userId: string,
): Promise<ChallengeProgressDTO[]> {
  const rows = await db.userChallengeProgress.findMany({
    where: { userId },
    include: {
      challenge: {
        include: { weapon: true, camo: true },
      },
    },
  });
  return rows.map((row) => ({
    challengeId: row.challengeId,
    weaponId: row.challenge.weaponId,
    weaponSlug: row.challenge.weapon.slug,
    camoCategory: row.challenge.camo.category,
    camoName: row.challenge.camo.name,
    challengeSortOrder: row.challenge.sortOrder,
    currentValue: row.currentValue,
    targetValue: row.targetValue,
    completed: row.completed,
    updatedAt: row.updatedAt.toISOString(),
  }));
}

export async function deleteUserProgress(db: Db, userId: string): Promise<void> {
  await db.userChallengeProgress.deleteMany({ where: { userId } });
  await db.userWeaponProgress.deleteMany({ where: { userId } });
}
