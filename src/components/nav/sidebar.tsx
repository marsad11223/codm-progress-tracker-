"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_ITEMS, isNavActive } from "@/components/nav/nav-items";
import { cn } from "@/lib/utils";

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-60 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground lg:flex">
      <div className="px-5 pt-7 pb-4">
        <p className="font-heading text-xs font-semibold tracking-[0.22em] text-primary">
          CAMO COMMAND
        </p>
        <p className="mt-1 text-sm text-muted-foreground">Mobile grind</p>
      </div>
      <nav className="flex flex-1 flex-col gap-1 px-3" aria-label="Primary">
        {NAV_ITEMS.map((item) => {
          const active = isNavActive(item.href, pathname);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex h-11 items-center gap-3 rounded-lg px-3 text-sm font-medium transition-colors",
                active
                  ? "bg-sidebar-accent text-foreground"
                  : "text-muted-foreground hover:bg-sidebar-accent/70 hover:text-foreground",
              )}
            >
              <Icon className={cn("size-4", active && "text-primary")} />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <p className="px-5 py-5 text-xs leading-5 text-muted-foreground">
        Progress stays in your database. This tracker never connects to Call of Duty.
      </p>
    </aside>
  );
}
