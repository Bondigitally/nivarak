"use client";

import { useUserRole } from "@/components/layout/user-role-context";
import { PatientHomeView } from "@/features/dashboard/components/PatientHomeView";
import { CoordinatorDashboardView } from "@/features/dashboard/views/coordinator";
import { resolveViewForRole } from "@/lib/auth/resolve-view";
import type { UserRole } from "@/lib/auth/roles";

const DASHBOARD_VIEWS: Partial<Record<UserRole, typeof PatientHomeView>> = {
  coordinator: CoordinatorDashboardView,
  admin: CoordinatorDashboardView,
};

export function DashboardPageContent() {
  const { role } = useUserRole();
  const View = resolveViewForRole(role, DASHBOARD_VIEWS, PatientHomeView);

  return <View />;
}
