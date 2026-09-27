import type { CamoCategory, WeaponCategory } from "@/types";

const CATEGORY_LABELS: Record<WeaponCategory, string> = {
  SMG: "SMG",
  AR: "Assault rifle",
  LMG: "LMG",
  SNIPER: "Sniper",
  MARKSMAN: "Marksman",
  SHOTGUN: "Shotgun",
  PISTOL: "Pistol",
  LAUNCHER: "Launcher",
  MELEE: "Melee",
};

const CAMO_LABELS: Record<CamoCategory, string> = {
  SAND: "Sand",
  DRAGON: "Dragon",
  SPLINTER: "Splinter",
  TIGER: "Tiger",
  JUNGLE: "Jungle",
  REPTILE: "Reptile",
  GOLD: "Gold",
};

export function categoryLabel(category: WeaponCategory): string {
  return CATEGORY_LABELS[category];
}

export function camoLabel(category: CamoCategory): string {
  return CAMO_LABELS[category];
}

export function catalogueLabel(categories: WeaponCategory[]): string {
  const unique = [...new Set(categories)];
  if (unique.length === 0) return "No categories";
  if (unique.length === 1 && unique[0] === "SMG") return "SMGs";
  return unique.map((category) => categoryLabel(category)).join(", ");
}

export function difficultyLabel(score: number | null): string {
  return score == null ? "Unrated" : String(score);
}

export function roundHalfUp(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.round(value);
}

export function clampPercent(value: number): number {
  return Math.min(100, Math.max(0, roundHalfUp(value)));
}

export function formatMean(value: number): string {
  if (!Number.isFinite(value)) return "0.0";
  return (Math.round(value * 10) / 10).toFixed(1);
}

export function formatRelative(iso: string | null): string {
  if (!iso) return "Not updated";
  const then = Date.parse(iso);
  if (Number.isNaN(then)) return "Not updated";
  const divisions: [number, Intl.RelativeTimeFormatUnit][] = [
    [60, "second"],
    [60, "minute"],
    [24, "hour"],
    [7, "day"],
    [4.34524, "week"],
    [12, "month"],
    [Number.POSITIVE_INFINITY, "year"],
  ];
  let duration = (then - Date.now()) / 1000;
  const formatter = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
  for (const [amount, unit] of divisions) {
    if (Math.abs(duration) < amount) {
      return formatter.format(Math.round(duration), unit);
    }
    duration /= amount;
  }
  return formatter.format(0, "second");
}

export function categoriesForFilter(
  value: string,
): WeaponCategory[] | null {
  switch (value) {
    case "smg":
      return ["SMG"];
    case "ar":
      return ["AR"];
    case "lmg":
      return ["LMG"];
    case "sniper":
      return ["SNIPER", "MARKSMAN"];
    case "shotgun":
      return ["SHOTGUN"];
    case "pistol":
      return ["PISTOL"];
    case "launcher":
      return ["LAUNCHER"];
    case "melee":
      return ["MELEE"];
    default:
      return null;
  }
}

export function parseCategoryFilter(value: string | undefined): string {
  if (!value) return "all";
  const known = [
    "all",
    "smg",
    "ar",
    "lmg",
    "sniper",
    "shotgun",
    "pistol",
    "launcher",
    "melee",
  ];
  return known.includes(value) ? value : "all";
}
