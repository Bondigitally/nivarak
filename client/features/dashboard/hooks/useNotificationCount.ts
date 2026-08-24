import { getHomeDashboardData } from "@/features/dashboard/data/home-data";

/**
 * Returns the current notification count.
 * Currently backed by mock data; will be replaced with API call / real-time state.
 */
export function useNotificationCount(): number {
  const data = getHomeDashboardData();
  return data?.notificationCount ?? 0;
}
