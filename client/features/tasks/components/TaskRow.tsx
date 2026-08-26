"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import { Tick02Icon } from "@hugeicons/core-free-icons";
import {
  dashboardCardClass,
  statusBadgeClass,
} from "@/features/dashboard/data/dashboard-styles";
import { typo } from "@/lib/tokens/typography";
import { cn } from "@/lib/utils";
import type { CareTask } from "../data/tasks-data";

export function TaskRow({
  task,
  onToggle,
}: {
  task: CareTask;
  onToggle: (id: string) => void;
}) {
  const showOverdue = Boolean(task.overdue && !task.completed);

  return (
    <button
      type="button"
      onClick={() => onToggle(task.id)}
      aria-pressed={task.completed}
      aria-label={`${task.completed ? "Mark incomplete" : "Mark complete"}: ${task.label}`}
      className={cn(
        dashboardCardClass,
        "flex min-h-14 w-full min-w-0 items-center px-3.5 py-3 text-left sm:px-4 sm:py-3.5",
        "transition-colors duration-150",
        "hover:bg-accent active:bg-divider",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
      )}
    >
      {/* Inner row: native <button> flex can fail to grow children; wrap for reliable span. */}
      <span className="flex w-full min-w-0 items-center justify-between gap-3">
        <span className="flex min-w-0 flex-1 items-center gap-3">
          <span
            className={cn(
              "flex size-5 shrink-0 items-center justify-center rounded-[4px]",
              "shadow-[0_1px_2px_rgba(17,24,39,0.04)]",
              task.completed
                ? "bg-primary"
                : "border-[1.5px] border-primary bg-card",
            )}
            aria-hidden
          >
            {task.completed ? (
              <HugeiconsIcon
                icon={Tick02Icon}
                size={16}
                strokeWidth={2.5}
                color="white"
              />
            ) : null}
          </span>

          <span className="flex min-w-0 flex-1 flex-col gap-0.5">
            <span
              className={cn(
                typo.headingM,
                "block w-full truncate",
                task.completed
                  ? "text-tertiary-foreground line-through"
                  : "text-foreground",
              )}
            >
              {task.label}
            </span>
            <span className={cn(typo.caption, "block w-full truncate")}>
              {task.detail}
            </span>
          </span>
        </span>

        {showOverdue ? (
          <span
            className={cn(
              statusBadgeClass,
              "ml-auto shrink-0 border border-warning-muted bg-warning-muted text-warning",
            )}
          >
            Overdue
          </span>
        ) : null}
      </span>
    </button>
  );
}
