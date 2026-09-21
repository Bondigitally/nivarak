"use client";

import { AppPageFrame } from "@/components/layout/app-page-frame";
import { PageHeader } from "@/components/shared/PageHeader";
import { DashboardReveal } from "@/features/dashboard/components/DashboardReveal";
import { dashboardPageShellClass } from "@/features/dashboard/data/dashboard-styles";
import { TasksList } from "@/features/tasks/components/TasksList";
import { cn } from "@/lib/utils";

export function TasksPageContent() {
  return (
    <AppPageFrame>
      <DashboardReveal className={cn(dashboardPageShellClass)}>
        <PageHeader
          title="Tasks"
          subtitle="Overdue, today, and completed actions from your care team."
        />
        <TasksList />
      </DashboardReveal>
    </AppPageFrame>
  );
}
