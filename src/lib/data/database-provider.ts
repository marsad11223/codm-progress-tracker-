import { prisma, type Db } from "@/lib/db/prisma";
import { listCamosForWeapon } from "@/lib/data/camos";
import {
  listChallengeProgress,
  listWeaponProgress,
} from "@/lib/data/progress";
import { getWeaponBySlug, listWeapons } from "@/lib/data/weapons";
import type {
  CamoDataProvider,
  ProgressDataProvider,
  WeaponDataProvider,
} from "@/lib/data/providers";
import { LOCAL_USER_ID } from "@/lib/constants";

export class DatabaseWeaponProvider implements WeaponDataProvider {
  constructor(
    private readonly userId = LOCAL_USER_ID,
    private readonly db: Db = prisma,
  ) {}

  listWeapons() {
    return listWeapons(this.db, this.userId);
  }

  getWeaponBySlug(slug: string) {
    return getWeaponBySlug(this.db, this.userId, slug);
  }
}

export class DatabaseCamoProvider implements CamoDataProvider {
  constructor(
    private readonly userId = LOCAL_USER_ID,
    private readonly db: Db = prisma,
  ) {}

  listCamosForWeapon(weaponId: string) {
    return listCamosForWeapon(this.db, this.userId, weaponId);
  }
}

export class DatabaseProgressProvider implements ProgressDataProvider {
  constructor(private readonly db: Db = prisma) {}

  listWeaponProgress(userId: string) {
    return listWeaponProgress(this.db, userId);
  }

  listChallengeProgress(userId: string) {
    return listChallengeProgress(this.db, userId);
  }
}

export const weaponProvider: WeaponDataProvider = new DatabaseWeaponProvider();
export const camoProvider: CamoDataProvider = new DatabaseCamoProvider();
export const progressProvider: ProgressDataProvider =
  new DatabaseProgressProvider();
