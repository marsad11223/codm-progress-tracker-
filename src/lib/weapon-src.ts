import fs from "node:fs";
import path from "node:path";

const LOCAL_EXTENSIONS = ["webp", "png", "jpg", "jpeg"] as const;

export function weaponImageSrc(slug: string, imageUrl: string | null): string {
  for (const extension of LOCAL_EXTENSIONS) {
    const file = path.join(process.cwd(), "public", "weapons", `${slug}.${extension}`);
    if (fs.existsSync(file)) return `/weapons/${slug}.${extension}`;
  }
  if (imageUrl) return imageUrl;
  return "/weapons/fallback.svg";
}
