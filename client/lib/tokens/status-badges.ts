import type {
  AlertSeverity,
  AppointmentStatus,
  LeadStatus,
  RiskLevel,
  StaffAvailability,
  StaffRole,
  TaskPriority,
  VisitType,
} from "@/lib/domain";
import { radius } from "@/lib/tokens/radius";

export type VitalStatus = "Normal" | "Low" | "Elevated";

/** Pill/status badge size — matches Scheduled / Completed on appointments */
export const statusBadgeClass =
  `inline-flex items-center ${radius.full} px-2.5 py-1 text-xs font-medium leading-4 [&_svg]:size-4`;

export function priorityBadgeClasses(priority: TaskPriority): string {
  switch (priority) {
    case "urgent":
      return "bg-destructive-muted text-destructive";
    case "high":
      return "bg-warning-muted text-warning";
    case "normal":
      return "bg-muted text-muted-foreground";
  }
}

export function priorityLabel(priority: TaskPriority): string {
  switch (priority) {
    case "urgent":
      return "Urgent";
    case "high":
      return "High";
    case "normal":
      return "Normal";
  }
}

export function severityConfig(severity: AlertSeverity) {
  switch (severity) {
    case "critical":
      return {
        badge: "bg-destructive-muted text-destructive",
        icon: "bg-destructive-muted text-destructive",
        dot: "bg-destructive",
        label: "Critical",
      };
    case "warning":
      return {
        badge: "bg-warning-muted text-warning",
        icon: "bg-warning-muted text-warning",
        dot: "bg-warning",
        label: "Warning",
      };
    case "info":
      return {
        badge: "bg-info-muted text-info",
        icon: "bg-info-muted text-info",
        dot: "bg-info",
        label: "Info",
      };
  }
}

export function riskConfig(level: RiskLevel) {
  switch (level) {
    case "critical":
      return {
        label: "Critical",
        badge: "bg-destructive-muted text-destructive",
        avatar: "bg-destructive/10 text-destructive",
      };
    case "high":
      return {
        label: "High Risk",
        badge: "bg-warning-muted text-warning",
        avatar: "bg-warning-muted text-warning",
      };
    case "medium":
      return {
        label: "Medium",
        badge: "bg-info-muted text-info",
        avatar: "bg-info-muted text-info",
      };
    case "low":
      return {
        label: "Low",
        badge: "bg-success-muted text-success",
        avatar: "bg-success-muted text-success",
      };
  }
}

export function visitTypeBadgeClasses(type: VisitType): string {
  switch (type) {
    case "Teleconsult":
    case "Home Visit":
    case "Clinic":
      return "bg-muted text-muted-foreground";
  }
}

export function appointmentStatusConfig(status: AppointmentStatus) {
  switch (status) {
    case "Scheduled":
      return { label: "Scheduled", class: "bg-muted text-muted-foreground" };
    case "Completed":
      return { label: "Completed", class: "bg-success-muted text-success" };
    case "Cancelled":
      return { label: "Cancelled", class: "bg-muted text-muted-foreground" };
  }
}

export function leadStatusConfig(status: LeadStatus) {
  switch (status) {
    case "new":
      return { label: "New", class: "bg-muted text-muted-foreground" };
    case "contacted":
      return { label: "Contacted", class: "bg-warning-muted text-warning" };
    case "assessing":
      return { label: "Assessing", class: "bg-muted text-muted-foreground" };
    case "enrolled":
      return { label: "Enrolled", class: "bg-success-muted text-success" };
    case "declined":
      return { label: "Declined", class: "bg-muted text-muted-foreground" };
  }
}

export function vitalStatusConfig(status: VitalStatus) {
  switch (status) {
    case "Normal":
      return {
        badgeBg: "bg-success-muted",
        badgeText: "text-success",
        dot: "bg-success",
      };
    case "Low":
      return {
        badgeBg: "bg-warning-muted",
        badgeText: "text-warning",
        dot: "bg-warning",
      };
    case "Elevated":
      return {
        badgeBg: "bg-destructive-muted",
        badgeText: "text-destructive",
        dot: "bg-destructive",
      };
  }
}

export function staffAvailabilityConfig(availability: StaffAvailability) {
  switch (availability) {
    case "available":
      return { label: "Available", cls: "bg-success-muted text-success", dot: "bg-success" };
    case "busy":
      return { label: "Busy", cls: "bg-warning-muted text-warning", dot: "bg-warning" };
    case "off-duty":
      return { label: "Off Duty", cls: "bg-muted text-muted-foreground", dot: "bg-muted-foreground/40" };
  }
}

export function staffRoleColor(role: StaffRole): string {
  switch (role) {
    case "Doctor":
    case "Nurse":
    case "Physiotherapist":
    case "Care Coordinator":
    case "Social Worker":
      return "bg-muted text-muted-foreground";
  }
}
