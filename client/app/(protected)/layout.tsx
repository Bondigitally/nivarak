import { Sidebar } from "@/components/layout/sidebar";
import { SidebarProvider } from "@/components/layout/sidebar-context";
import { SignOutDialog } from "@/components/layout/sign-out-dialog";
import { BookVisitModal } from "@/features/appointments/components/BookVisitModal";
import { InviteCaregiverDialog } from "@/features/care-team/components/InviteCaregiverDialog";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      {/* In-flow sidebar + scrolling main */}
      <div className="protected-shell flex overflow-hidden bg-background font-sans">
        <Sidebar />
        <main
          data-dashboard-scroll
          className="min-h-0 min-w-0 flex-1 overflow-y-scroll overscroll-y-contain scrollbar-gutter"
        >
          {children}
        </main>
      </div>
      <SignOutDialog />
      <BookVisitModal />
      <InviteCaregiverDialog />
    </SidebarProvider>
  );
}
