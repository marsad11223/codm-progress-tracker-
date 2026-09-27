import type { Db } from "@/lib/db/prisma";
import { toCamoDTO, sortCamos } from "@/lib/data/mappers";
import type { CamoDTO } from "@/types";

export async function listCamosForWeapon(
  db: Db,
  userId: string,
  weaponId: string,
): Promise<CamoDTO[]> {
  const [camos, progress] = await Promise.all([
    db.camo.findMany({
      relationLoadStrategy: "join",
      where: { weaponId },
      include: {
        challenges: {
          orderBy: { sortOrder: "asc" },
          include: { progress: { where: { userId } } },
        },
      },
    }),
    db.userWeaponProgress.findUnique({
      where: { userId_weaponId: { userId, weaponId } },
    }),
  ]);
  return sortCamos(
    camos.map((camo) => toCamoDTO(camo, progress?.goldUnlocked ?? false)),
  );
}

export async function setGoldTarget(
  db: Db,
  weaponId: string,
  target: number,
): Promise<void> {
  await db.camo.updateMany({
    where: { weaponId, category: "GOLD" },
    data: { target },
  });
}
