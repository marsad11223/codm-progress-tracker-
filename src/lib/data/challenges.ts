import type { Db } from "@/lib/db/prisma";

export type ChallengeRecord = {
  id: string;
  weaponId: string;
  target: number;
};

export type ChallengeState = {
  id: string;
  completed: boolean;
  currentValue: number;
};

export async function findChallenge(
  db: Db,
  challengeId: string,
): Promise<ChallengeRecord | null> {
  const row = await db.challenge.findUnique({
    where: { id: challengeId },
    select: { id: true, weaponId: true, target: true },
  });
  return row;
}

export async function listChallengeState(
  db: Db,
  userId: string,
  weaponId: string,
): Promise<ChallengeState[]> {
  const rows = await db.challenge.findMany({
    where: { weaponId },
    select: {
      id: true,
      progress: {
        where: { userId },
        select: { completed: true, currentValue: true },
      },
    },
  });
  return rows.map((row) => ({
    id: row.id,
    completed: row.progress[0]?.completed ?? false,
    currentValue: row.progress[0]?.currentValue ?? 0,
  }));
}

export async function countUnverifiedWeapons(db: Db): Promise<number> {
  return db.weapon.count({
    where: {
      active: true,
      challenges: { some: { targetVerified: false } },
    },
  });
}
