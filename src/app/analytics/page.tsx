import { AnalyticsView } from "@/components/analytics/analytics-view";
import { getAnalytics } from "@/lib/services/analytics";

export const metadata = { title: "Analytics" };

export default async function AnalyticsPage() {
  const snapshot = await getAnalytics();
  return <AnalyticsView snapshot={snapshot} />;
}
