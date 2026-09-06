"use client";

import { useUserRole } from "@/components/layout/user-role-context";
import { PatientHomeView } from "@/features/dashboard/components/PatientHomeView";
import { CoordinatorDashboardView } from "@/features/dashboard/views/coordinator";

export function DashboardPageContent() {
  const { role } = useUserRole();

  if (role === "coordinator" || role === "admin") {
    return <CoordinatorDashboardView />;
  }

  return <PatientHomeView />;
}
