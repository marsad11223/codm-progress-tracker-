import Link from "next/link";
import { CategoryFilter } from "@/components/nav/category-filter";
import { DiamondTracker } from "@/components/dashboard/diamond-tracker";
import { GrindQueue } from "@/components/dashboard/grind-queue";
import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import { ProgressBar } from "@/components/progress-bar";
import { WeaponImage } from "@/components/weapon-image";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { difficultyLabel, formatMean, formatRelative } from "@/lib/format";
import { weaponImageSrc } from "@/lib/weapon-src";
import type { DashboardSummary, WeaponDTO } from "@/types";

function Stat({
  label,
  value,
  detail,
}: {
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <Card>
      <CardHeader>
        <CardDescription>{label}</CardDescription>
        <CardTitle className="font-heading text-4xl font-semibold tracking-tight">
          {value}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-xs text-muted-foreground">{detail}</p>
      </CardContent>
    </Card>
  );
}

function WeaponLink({ weapon }: { weapon: WeaponDTO }) {
  return (
    <Link
      href={`/arsenal/${weapon.slug}`}
      className="flex items-center gap-3 rounded-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
    >
      <WeaponImage
        src={weaponImageSrc(weapon.slug, weapon.imageUrl)}
        alt=""
        className="size-20 rounded-xl"
      />
      <span className="min-w-0 flex-1">
        <span className="flex flex-wrap items-center gap-2">
          <span className="truncate font-medium">{weapon.name}</span>
          {weapon.goldUnlocked ? (
            <Badge className="bg-primary text-primary-foreground">Gold</Badge>
          ) : null}
          {weapon.diamondUnlocked ? (
            <Badge className="bg-sky-600 text-white">Diamond</Badge>
          ) : null}
        </span>
        <span className="mt-1 block text-xs text-muted-foreground">
          {weapon.progressPercentage}% · {difficultyLabel(weapon.difficultyScore)}
        </span>
        <span className="mt-2 block">
          <ProgressBar value={weapon.progressPercentage} />
        </span>
      </span>
    </Link>
  );
}

