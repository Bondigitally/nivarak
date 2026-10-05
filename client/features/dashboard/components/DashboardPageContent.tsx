"use client";

import { useUserRole } from "@/components/layout/user-role-context";
import { DashboardHomeSkeleton } from "@/components/layout/page-skeletons";
import { PatientHomeView } from "@/features/dashboard/components/PatientHomeView";
import { CoordinatorDashboardView } from "@/features/dashboard/views/coordinator";
import { DoctorDashboardView } from "@/features/dashboard/views/doctor";

export function DashboardPageContent() {
  const { role, isLoading } = useUserRole();

  // Role defaults to "patient" until Cognito resolves — wait so doctors/coordinators
  // do not briefly see the patient home dashboard on reload.
  if (isLoading) {
    return <DashboardHomeSkeleton />;
  }

  if (role === "coordinator" || role === "admin") {
    return <CoordinatorDashboardView />;
  }

  if (role === "doctor") {
    return <DoctorDashboardView />;
  }

  return <PatientHomeView />;
}
