"use client";

import { dashboardCardClass, statusBadgeClass } from "@/features/dashboard/data/dashboard-styles";
import { typo } from "@/lib/tokens/typography";
import { cn } from "@/lib/utils";

export function TasksProgressCard({
  completed,
  total,
}: {
  completed: number;
  total: number;
}) {
  const fillPercent = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <section
      className={cn(dashboardCardClass, "flex w-full flex-col gap-4 p-4 sm:p-5")}
      aria-label="Task progress"
    >
      <div className="flex min-w-0 items-center justify-between gap-3">
        <h2 className={cn(typo.headingS, "text-foreground")}>Today&apos;s progress</h2>
        <span
          className={cn(
            statusBadgeClass,
            "shrink-0 bg-accent text-muted-foreground tabular-nums",
          )}
        >
          {completed}/{total} completed
        </span>
      </div>

      <div
        className="h-2 w-full overflow-hidden rounded-full bg-accent"
        role="progressbar"
        aria-valuenow={completed}
        aria-valuemin={0}
        aria-valuemax={total}
        aria-label={`${completed} of ${total} today's tasks completed`}
      >
        <div
          className="h-full rounded-full bg-info transition-[width] duration-500 ease-out"
          style={{ width: `${fillPercent}%` }}
        />
      </div>
    </section>
  );
}
