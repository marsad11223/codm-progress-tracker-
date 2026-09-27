import type {
  CamoDTO,
  ChallengeProgressDTO,
  WeaponDTO,
  WeaponProgressDTO,
} from "@/types";

export interface WeaponDataProvider {
  listWeapons(): Promise<WeaponDTO[]>;
  getWeaponBySlug(slug: string): Promise<WeaponDTO | null>;
}

export interface CamoDataProvider {
  listCamosForWeapon(weaponId: string): Promise<CamoDTO[]>;
}

export interface ProgressDataProvider {
  listWeaponProgress(userId: string): Promise<WeaponProgressDTO[]>;
  listChallengeProgress(userId: string): Promise<ChallengeProgressDTO[]>;
}
