import type { CareTaskGroup } from "./tasks-data";

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

export function getCoordinatorTaskGroups(): CareTaskGroup[] {
  const dueA = dueAtLaterToday(30);
  const dueB = dueAtLaterToday(60);
  const dueC = dueAtFromToday(0, 17, 0);

  return [
    {
      id: "overdue",
      title: "Overdue",
      tasks: [
        {
          id: "ct1",
          label: "Review medication adherence report",
          time: "Yesterday · 5:00 PM",
          dueAt: dueAtFromToday(-1, 17, 0),
          detail: "Margaret Chen",
          patientName: "Margaret Chen",
          priority: "urgent",
          completed: false,
        },
      ],
    },
    {
      id: "today",
      title: "Today",
      tasks: [
        {
          id: "ct2",
          label: "Confirm home visit logistics",
          time: formatClock(dueA),
          dueAt: dueA,
          detail: "Robert Nair",
          patientName: "Robert Nair",
          priority: "urgent",
          completed: false,
        },
        {
          id: "ct3",
          label: "Update care plan — post-assessment",
          time: formatClock(dueB),
          dueAt: dueB,
          detail: "Patricia Lim",
          patientName: "Patricia Lim",
          priority: "high",
          completed: false,
        },
        {
          id: "ct4",
          label: "Call family caregiver for check-in",
          time: "10:30 AM",
          dueAt: dueAtFromToday(0, 10, 30),
          detail: "Sunita Verma",
          patientName: "Sunita Verma",
          priority: "high",
          completed: true,
        },
        {
          id: "ct5",
          label: "Submit weekly patient status report",
          time: "5:00 PM",
          dueAt: dueC,
          detail: "All patients",
          patientName: "All patients",
          priority: "normal",
          completed: false,
        },
      ],
    },
  ];
}
