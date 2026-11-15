"use client";

import type { ReactNode } from "react";
import { SidebarProvider } from "@/components/layout/sidebar-context";
import {
  DASHBOARD_SHELL_DRAWER_OVERLAY_ROOT_ID,
  DASHBOARD_WORKSPACE_DRAWER_PANEL_ROOT_ID,
  dashboardShellDrawerOverlayHostClass,
  dashboardWorkspaceDrawerPanelHostClass,
  shellInnerFrameClass,
  shellMainContentHostClass,
  shellMainWorkspaceClass,
} from "@/components/layout/shell-chrome";
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
 * - `.protected-shell` applies a uniform outer gutter on all sides (`--shell-outer-gutter`).
 * - `shellInnerFrameClass` holds sidebar + workspace at equal height (shared top/bottom).
 * - Route chrome (`AppPageFrame`) pins the top bar; `[data-dashboard-scroll]` is the
 *   only vertical scrollport for page body. html/body do not scroll.
 * - `shellMainWorkspaceClass` is the rounded main pane (24px on lg).
 */
export function AppShell({ sidebar, dialogs, children, className }: AppShellProps) {
  return (
    <SidebarProvider>
      <div
        className={cn("protected-shell overflow-hidden bg-sidebar font-sans", className)}
      >
        <div className={shellInnerFrameClass}>
          <div
            id={DASHBOARD_SHELL_DRAWER_OVERLAY_ROOT_ID}
            className={dashboardShellDrawerOverlayHostClass}
            aria-hidden
          />
          {sidebar}
          <div className="relative flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
            <div
              id={DASHBOARD_WORKSPACE_DRAWER_PANEL_ROOT_ID}
              className={dashboardWorkspaceDrawerPanelHostClass}
              aria-hidden
            />
            <div className={shellMainWorkspaceClass}>
              <main className={shellMainContentHostClass}>{children}</main>
            </div>
          </div>
        </div>
      </div>
      <SignOutDialog />
      {dialogs}
    </SidebarProvider>
  );
}
