"use client";

import { useEffect } from "react";
import { useTaskStore } from "@/features/tasks/store/task-store";

/**
 * Loads task mock data for the dashboard/tasks pages.
 * Role-aware sync via UserRoleProvider lands in the role/shell layer (#41).
 */
export function useSyncTaskGroups() {
  const loadGroupsForRole = useTaskStore((s) => s.loadGroupsForRole);

  useEffect(() => {
    loadGroupsForRole("patient");
  }, [loadGroupsForRole]);
}
