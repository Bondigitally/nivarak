"use client";

import type { ReactNode } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { AppSidebar } from "@/components/layout/sidebar";
import { UserRoleProvider, useUserRole } from "@/components/layout/user-role-context";
import { useSyncTaskGroups } from "@/features/tasks/hooks/use-sync-task-groups";

function RoleAwareSidebar() {
  const { role } = useUserRole();
  return <AppSidebar role={role} />;
}

function RoleAwareContent({ children }: { children: ReactNode }) {
  useSyncTaskGroups();
  return children;
}

export function RoleAwareAppShell({
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
