"use client";

import { AppPageFrame } from "@/features/dashboard/components/AppPageFrame";
import { useUserRole } from "@/components/layout/user-role-context";
import { PageHeader } from "@/components/shared/PageHeader";
import { AlertsList } from "@/features/alerts/components/AlertsList";
import { DashboardReveal } from "@/features/dashboard/components/DashboardReveal";
import { dashboardPageShellClass } from "@/features/dashboard/data/dashboard-styles";
import { CoordinatorAlertsView } from "@/features/alerts/views/coordinator";
import { cn } from "@/lib/utils";

function PatientAlertsView() {
  return (
    <AppPageFrame>
      <DashboardReveal className={cn(dashboardPageShellClass)}>
        <PageHeader
          title="Notifications"
          subtitle="Stay on top of vitals, assessments, tasks, and risk changes."
        />
        <AlertsList />
      </DashboardReveal>
    </AppPageFrame>
  );
}

export function AlertsPageContent() {
  const { role } = useUserRole();

  if (role === "coordinator" || role === "admin") {
    return <CoordinatorAlertsView />;
  }

  return <PatientAlertsView />;
}
