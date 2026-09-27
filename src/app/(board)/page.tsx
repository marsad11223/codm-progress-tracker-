import { DashboardView } from "@/components/dashboard/dashboard-view";
import { parseCategoryFilter } from "@/lib/format";
import { LOCAL_USER_ID } from "@/lib/constants";
import { getDashboard } from "@/lib/services/dashboard";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const raw = Array.isArray(params.category) ? params.category[0] : params.category;
  const category = parseCategoryFilter(raw);
  const summary = await getDashboard(LOCAL_USER_ID, category);
  return <DashboardView summary={summary} category={category} />;
}
