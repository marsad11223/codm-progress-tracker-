import { ArsenalFilters } from "@/components/arsenal/arsenal-filters";
import { WeaponCard } from "@/components/arsenal/weapon-card";
import { CategoryFilter } from "@/components/nav/category-filter";
import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import { listArsenal, type ArsenalQuery } from "@/lib/services/arsenal";
import { parseCategoryFilter } from "@/lib/format";

function one(value: string | string[] | undefined): string {
  return Array.isArray(value) ? (value[0] ?? "") : (value ?? "");
}

function parseStatus(value: string): ArsenalQuery["status"] {
  if (value === "not-started" || value === "in-progress" || value === "gold") {
    return value;
  }
  return "all";
}

function parseDifficulty(value: string): ArsenalQuery["difficulty"] {
  if (
    value === "unrated" ||
    value === "1-25" ||
    value === "26-50" ||
    value === "51-75" ||
    value === "76-100"
  ) {
    return value;
  }
  return "all";
}

function parseSort(value: string): ArsenalQuery["sort"] {
  if (value === "difficulty" || value === "alpha" || value === "updated") return value;
  return "progress";
}

export const metadata = { title: "Arsenal" };

export default async function ArsenalPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const category = parseCategoryFilter(one(params.category));
  const query: ArsenalQuery = {
    search: one(params.q),
    category,
    status: parseStatus(one(params.status)),
    difficulty: parseDifficulty(one(params.difficulty)),
    sort: parseSort(one(params.sort)),
  };
  const result = await listArsenal(query);
  const preserve = {
    q: query.search || undefined,
    status: query.status === "all" ? undefined : query.status,
    difficulty: query.difficulty === "all" ? undefined : query.difficulty,
    sort: query.sort === "progress" ? undefined : query.sort,
  };

  return (
    <>
      <PageHeader
        eyebrow="Catalogue"
        title="Arsenal"
        description="SMGs are the seeded class. Other classes stay empty until they are added as rows. Snipers includes marksman rifles."
      />
      <div className="mb-4 flex flex-col gap-3">
        <CategoryFilter pathname="/arsenal" current={category} preserve={preserve} />
        <ArsenalFilters
          state={{
            q: query.search,
            category,
            status: query.status,
            difficulty: query.difficulty,
            sort: query.sort,
          }}
        />
      </div>
      {result.empty === "catalogue" ? (
        <EmptyState
          title="No weapons seeded yet"
          body="Run npx prisma db seed after the database is up. The README has the exact commands."
        />
      ) : null}
      {result.empty === "category" ? (
        <EmptyState
          title="The catalogue has not been seeded for that class yet"
          body="This filter is real. There are no rows for it, so nothing is invented here."
          action={{ href: "/arsenal", label: "Show all classes" }}
        />
      ) : null}
      {result.empty === "filters" ? (
        <EmptyState
          title="No weapons match these filters"
          body="Clear the search, status, or difficulty band to see the catalogue again."
          action={{ href: "/arsenal", label: "Clear filters" }}
        />
      ) : null}
      {result.empty === "none" ? (
        <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {result.weapons.map((weapon) => (
            <li key={weapon.id}>
              <WeaponCard weapon={weapon} />
            </li>
          ))}
        </ul>
      ) : null}
    </>
  );
}
