import { create } from "zustand";
import {
  getTaskGroups,
  type CareTaskGroup,
} from "../data/tasks-data";
import { getCoordinatorTaskGroups } from "../data/coordinator-tasks-data";
import type { UserRole } from "@/lib/auth/roles";

type TaskStore = {
  groups: CareTaskGroup[];
  /** Tracks which role's data is currently loaded to avoid redundant resets. */
  activeRole: UserRole | null;
  setCompleted: (id: string, completed: boolean) => void;
  loadGroupsForRole: (role: UserRole) => void;
};

/** Returns the appropriate mock dataset for the given role. */
function groupsForRole(role: UserRole): CareTaskGroup[] {
  if (role === "coordinator" || role === "admin") {
    return getCoordinatorTaskGroups();
  }
  return getTaskGroups();
}

export const useTaskStore = create<TaskStore>((set, get) => ({
  groups: getTaskGroups(),
  activeRole: null,

  /**
   * Toggles a task's completed state across all groups by id.
   * Tasks are not moved between overdue/today/upcoming buckets on completion —
   * the group structure is static until the store is reloaded for a new role.
   */
  setCompleted: (id, completed) =>
    set((state) => ({
      groups: state.groups.map((group): CareTaskGroup => ({
        ...group,
        tasks: group.tasks.map((task) =>
          task.id === id ? { ...task, completed } : task,
        ),
      })),
    })),

  /** No-op if the same role is already loaded — prevents redundant resets on re-render. */
  loadGroupsForRole: (role) => {
    if (get().activeRole === role) return;
    set({
      activeRole: role,
      groups: groupsForRole(role),
    });
  },
}));
