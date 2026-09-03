"use client";

import { CheckmarkCircle02Icon } from "@hugeicons/core-free-icons";
import { AppIcon } from "@/components/shared/AppIcon";
import {
  AnimatedStrikeText,
  useStrikeToggle,
} from "@/components/shared/AnimatedStrikeText";
import {
  dashboardDividedRowClass,
  statusBadgeClass,
} from "@/features/dashboard/data/dashboard-styles";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { BADGE_ICON_SIZE } from "@/lib/icons";
import { typo } from "@/lib/tokens/typography";
import { cn } from "@/lib/utils";
import { getTaskSection, type CareTask } from "../data/tasks-data";
import { TaskCheckbox } from "./TaskCheckbox";

export function TaskRow({
  task,
  onComplete,
  onIncomplete,
}: {
  task: CareTask;
  onComplete: (id: string) => void;
  onIncomplete?: (id: string) => void;
}) {
  const { displayCompleted, isPending, toggle } = useStrikeToggle(task.completed, () => {
    if (task.completed) {
      onIncomplete?.(task.id);
      return;
    }
    onComplete(task.id);
  });

  const isOverdue =
    !displayCompleted && getTaskSection(task.dueAt) === "overdue";

  const tooltipLabel = displayCompleted
    ? "Mark as incomplete"
    : "Mark as complete";

  return (
    <button
      type="button"
      aria-pressed={displayCompleted}
      aria-busy={isPending}
      aria-label={
        displayCompleted
          ? `Mark as incomplete: ${task.label}`
          : `Mark as complete: ${task.label}`
      }
      onClick={toggle}
      disabled={isPending}
      className={cn(
        dashboardDividedRowClass,
        "flex min-h-14 w-full min-w-0 cursor-pointer items-center gap-3 px-4 py-3 text-left sm:gap-3.5 sm:py-3.5",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        displayCompleted && "hover:before:opacity-0",
        isPending && "pointer-events-none",
      )}
    >
      <TooltipProvider delayDuration={200}>
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="shrink-0">
              <TaskCheckbox completed={displayCompleted} />
            </span>
          </TooltipTrigger>
          <TooltipContent side="top">{tooltipLabel}</TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <span className="flex min-w-0 flex-col gap-0.5 overflow-hidden">
        <AnimatedStrikeText
          active={displayCompleted}
          className={cn(
            typo.headingS,
            "max-w-full truncate transition-colors duration-200",
            displayCompleted ? "text-tertiary-foreground" : "text-foreground",
          )}
        >
          {task.label}
        </AnimatedStrikeText>
        <span
          className={cn(
            typo.caption,
            "truncate transition-colors duration-200",
            displayCompleted && "text-tertiary-foreground",
            isOverdue && "text-destructive",
          )}
        >
          {task.time}
          {task.detail ? ` · ${task.detail}` : null}
        </span>
      </span>

      <span className="min-w-3 flex-1" aria-hidden />

      {displayCompleted ? (
        <span
          className={cn(
            statusBadgeClass,
            typo.badge,
            "shrink-0 gap-1.5 border border-border bg-muted text-muted-foreground",
          )}
        >
          <AppIcon
            icon={CheckmarkCircle02Icon}
            size={BADGE_ICON_SIZE}
            aria-hidden
          />
          Completed
        </span>
      ) : (
        <span
          className={cn(
            typo.button,
            "inline-flex h-9 shrink-0 items-center justify-center rounded-full border border-primary bg-card px-4 text-primary",
          )}
        >
          Done
        </span>
      )}
    </button>
  );
}
