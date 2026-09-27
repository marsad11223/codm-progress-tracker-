import type { Prisma, WeaponCategory } from "@prisma/client";
import type { Db } from "@/lib/db/prisma";
import { sortCamos, toCamoDTO, toWeaponDTO, type WeaponRow } from "@/lib/data/mappers";
import type { WeaponDetailDTO, WeaponDTO } from "@/types";

function progressFilter(userId: string) {
  return { where: { userId } };
}

export async function listWeapons(db: Db, userId: string): Promise<WeaponDTO[]> {
  const rows = await db.weapon.findMany({
    where: { active: true },
    include: { progress: progressFilter(userId) },
    orderBy: { name: "asc" },
  });
  return rows.map((row) => toWeaponDTO(row as WeaponRow));
}

export async function getWeaponBySlug(
  db: Db,
  userId: string,
  slug: string,
): Promise<WeaponDTO | null> {
  const row = await db.weapon.findFirst({
    where: { slug, active: true },
    include: { progress: progressFilter(userId) },
  });
  return row ? toWeaponDTO(row as WeaponRow) : null;
}

export async function countActive(
  db: Db,
  categories?: WeaponCategory[] | null,
): Promise<number> {
  return db.weapon.count({
    where: {
      active: true,
      ...(categories ? { category: { in: categories } } : {}),
    },
  });
}

export type WeaponListFilter = {
  search?: string;
  categories?: WeaponCategory[] | null;
  status?: "all" | "not-started" | "in-progress" | "gold";
  difficulty?: "all" | "unrated" | { min: number; max: number };
};

export async function queryWeapons(
  db: Db,
  userId: string,
  filter: WeaponListFilter,
): Promise<WeaponDTO[]> {
  const where: Prisma.WeaponWhereInput = { active: true };
  if (filter.categories && filter.categories.length > 0) {
    where.category = { in: filter.categories };
  }
  if (filter.search) {
    where.name = { contains: filter.search, mode: "insensitive" };
  }
  if (filter.difficulty === "unrated") {
    where.difficultyScore = null;
  } else if (filter.difficulty && filter.difficulty !== "all") {
    where.difficultyScore = {
      gte: filter.difficulty.min,
      lte: filter.difficulty.max,
    };
  }
  if (filter.status === "gold") {
    where.progress = { some: { userId, goldUnlocked: true } };
  } else if (filter.status === "in-progress") {
    where.progress = {
      some: {
        userId,
        goldUnlocked: false,
        OR: [{ progressPercentage: { gt: 0 } }, { startedAt: { not: null } }],
      },
    };
  } else if (filter.status === "not-started") {
    where.AND = [
      {
        OR: [
          { progress: { none: { userId } } },
          {
            progress: {
              some: {
                userId,
                goldUnlocked: false,
                progressPercentage: 0,
                startedAt: null,
              },
            },
          },
        ],
      },
    ];
  }

  const rows = await db.weapon.findMany({
    where,
    include: { progress: progressFilter(userId) },
  });
  return rows.map((row) => toWeaponDTO(row as WeaponRow));
}

export async function getWeaponDetail(
  db: Db,
  userId: string,
  where: { slug: string } | { id: string },
): Promise<WeaponDetailDTO | null> {
  const row = await db.weapon.findFirst({
    where: { ...where, active: true },
    include: {
      progress: progressFilter(userId),
      camos: {
        include: {
          challenges: {
            orderBy: { sortOrder: "asc" },
            include: { progress: progressFilter(userId) },
          },
        },
      },
    },
  });
  if (!row) return null;
  const weapon = toWeaponDTO(row as WeaponRow);
  const camos = sortCamos(
    row.camos.map((camo) => toCamoDTO(camo, weapon.goldUnlocked)),
  );
  return { ...weapon, camos };
}
