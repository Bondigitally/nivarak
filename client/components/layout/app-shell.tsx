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

/**
 * Fixed viewport frame for the protected app.
 *
 * Layout contract:
 * - The outer `protected-shell` div is a full-viewport flex row (sidebar + main).
 * - `main[data-dashboard-scroll]` is absolutely inset inside a non-scrolling flex item.
 *   This prevents double scrollbars: only the main pane scrolls; html/body do not.
 * - `shellCanvasClass` paints the cool-gray canvas on the non-scrolling frame so the
 *   fill stays viewport-fixed regardless of scroll position.
 * - The `border-x border-b` overlay adds the panel frame on lg without affecting layout.
 */
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
