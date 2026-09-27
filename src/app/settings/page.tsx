import { PageHeader } from "@/components/page-header";
import { SettingsPanel } from "@/components/settings/settings-panel";

export const metadata = { title: "Settings" };

export default function SettingsPage() {
  return (
    <>
      <PageHeader
        eyebrow="Local only"
        title="Settings"
        description="One local user, no account. Theme stays in this browser. The tracker never connects to Call of Duty."
      />
      <SettingsPanel />
    </>
  );
}
