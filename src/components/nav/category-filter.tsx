import Link from "next/link";
import { CATEGORY_FILTERS } from "@/types";
import { cn } from "@/lib/utils";

export function CategoryFilter({
  pathname,
  current,
  preserve,
}: {
  pathname: string;
  current: string;
  preserve?: Record<string, string | undefined>;
}) {
  function href(value: string) {
    const params = new URLSearchParams();
    if (value !== "all") params.set("category", value);
    for (const [key, param] of Object.entries(preserve ?? {})) {
      if (param) params.set(key, param);
    }
    const query = params.toString();
    return query ? `${pathname}?${query}` : pathname;
  }

  return (
    <div className="flex gap-2 overflow-x-auto pb-1" aria-label="Weapon category">
      {CATEGORY_FILTERS.map((filter) => {
        const active = filter.value === current;
        return (
          <Link
            key={filter.value}
            href={href(filter.value)}
            title={
              filter.value === "sniper" ? "Includes marksman rifles" : undefined
            }
            aria-current={active ? "page" : undefined}
            className={cn(
              "inline-flex h-11 shrink-0 items-center rounded-full border px-4 text-sm font-medium",
              active
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-card text-muted-foreground hover:text-foreground",
            )}
          >
            {filter.label}
          </Link>
        );
      })}
    </div>
  );
}
