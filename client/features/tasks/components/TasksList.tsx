"use client";

import { useState, type ReactNode } from "react";
import { LayoutGroup } from "framer-motion";
import {
  ArrowDown01Icon,
  BellRingIcon,
  TaskDaily01Icon,
} from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import { AppIcon } from "@/components/shared/AppIcon";
import { dashboardCardClass } from "@/features/dashboard/data/dashboard-styles";
import { typo } from "@/lib/tokens/typography";
import { cn } from "@/lib/utils";
import { EmptyState } from "@/features/dashboard/components/EmptyState";
import { GentleReminderModal } from "./GentleReminderModal";
import { TasksProgressCard } from "./TasksProgressCard";
import { TasksGroupedCard } from "./TasksGroupedCard";
import {
  getCompletedTasks,
  getIncompleteTasks,
  getIncompleteTasksForSection,
  getTaskGroups,
  getTaskSection,
  getTodayTaskProgress,
  type CareTaskGroup,
} from "../data/tasks-data";

function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <h2 className={cn(typo.bodyL, "font-semibold text-foreground")}>
      {children}
    </h2>
  );
}

function TasksSectionCollapsible({
  label,
  count,
  expanded,
  onToggle,
  children,
  tone = "default",
}: {
  label: string;
  count: number;
  expanded: boolean;
  onToggle: () => void;
  children: ReactNode;
  tone?: "default" | "destructive";
}) {
  const isDestructive = tone === "destructive";

  return (
    <div className="flex w-full flex-col gap-2">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={expanded}
        className={cn(
          dashboardCardClass,
          "flex min-h-16 w-full min-w-0 items-center justify-between gap-3 px-4 py-4 text-left sm:min-h-[4.5rem] sm:px-5",
          "transition-colors duration-150 hover:bg-accent",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
          isDestructive
            ? "border-destructive focus-visible:ring-destructive"
            : "focus-visible:ring-ring",
        )}
      >
        <span
          className={cn(
            typo.bodyL,
            "flex min-w-0 flex-1 items-center gap-2.5 font-normal text-foreground",
          )}
        >
          {isDestructive ? (
            <span className="overdue-status-dot" aria-hidden />
          ) : null}
          <span
            className={cn(
              "min-w-0 truncate font-semibold",
              isDestructive && "text-destructive",
            )}
          >
            {label} ({count})
          </span>
        </span>
        <AppIcon
          icon={ArrowDown01Icon}
          className={cn(
            "text-muted-foreground transition-transform duration-200",
            expanded && "rotate-180",
          )}
        />
      </button>
      {expanded ? children : null}
    </div>
  );
}

export function TasksList({
  initialGroups = getTaskGroups(),
}: {
  initialGroups?: CareTaskGroup[];
}) {
  const [groups, setGroups] = useState(initialGroups);
  const [overdueExpanded, setOverdueExpanded] = useState(false);
  const [completedExpanded, setCompletedExpanded] = useState(false);
  const [reminderOpen, setReminderOpen] = useState(false);

  function setTaskCompleted(id: string, completed: boolean) {
    setGroups((current) =>
      current.map((group) => ({
        ...group,
        tasks: group.tasks.map((task) =>
          task.id === id ? { ...task, completed } : task,
        ),
      })),
    );

    if (completed) {
      setCompletedExpanded(true);
      return;
    }

    const existing = groups
      .flatMap((group) => group.tasks)
      .find((task) => task.id === id);
    if (existing && getTaskSection(existing.dueAt) === "overdue") {
      setOverdueExpanded(true);
    }
  }

  const overdueTasks = getIncompleteTasksForSection(groups, "overdue");
  const todayTasks = getIncompleteTasksForSection(groups, "today");
  const completedTasks = getCompletedTasks(groups);
  const remindableTasks = getIncompleteTasks(groups);
  const hasAnyTasks =
    remindableTasks.length > 0 || completedTasks.length > 0;

  const progress = getTodayTaskProgress(groups);
  const hasTodayProgress = progress.total > 0;

  if (!hasAnyTasks) {
    return (
      <div className={cn(dashboardCardClass, "flex min-h-95 flex-col")}>
        <EmptyState
          icon={TaskDaily01Icon}
          title="No tasks yet"
          body="When your care team assigns medications, vitals logs, or exercises, they will show up here."
          className="min-h-0"
        />
      </div>
    );
  }

  const groupedCardProps = {
    onComplete: (id: string) => setTaskCompleted(id, true),
    onIncomplete: (id: string) => setTaskCompleted(id, false),
  };

  return (
    <>
      <LayoutGroup>
        <div className="flex w-full flex-col gap-5">
          {hasTodayProgress ? (
            <TasksProgressCard
              completed={progress.completed}
              total={progress.total}
            />
          ) : null}

          {overdueTasks.length > 0 ? (
            <section className="flex w-full flex-col">
              <TasksSectionCollapsible
                label="Overdue"
                count={overdueTasks.length}
                expanded={overdueExpanded}
                onToggle={() => setOverdueExpanded((open) => !open)}
                tone="destructive"
              >
                <TasksGroupedCard
                  tasks={overdueTasks}
                  {...groupedCardProps}
                />
              </TasksSectionCollapsible>
            </section>
          ) : null}

          {todayTasks.length > 0 ? (
            <section className="flex w-full flex-col">
              <TasksGroupedCard
                tasks={todayTasks}
                {...groupedCardProps}
                header={
                  <div className="flex min-w-0 flex-wrap items-center justify-between gap-x-3 gap-y-2">
                    <SectionLabel>Today</SectionLabel>
                    <Button
                      type="button"
                      variant="info-outline"
                      className="h-9 shrink-0 px-4"
                      onClick={() => setReminderOpen(true)}
                    >
                      <AppIcon icon={BellRingIcon} />
                      Add gentle reminder
                    </Button>
                  </div>
                }
              />
            </section>
          ) : null}

          {completedTasks.length > 0 ? (
            <section className="flex w-full flex-col">
              <TasksSectionCollapsible
                label="Completed"
                count={completedTasks.length}
                expanded={completedExpanded}
                onToggle={() => setCompletedExpanded((open) => !open)}
              >
                <TasksGroupedCard
                  tasks={completedTasks}
                  {...groupedCardProps}
                />
              </TasksSectionCollapsible>
            </section>
          ) : null}
        </div>
      </LayoutGroup>

      <GentleReminderModal
        open={reminderOpen}
        onOpenChange={setReminderOpen}
        tasks={remindableTasks}
      />
    </>
  );
}
