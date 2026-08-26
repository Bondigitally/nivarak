"use client";

import { useEffect, useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  TaskDaily01Icon,
  Tick02Icon,
} from "@hugeicons/core-free-icons";
import { typo } from "@/lib/tokens/typography";
import { cn } from "@/lib/utils";
import { dashboardCardClass, dashboardCardHeaderClass, dashboardListItemClass, statusBadgeClass } from "../data/dashboard-styles";
import { EmptyState, SectionInfoButton, ViewAllLink } from "./EmptyState";
import type { HomeTask } from "../data/home-data";

const VISIBLE_TASK_COUNT = 4;

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
            <li key={task.id}>
              <button
                type="button"
                onClick={() => toggleTask(task.id)}
                aria-pressed={task.completed}
                className={cn(
                  dashboardListItemClass,
                  "flex w-full items-center gap-3 py-2 pl-1.5 text-left",
                  index === 0 && "pt-0",
                )}
              >
                <span
                  className={cn(
                    "flex size-5 shrink-0 items-center justify-center rounded-[4px] shadow-[0_1px_2px_rgba(17,24,39,0.04)]",
                    task.completed ? "bg-primary-active" : "border border-border bg-card",
                  )}
                  aria-hidden
                >
                  {task.completed ? (
                    <HugeiconsIcon icon={Tick02Icon} size={19} strokeWidth={2} color="var(--primary-foreground)" />
                  ) : null}
                </span>
                <span
                  className={cn(
                    typo.bodyL,
                    task.completed && "text-muted-foreground line-through",
                    !task.completed && "text-foreground",
                  )}
                >
                  {task.label}
                </span>
              </button>
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
