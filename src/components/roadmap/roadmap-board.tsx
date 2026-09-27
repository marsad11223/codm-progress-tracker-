"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { ChevronDown, ChevronUp, GripVertical, Plus, X } from "lucide-react";
import { toast } from "sonner";
import { saveGrindOrderAction } from "@/app/actions/roadmap";
import { WeaponImage } from "@/components/weapon-image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ProgressBar } from "@/components/progress-bar";
import type { RoadmapItem, WeaponDTO } from "@/types";

function move<T>(items: T[], from: number, to: number): T[] {
  const next = [...items];
  const [item] = next.splice(from, 1);
  if (!item) return items;
  next.splice(to, 0, item);
  return next;
}

export function RoadmapBoard({
  ordered,
  tray,
  art,
}: {
  ordered: RoadmapItem[];
  tray: WeaponDTO[];
  art: Record<string, string>;
}) {
  const [items, setItems] = useState(ordered.map((entry) => entry.weapon));
  const [pool, setPool] = useState(tray);
  const [dragId, setDragId] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function persist(nextItems: WeaponDTO[], nextPool: WeaponDTO[]) {
    setItems(nextItems);
    setPool(nextPool);
    startTransition(async () => {
      const result = await saveGrindOrderAction(nextItems.map((weapon) => weapon.id));
      if (!result.ok) {
        toast.error(result.error);
        setItems(ordered.map((entry) => entry.weapon));
        setPool(tray);
      }
    });
  }

  function reorder(fromId: string, toId: string) {
    const from = items.findIndex((weapon) => weapon.id === fromId);
    const to = items.findIndex((weapon) => weapon.id === toId);
    if (from < 0 || to < 0 || from === to) return;
    persist(move(items, from, to), pool);
  }

  function addWeapon(weapon: WeaponDTO, index = items.length) {
    const nextItems = [...items];
    nextItems.splice(index, 0, weapon);
    persist(
      nextItems,
      pool.filter((entry) => entry.id !== weapon.id),
    );
  }

  function removeWeapon(weapon: WeaponDTO) {
    persist(
      items.filter((entry) => entry.id !== weapon.id),
      [...pool, weapon].sort((a, b) => a.name.localeCompare(b.name)),
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(16rem,0.8fr)]">
      <section>
        <h2 className="font-heading text-2xl font-semibold">Order</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Lower position is sooner. Drag a row, or use the arrows. Gold guns can stay on the list and are skipped for current grind.
        </p>
        {items.length === 0 ? (
          <p className="mt-4 rounded-xl border border-dashed border-border px-4 py-8 text-sm text-muted-foreground">
            Your roadmap is empty. Add a gun from the tray to set the order you want to grind.
          </p>
        ) : (
          <ol className="mt-4 flex flex-col gap-2">
            {items.map((weapon, index) => (
              <li
                key={weapon.id}
                draggable
                onDragStart={(event) => {
                  setDragId(weapon.id);
                  event.dataTransfer.setData("text/plain", weapon.id);
                  event.dataTransfer.effectAllowed = "move";
                }}
                onDragOver={(event) => event.preventDefault()}
                onDrop={(event) => {
                  event.preventDefault();
                  const source = event.dataTransfer.getData("text/plain") || dragId;
                  if (!source) return;
                  const fromTray = pool.find((entry) => entry.id === source);
                  if (fromTray) addWeapon(fromTray, index);
                  else reorder(source, weapon.id);
                  setDragId(null);
                }}
                className="flex items-center gap-2 rounded-xl bg-card px-2 py-2 ring-1 ring-foreground/10"
              >
                <span className="w-6 text-center font-heading text-sm text-muted-foreground">
                  {index + 1}
                </span>
                <GripVertical className="size-4 shrink-0 text-muted-foreground" aria-hidden />
                <WeaponImage
                  src={art[weapon.id] ?? "/weapons/fallback.svg"}
                  alt=""
                  className="size-12 shrink-0 rounded-lg"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <Link href={`/arsenal/${weapon.slug}`} className="truncate font-medium hover:text-primary">
                      {weapon.name}
                    </Link>
                    {weapon.goldUnlocked ? (
                      <Badge className="bg-primary text-primary-foreground">Gold</Badge>
                    ) : null}
                  </div>
                  <div className="mt-2 max-w-xs">
                    <ProgressBar value={weapon.progressPercentage} />
                  </div>
                </div>
                <div className="flex items-center">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="size-11"
                    aria-label={`Move ${weapon.name} up`}
                    disabled={pending || index === 0}
                    onClick={() => persist(move(items, index, index - 1), pool)}
                  >
                    <ChevronUp />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="size-11"
                    aria-label={`Move ${weapon.name} down`}
                    disabled={pending || index === items.length - 1}
                    onClick={() => persist(move(items, index, index + 1), pool)}
                  >
                    <ChevronDown />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="size-11"
                    aria-label={`Remove ${weapon.name} from the roadmap`}
                    disabled={pending}
                    onClick={() => removeWeapon(weapon)}
                  >
                    <X />
                  </Button>
                </div>
              </li>
            ))}
          </ol>
        )}
      </section>
      <section
        onDragOver={(event) => event.preventDefault()}
        onDrop={(event) => {
          event.preventDefault();
          const source = event.dataTransfer.getData("text/plain") || dragId;
          const fromTray = pool.find((entry) => entry.id === source);
          const listed = items.find((entry) => entry.id === source);
          if (listed) removeWeapon(listed);
          else if (fromTray) addWeapon(fromTray);
          setDragId(null);
        }}
      >
        <h2 className="font-heading text-2xl font-semibold">Not listed</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Active weapons that are not on the roadmap yet.
        </p>
        {pool.length === 0 ? (
          <p className="mt-4 text-sm text-muted-foreground">
            Every active weapon is already on the roadmap.
          </p>
        ) : (
          <ul className="mt-4 flex flex-col gap-2">
            {pool.map((weapon) => (
              <li
                key={weapon.id}
                draggable
                onDragStart={(event) => {
                  setDragId(weapon.id);
                  event.dataTransfer.setData("text/plain", weapon.id);
                  event.dataTransfer.effectAllowed = "copy";
                }}
                className="flex items-center justify-between gap-2 rounded-xl bg-card px-3 py-2 ring-1 ring-foreground/10"
              >
                <span className="truncate text-sm font-medium">{weapon.name}</span>
                <Button
                  type="button"
                  variant="outline"
                  className="h-11"
                  disabled={pending}
                  onClick={() => addWeapon(weapon)}
                >
                  <Plus />
                  Add
                </Button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
