import { countUnverifiedWeapons } from "@/lib/data/challenges";
import { listWeapons } from "@/lib/data/weapons";
import { prisma, withRetry } from "@/lib/db/prisma";
import { LOCAL_USER_ID } from "@/lib/constants";
import { categoryLabel } from "@/lib/format";
import { WEAPON_CATEGORIES, type AnalyticsSnapshot } from "@/types";

export function getAnalytics(): Promise<AnalyticsSnapshot> {
  return withRetry(readAnalytics);
}

async function readAnalytics(): Promise<AnalyticsSnapshot> {
  const [weapons, unverifiedWeapons] = await Promise.all([
    listWeapons(prisma, LOCAL_USER_ID),
    countUnverifiedWeapons(prisma),
  ]);
  const buckets = [
    { label: "0%", count: 0 },
    { label: "1–49%", count: 0 },
    { label: "50–99%", count: 0 },
    { label: "100%", count: 0 },
  ];
  for (const weapon of weapons) {
    const value = weapon.progressPercentage;
    if (value <= 0) buckets[0]!.count += 1;
    else if (value < 50) buckets[1]!.count += 1;
    else if (value < 100) buckets[2]!.count += 1;
    else buckets[3]!.count += 1;
  }
  return {
    totalWeapons: weapons.length,
    categories: WEAPON_CATEGORIES.map((category) => {
      const rows = weapons.filter((weapon) => weapon.category === category);
      return {
        category,
        label: categoryLabel(category),
        active: rows.length,
        gold: rows.filter((weapon) => weapon.goldUnlocked).length,
      };
    }),
    buckets,
    unverifiedWeapons,
    started: weapons.filter((weapon) => weapon.startedAt != null).length,
    neverStarted: weapons.filter((weapon) => weapon.startedAt == null).length,
  };
}
