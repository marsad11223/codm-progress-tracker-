import { listGrind } from "@/lib/data/grind-order";
import { listWeapons } from "@/lib/data/weapons";
import { prisma, type Db } from "@/lib/db/prisma";
import { catalogueLabel, categoriesForFilter, roundHalfUp } from "@/lib/format";
import { pickNextBest } from "@/lib/services/recommendation";
import type { DashboardSummary, GrindCandidate, WeaponDTO } from "@/types";

function inFilter(weapon: WeaponDTO, category: string): boolean {
  const categories = categoriesForFilter(category);
  if (!categories) return true;
  return categories.includes(weapon.category);
}

export async function getDashboard(
  userId: string,
  category = "all",
  db: Db = prisma,
): Promise<DashboardSummary> {
  const [weapons, grind] = await Promise.all([
    listWeapons(db, userId),
    listGrind(db, userId),
  ]);
  const totalWeapons = weapons.length;
  const goldWeapons = weapons.filter((weapon) => weapon.goldUnlocked);
  const goldCount = goldWeapons.length;
  const remaining = totalWeapons - goldCount;
  const completionPercent =
    totalWeapons === 0 ? 0 : roundHalfUp((goldCount / totalWeapons) * 100);
  const averageGrind =
    totalWeapons === 0
      ? 0
      : weapons.reduce((sum, weapon) => sum + weapon.progressPercentage, 0) /
        totalWeapons;

  const positions = new Map(
    grind.map((entry) => [entry.weapon.id, entry.position]),
  );
  const candidates: GrindCandidate[] = weapons
    .filter((weapon) => inFilter(weapon, category))
    .map((weapon) => ({
      weapon,
      roadmapPosition: positions.get(weapon.id) ?? null,
    }));
  const nextBest = pickNextBest(candidates);

  const openOnRoadmap = grind.find((entry) => !entry.weapon.goldUnlocked);
  let currentGrind: WeaponDTO | null = null;
  let currentGrindNote: string | null = null;
  if (openOnRoadmap) {
    currentGrind = openOnRoadmap.weapon;
    currentGrindNote = "First open gun on your roadmap.";
  } else if (nextBest) {
    currentGrind = nextBest.weapon;
    currentGrindNote =
      grind.length === 0
        ? "The roadmap is empty, so this is the same pick as next best grind."
        : "Every gun on your roadmap is already Gold, so this matches next best grind.";
  }

  const recentlyCompleted = goldWeapons
    .slice()
    .sort((a, b) => {
      const aTime = a.completedAt ? Date.parse(a.completedAt) : 0;
      const bTime = b.completedAt ? Date.parse(b.completedAt) : 0;
      return bTime - aTime;
    })
    .slice(0, 5);

  return {
    totalWeapons,
    catalogueLabel: catalogueLabel(weapons.map((weapon) => weapon.category)),
    goldCount,
    remaining,
    completionPercent,
    averageGrind,
    currentGrind,
    currentGrindNote,
    recentlyCompleted,
    nextBest,
  };
}
