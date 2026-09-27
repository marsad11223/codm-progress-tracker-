import { ChallengeToggle } from "@/components/weapon/challenge-toggle";
import { WeaponImage } from "@/components/weapon-image";
import { ProgressBar } from "@/components/progress-bar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { camoLabel, categoryLabel, difficultyLabel } from "@/lib/format";
import { weaponImageSrc } from "@/lib/weapon-src";
import type { CamoCategory, CamoDTO, WeaponDetailDTO } from "@/types";

function groupCamos(camos: CamoDTO[]): { category: CamoCategory; rows: CamoDTO[] }[] {
  const groups: { category: CamoCategory; rows: CamoDTO[] }[] = [];
  for (const camo of camos) {
    const last = groups[groups.length - 1];
    if (!last || last.category !== camo.category) {
      groups.push({ category: camo.category, rows: [camo] });
    } else {
      last.rows.push(camo);
    }
  }
  return groups;
}

export function WeaponDetail({ weapon }: { weapon: WeaponDetailDTO }) {
  const groups = groupCamos(weapon.camos);

  return (
    <article className="flex flex-col gap-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-start">
        <WeaponImage
          src={weaponImageSrc(weapon.slug, weapon.imageUrl)}
          alt=""
          className="size-28 rounded-2xl"
        />
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium tracking-[0.16em] text-primary uppercase">
            {categoryLabel(weapon.category)}
          </p>
          <div className="mt-1 flex flex-wrap items-center gap-2">
            <h1 className="font-heading text-4xl font-semibold tracking-tight">
              {weapon.name}
            </h1>
            {weapon.goldUnlocked ? (
              <Badge className="bg-primary text-primary-foreground">Gold</Badge>
            ) : (
              <Badge variant="outline">Gold locked</Badge>
            )}
          </div>
          {weapon.releaseSeason ? (
            <p className="mt-1 text-sm text-muted-foreground">{weapon.releaseSeason}</p>
          ) : null}
          <div className="mt-4 flex items-center gap-3">
            <div className="max-w-md flex-1">
              <ProgressBar value={weapon.progressPercentage} />
            </div>
            <span className="font-heading text-lg font-semibold tabular-nums">
              {weapon.progressPercentage}%
            </span>
          </div>
        </div>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Difficulty</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p className="font-heading text-3xl font-semibold">
            {difficultyLabel(weapon.difficultyScore)}
          </p>
          {weapon.difficultyReasons.length > 0 ? (
            <ul className="list-disc space-y-1 pl-4 text-muted-foreground">
              {weapon.difficultyReasons.map((reason) => (
                <li key={reason}>{reason}</li>
              ))}
            </ul>
          ) : (
            <p className="text-muted-foreground">No reasons recorded.</p>
          )}
          <p className="text-muted-foreground">
            This rating is not official. It is not a Call of Duty score.
          </p>
        </CardContent>
      </Card>

      <div className="flex flex-col gap-6">
        {groups.map((group) => {
          const done = group.rows.filter((row) => row.complete).length;
          return (
            <section key={group.category} className="flex flex-col gap-2">
              <div className="flex items-baseline justify-between gap-3">
                <h2 className="font-heading text-2xl font-semibold">
                  {camoLabel(group.category)}
                </h2>
                {group.category === "GOLD" ? null : (
                  <p className="text-xs text-muted-foreground">
                    {done} of {group.rows.length} patterns
                  </p>
                )}
              </div>
              {group.category === "GOLD"
                ? group.rows.map((camo) => (
                    <div
                      key={camo.id}
                      className={
                        camo.complete
                          ? "rounded-xl bg-primary/15 p-4 ring-1 ring-primary/40"
                          : "rounded-xl bg-card p-4 ring-1 ring-foreground/10"
                      }
                    >
                      <div className="flex items-center justify-between gap-3">
                        <h3 className="font-heading text-xl font-semibold">Gold</h3>
                        <Badge
                          className={
                            camo.complete
                              ? "bg-primary text-primary-foreground"
                              : undefined
                          }
                          variant={camo.complete ? "default" : "outline"}
                        >
                          {camo.complete ? "Unlocked" : "Locked"}
                        </Badge>
                      </div>
                      <p className="mt-2 text-sm">{camo.requirement}</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Fills when all {camo.target} base challenges are complete. No checkbox.
                      </p>
                    </div>
                  ))
                : group.rows.map((camo) => (
                    <div
                      key={camo.id}
                      className="rounded-xl bg-card ring-1 ring-foreground/10"
                    >
                      {camo.challenges.length === 0 ? (
                        <div className="px-4 py-3">
                          <h3 className="font-medium">{camo.name}</h3>
                          <p className="text-sm text-muted-foreground">{camo.requirement}</p>
                        </div>
                      ) : (
                        camo.challenges.map((challenge) => (
                          <div
                            key={challenge.id}
                            className="flex items-start gap-1 px-2 py-1"
                          >
                            <ChallengeToggle
                              challengeId={challenge.id}
                              slug={weapon.slug}
                              completed={challenge.completed}
                              label={`${camo.name} challenge`}
                            />
                            <div className="min-w-0 py-2">
                              <h3 className="font-medium">{camo.name}</h3>
                              <p className="text-sm text-muted-foreground">
                                {challenge.description}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {challenge.targetVerified
                                  ? `Target ${challenge.target}`
                                  : "Target not verified"}
                              </p>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  ))}
            </section>
          );
        })}
      </div>
    </article>
  );
}
