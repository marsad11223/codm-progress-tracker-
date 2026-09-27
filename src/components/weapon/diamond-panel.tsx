"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import {
  setDiamondMatchesAction,
  setDiamondTrackingAction,
} from "@/app/actions/progress";
import { ProgressBar } from "@/components/progress-bar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DIAMOND_KILLS_PER_MATCH, DIAMOND_MATCH_TARGET, DIAMOND_REQUIREMENT } from "@/lib/constants";

export function DiamondPanel({
  weaponId,
  slug,
  name,
  goldUnlocked,
  tracked,
  matches,
  unlocked,
}: {
  weaponId: string;
  slug: string;
  name: string;
  goldUnlocked: boolean;
  tracked: boolean;
  matches: number;
  unlocked: boolean;
}) {
  const [pending, startTransition] = useTransition();
  const percent = Math.round((matches / DIAMOND_MATCH_TARGET) * 100);

  function track(next: boolean) {
    startTransition(async () => {
      const result = await setDiamondTrackingAction({
        weaponId,
        slug,
        tracked: next,
      });
      if (!result.ok) toast.error(result.error);
    });
  }

  function setMatches(next: number) {
    startTransition(async () => {
      const result = await setDiamondMatchesAction({
        weaponId,
        slug,
        matches: next,
      });
      if (!result.ok) toast.error(result.error);
    });
  }

  return (
    <Card className="ring-sky-500/30">
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <CardTitle>Diamond</CardTitle>
          {unlocked ? (
            <Badge className="bg-sky-600 text-white">Unlocked</Badge>
          ) : goldUnlocked ? (
            <Badge variant="outline">After Gold</Badge>
          ) : (
            <Badge variant="outline">Locked until Gold</Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        <p>{DIAMOND_REQUIREMENT}</p>
        {!goldUnlocked ? (
          <p className="text-muted-foreground">
            Finish every base camo on {name}. Diamond tracking opens after Gold.
          </p>
        ) : !tracked ? (
          <Button type="button" disabled={pending} onClick={() => track(true)}>
            Track Diamond
          </Button>
        ) : (
          <>
            <ProgressBar value={percent} />
            <div className="flex flex-wrap items-center gap-2">
              <Button
                type="button"
                variant="outline"
                disabled={pending || matches <= 0}
                onClick={() => setMatches(matches - 1)}
              >
                −1 match
              </Button>
              <span className="font-heading text-lg tabular-nums">
                {matches}/{DIAMOND_MATCH_TARGET}
              </span>
              <Button
                type="button"
                variant="outline"
                disabled={pending || matches >= DIAMOND_MATCH_TARGET}
                onClick={() => setMatches(matches + 1)}
              >
                +1 match
              </Button>
              <span className="text-muted-foreground">
                {DIAMOND_KILLS_PER_MATCH} kills each
              </span>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={pending}
              onClick={() => track(false)}
            >
              Stop tracking
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}
