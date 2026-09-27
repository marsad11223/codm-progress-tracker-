"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { promoteWeaponAction } from "@/app/actions/roadmap";
import { WeaponImage } from "@/components/weapon-image";
import { ProgressBar } from "@/components/progress-bar";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { WeaponDTO } from "@/types";

export type QueueEntry = {
  weapon: WeaponDTO;
  src: string;
  pinned: boolean;
};

export function GrindQueue({
  queue,
  choices,
}: {
  queue: QueueEntry[];
  choices: { id: string; name: string }[];
}) {
  const [pending, startTransition] = useTransition();
  const [pick, setPick] = useState(choices[0]?.id ?? "");

  function promote(weaponId: string) {
    startTransition(async () => {
      const result = await promoteWeaponAction(weaponId);
      if (!result.ok) toast.error(result.error);
    });
  }

  return (
    <div className="flex flex-col gap-3">
      {queue.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Every weapon in this view is already Gold.
        </p>
      ) : (
        <ol className="flex max-h-[32rem] flex-col gap-2 overflow-y-auto pr-1">
          {queue.map((entry, index) => (
            <li
              key={entry.weapon.id}
              className="flex items-center gap-2 rounded-xl bg-background/60 p-2 ring-1 ring-foreground/10"
            >
              <span className="w-5 text-center font-heading text-sm text-muted-foreground">
                {index + 1}
              </span>
              <WeaponImage
                src={entry.src}
                alt=""
                className="size-14 shrink-0 rounded-lg"
              />
              <div className="min-w-0 flex-1">
                <Link
                  href={`/arsenal/${entry.weapon.slug}`}
                  className="block truncate font-medium hover:text-primary"
                >
                  {entry.weapon.name}
                </Link>
                <p className="text-xs text-muted-foreground">
                  {entry.pinned ? "Your rank" : "Suggested"} · {entry.weapon.progressPercentage}%
                </p>
                <div className="mt-1.5">
                  <ProgressBar value={entry.weapon.progressPercentage} />
                </div>
              </div>
              {index === 0 ? (
                <span className="px-1 text-xs font-medium text-primary">Next</span>
              ) : (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={pending}
                  onClick={() => promote(entry.weapon.id)}
                >
                  First
                </Button>
              )}
            </li>
          ))}
        </ol>
      )}
      {choices.length > 0 ? (
        <div className="flex flex-col gap-2 border-t border-border pt-3">
          <p className="text-xs text-muted-foreground">
            Not following the list? Rank any gun first.
          </p>
          <Select value={pick} onValueChange={setPick}>
            <SelectTrigger className="w-full" aria-label="Weapon to rank first">
              <SelectValue placeholder="Choose a weapon" />
            </SelectTrigger>
            <SelectContent>
              {choices.map((weapon) => (
                <SelectItem key={weapon.id} value={weapon.id}>
                  {weapon.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            type="button"
            disabled={pending || !pick}
            onClick={() => promote(pick)}
          >
            Rank this first
          </Button>
        </div>
      ) : null}
    </div>
  );
}
