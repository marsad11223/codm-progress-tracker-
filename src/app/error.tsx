"use client";

import { Button } from "@/components/ui/button";

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="rounded-xl border border-dashed border-border bg-card px-6 py-12">
      <h1 className="font-heading text-3xl font-semibold">Could not load this page</h1>
      <p className="mt-2 max-w-lg text-sm leading-6 text-muted-foreground">
        The tracker could not read its database. Check that Postgres is running, then retry.
      </p>
      <Button type="button" className="mt-5 h-11" onClick={() => reset()}>
        Retry
      </Button>
    </div>
  );
}
