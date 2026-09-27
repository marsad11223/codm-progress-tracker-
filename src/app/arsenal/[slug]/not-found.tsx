import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function WeaponNotFound() {
  return (
    <div className="rounded-xl border border-dashed border-border bg-card px-6 py-12">
      <h1 className="font-heading text-3xl font-semibold">Weapon not in the catalogue</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        That slug does not match an active weapon.
      </p>
      <Button asChild className="mt-5 h-11">
        <Link href="/arsenal">Back to the arsenal</Link>
      </Button>
    </div>
  );
}
