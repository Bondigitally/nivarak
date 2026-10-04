"use client";

import type { ReactNode } from "react";
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
  const { role } = useUserRole();
  const navBadges = useShellNavBadges(role);
  return <AppSidebar role={role} navBadges={navBadges} />;
}

function RoleAwareContent({ children }: { children: ReactNode }) {
  useSyncTaskGroups();
  return children;
}

/** Protected chrome bridge — owns feature stores so layout stays feature-free. */
export function ProtectedAppShell({
  dialogs,
  children,
}: {
  dialogs?: ReactNode;
  children: ReactNode;
}) {
  return (
    <UserRoleProvider>
      <AppShell sidebar={<RoleAwareSidebar />} dialogs={dialogs}>
        <RoleAwareContent>{children}</RoleAwareContent>
      </AppShell>
    </UserRoleProvider>
  );
}
