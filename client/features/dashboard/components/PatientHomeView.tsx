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
        <div className={cn(dashboardGridHalfClass, dashboardGridStackClass)}>
          <VitalsCard vitals={data.vitals} />
          <TasksCard />
        </div>
        <div className={cn(dashboardGridHalfClass, dashboardGridStackClass)}>
          <RiskStatusCard risk={data.risk} />
          <AppointmentsCard appointments={data.appointments} />
          <CareTeamCard members={data.careTeam} />
        </div>
      </div>
      <RecentActivityCard items={data.activity} />
    </DashboardReveal>
    </AppPageFrame>
  );
}
