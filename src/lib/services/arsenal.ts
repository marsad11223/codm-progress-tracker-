import { cache } from "react";
import { countActive, getWeaponDetail, queryWeapons, type WeaponListFilter } from "@/lib/data/weapons";
import { prisma, withRetry } from "@/lib/db/prisma";
import { categoriesForFilter } from "@/lib/format";
import { LOCAL_USER_ID } from "@/lib/constants";
import type { WeaponCategory, WeaponDetailDTO, WeaponDTO } from "@/types";

export type ArsenalQuery = {
  search: string;
  category: string;
  status: "all" | "not-started" | "in-progress" | "gold";
  difficulty: "all" | "unrated" | "1-25" | "26-50" | "51-75" | "76-100";
  sort: "progress" | "difficulty" | "alpha" | "updated";
};

export type ArsenalResult = {
  weapons: WeaponDTO[];
  empty: "none" | "catalogue" | "category" | "filters";
};

const DIFFICULTY_BANDS: Record<
  Exclude<ArsenalQuery["difficulty"], "all" | "unrated">,
  { min: number; max: number }
> = {
  "1-25": { min: 1, max: 25 },
  "26-50": { min: 26, max: 50 },
  "51-75": { min: 51, max: 75 },
  "76-100": { min: 76, max: 100 },
};

function activityTime(weapon: WeaponDTO): number {
  const stamp = weapon.progressUpdatedAt ?? weapon.updatedAt;
  const parsed = Date.parse(stamp);
  return Number.isNaN(parsed) ? 0 : parsed;
}

function sortWeapons(weapons: WeaponDTO[], sort: ArsenalQuery["sort"]): WeaponDTO[] {
  const rows = [...weapons];
  rows.sort((a, b) => {
    if (sort === "alpha") return a.name.localeCompare(b.name);
    if (sort === "updated") {
      const delta = activityTime(b) - activityTime(a);
      return delta !== 0 ? delta : a.name.localeCompare(b.name);
    }
    if (sort === "difficulty") {
      if (a.difficultyScore == null && b.difficultyScore == null) {
        return a.name.localeCompare(b.name);
      }
      if (a.difficultyScore == null) return 1;
      if (b.difficultyScore == null) return -1;
      if (a.difficultyScore !== b.difficultyScore) {
        return b.difficultyScore - a.difficultyScore;
      }
      return a.name.localeCompare(b.name);
    }
    if (a.progressPercentage !== b.progressPercentage) {
      return b.progressPercentage - a.progressPercentage;
    }
    return a.name.localeCompare(b.name);
  });
  return rows;
}

export function listArsenal(query: ArsenalQuery): Promise<ArsenalResult> {
  return withRetry(() => readArsenal(query));
}

async function readArsenal(query: ArsenalQuery): Promise<ArsenalResult> {
  const categories = categoriesForFilter(query.category);
  const catalogueCount = await countActive(prisma);
  if (catalogueCount === 0) {
    return { weapons: [], empty: "catalogue" };
  }
  if (categories) {
    const categoryCount = await countActive(
      prisma,
      categories as WeaponCategory[],
    );
    if (categoryCount === 0) {
      return { weapons: [], empty: "category" };
    }
  }

  const filter: WeaponListFilter = {
    search: query.search.trim() || undefined,
    categories: categories as WeaponCategory[] | null,
    status: query.status,
    difficulty:
      query.difficulty === "unrated"
        ? "unrated"
        : query.difficulty === "all"
          ? "all"
          : DIFFICULTY_BANDS[query.difficulty],
  };
  const weapons = sortWeapons(
    await queryWeapons(prisma, LOCAL_USER_ID, filter),
    query.sort,
  );
  return {
    weapons,
    empty: weapons.length === 0 ? "filters" : "none",
  };
}

export const getWeaponPage = cache(
  (slug: string): Promise<WeaponDetailDTO | null> => {
    return withRetry(() => readWeaponPage(slug));
  },
);

async function readWeaponPage(
  slug: string,
): Promise<WeaponDetailDTO | null> {
  return getWeaponDetail(prisma, LOCAL_USER_ID, { slug });
}
