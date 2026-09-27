import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="rounded-xl border border-dashed border-border bg-card px-6 py-12">
      <h1 className="font-heading text-3xl font-semibold">Page not found</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        That route is not part of the tracker.
      </p>
      <Button asChild className="mt-5 h-11">
        <Link href="/">Back to the board</Link>
      </Button>
    </div>
  );
}
