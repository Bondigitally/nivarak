export type {
  RiskLevel,
  PatientStatus,
  Patient,
  PriorityPatient,
  PatientListItem,
} from "./patient";

export type {
  TaskPriority,
  TaskBucket,
  Task,
  TaskGroup,
} from "./task";

export type {
  AlertSeverity,
  NotificationPriority,
  NotificationCategory,
  NotificationSource,
  AlertType,
  NotificationTimeGroup,
  NotificationAction,
  Notification,
  PatientNotification,
} from "./notification";

export type {
  VisitType,
  AppointmentStatus,
  Appointment,
} from "./appointment";

export type {
  StaffRole,
  StaffAvailability,
  StaffMember,
  LeadStatus,
  Lead,
  CoordinatorStats,
} from "./staff";

// Legacy aliases for gradual migration
export type CareTask = import("./task").Task;
export type CareTaskGroup = import("./task").TaskGroup;
export type CoordinatorTask = import("./task").Task;
export type CoordinatorAlert = import("./notification").Notification;
export type NotificationItem = import("./notification").PatientNotification;
export type ScheduleItem = import("./appointment").Appointment;
