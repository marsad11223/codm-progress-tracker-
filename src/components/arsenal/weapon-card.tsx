import Link from "next/link";
import { WeaponImage } from "@/components/weapon-image";
import { ProgressBar } from "@/components/progress-bar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { categoryLabel, difficultyLabel, formatRelative } from "@/lib/format";
import { weaponImageSrc } from "@/lib/weapon-src";
import type { WeaponDTO } from "@/types";

export function WeaponCard({ weapon }: { weapon: WeaponDTO }) {
  const updated = weapon.progressUpdatedAt ?? weapon.updatedAt;
  return (
    <Link
      href={`/arsenal/${weapon.slug}`}
      className="block rounded-xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
    >
      <Card className="h-full transition-colors hover:bg-muted/40">
        <CardContent className="flex gap-3">
          <WeaponImage
            src={weaponImageSrc(weapon.slug, weapon.imageUrl)}
            alt=""
            className="size-16 shrink-0 rounded-lg"
          />
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2">
              <h2 className="truncate font-heading text-lg font-semibold">
                {weapon.name}
              </h2>
              {weapon.goldUnlocked ? (
                <Badge className="bg-primary text-primary-foreground">Gold</Badge>
              ) : null}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              {categoryLabel(weapon.category)} · {difficultyLabel(weapon.difficultyScore)}
            </p>
            <div className="mt-3 flex items-center gap-3">
              <div className="min-w-0 flex-1">
                <ProgressBar value={weapon.progressPercentage} />
              </div>
              <span className="font-heading text-sm font-semibold tabular-nums">
                {weapon.progressPercentage}%
              </span>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              Updated {formatRelative(updated)}
            </p>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
