import { create } from "zustand";
import {
  getTaskGroups,
  type CareTaskGroup,
} from "../data/tasks-data";
import { getCoordinatorTaskGroups } from "../data/coordinator-tasks-data";
import type { UserRole } from "@/lib/auth/roles";

type TaskStore = {
  groups: CareTaskGroup[];
  activeRole: UserRole | null;
  setCompleted: (id: string, completed: boolean) => void;
  loadGroupsForRole: (role: UserRole) => void;
};

function groupsForRole(role: UserRole): CareTaskGroup[] {
  if (role === "coordinator" || role === "admin") {
    return getCoordinatorTaskGroups();
  }
  return getTaskGroups();
}

export const useTaskStore = create<TaskStore>((set, get) => ({
  groups: getTaskGroups(),
  activeRole: null,

  setCompleted: (id, completed) =>
    set((state) => ({
      groups: state.groups.map((group): CareTaskGroup => ({
        ...group,
        tasks: group.tasks.map((task) =>
          task.id === id ? { ...task, completed } : task,
        ),
      })),
    })),

  loadGroupsForRole: (role) => {
    if (get().activeRole === role) return;
    set({
      activeRole: role,
      groups: groupsForRole(role),
    });
  },
}));