export function DashboardView({
  summary,
  category,
}: {
  summary: DashboardSummary;
  category: string;
}) {
  if (summary.totalWeapons === 0) {
    return (
      <>
        <PageHeader
          eyebrow="Command center"
          title="Grind board"
          description="Gold means every base camo challenge on a weapon is done. Diamond opens after Gold."
        />
        <EmptyState
          title="No weapons seeded yet"
          body="The catalogue is empty. Seed it with npx prisma db seed. The README has the Postgres and migrate steps."
        />
      </>
    );
  }

  const collected = summary.weapons.filter((weapon) => weapon.goldUnlocked);
  const diamondTracked = summary.weapons.filter((weapon) => weapon.diamondTracked);
  const goldOptions = collected
    .filter((weapon) => !weapon.diamondTracked)
    .map((weapon) => ({ id: weapon.id, name: weapon.name, slug: weapon.slug }));
  const queue = summary.upNext.map((entry) => ({
    ...entry,
    src: weaponImageSrc(entry.weapon.slug, entry.weapon.imageUrl),
  }));
  const choices = summary.upNext.map((entry) => ({
    id: entry.weapon.id,
    name: entry.weapon.name,
  }));

  return (
    <>
      <PageHeader
        eyebrow="Command center"
        title="Grind board"
        description="Gold means every base camo challenge on a weapon is done. Diamond opens after Gold: 10 kills in a match, 120 times. Platinum and Damascus are a later slice, not this number."
      />
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Stat
          label="Catalogue"
          value={String(summary.totalWeapons)}
          detail={`${summary.catalogueLabel} in the catalogue`}
        />
        <Stat
          label="Gold"
          value={String(summary.goldCount)}
          detail="Active weapons with every base challenge done"
        />
        <Stat
          label="Remaining"
          value={String(summary.remaining)}
          detail="Active weapons that are not Gold"
        />
        <Stat
          label="Gold completion"
          value={`${summary.completionPercent}%`}
          detail={`Average grind ${formatMean(summary.averageGrind)}%. That mean counts partial guns.`}
        />
      </div>

      <div className="mt-6 grid items-start gap-4 lg:grid-cols-[20rem_minmax(0,1fr)]">
        <Card className="lg:sticky lg:top-6">
          <CardHeader>
            <CardDescription>Up next</CardDescription>
            <CardTitle>Which gun to pick</CardTitle>
          </CardHeader>
          <CardContent>
            <GrindQueue queue={queue} choices={choices} />
          </CardContent>
        </Card>

        <div className="flex flex-col gap-3">
          <div className="grid gap-3 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardDescription>Current grind</CardDescription>
                <CardTitle>What you are on</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                {summary.currentGrind ? (
                  <>
                    <WeaponLink weapon={summary.currentGrind} />
                    {summary.currentGrindNote ? (
                      <p className="text-sm text-muted-foreground">
                        {summary.currentGrindNote}
                      </p>
                    ) : null}
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Every active weapon is already Gold.
                  </p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardDescription>Next best grind</CardDescription>
                <CardTitle>A local pick, not an in-game recommendation</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                <CategoryFilter pathname="/" current={category} />
                {summary.nextBest ? (
                  <>
                    <WeaponLink weapon={summary.nextBest.weapon} />
                    <ul className="list-disc space-y-1 pl-4 text-sm text-muted-foreground">
                      {summary.nextBest.reasons.map((reason) => (
                        <li key={reason}>{reason}</li>
                      ))}
                    </ul>
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Nothing left to grind in this view.
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardDescription>After Gold</CardDescription>
              <CardTitle>Diamond camo</CardTitle>
            </CardHeader>
            <CardContent>
              <DiamondTracker
                tracked={diamondTracked.map((weapon) => ({
                  weapon,
                  src: weaponImageSrc(weapon.slug, weapon.imageUrl),
                }))}
                goldOptions={goldOptions}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardDescription>Collected</CardDescription>
              <CardTitle>Gold weapons</CardTitle>
            </CardHeader>
            <CardContent>
              {collected.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No Gold weapons yet. Finished guns show up here with their art.
                </p>
              ) : (
                <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {collected.map((weapon) => (
                    <li key={weapon.id}>
                      <Link
                        href={`/arsenal/${weapon.slug}`}
                        className="block overflow-hidden rounded-2xl ring-1 ring-primary/30 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                      >
                        <WeaponImage
                          src={weaponImageSrc(weapon.slug, weapon.imageUrl)}
                          alt=""
                          className="aspect-[4/3] w-full"
                        />
                        <span className="flex items-center justify-between gap-2 bg-card px-3 py-2">
                          <span className="truncate text-sm font-medium">{weapon.name}</span>
                          {weapon.diamondUnlocked ? (
                            <Badge className="bg-sky-600 text-white">Diamond</Badge>
                          ) : (
                            <Badge className="bg-primary text-primary-foreground">Gold</Badge>
                          )}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardDescription>Recently completed</CardDescription>
              <CardTitle>Latest Gold</CardTitle>
            </CardHeader>
            <CardContent>
              {summary.recentlyCompleted.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No Gold weapons yet. Check a challenge on a gun to start.
                </p>
              ) : (
                <ul className="divide-y divide-border">
                  {summary.recentlyCompleted.map((weapon) => (
                    <li key={weapon.id} className="flex items-center gap-3 py-3">
                      <WeaponImage
                        src={weaponImageSrc(weapon.slug, weapon.imageUrl)}
                        alt=""
                        className="size-12 rounded-lg"
                      />
                      <Link
                        href={`/arsenal/${weapon.slug}`}
                        className="min-w-0 flex-1 truncate font-medium hover:text-primary"
                      >
                        {weapon.name}
                      </Link>
                      <span className="text-xs text-muted-foreground">
                        {weapon.completedAt
                          ? `Gold ${formatRelative(weapon.completedAt)}`
                          : "Gold"}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
