import type { Prisma } from "@prisma/client";
import type {
  CamoCategory,
  CamoDTO,
  ChallengeDTO,
  ChallengeType,
  WeaponCategory,
  WeaponDTO,
} from "@/types";

export function readReasons(value: Prisma.JsonValue): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === "string");
}

type ProgressRow = {
  progressPercentage: number;
  goldUnlocked: boolean;
  diamondTracked: boolean;
  diamondMatches: number;
  diamondUnlocked: boolean;
  startedAt: Date | null;
  completedAt: Date | null;
  updatedAt: Date;
};

export type WeaponRow = {
  id: string;
  name: string;
  slug: string;
  category: WeaponCategory;
  imageUrl: string | null;
  releaseSeason: string | null;
  difficultyScore: number | null;
  difficultyReasons: Prisma.JsonValue;
  active: boolean;
  updatedAt: Date;
  progress: ProgressRow[];
};

type ChallengeRow = {
  id: string;
  description: string;
  target: number;
  challengeType: ChallengeType;
  targetVerified: boolean;
  sortOrder: number;
  progress: {
    currentValue: number;
    targetValue: number;
    completed: boolean;
  }[];
};

export type CamoRow = {
  id: string;
  weaponId: string;
  category: CamoCategory;
  name: string;
  requirement: string;
  target: number;
  imageUrl: string | null;
  sortOrder: number;
  challenges: ChallengeRow[];
};

export function toWeaponDTO(weapon: WeaponRow): WeaponDTO {
  const progress = weapon.progress[0];
  return {
    id: weapon.id,
    name: weapon.name,
    slug: weapon.slug,
    category: weapon.category,
    imageUrl: weapon.imageUrl,
    releaseSeason: weapon.releaseSeason,
    difficultyScore: weapon.difficultyScore,
    difficultyReasons: readReasons(weapon.difficultyReasons),
    active: weapon.active,
    updatedAt: weapon.updatedAt.toISOString(),
    progressPercentage: progress?.progressPercentage ?? 0,
    goldUnlocked: progress?.goldUnlocked ?? false,
    diamondTracked: progress?.diamondTracked ?? false,
    diamondMatches: progress?.diamondMatches ?? 0,
    diamondUnlocked: progress?.diamondUnlocked ?? false,
    startedAt: progress?.startedAt?.toISOString() ?? null,
    completedAt: progress?.completedAt?.toISOString() ?? null,
    progressUpdatedAt: progress?.updatedAt.toISOString() ?? null,
  };
}

export function toChallengeDTO(challenge: ChallengeRow): ChallengeDTO {
  const progress = challenge.progress[0];
  return {
    id: challenge.id,
    description: challenge.description,
    target: challenge.target,
    challengeType: challenge.challengeType,
    targetVerified: challenge.targetVerified,
    sortOrder: challenge.sortOrder,
    completed: progress?.completed ?? false,
    currentValue: progress?.currentValue ?? 0,
    targetValue: progress?.targetValue ?? challenge.target,
  };
}

export function toCamoDTO(camo: CamoRow, goldUnlocked: boolean): CamoDTO {
  const challenges = [...camo.challenges]
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map(toChallengeDTO);
  const complete =
    camo.category === "GOLD"
      ? goldUnlocked
      : challenges.length > 0 && challenges.every((challenge) => challenge.completed);
  return {
    id: camo.id,
    weaponId: camo.weaponId,
    category: camo.category,
    name: camo.name,
    requirement: camo.requirement,
    target: camo.target,
    imageUrl: camo.imageUrl,
    sortOrder: camo.sortOrder,
    complete,
    challenges,
  };
}

export function sortCamos(camos: CamoDTO[]): CamoDTO[] {
  return [...camos].sort((a, b) => {
    if (a.sortOrder !== b.sortOrder) return a.sortOrder - b.sortOrder;
    const aPattern = a.challenges[0]?.sortOrder ?? 0;
    const bPattern = b.challenges[0]?.sortOrder ?? 0;
    if (aPattern !== bPattern) return aPattern - bPattern;
    return a.name.localeCompare(b.name);
  });
}
