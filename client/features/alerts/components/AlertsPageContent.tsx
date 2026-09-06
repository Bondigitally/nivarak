"use client";

import { AppPageFrame } from "@/components/layout/app-page-frame";
import { useUserRole } from "@/components/layout/user-role-context";
import { PageHeader } from "@/components/shared/PageHeader";
import { AlertsList } from "@/features/alerts/components/AlertsList";
import { DashboardReveal } from "@/features/dashboard/components/DashboardReveal";
import { dashboardPageShellClass } from "@/features/dashboard/data/dashboard-styles";
import { CoordinatorAlertsView } from "@/features/alerts/views/coordinator";
import { resolveViewForRole } from "@/lib/auth/resolve-view";
import type { UserRole } from "@/lib/auth/roles";
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

const ALERTS_VIEWS: Partial<Record<UserRole, typeof CoordinatorAlertsView>> = {
  coordinator: CoordinatorAlertsView,
  admin: CoordinatorAlertsView,
};

export function AlertsPageContent() {
  const { role } = useUserRole();
  const View = resolveViewForRole(role, ALERTS_VIEWS, PatientAlertsView);

  return <View />;
}
