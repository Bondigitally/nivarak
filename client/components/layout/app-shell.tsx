import type { ReactNode } from "react";
import { SidebarProvider } from "@/components/layout/sidebar-context";
import { SignOutDialog } from "@/components/layout/sign-out-dialog";

type AppShellProps = {
  sidebar: ReactNode;
  dialogs?: ReactNode;
  children: ReactNode;
};

export function AppShell({ sidebar, dialogs, children }: AppShellProps) {
  return (
    <SidebarProvider>
      <div className="protected-shell flex overflow-hidden bg-sidebar font-sans">
        {sidebar}
        <main
          data-dashboard-scroll
          className="min-h-0 min-w-0 flex-1 overflow-y-scroll overscroll-y-contain scrollbar-gutter bg-background lg:rounded-tl-xl lg:border lg:border-sidebar-border"
        >
          {children}
        </main>
      </div>
      <SignOutDialog />
      {dialogs}
    </SidebarProvider>
  );
}
