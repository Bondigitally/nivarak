import type { IconSvgElement } from "@hugeicons/react";

export type AlertSeverity = "critical" | "warning" | "info";
export type NotificationPriority = "critical" | "high" | "normal" | "low";
export type NotificationCategory = "alert" | "reminder" | "update";
export type NotificationSource =
  | "vitals"
  | "assessment"
  | "task"
  | "medication"
  | "appointment"
  | "care-plan"
  | "encounter"
  | "document"
  | "risk"
  | "system";

export type AlertType =
  | "vitals"
  | "medication"
  | "missed-appointment"
  | "assessment"
  | "general";

export type NotificationTimeGroup = "today" | "yesterday" | "earlier";

export interface NotificationAction {
  label: string;
  href: string;
}

export interface Notification {
  id: string;
  title: string;
  read: boolean;
  /** Patient-facing fields */
  source?: NotificationSource;
  category?: NotificationCategory;
  priority?: NotificationPriority;
  body?: string;
  time?: string;
  timeGroup?: NotificationTimeGroup;
  actions?: NotificationAction[];
  /** Coordinator / staff fields */
  type?: AlertType;
  icon?: IconSvgElement;
  patientName?: string;
  timeLabel?: string;
  severity?: AlertSeverity;
}

/** Patient alerts list item — required fields for the patient notification UI. */
export type PatientNotification = Notification & {
  source: NotificationSource;
  category: NotificationCategory;
  priority: NotificationPriority;
  body: string;
  time: string;
  timeGroup: NotificationTimeGroup;
  actions: NotificationAction[];
};
