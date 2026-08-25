import { SidebarProvider } from "@/components/layout/sidebar-context";

/**
 * Provider shell only — Sidebar chrome / modals land in restructure/nav-shell.
 */
export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <div className="protected-shell min-h-screen bg-[#F8F5FA] font-sans">
        <main
          data-dashboard-scroll
          className="min-h-screen overflow-y-auto overscroll-y-contain"
        >
          {children}
        </main>
      </div>
    </SidebarProvider>
  );
}
