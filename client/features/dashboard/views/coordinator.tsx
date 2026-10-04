"use client";

import { AppPageFrame } from "@/components/layout/app-page-frame";
import { cn } from "@/lib/utils";
import {
  dashboardGridClass,
  dashboardGridHalfClass,
  dashboardGridStackClass,
  dashboardPageShellClass,
} from "@/features/dashboard/data/dashboard-styles";
import { DashboardReveal } from "@/features/dashboard/components/DashboardReveal";
import { StatsRow } from "@/features/dashboard/components/StatsRow";
import { PriorityPatientsCard } from "@/features/patients/components/PriorityPatientsCard";
import { TodayScheduleCard } from "@/features/schedule/components/TodayScheduleCard";
import { TasksCard } from "@/features/dashboard/components/TasksCard";
import { RecentAlertsCard } from "@/features/alerts/components/RecentAlertsCard";
import { PageHeader } from "@/components/shared/PageHeader";
import { getCoordinatorStats } from "@/features/dashboard/data/coordinator-stats-data";
import { getPriorityPatients } from "@/features/patients/data/patients-data";
import { getTodaySchedule } from "@/features/schedule/data/schedule-data";
import { useNotificationStore } from "@/features/alerts/store/notification-store";

export function CoordinatorDashboardView() {
  const stats = getCoordinatorStats();
  const patients = getPriorityPatients();
  const schedule = getTodaySchedule();
  const alerts = useNotificationStore((s) => s.coordinatorAlerts);

  return (
    <AppPageFrame>
    <DashboardReveal className={cn(dashboardPageShellClass)}>
      <PageHeader
        title="Good Morning, Alex"
        subtitle={`You have ${stats.tasksDueToday} tasks and ${stats.appointmentsToday} appointments today.${
          stats.criticalAlerts > 0
            ? ` ${stats.criticalAlerts} critical alert${stats.criticalAlerts > 1 ? "s" : ""} require your attention.`
            : ""
        }`}
      />

      <StatsRow stats={stats} />

      <div className={dashboardGridClass}>
        <div className={cn(dashboardGridHalfClass, dashboardGridStackClass)}>
          <PriorityPatientsCard patients={patients} />
          <TasksCard />
        </div>
        <div className={cn(dashboardGridHalfClass, dashboardGridStackClass)}>
          <TodayScheduleCard schedule={schedule} />
          <RecentAlertsCard alerts={alerts} />
        </div>
      </div>
    </DashboardReveal>
    </AppPageFrame>
  );
}
