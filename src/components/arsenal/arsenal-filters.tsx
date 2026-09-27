"use client";

import { useRouter } from "next/navigation";
import { Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

export type ArsenalFilterState = {
  q: string;
  category: string;
  status: string;
  difficulty: string;
  sort: string;
};

const SORTS = [
  { value: "progress", label: "Progress" },
  { value: "difficulty", label: "Difficulty" },
  { value: "alpha", label: "Alpha" },
  { value: "updated", label: "Recently updated" },
];

function buildQuery(state: ArsenalFilterState): string {
  const params = new URLSearchParams();
  if (state.category && state.category !== "all") params.set("category", state.category);
  if (state.q.trim()) params.set("q", state.q.trim());
  if (state.status !== "all") params.set("status", state.status);
  if (state.difficulty !== "all") params.set("difficulty", state.difficulty);
  if (state.sort !== "progress") params.set("sort", state.sort);
  const query = params.toString();
  return query ? `/arsenal?${query}` : "/arsenal";
}

function Controls({
  state,
  onChange,
}: {
  state: ArsenalFilterState;
  onChange: (patch: Partial<ArsenalFilterState>) => void;
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-3">
      <Select value={state.status} onValueChange={(status) => onChange({ status })}>
        <SelectTrigger className="h-11 w-full" aria-label="Status">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All statuses</SelectItem>
          <SelectItem value="not-started">Not started</SelectItem>
          <SelectItem value="in-progress">In progress</SelectItem>
          <SelectItem value="gold">Gold</SelectItem>
        </SelectContent>
      </Select>
      <Select
        value={state.difficulty}
        onValueChange={(difficulty) => onChange({ difficulty })}
      >
        <SelectTrigger className="h-11 w-full" aria-label="Difficulty">
          <SelectValue placeholder="Difficulty" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Any difficulty</SelectItem>
          <SelectItem value="unrated">Unrated</SelectItem>
          <SelectItem value="1-25">1–25</SelectItem>
          <SelectItem value="26-50">26–50</SelectItem>
          <SelectItem value="51-75">51–75</SelectItem>
          <SelectItem value="76-100">76–100</SelectItem>
        </SelectContent>
      </Select>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="h-11 w-full justify-between">
            Sort: {SORTS.find((item) => item.value === state.sort)?.label ?? "Progress"}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-52">
          <DropdownMenuLabel>Sort arsenal</DropdownMenuLabel>
          {SORTS.map((item) => (
            <DropdownMenuItem key={item.value} onSelect={() => onChange({ sort: item.value })}>
              {item.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

export function ArsenalFilters({ state }: { state: ArsenalFilterState }) {
  const router = useRouter();

  function onChange(patch: Partial<ArsenalFilterState>) {
    router.push(buildQuery({ ...state, ...patch }));
  }

  return (
    <div className="flex flex-col gap-3">
      <form action="/arsenal" className="flex gap-2">
        {state.category !== "all" ? (
          <input type="hidden" name="category" value={state.category} />
        ) : null}
        {state.status !== "all" ? (
          <input type="hidden" name="status" value={state.status} />
        ) : null}
        {state.difficulty !== "all" ? (
          <input type="hidden" name="difficulty" value={state.difficulty} />
        ) : null}
        {state.sort !== "progress" ? (
          <input type="hidden" name="sort" value={state.sort} />
        ) : null}
        <Input
          name="q"
          defaultValue={state.q}
          placeholder="Search SMGs by name"
          aria-label="Search weapons"
          className="h-11"
        />
        <Button type="submit" className="h-11">
          Search
        </Button>
      </form>
      <div className="hidden lg:block">
        <Controls state={state} onChange={onChange} />
      </div>
      <div className="lg:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" className="h-11">
              <Filter />
              Filters
            </Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="pb-8">
            <SheetHeader>
              <SheetTitle>Filters</SheetTitle>
              <SheetDescription>
                Status, difficulty, and sort. Snipers in the category row includes marksman rifles.
              </SheetDescription>
            </SheetHeader>
            <div className="px-4">
              <Controls state={state} onChange={onChange} />
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
}
