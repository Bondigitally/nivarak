"use client";

import { useEffect, type ReactNode } from "react";
import { ThemeProvider } from "@/components/theme-provider";
import { AppShell } from "@/components/layout/app-shell";
import { AppSidebar } from "@/components/layout/sidebar";
import {
  UserRoleProvider,
  useUserRole,
} from "@/components/layout/user-role-context";
import { useNotificationStore } from "@/features/alerts/store/notification-store";
import { getNewLeadsCount } from "@/features/leads/data/leads-data";
import { getActionableTaskCount } from "@/features/tasks/data/tasks-data";
import { useSyncTaskGroups } from "@/features/tasks/hooks/use-sync-task-groups";
import { useTaskStore } from "@/features/tasks/store/task-store";
import type { UserRole } from "@/lib/auth/roles";

/**
 * Badge counts for nav items, derived from live stores.
 * Coordinator and admin see the coordinator alert count and leads badge;
 * all other roles see the patient notification count and task count.
 */
function useShellNavBadges(role: UserRole): Record<string, number> {
  const isCoordinatorChrome = role === "coordinator" || role === "admin";
  const patientUnread = useNotificationStore((s) => s.unreadCount());
  const coordinatorUnread = useNotificationStore((s) =>
    s.coordinatorUnreadCount(),
  );
  const alertUnreadCount = isCoordinatorChrome
    ? coordinatorUnread
    : patientUnread;
  const taskGroups = useTaskStore((s) => s.groups);
  const actionableTaskCount = getActionableTaskCount(taskGroups);
  const newLeadsCount = isCoordinatorChrome ? getNewLeadsCount() : 0;

  return {
    "/notifications": alertUnreadCount,
    "/care/tasks": actionableTaskCount,
    ...(isCoordinatorChrome ? { "/leads": newLeadsCount } : {}),
  };
}

function RoleAwareSidebar() {
  const { role, isLoading } = useUserRole();
  const navBadges = useShellNavBadges(role);
  if (isLoading) return null;
  return <AppSidebar role={role} navBadges={navBadges} />;
}

function RoleAwareContent({ children }: { children: ReactNode }) {
  useSyncTaskGroups();
  return children;
}

/**
 * Theme switching is dashboard-only. Clear `html.dark` on leave so public
 * routes (IASP, auth, legal) never inherit a leftover dark class.
 */
function DashboardThemeProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    return () => {
      document.documentElement.classList.remove("dark");
    };
  }, []);

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      {children}
    </ThemeProvider>
  );
}

/**
 * Protected chrome bridge — connects feature stores to the app shell.
 *
 * Lives here rather than in layout.tsx so layout.tsx stays a React Server
 * Component (no "use client"). Stores are client-only and must be initialized
 * inside a Client Component boundary.
 */
export function ProtectedAppShell({
  dialogs,
  children,
}: {
  dialogs?: ReactNode;
  children: ReactNode;
}) {
  return (
    <DashboardThemeProvider>
      <UserRoleProvider>
        <AppShell sidebar={<RoleAwareSidebar />} dialogs={dialogs}>
          <RoleAwareContent>{children}</RoleAwareContent>
        </AppShell>
      </UserRoleProvider>
    </DashboardThemeProvider>
  );
}
