"use client";

import { useEffect, useState } from "react";
import { TaskDaily01Icon } from "@hugeicons/core-free-icons";
import {
  AnimatedStrikeText,
  useStrikeToggle,
} from "@/components/shared/AnimatedStrikeText";
import { TaskCheckbox } from "@/features/tasks/components/TaskCheckbox";
import { typo } from "@/lib/tokens/typography";
import { cn } from "@/lib/utils";
import { dashboardCardClass, dashboardCardHeaderClass, dashboardListItemClass, statusBadgeClass } from "../data/dashboard-styles";
import { EmptyState, SectionInfoButton, ViewAllLink } from "./EmptyState";
import type { HomeTask } from "../data/home-data";

const VISIBLE_TASK_COUNT = 4;

function DashboardTaskItem({
  task,
  isFirst,
  onToggle,
}: {
  task: HomeTask;
  isFirst: boolean;
  onToggle: (id: string) => void;
}) {
  const { displayCompleted, isPending, toggle } = useStrikeToggle(task.completed, () => {
    onToggle(task.id);
  });

  return (
    <li>
      <button
        type="button"
        onClick={toggle}
        aria-pressed={displayCompleted}
        aria-busy={isPending}
        disabled={isPending}
        className={cn(
          dashboardListItemClass,
          "flex w-full items-center gap-3 py-2 pl-1.5 text-left",
          isFirst && "pt-0",
          isPending && "pointer-events-none",
        )}
      >
        <TaskCheckbox completed={displayCompleted} />
        <span className="min-w-0 flex-1 overflow-hidden">
          <AnimatedStrikeText
            active={displayCompleted}
            className={cn(
              typo.bodyL,
              "max-w-full truncate transition-colors duration-200",
              displayCompleted ? "text-muted-foreground" : "text-foreground",
            )}
          >
            {task.label}
          </AnimatedStrikeText>
        </span>
      </button>
    </li>
  );
}

export function TasksCard({ tasks }: { tasks: HomeTask[] | null }) {
  const [items, setItems] = useState<HomeTask[] | null>(
    () => tasks?.slice(0, VISIBLE_TASK_COUNT) ?? null,
  );

  useEffect(() => {
    const next = tasks?.slice(0, VISIBLE_TASK_COUNT) ?? null;
    const id = window.setTimeout(() => setItems(next), 0);
    return () => window.clearTimeout(id);
  }, [tasks]);

  const completed = items?.filter((task) => task.completed).length ?? 0;
  const total = items?.length ?? 0;

  function toggleTask(id: string) {
    setItems((current) =>
      current
        ? current.map((task) =>
            task.id === id ? { ...task, completed: !task.completed } : task,
          )
        : current,
    );
  }

  return (
    <section className={cn(dashboardCardClass, "flex h-fit shrink-0 flex-col p-4")}>
      <div className={dashboardCardHeaderClass}>
        <div className="flex min-w-0 items-center gap-2">
          <h2 className={typo.headingXl}>Today&apos;s tasks</h2>
          {items ? (
            <span
              className={cn(
                statusBadgeClass,
                "shrink-0 bg-accent text-muted-foreground",
              )}
            >
              {completed}/{total} Completed
            </span>
          ) : null}
          <SectionInfoButton info="Daily actions from your care team - medications, vitals logs, exercises, and more. Check them off as you complete them." />
        </div>
        <ViewAllLink href="/care/tasks" />
      </div>
      {items && items.length > 0 ? (
        <ul className="flex flex-col gap-3">
          {items.map((task, index) => (
            <DashboardTaskItem
              key={task.id}
              task={task}
              isFirst={index === 0}
              onToggle={toggleTask}
            />
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
