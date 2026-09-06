"use client";

import { useEffect } from "react";
import { useUserRole } from "@/components/layout/user-role-context";
import { useTaskStore } from "@/features/tasks/store/task-store";

/** Keeps task mock data aligned with the active user role. */
export function useSyncTaskGroups() {
  const { role, isLoading } = useUserRole();
  const loadGroupsForRole = useTaskStore((s) => s.loadGroupsForRole);

  useEffect(() => {
    if (isLoading) return;
    loadGroupsForRole(role);
  }, [role, isLoading, loadGroupsForRole]);
}
