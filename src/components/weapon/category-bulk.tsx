"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { setCamoCategoryAction } from "@/app/actions/progress";
import { Button } from "@/components/ui/button";
import type { CamoCategory } from "@/types";

export function CategoryBulk({
  weaponId,
  slug,
  category,
  allComplete,
  anyComplete,
}: {
  weaponId: string;
  slug: string;
  category: CamoCategory;
  allComplete: boolean;
  anyComplete: boolean;
}) {
  const [pending, startTransition] = useTransition();

  function apply(completed: boolean) {
    startTransition(async () => {
      const result = await setCamoCategoryAction({
        weaponId,
        slug,
        category,
        completed,
      });
      if (!result.ok) toast.error(result.error);
    });
  }

  return (
    <div className="flex items-center gap-1">
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={pending || allComplete}
        onClick={() => apply(true)}
      >
        Select all
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        disabled={pending || !anyComplete}
        onClick={() => apply(false)}
      >
        Clear
      </Button>
    </div>
  );
}
