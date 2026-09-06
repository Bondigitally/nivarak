import { create } from "zustand";
import { MOCK_NOTIFICATIONS } from "../data/alerts-data";
import { getCoordinatorAlerts } from "../data/coordinator-alerts-data";
import type { Notification } from "@/lib/domain";

type NotificationStore = {
  /** IDs of patient notifications explicitly marked as read. */
  readIds: string[];
  /** IDs of coordinator alerts explicitly marked as read. */
  coordinatorReadIds: string[];
  coordinatorAlerts: Notification[];
  markRead: (id: string) => void;
  markAllRead: () => void;
  markCoordinatorRead: (id: string) => void;
  markAllCoordinatorRead: () => void;
  isRead: (id: string, originallyRead: boolean) => boolean;
  isCoordinatorRead: (id: string, originallyRead: boolean) => boolean;
  unreadCount: () => number;
  coordinatorUnreadCount: () => number;
};

export const useNotificationStore = create<NotificationStore>((set, get) => ({
  readIds: [],
  coordinatorReadIds: [],
  coordinatorAlerts: getCoordinatorAlerts(),

  markRead: (id) =>
    set((state) => ({
      readIds: state.readIds.includes(id)
        ? state.readIds
        : [...state.readIds, id],
    })),

  markAllRead: () =>
    set({ readIds: MOCK_NOTIFICATIONS.map((n) => n.id) }),

  markCoordinatorRead: (id) =>
    set((state) => ({
      coordinatorReadIds: state.coordinatorReadIds.includes(id)
        ? state.coordinatorReadIds
        : [...state.coordinatorReadIds, id],
      coordinatorAlerts: state.coordinatorAlerts.map((alert) =>
        alert.id === id ? { ...alert, read: true } : alert,
      ),
    })),

  markAllCoordinatorRead: () =>
    set((state) => ({
      coordinatorReadIds: state.coordinatorAlerts.map((a) => a.id),
      coordinatorAlerts: state.coordinatorAlerts.map((alert) => ({
        ...alert,
        read: true,
      })),
    })),

  isRead: (id, originallyRead) =>
    originallyRead || get().readIds.includes(id),

  isCoordinatorRead: (id, originallyRead) =>
    originallyRead || get().coordinatorReadIds.includes(id),

  unreadCount: () => {
    const { readIds } = get();
    return MOCK_NOTIFICATIONS.filter(
      (n) => !n.read && !readIds.includes(n.id),
    ).length;
  },

  coordinatorUnreadCount: () => {
    const { coordinatorAlerts, coordinatorReadIds } = get();
    return coordinatorAlerts.filter(
      (a) => !a.read && !coordinatorReadIds.includes(a.id),
    ).length;
  },
}));
