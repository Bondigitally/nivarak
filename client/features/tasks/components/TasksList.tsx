"use client";

import { useState } from "react";
import { TaskDaily01Icon } from "@hugeicons/core-free-icons";
import { dashboardCardClass } from "@/features/dashboard/data/dashboard-styles";
import { typo } from "@/lib/tokens/typography";
import { cn } from "@/lib/utils";
import { EmptyState } from "@/features/dashboard/components/EmptyState";
import { TaskRow } from "./TaskRow";
import { getTodayTaskGroups, type CareTaskGroup } from "../data/tasks-data";

function TaskGroup({
  group,
  onToggle,
}: {
  group: CareTaskGroup;
  onToggle: (id: string) => void;
}) {
  return (
    <section className="flex w-full flex-col gap-2">
      <h2 className={cn(typo.overline, "tracking-[0.6px]")}>{group.title}</h2>
      <ul className="flex w-full flex-col gap-2">
        {group.tasks.map((task) => (
          <li key={task.id} className="w-full min-w-0">
            <TaskRow task={task} onToggle={onToggle} />
          </li>
        ))}
      </ul>
    </section>
  );
}

export function TasksList({
  initialGroups = getTodayTaskGroups(),
}: {
  initialGroups?: CareTaskGroup[];
}) {
  const [groups, setGroups] = useState(initialGroups);

  function toggleTask(id: string) {
    setGroups((current) =>
      current.map((group) => ({
        ...group,
        tasks: group.tasks.map((task) =>
          task.id === id ? { ...task, completed: !task.completed } : task,
        ),
      })),
    );
  }

  const visibleGroups = groups.filter((group) => group.tasks.length > 0);

  if (visibleGroups.length === 0) {
    return (
      <div className={cn(dashboardCardClass, "flex min-h-95 flex-col")}>
        <EmptyState
          icon={TaskDaily01Icon}
          title="No tasks for today"
          body="When your care team assigns medications, vitals logs, or exercises, they will show up here."
          className="min-h-0"
        />
      </div>
    );
  }

  return (
    <div className="flex w-full flex-col gap-5">
      {visibleGroups.map((group) => (
        <TaskGroup key={group.id} group={group} onToggle={toggleTask} />
      ))}
    </div>
  );
}
