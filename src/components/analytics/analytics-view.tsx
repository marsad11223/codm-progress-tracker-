import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { AnalyticsSnapshot } from "@/types";

function Meter({
  label,
  detail,
  value,
  max,
}: {
  label: string;
  detail: string;
  value: number;
  max: number;
}) {
  const width = max === 0 ? 0 : Math.min(100, Math.round((value / max) * 100));
  return (
    <div>
      <div className="mb-1 flex items-baseline justify-between gap-3 text-sm">
        <span>{label}</span>
        <span className="text-muted-foreground">{detail}</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-muted">
        <div className="h-full rounded-full bg-primary" style={{ width: `${width}%` }} />
      </div>
    </div>
  );
}

export function AnalyticsView({ snapshot }: { snapshot: AnalyticsSnapshot }) {
  if (snapshot.totalWeapons === 0) {
    return (
      <>
        <PageHeader
          eyebrow="Read only"
          title="Analytics"
          description="The same progress rows as the dashboard, cut so thin catalogue data stays visible."
        />
        <EmptyState
          title="No weapons seeded yet"
          body="Analytics has nothing to count until the catalogue is seeded. The README lists npx prisma db seed."
        />
      </>
    );
  }

  return (
    <>
      <PageHeader
        eyebrow="Read only"
        title="Analytics"
        description="Same rows as the dashboard. Bars are CSS, not a second progress number."
      />
      <div className="grid gap-3 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Completion by category</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            {snapshot.categories.map((row) => (
              <Meter
                key={row.category}
                label={row.label}
                value={row.gold}
                max={Math.max(row.active, 1)}
                detail={
                  row.active === 0
                    ? "Not seeded"
                    : `${row.gold} Gold / ${row.active} active`
                }
              />
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Progress distribution</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            {snapshot.buckets.map((bucket) => (
              <Meter
                key={bucket.label}
                label={bucket.label}
                value={bucket.count}
                max={snapshot.totalWeapons}
                detail={`${bucket.count} weapons`}
              />
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Unverified targets</CardTitle>
          </CardHeader>
          <CardContent>
            <Meter
              label="Weapons with a target that is not verified"
              value={snapshot.unverifiedWeapons}
              max={snapshot.totalWeapons}
              detail={`${snapshot.unverifiedWeapons} of ${snapshot.totalWeapons}`}
            />
            <p className="mt-3 text-sm text-muted-foreground">
              A zero target with the unverified flag is seed data, not a finished requirement. Checking the box still counts.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Started against never started</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <Meter
              label="Started"
              value={snapshot.started}
              max={snapshot.totalWeapons}
              detail={`${snapshot.started} weapons`}
            />
            <Meter
              label="Never started"
              value={snapshot.neverStarted}
              max={snapshot.totalWeapons}
              detail={`${snapshot.neverStarted} weapons`}
            />
          </CardContent>
        </Card>
      </div>
    </>
  );
}
