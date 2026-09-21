"use client";

import { type ReactNode } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  dashboardCardClass,
  dashboardDividedItemClass,
  dashboardRowDividerClass,
} from "@/features/dashboard/data/dashboard-styles";
import { cn } from "@/lib/utils";
import { TaskRow } from "./TaskRow";
import type { CareTask } from "../data/tasks-data";

const ROW_EASE = [0.22, 1, 0.36, 1] as const;

/**
 * Animated list card for a group of care tasks (e.g. "Today", "Overdue").
 *
 * `mode="popLayout"` on AnimatePresence lets remaining rows reflow smoothly
 * when a completed row exits, instead of snapping into place.
 *
 * Each `motion.li` receives a stable `layoutId` (`task-row-${task.id}`) so
 * Framer Motion can animate the element as a shared element if it moves
 * between two separate TasksGroupedCard instances (overdue → today on
 * completion undo).
 */

export function TasksGroupedCard({
  tasks,
  onComplete,
  onIncomplete,
  header,
}: {
  tasks: CareTask[];
  onComplete: (id: string) => void;
  onIncomplete?: (id: string) => void;
  header?: ReactNode;
}) {
  const reduceMotion = useReducedMotion();

  if (tasks.length === 0) return null;

  return (
    <div className={`${dashboardCardClass} overflow-hidden`}>
      {header ? (
        <div className="px-4 py-3.5 sm:px-4 sm:py-4">
          {header}
        </div>
      ) : null}
      <ul className="flex min-w-0 flex-col">
        <AnimatePresence initial={false} mode="popLayout">
          {tasks.map((task, index) => (
            <motion.li
              key={task.id}
              layout={!reduceMotion}
              layoutId={reduceMotion ? undefined : `task-row-${task.id}`}
              initial={reduceMotion ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={
                reduceMotion
                  ? undefined
                  : { opacity: 0, y: -6, transition: { duration: 0.18 } }
              }
              transition={{ duration: 0.28, ease: ROW_EASE }}
              className={dashboardDividedItemClass}
            >
              {index > 0 ? (
                <div
                  className={cn(dashboardRowDividerClass, "inset-x-4")}
                  aria-hidden
                />
              ) : null}
              <TaskRow
                task={task}
                onComplete={onComplete}
                onIncomplete={onIncomplete}
              />
            </motion.li>
          ))}
        </AnimatePresence>
      </ul>
    </div>
  );
}
