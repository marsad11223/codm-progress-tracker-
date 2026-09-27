// Seed data for the SMG catalogue.
// Difficulty is not an official Call of Duty rating.
// Unverified targets must stay targetVerified: false.
// This module does not invent kill counts and does not copy Modern Warfare 2019 ladders.

export const LAUNCH_SEASON = "Launch (wiki list, year not printed on the row)";

export type SeedWeapon = {
  name: string;
  slug: string;
  releaseSeason: string;
};

export const SMG_WEAPONS: SeedWeapon[] = [
  { name: "RUS-79U", slug: "rus-79u", releaseSeason: LAUNCH_SEASON },
  { name: "PDW-57", slug: "pdw-57", releaseSeason: LAUNCH_SEASON },
  { name: "HG 40", slug: "hg-40", releaseSeason: LAUNCH_SEASON },
  { name: "Chicom", slug: "chicom", releaseSeason: LAUNCH_SEASON },
  { name: "MSMC", slug: "msmc", releaseSeason: LAUNCH_SEASON },
  { name: "Razorback", slug: "razorback", releaseSeason: "Season 2" },
  { name: "Pharo", slug: "pharo", releaseSeason: "Season 2" },
  { name: "GKS", slug: "gks", releaseSeason: "Season 5" },
  { name: "Cordite", slug: "cordite", releaseSeason: "Season 6" },
  { name: "QQ9", slug: "qq9", releaseSeason: "Season 7" },
  { name: "Fennec", slug: "fennec", releaseSeason: "Season 11" },
  { name: "AGR 556", slug: "agr-556", releaseSeason: "Season 12" },
  { name: "QXR", slug: "qxr", releaseSeason: "Season 13" },
  { name: "PP19 Bizon", slug: "pp19-bizon", releaseSeason: "2021 Season 3" },
  { name: "MX9", slug: "mx9", releaseSeason: "2021 Season 6" },
  { name: "CBR4", slug: "cbr4", releaseSeason: "2021 Season 10" },
  { name: "PPSh-41", slug: "ppsh-41", releaseSeason: "2022 Season 1" },
  { name: "MAC-10", slug: "mac-10", releaseSeason: "2022 Season 3" },
  { name: "KSP 45", slug: "ksp-45", releaseSeason: "2022 Season 6" },
  { name: "Switchblade X9", slug: "switchblade-x9", releaseSeason: "2022 Season 7" },
  { name: "LAPA", slug: "lapa", releaseSeason: "2022 Season 10" },
  { name: "OTs 9", slug: "ots-9", releaseSeason: "2023 Season 4" },
  { name: "Striker 45", slug: "striker-45", releaseSeason: "2023 Season 7" },
  { name: "CX-9", slug: "cx-9", releaseSeason: "2023 Season 9" },
  { name: "TEC-9", slug: "tec-9", releaseSeason: "2024 Season 3" },
  { name: "ISO", slug: "iso", releaseSeason: "2024 Season 7" },
  { name: "USS 9", slug: "uss-9", releaseSeason: "2024 Season 10" },
  { name: "VMP", slug: "vmp", releaseSeason: "2025 Season 5" },
  { name: "Sten", slug: "sten", releaseSeason: "2025 Season 9" },
  { name: "LC10", slug: "lc10", releaseSeason: "2026 Season 1" },
  { name: "FSS Hurricane", slug: "fss-hurricane", releaseSeason: "2026 Season 6" },
  { name: "Static-HV", slug: "static-hv", releaseSeason: "2026 Season 8" },
];

export const CAMO_GROUPS = [
  {
    category: "SAND",
    sortOrder: 1,
    patterns: [
      "Desert Snake",
      "Commando",
      "Rip n' Tear",
      "Moroccan Snake",
      "Pitter Patter",
      "China Lake",
      "Pinstripe Suit",
      "Chain Link",
      "Night Fall",
      "Smoke",
    ],
  },
  {
    category: "DRAGON",
    sortOrder: 2,
    patterns: [
      "H20",
      "Dirt",
      "Moss",
      "Tagged",
      "Black Top",
      "Asphalt",
      "Crime Scene",
      "Neon Pink",
      "Trailblazer",
      "Foilage",
    ],
  },
  {
    category: "SPLINTER",
    sortOrder: 3,
    patterns: [
      "Tundra",
      "Undergrowth",
      "Frostbite",
      "Ice Breaker",
      "Ruins",
      "Arctic Seafoam",
      "Angles",
      "Autumm Dazzle",
      "Arctic Abstract",
      "Sharp Edges",
    ],
  },
  {
    category: "TIGER",
    sortOrder: 4,
    patterns: [
      "Overgrown",
      "Mudslide",
      "Dank Forest",
      "Abominable",
      "Faded Veil",
      "Feral Beast",
      "Tiger Stripes",
      "Desert Cat",
      "Red Tiger",
      "Blue Tiger",
    ],
  },
  {
    category: "JUNGLE",
    sortOrder: 5,
    patterns: [
      "Swamp",
      "Modern Woodland",
      "Desert Hybird",
      "Sand Dance",
      "Marshland",
      "Kill Brush",
      "Warcom Greens",
      "Warcom Blues",
      "Night Forces",
      "Canopy",
    ],
  },
  {
    category: "REPTILE",
    sortOrder: 6,
    patterns: [
      "Python",
      "Rattlesnake",
      "Komodo",
      "Blue Iguana",
      "Chupacabra",
      "Pink Python",
      "Anacoda",
      "Bullsnake",
      "Gecko",
      "Gartersnake",
    ],
  },
] as const;
