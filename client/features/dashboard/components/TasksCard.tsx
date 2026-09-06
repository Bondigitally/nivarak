"use client";

import { TaskDaily01Icon } from "@hugeicons/core-free-icons";
import { TaskRow } from "@/features/tasks/components/TaskRow";
import {
  getTodayTaskProgress,
  getTodayTasks,
} from "@/features/tasks/data/tasks-data";
import { useTaskStore } from "@/features/tasks/store/task-store";
import { typo } from "@/lib/tokens/typography";
import { cn } from "@/lib/utils";
import {
  dashboardCardClass,
  dashboardCardHeaderClass,
  dashboardDividedItemClass,
  dashboardRowDividerClass,
  statusBadgeClass,
} from "../data/dashboard-styles";
import { EmptyState, SectionInfoButton, ViewAllLink } from "./EmptyState";

const VISIBLE_TASK_COUNT = 3;

export function TasksCard() {
  const groups = useTaskStore((s) => s.groups);
  const setCompleted = useTaskStore((s) => s.setCompleted);

  const todayTasks = getTodayTasks(groups);
  const { completed, total } = getTodayTaskProgress(groups);
  const visible = todayTasks.slice(0, VISIBLE_TASK_COUNT);

  return (
    <section className={cn(dashboardCardClass, "flex h-fit shrink-0 flex-col p-5")}>
      <div className={dashboardCardHeaderClass}>
        <div className="flex min-w-0 items-center gap-2">
          <h2 className={typo.headingXl}>Today&apos;s tasks</h2>
          {total > 0 ? (
            <span
              className={cn(
                statusBadgeClass,
                "shrink-0 bg-accent text-muted-foreground tabular-nums",
              )}
            >
              {completed}/{total} Completed
            </span>
          ) : null}
          <SectionInfoButton info="Daily actions from your care team - medications, vitals logs, exercises, and more. Check them off as you complete them." />
        </div>
        <ViewAllLink href="/care/tasks" />
      </div>
      {visible.length > 0 ? (
        <ul className="flex min-w-0 flex-col">
          {visible.map((task, index) => (
            <li key={task.id} className={dashboardDividedItemClass}>
              {index > 0 ? (
                <div className={dashboardRowDividerClass} aria-hidden />
              ) : null}
              <TaskRow
                task={task}
                onComplete={(id) => setCompleted(id, true)}
                onIncomplete={(id) => setCompleted(id, false)}
                showStatusAction={false}
                className="-mx-2 w-[calc(100%+1rem)] px-2"
              />
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState
          icon={TaskDaily01Icon}
          title="No tasks for today"
          body="When your care team assigns medications, vitals logs, or exercises, they will show up here."
          className="min-h-0"
        />
      )}
    </section>
  );
}
