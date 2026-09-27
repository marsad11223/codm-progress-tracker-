"use client";

import { useOptimistic, useTransition } from "react";
import { toast } from "sonner";
import { toggleChallengeAction } from "@/app/actions/progress";
import { Checkbox } from "@/components/ui/checkbox";

export function ChallengeToggle({
  challengeId,
  slug,
  completed,
  label,
}: {
  challengeId: string;
  slug: string;
  completed: boolean;
  label: string;
}) {
  const [optimistic, setOptimistic] = useOptimistic(completed);
  const [pending, startTransition] = useTransition();

  return (
    <label className="flex min-h-11 min-w-11 cursor-pointer items-center justify-center rounded-lg">
      <Checkbox
        checked={optimistic}
        disabled={pending}
        aria-label={label}
        className="size-5"
        onCheckedChange={(value) => {
          const next = value === true;
          startTransition(async () => {
            setOptimistic(next);
            const result = await toggleChallengeAction({
              challengeId,
              slug,
              completed: next,
            });
            if (!result.ok) toast.error(result.error);
          });
        }}
      />
    </label>
  );
}
