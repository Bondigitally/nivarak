import { Sidebar } from "@/components/layout/sidebar";
import { SidebarProvider } from "@/components/layout/sidebar-context";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      {/* In-flow sidebar + scrolling main */}
      <div className="protected-shell flex overflow-hidden bg-[#F8F5FA] font-sans">
        <Sidebar />
        <main
          data-dashboard-scroll
          className="min-h-0 min-w-0 flex-1 overflow-y-auto overscroll-y-contain"
        >
          {children}
        </main>
      </div>
    </SidebarProvider>
  );
}
