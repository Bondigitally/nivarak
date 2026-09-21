"use client";

import { dashboardCardClass, cardTitleClass } from "@/features/dashboard/data/dashboard-styles";
import { typo } from "@/lib/tokens/typography";
import { cn } from "@/lib/utils";

export function TasksProgressCard({
  completed,
  total,
}: {
  completed: number;
  total: number;
}) {
  return (
    <section
      className={cn(dashboardCardClass, "flex w-full flex-col gap-4 p-4 sm:p-5")}
      aria-label="Task progress"
    >
      <div className="flex min-w-0 items-center justify-between gap-3">
        <h2 className={cardTitleClass}>Today&apos;s progress</h2>
        <div
          className="flex shrink-0 items-center gap-4"
          aria-hidden
        >
          <p className="text-[48px] font-bold leading-14 tracking-[-0.05em] tabular-nums whitespace-nowrap">
            <span className="text-primary">{completed}</span>
            <span className="text-foreground"> of {total}</span>
          </p>
          <span className={cn(typo.bodyL, "whitespace-nowrap")}>
            tasks completed
          </span>
        </div>
      </div>

      <div
        className="flex w-full gap-1"
        role="progressbar"
        aria-valuenow={completed}
        aria-valuemin={0}
        aria-valuemax={total}
        aria-label={`${completed} of ${total} today's tasks completed`}
      >
        {Array.from({ length: total }, (_, index) => (
          <div
            key={index}
            className={cn(
              "h-2 min-w-0 flex-1 rounded-full transition-colors duration-500 ease-out",
              index < completed ? "bg-primary" : "bg-accent",
            )}
            aria-hidden
          />
        ))}
      </div>
    </section>
  );
}
