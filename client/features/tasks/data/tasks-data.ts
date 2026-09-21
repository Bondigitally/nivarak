import type { Task, TaskBucket } from "@/lib/domain";

export type { TaskBucket } from "@/lib/domain";

/** Patient-facing task with required scheduling fields. */
export type CareTask = Task & {
  time: string;
  dueAt: string;
};

export type CareTaskGroup = {
  id: TaskBucket;
  title: string;
  tasks: CareTask[];
};

function startOfLocalDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function addLocalDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function dueAtFromToday(daysOffset: number, hour: number, minute = 0) {
  const day = addLocalDays(startOfLocalDay(new Date()), daysOffset);
  day.setHours(hour, minute, 0, 0);
  return day.toISOString();
}

/** Due later today — clamps past midnight to 23:59 so mock tasks stay in Today. */
function dueAtLaterToday(minutesFromNow: number) {
  const candidate = new Date(Date.now() + minutesFromNow * 60_000);
  const endOfToday = startOfLocalDay(new Date());
  endOfToday.setHours(23, 59, 50, 0);
  if (candidate.getTime() > endOfToday.getTime()) {
    return endOfToday.toISOString();
  }
  return candidate.toISOString();
}

function formatClock(iso: string) {
  return new Date(iso).toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });
}

function isDueDateToday(dueAt: string, now: Date = new Date()) {
  const due = new Date(dueAt);
  if (Number.isNaN(due.getTime())) return false;
  return startOfLocalDay(due).getTime() === startOfLocalDay(now).getTime();
}

/**
 * Section for an incomplete task — driven only by dueAt vs now.
 * - due datetime passed → overdue
 * - due later today → today
 * - due after today → null (not shown in overdue/today lists)
 */
export function getTaskSection(
  dueAt: string,
  now: Date = new Date(),
): TaskBucket | null {
  const due = new Date(dueAt);
  if (Number.isNaN(due.getTime())) return "today";

  if (due.getTime() < now.getTime()) return "overdue";

  const tomorrowStart = addLocalDays(startOfLocalDay(now), 1);
  if (due.getTime() < tomorrowStart.getTime()) return "today";

  return null;
}

export function getAllTasks(groups: CareTaskGroup[]): CareTask[] {
  const byId = new Map<string, CareTask>();
  for (const group of groups) {
    for (const task of group.tasks) {
      byId.set(task.id, task);
    }
  }
  return [...byId.values()];
}

export function getIncompleteTasksForSection(
  groups: CareTaskGroup[],
  section: TaskBucket,
  now: Date = new Date(),
): CareTask[] {
  return getAllTasks(groups).filter(
    (task) =>
      !task.completed && getTaskSection(task.dueAt, now) === section,
  );
}

export function getCompletedTasks(groups: CareTaskGroup[]): CareTask[] {
  return getAllTasks(groups).filter((task) => task.completed);
}

export function getIncompleteTasks(groups: CareTaskGroup[]): CareTask[] {
  return getAllTasks(groups).filter((task) => !task.completed);
}

/** Incomplete overdue + today tasks — sidebar badge count. */
export function getActionableTaskCount(
  groups: CareTaskGroup[],
  now: Date = new Date(),
): number {
  return (
    getIncompleteTasksForSection(groups, "overdue", now).length +
    getIncompleteTasksForSection(groups, "today", now).length
  );
}

function buildMockTaskGroups(): CareTaskGroup[] {
  return [
    {
      id: "overdue",
      title: "Overdue",
      tasks: [
        {
          id: "t6",
          label: "Evening Blood Pressure",
          time: "Yesterday · 8:00 PM",
          dueAt: dueAtFromToday(-1, 20, 0),
          detail: "Required daily",
          completed: false,
        },
        {
          id: "t7",
          label: "Take Metformin (500mg)",
          time: "Yesterday · 6:00 PM",
          dueAt: dueAtFromToday(-1, 18, 0),
          detail: "With dinner",
          completed: false,
        },
      ],
    },
    {
      id: "today",
      title: "Today",
      tasks: (() => {
        const dueA = dueAtLaterToday(25);
        const dueB = dueAtLaterToday(40);
        const dueC = dueAtLaterToday(55);
        const dueD = dueAtLaterToday(70);
        const dueE = dueAtLaterToday(85);

        return [
          {
            id: "t1",
            label: "Take Lisinopril (10mg)",
            time: "8:00 AM",
            dueAt: dueAtFromToday(0, 8, 0),
            detail: "With food",
            completed: true,
          },
          {
            id: "t2",
            label: "Log Morning Weight",
            time: "9:00 AM",
            dueAt: dueAtFromToday(0, 9, 0),
            detail: "Before breakfast",
            completed: true,
          },
          {
            id: "t3",
            label: "Physiotherapy Exercises",
            time: formatClock(dueA),
            dueAt: dueA,
            detail: "15 mins",
            completed: false,
          },
          {
            id: "t4",
            label: "Drink Water (500ml)",
            time: "3:00 PM",
            dueAt: dueAtFromToday(0, 15, 0),
            detail: "Hydration goal",
            completed: true,
          },
          {
            id: "t5",
            label: "Log Evening Blood Pressure",
            time: formatClock(dueB),
            dueAt: dueB,
            detail: "Resting state",
            completed: false,
          },
          {
            id: "t10",
            label: "Take Evening Metformin (500mg)",
            time: formatClock(dueC),
            dueAt: dueC,
            detail: "With snack",
            completed: false,
          },
          {
            id: "t11",
            label: "Review care plan notes",
            time: formatClock(dueD),
            dueAt: dueD,
            detail: "Before bed",
            completed: false,
          },
          {
            id: "t12",
            label: "Stretch / mobility routine",
            time: formatClock(dueE),
            dueAt: dueE,
            detail: "10 mins",
            completed: false,
          },
        ];
      })(),
    },
  ];
}

export function getTaskGroups(): CareTaskGroup[] {
  return buildMockTaskGroups().map((group) => ({
    ...group,
    tasks: group.tasks.map((task) => ({ ...task })),
  })) as CareTaskGroup[];
}

/**
 * Today's tasks — only tasks whose due calendar date is today.
 * Overdue (prior-day) tasks are excluded.
 */
export function getTodayTasks(
  groups: CareTaskGroup[],
  now: Date = new Date(),
): CareTask[] {
  return getAllTasks(groups).filter((task) => isDueDateToday(task.dueAt, now));
}

/**
 * Today's progress — only tasks whose due calendar date is today.
 * Overdue (prior-day) tasks are excluded.
 */
export function getTodayTaskProgress(
  groups: CareTaskGroup[],
  now: Date = new Date(),
) {
  const todayDue = getTodayTasks(groups, now);

  const total = todayDue.length;
  const completed = todayDue.filter((task) => task.completed).length;

  return { completed, total };
}
