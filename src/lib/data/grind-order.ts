import type { Db } from "@/lib/db/prisma";
import { toWeaponDTO, type WeaponRow } from "@/lib/data/mappers";
import type { WeaponDTO } from "@/types";

export async function listGrind(
  db: Db,
  userId: string,
): Promise<{ weapon: WeaponDTO; position: number }[]> {
  const rows = await db.grindOrder.findMany({
    relationLoadStrategy: "join",
    where: { userId, weapon: { active: true } },
    orderBy: { position: "asc" },
    include: {
      weapon: { include: { progress: { where: { userId } } } },
    },
  });
  return rows.map((row) => ({
    position: row.position,
    weapon: toWeaponDTO(row.weapon as WeaponRow),
  }));
}

export async function replaceGrindOrder(
  db: Db,
  userId: string,
  weaponIds: string[],
): Promise<void> {
  await db.grindOrder.deleteMany({ where: { userId } });
  if (weaponIds.length === 0) return;
  await db.grindOrder.createMany({
    data: weaponIds.map((weaponId, index) => ({
      userId,
      weaponId,
      position: index + 1,
    })),
  });
}

export async function deleteGrindOrder(db: Db, userId: string): Promise<void> {
  await db.grindOrder.deleteMany({ where: { userId } });
}
