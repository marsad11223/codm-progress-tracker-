import fs from "node:fs";
import path from "node:path";

export function weaponImageSrc(slug: string, imageUrl: string | null): string {
  const file = path.join(process.cwd(), "public", "weapons", `${slug}.webp`);
  if (fs.existsSync(file)) return `/weapons/${slug}.webp`;
  if (imageUrl) return imageUrl;
  return "/weapons/fallback.svg";
}
