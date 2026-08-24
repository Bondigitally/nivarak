"use client";

import { DashboardPageFrame } from "@/features/dashboard/components/HomeTopBar";
import { DashboardReveal } from "@/features/dashboard/components/DashboardReveal";
import { dashboardPageShellClass } from "@/features/dashboard/data/dashboard-styles";
import { getHomeDashboardData } from "@/features/dashboard/data/home-data";
import { TasksList } from "@/features/tasks/components/TasksList";
import { typo } from "@/lib/tokens/typography";
import { cn } from "@/lib/utils";

export default function TasksPage() {
  const data = getHomeDashboardData();
  const notificationCount = data?.notificationCount ?? 3;

  return (
    <DashboardPageFrame notificationCount={notificationCount}>
      <DashboardReveal className={cn(dashboardPageShellClass)}>
        <div className="flex min-w-0 flex-col gap-1">
          <h1 className={typo.headingXxl}>Today&apos;s Tasks</h1>
          <p className={typo.bodyL}>You are doing great. Keep it up.</p>
        </div>

        <TasksList />
      </DashboardReveal>
    </DashboardPageFrame>
  );
}
