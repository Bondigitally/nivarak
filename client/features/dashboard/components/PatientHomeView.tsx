"use client";

import { AppPageFrame } from "@/features/dashboard/components/AppPageFrame";
import { AppointmentsCard } from "@/features/appointments/components/AppointmentsCard";
import { CareTeamCard } from "@/features/dashboard/components/CareTeamCard";
import { DashboardReveal } from "@/features/dashboard/components/DashboardReveal";
import { HomeGreeting } from "@/features/dashboard/components/HomeGreeting";
import { IasScoreCard } from "@/features/dashboard/components/IasScoreCard";
import { RecentActivityCard } from "@/features/dashboard/components/RecentActivityCard";
import { RiskStatusCard } from "@/features/dashboard/components/RiskStatusCard";
import { TasksCard } from "@/features/tasks/components/TasksCard";
import { VitalsCard } from "@/features/dashboard/components/VitalsCard";
import {
  dashboardGridClass,
  dashboardGridHalfClass,
  dashboardGridStackClass,
  dashboardGridThirdClass,
  dashboardPageShellClass,
} from "@/features/dashboard/data/dashboard-styles";
import { getHomeDashboardData } from "@/features/dashboard/data/home-data";
import { cn } from "@/lib/utils";

export function PatientHomeView() {
  const data = getHomeDashboardData();

  return (
    <AppPageFrame>
    <DashboardReveal className={cn(dashboardPageShellClass)}>
      <HomeGreeting name={data.greetingName} subtitle={data.greetingSubtitle} />
      <IasScoreCard assessment={data.assessment} />
      <div className={dashboardGridClass}>
        <div className={cn(dashboardGridHalfClass, "flex min-h-0")}>
          <VitalsCard vitals={data.vitals} />
        </div>
        <div className={cn(dashboardGridHalfClass, dashboardGridStackClass)}>
          <RiskStatusCard risk={data.risk} />
          <AppointmentsCard appointments={data.appointments} />
        </div>
        <div className={cn(dashboardGridThirdClass, "min-w-0")}>
          <TasksCard />
        </div>
        <div className={cn(dashboardGridThirdClass, "min-w-0")}>
          <CareTeamCard members={data.careTeam} />
        </div>
        <div className={cn(dashboardGridThirdClass, "min-w-0")}>
          <RecentActivityCard items={data.activity} />
        </div>
      </div>
    </DashboardReveal>
    </AppPageFrame>
  );
}
