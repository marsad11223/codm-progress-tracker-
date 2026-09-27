"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
  setDiamondMatchesAction,
  setDiamondTrackingAction,
} from "@/app/actions/progress";
import { WeaponImage } from "@/components/weapon-image";
import { ProgressBar } from "@/components/progress-bar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DIAMOND_KILLS_PER_MATCH, DIAMOND_MATCH_TARGET } from "@/lib/constants";
import type { WeaponDTO } from "@/types";

function MatchControl({
  weapon,
  pending,
  onChange,
}: {
  weapon: WeaponDTO;
  pending: boolean;
  onChange: (weapon: WeaponDTO, matches: number) => void;
}) {
  return (
    <div className="flex items-center gap-1">
      <Button
        type="button"
        variant="outline"
        size="icon-sm"
        aria-label={`Remove a Diamond match from ${weapon.name}`}
        disabled={pending || weapon.diamondMatches <= 0}
        onClick={() => onChange(weapon, weapon.diamondMatches - 1)}
      >
        −
      </Button>
      <span className="w-16 text-center font-heading text-sm tabular-nums">
        {weapon.diamondMatches}/{DIAMOND_MATCH_TARGET}
      </span>
      <Button
        type="button"
        variant="outline"
        size="icon-sm"
        aria-label={`Add a Diamond match for ${weapon.name}`}
        disabled={pending || weapon.diamondMatches >= DIAMOND_MATCH_TARGET}
        onClick={() => onChange(weapon, weapon.diamondMatches + 1)}
      >
        +
      </Button>
    </div>
  );
}

export function DiamondTracker({
  tracked,
  goldOptions,
}: {
  tracked: { weapon: WeaponDTO; src: string }[];
  goldOptions: { id: string; name: string; slug: string }[];
}) {
  const [pending, startTransition] = useTransition();
  const [pick, setPick] = useState(goldOptions[0]?.id ?? "");

  function add(weaponId: string) {
    const weapon = goldOptions.find((entry) => entry.id === weaponId);
    if (!weapon) return;
    startTransition(async () => {
      const result = await setDiamondTrackingAction({
        weaponId: weapon.id,
        slug: weapon.slug,
        tracked: true,
      });
      if (!result.ok) toast.error(result.error);
    });
  }

  function remove(weapon: WeaponDTO) {
    startTransition(async () => {
      const result = await setDiamondTrackingAction({
        weaponId: weapon.id,
        slug: weapon.slug,
        tracked: false,
      });
      if (!result.ok) toast.error(result.error);
    });
  }

  function setMatches(weapon: WeaponDTO, matches: number) {
    startTransition(async () => {
      const result = await setDiamondMatchesAction({
        weaponId: weapon.id,
        slug: weapon.slug,
        matches,
      });
      if (!result.ok) toast.error(result.error);
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-muted-foreground">
        After Gold, log each match where you get {DIAMOND_KILLS_PER_MATCH} kills.
        Diamond unlocks at {DIAMOND_MATCH_TARGET} matches.
      </p>
      {tracked.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No weapons on the Diamond tracker yet. Add a Gold gun below.
        </p>
      ) : (
        <ul className="flex flex-col gap-3">
          {tracked.map(({ weapon, src }) => {
            const percent = Math.round(
              (weapon.diamondMatches / DIAMOND_MATCH_TARGET) * 100,
            );
            return (
              <li
                key={weapon.id}
                className="rounded-xl bg-sky-500/10 p-3 ring-1 ring-sky-500/25"
              >
                <div className="flex items-center gap-3">
                  <WeaponImage src={src} alt="" className="size-16 shrink-0 rounded-lg" />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <Link
                        href={`/arsenal/${weapon.slug}`}
                        className="truncate font-medium hover:text-primary"
                      >
                        {weapon.name}
                      </Link>
                      {weapon.diamondUnlocked ? (
                        <Badge className="bg-sky-600 text-white">Diamond</Badge>
                      ) : (
                        <Badge variant="outline">In progress</Badge>
                      )}
                    </div>
                    <div className="mt-2">
                      <ProgressBar value={percent} />
                    </div>
                  </div>
                </div>
                <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                  <MatchControl weapon={weapon} pending={pending} onChange={setMatches} />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    disabled={pending}
                    onClick={() => remove(weapon)}
                  >
                    Remove
                  </Button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
      {goldOptions.length > 0 ? (
        <div className="flex flex-col gap-2 sm:flex-row">
          <Select value={pick} onValueChange={setPick}>
            <SelectTrigger className="w-full sm:flex-1" aria-label="Gold weapon to track for Diamond">
              <SelectValue placeholder="Choose a Gold weapon" />
            </SelectTrigger>
            <SelectContent>
              {goldOptions.map((weapon) => (
                <SelectItem key={weapon.id} value={weapon.id}>
                  {weapon.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button type="button" disabled={pending || !pick} onClick={() => add(pick)}>
            Add to Diamond
          </Button>
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">
          Gold a weapon before it can join the Diamond tracker.
        </p>
      )}
    </div>
  );
}
