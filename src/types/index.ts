export const WEAPON_CATEGORIES = [
  "SMG",
  "AR",
  "LMG",
  "SNIPER",
  "MARKSMAN",
  "SHOTGUN",
  "PISTOL",
  "LAUNCHER",
  "MELEE",
] as const;

export type WeaponCategory = (typeof WEAPON_CATEGORIES)[number];

export const CAMO_CATEGORIES = [
  "SAND",
  "DRAGON",
  "SPLINTER",
  "TIGER",
  "JUNGLE",
  "REPTILE",
  "GOLD",
] as const;

export type CamoCategory = (typeof CAMO_CATEGORIES)[number];

export const CHALLENGE_TYPES = [
  "KILLS",
  "HEADSHOTS",
  "HIPFIRE",
  "LONGSHOT",
  "FIVE_ATTACHMENTS",
  "NO_ATTACHMENTS",
  "CROUCHED",
  "OTHER",
] as const;

export type ChallengeType = (typeof CHALLENGE_TYPES)[number];

export const CATEGORY_FILTERS = [
  { value: "all", label: "All" },
  { value: "smg", label: "SMGs" },
  { value: "ar", label: "ARs" },
  { value: "lmg", label: "LMGs" },
  { value: "sniper", label: "Snipers" },
  { value: "shotgun", label: "Shotguns" },
  { value: "pistol", label: "Pistols" },
  { value: "launcher", label: "Launchers" },
  { value: "melee", label: "Melee" },
] as const;

export type CategoryFilterValue = (typeof CATEGORY_FILTERS)[number]["value"];

export type WeaponDTO = {
  id: string;
  name: string;
  slug: string;
  category: WeaponCategory;
  imageUrl: string | null;
  releaseSeason: string | null;
  difficultyScore: number | null;
  difficultyReasons: string[];
  active: boolean;
  updatedAt: string;
  progressPercentage: number;
  goldUnlocked: boolean;
  diamondTracked: boolean;
  diamondMatches: number;
  diamondUnlocked: boolean;
  startedAt: string | null;
  completedAt: string | null;
  progressUpdatedAt: string | null;
};

export type ChallengeDTO = {
  id: string;
  description: string;
  target: number;
  challengeType: ChallengeType;
  targetVerified: boolean;
  sortOrder: number;
  completed: boolean;
  currentValue: number;
  targetValue: number;
};

export type CamoDTO = {
  id: string;
  weaponId: string;
  category: CamoCategory;
  name: string;
  requirement: string;
  target: number;
  imageUrl: string | null;
  sortOrder: number;
  complete: boolean;
  challenges: ChallengeDTO[];
};

export type WeaponDetailDTO = WeaponDTO & {
  camos: CamoDTO[];
};

export type WeaponProgressDTO = {
  weaponId: string;
  progressPercentage: number;
  goldUnlocked: boolean;
  diamondTracked: boolean;
  diamondMatches: number;
  diamondUnlocked: boolean;
  startedAt: string | null;
  completedAt: string | null;
  updatedAt: string;
};

export type ChallengeProgressDTO = {
  challengeId: string;
  weaponId: string;
  weaponSlug: string;
  camoCategory: CamoCategory;
  camoName: string;
  challengeSortOrder: number;
  currentValue: number;
  targetValue: number;
  completed: boolean;
  updatedAt: string;
};

export type GrindCandidate = {
  weapon: WeaponDTO;
  roadmapPosition: number | null;
};

export type NextBestGrind = {
  weapon: WeaponDTO;
  reasons: string[];
};

export type DashboardSummary = {
  totalWeapons: number;
  catalogueLabel: string;
  goldCount: number;
  remaining: number;
  completionPercent: number;
  averageGrind: number;
  currentGrind: WeaponDTO | null;
  currentGrindNote: string | null;
  recentlyCompleted: WeaponDTO[];
  nextBest: NextBestGrind | null;
  upNext: { weapon: WeaponDTO; pinned: boolean }[];
  weapons: WeaponDTO[];
};

export type AnalyticsCategoryRow = {
  category: WeaponCategory;
  label: string;
  active: number;
  gold: number;
};

export type AnalyticsSnapshot = {
  totalWeapons: number;
  categories: AnalyticsCategoryRow[];
  buckets: { label: string; count: number }[];
  unverifiedWeapons: number;
  started: number;
  neverStarted: number;
};

export type RoadmapItem = {
  weapon: WeaponDTO;
  position: number;
};

export type ExportChallenge = {
  weaponSlug: string;
  camoCategory: CamoCategory;
  camoName: string;
  challengeSortOrder: number;
  completed: boolean;
  currentValue: number;
  targetValue: number;
};

export type ExportFile = {
  schemaVersion: 1;
  exportedAt: string;
  userId: string;
  theme?: "dark" | "light";
  challengeProgress: ExportChallenge[];
  grindOrder: string[];
  diamondProgress?: {
    weaponSlug: string;
    tracked: boolean;
    matches: number;
  }[];
};

export type ActionResult<T = undefined> =
  | (T extends undefined ? { ok: true } : { ok: true; data: T })
  | { ok: false; error: string };
