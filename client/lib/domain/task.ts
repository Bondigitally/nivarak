export type TaskPriority = "urgent" | "high" | "normal";
export type TaskBucket = "overdue" | "today";

export interface Task {
  id: string;
  label: string;
  completed: boolean;
  /** Display label for due time. */
  time?: string;
  /** ISO due datetime — source of truth for section placement. */
  dueAt?: string;
  detail?: string;
  /** Coordinator / staff views */
  patientName?: string;
  priority?: TaskPriority;
  dueLabel?: string;
}

export interface TaskGroup {
  id: TaskBucket;
  title: string;
  tasks: Task[];
}
