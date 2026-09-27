import { BottomNav } from "@/components/nav/bottom-nav";
import { Sidebar } from "@/components/nav/sidebar";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Sidebar />
      <div className="lg:pl-60">
        <main className="mx-auto w-full max-w-6xl px-4 pt-6 pb-28 lg:px-8 lg:pt-8 lg:pb-12">
          {children}
        </main>
      </div>
      <BottomNav />
    </>
  );
}
