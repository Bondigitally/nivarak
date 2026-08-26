export type TaskPeriod = "morning" | "afternoon" | "evening" | "missed";

export type CareTask = {
  id: string;
  label: string;
  detail: string;
  completed: boolean;
  overdue?: boolean;
};

export type CareTaskGroup = {
  id: TaskPeriod;
  title: string;
  tasks: CareTask[];
};

/** Sample payload matching Figma node 1014:2432 (Today's Tasks). */
export const MOCK_TODAY_TASK_GROUPS: CareTaskGroup[] = [
  {
    id: "morning",
    title: "Morning",
    tasks: [
      {
        id: "t1",
        label: "Take Lisinopril (10mg)",
        detail: "8:00 AM • With food",
        completed: true,
      },
      {
        id: "t2",
        label: "Log Morning Weight",
        detail: "9:00 AM • Before breakfast",
        completed: true,
      },
    ],
  },
  {
    id: "afternoon",
    title: "Afternoon",
    tasks: [
      {
        id: "t3",
        label: "Physiotherapy Exercises",
        detail: "2:00 PM • 15 mins",
        completed: false,
      },
      {
        id: "t4",
        label: "Drink Water (500ml)",
        detail: "3:00 PM • Hydration goal",
        completed: true,
      },
    ],
  },
  {
    id: "evening",
    title: "Evening",
    tasks: [
      {
        id: "t5",
        label: "Log Evening Blood Pressure",
        detail: "8:00 PM • Resting state",
        completed: false,
      },
    ],
  },
  {
    id: "missed",
    title: "Missed Yesterday",
    tasks: [
      {
        id: "t6",
        label: "Evening Blood Pressure",
        detail: "Missed yesterday • Required Daily",
        completed: false,
        overdue: true,
      },
    ],
  },
];

export function getTodayTaskGroups(): CareTaskGroup[] {
  return MOCK_TODAY_TASK_GROUPS.map((group) => ({
    ...group,
    tasks: group.tasks.map((task) => ({ ...task })),
  }));
}
