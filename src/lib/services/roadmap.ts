import { replaceGrindOrder, listGrind } from "@/lib/data/grind-order";
import { listWeapons } from "@/lib/data/weapons";
import { prisma, runTransaction, withRetry } from "@/lib/db/prisma";
import { AppError } from "@/lib/app-error";
import { LOCAL_USER_ID } from "@/lib/constants";
import type { RoadmapItem, WeaponDTO } from "@/types";

export function getRoadmap(): Promise<{
  ordered: RoadmapItem[];
  tray: WeaponDTO[];
}> {
  return withRetry(readRoadmap);
}

async function readRoadmap(): Promise<{
  ordered: RoadmapItem[];
  tray: WeaponDTO[];
}> {
  const [ordered, weapons] = await Promise.all([
    listGrind(prisma, LOCAL_USER_ID),
    listWeapons(prisma, LOCAL_USER_ID),
  ]);
  const listed = new Set(ordered.map((entry) => entry.weapon.id));
  const tray = weapons
    .filter((weapon) => !listed.has(weapon.id))
    .sort((a, b) => a.name.localeCompare(b.name));
  return { ordered, tray };
}

export async function saveGrindOrder(weaponIds: string[]): Promise<void> {
  const unique = new Set(weaponIds);
  if (unique.size !== weaponIds.length) {
    throw new AppError("A weapon can only appear once on the roadmap.");
  }
  const weapons = await listWeapons(prisma, LOCAL_USER_ID);
  const known = new Set(weapons.map((weapon) => weapon.id));
  for (const weaponId of weaponIds) {
    if (!known.has(weaponId)) {
      throw new AppError("That weapon is not in the active catalogue.");
    }
  }
  await runTransaction(async (db) => {
    await replaceGrindOrder(db, LOCAL_USER_ID, weaponIds);
  });
}

export async function promoteWeaponToFirst(weaponId: string): Promise<void> {
  const weapon = await prisma.weapon.findFirst({
    where: { id: weaponId, active: true },
    select: { id: true },
  });
  if (!weapon) {
    throw new AppError("That weapon is not in the active catalogue.");
  }
  const ordered = await prisma.grindOrder.findMany({
    where: { userId: LOCAL_USER_ID },
    orderBy: { position: "asc" },
    select: { weaponId: true },
  });
  const ids = ordered
    .map((entry) => entry.weaponId)
    .filter((id) => id !== weaponId);
  ids.unshift(weaponId);
  await runTransaction(async (db) => {
    await replaceGrindOrder(db, LOCAL_USER_ID, ids);
  });
}
