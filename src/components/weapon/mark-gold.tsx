"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { setWeaponGoldAction } from "@/app/actions/progress";
import { Button } from "@/components/ui/button";

export function MarkGold({
  weaponId,
  slug,
  goldUnlocked,
}: {
  weaponId: string;
  slug: string;
  goldUnlocked: boolean;
}) {
  const [pending, startTransition] = useTransition();

  function apply(gold: boolean) {
    startTransition(async () => {
      const result = await setWeaponGoldAction({ weaponId, slug, gold });
      if (!result.ok) toast.error(result.error);
    });
  }

  if (goldUnlocked) {
    return (
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={pending}
        onClick={() => apply(false)}
      >
        Clear Gold
      </Button>
    );
  }

  return (
    <Button type="button" size="sm" disabled={pending} onClick={() => apply(true)}>
      Already Gold
    </Button>
  );
}
