import type { ReactNode } from "react";
import { SidebarProvider } from "@/components/layout/sidebar-context";
import { shellCanvasClass } from "@/components/layout/shell-chrome";
import { SignOutDialog } from "@/components/layout/sign-out-dialog";
import { cn } from "@/lib/utils";

type AppShellProps = {
  sidebar: ReactNode;
  dialogs?: ReactNode;
  children: ReactNode;
  /** Optional shell class — e.g. `dark` for route-scoped theme testing */
  className?: string;
};

export function AppShell({ sidebar, dialogs, children, className }: AppShellProps) {
  return (
    <SidebarProvider>
      <div
        className={cn(
          "protected-shell flex overflow-hidden bg-sidebar font-sans",
          className,
        )}
      >
        {sidebar}
        <div className="relative min-h-0 min-w-0 flex-1 overflow-hidden bg-sidebar">
          <div
            className={cn(
              "absolute inset-0 overflow-hidden",
              shellCanvasClass,
            )}
          >
            <main
              data-dashboard-scroll
              className="absolute inset-0 overflow-y-scroll overscroll-y-contain bg-transparent"
            >
              {children}
            </main>
            {/* Side + bottom frame */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 z-10 hidden border-x border-b border-sidebar-border lg:block"
            />
          </div>
        </div>
      </div>
      <SignOutDialog />
      {dialogs}
    </SidebarProvider>
  );
}
