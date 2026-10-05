import type { IconSvgElement } from "@hugeicons/react";
import {
  HeartPulseIcon,
  Audit01Icon,
  CheckListIcon,
  Medicine02Icon,
  Calendar03Icon,
  Plant01Icon,
  Archive02Icon,
  StethoscopeIcon,
  Activity01Icon,
  Notification01Icon,
} from "@hugeicons/core-free-icons";
import type {
  NotificationCategory,
  NotificationPriority,
  NotificationSource,
  NotificationTimeGroup,
  NotificationAction,
  PatientNotification,
} from "@/lib/domain";

export type {
  NotificationCategory,
  NotificationPriority,
  NotificationSource,
  NotificationTimeGroup,
  NotificationAction,
};

export type NotificationItem = PatientNotification;

// ─── Source meta — icon + label used as the source chip ────────────────────────

export const SOURCE_META: Record<
  NotificationSource,
  { label: string; icon: IconSvgElement }
> = {
  vitals:      { label: "Vitals",      icon: HeartPulseIcon },
  assessment:  { label: "Assessment",  icon: Audit01Icon },
  task:        { label: "Task",        icon: CheckListIcon },
  medication:  { label: "Medication",  icon: Medicine02Icon },
  appointment: { label: "Appointment", icon: Calendar03Icon },
  "care-plan": { label: "Care Plan",   icon: Plant01Icon },
  encounter:   { label: "Encounter",   icon: StethoscopeIcon },
  document:    { label: "Document",    icon: Archive02Icon },
  risk:        { label: "Risk",        icon: Activity01Icon },
  system:      { label: "System",      icon: Notification01Icon },
};

// ─── Category badge colours ─────────────────────────────────────────────────────

export const CATEGORY_BADGE: Record<NotificationCategory, string> = {
  alert:    "border-destructive-muted bg-destructive-muted text-destructive",
  reminder: "border-warning-muted bg-warning-muted text-warning",
  update:   "border-info-muted bg-info-muted text-info",
};

export const CATEGORY_LABEL: Record<NotificationCategory, string> = {
  alert:    "Alert",
  reminder: "Reminder",
  update:   "Update",
};

/** Left accent-bar colour for unread items on the full alerts page. */
export const CATEGORY_BORDER: Record<NotificationCategory, string> = {
  alert:    "border-l-destructive",
  reminder: "border-l-warning",
  update:   "border-l-info",
};

/** Solid background colour for the unread left accent bar. */
export const CATEGORY_BAR_BG: Record<NotificationCategory, string> = {
  alert:    "bg-destructive",
  reminder: "bg-warning",
  update:   "bg-info",
};

// ─── Priority → icon-bubble colour ─────────────────────────────────────────────

export const PRIORITY_BUBBLE: Record<NotificationPriority, string> = {
  critical: "bg-destructive-muted text-destructive",
  high:     "bg-warning-muted text-warning",
  normal:   "bg-info-muted text-info",
  low:      "bg-muted text-tertiary-foreground",
};

/** Pastel squircle tile — muted tint + outline icon on notification rows. */
export const NOTIFICATION_ICON_TILE: Record<NotificationCategory, string> = {
  alert:    "bg-destructive-muted text-foreground",
  reminder: "bg-warning/15 text-foreground",
  update:   "bg-info-muted text-foreground",
};

// ─── Tab options ────────────────────────────────────────────────────────────────

export const NOTIFICATION_TABS = [
  { id: "all"      as const, label: "All" },
  { id: "alert"    as const, label: "Alerts" },
  { id: "reminder" as const, label: "Reminders" },
  { id: "update"   as const, label: "Updates" },
] satisfies { id: NotificationTabKey; label: string }[];

export type NotificationTabKey = "all" | NotificationCategory;

// ─── Time group labels + order ─────────────────────────────────────────────────

export const TIME_GROUP_LABELS: Record<NotificationTimeGroup, string> = {
  today:     "Today",
  yesterday: "Yesterday",
  earlier:   "Earlier This Week",
};

export const TIME_GROUP_ORDER: NotificationTimeGroup[] = [
  "today",
  "yesterday",
  "earlier",
];

// ─── Mock data ──────────────────────────────────────────────────────────────────

export const MOCK_NOTIFICATIONS: NotificationItem[] = [
  // ── Alerts (today) ────────────────────────────────────────────────────────
  {
    id: "n1",
    source:   "vitals",
    category: "alert",
    priority: "critical",
    title:    "Blood pressure elevated",
    body:     "A reading of 185/110 mmHg was recorded and is above the safe threshold set for you.",
    time:     "15 min ago",
    timeGroup: "today",
    read:     false,
    actions:  [{ label: "View Vitals", href: "/health/vitals" }],
  },
  {
    id: "n2",
    source:   "assessment",
    category: "alert",
    priority: "critical",
    title:    "Assessment red flags",
    body:     "Three red flags were flagged in the independence assessment. Review them and update the care plan soon.",
    time:     "8:00 AM",
    timeGroup: "today",
    read:     false,
    actions:  [{ label: "View Assessment", href: "/health/assessments" }],
  },
  // ── Reminders (today) ──────────────────────────────────────────────────────
  {
    id: "n3",
    source:   "medication",
    category: "reminder",
    priority: "high",
    title:    "Morning meds due",
    body:     "Amlodipine 5 mg and Metformin 500 mg are due. Take them with breakfast when ready.",
    time:     "9:00 AM",
    timeGroup: "today",
    read:     false,
    actions:  [{ label: "View Medications", href: "/care/medications" }],
  },
  {
    id: "n4",
    source:   "task",
    category: "reminder",
    priority: "normal",
    title:    "Daily walk due",
    body:     "Your 20 minute walk has not been logged yet today. Mark it complete when you finish.",
    time:     "11:00 AM",
    timeGroup: "today",
    read:     false,
    actions:  [{ label: "Open Task", href: "/care/tasks" }],
  },
  // ── Alerts (yesterday) ────────────────────────────────────────────────────
  {
    id: "n5",
    source:   "risk",
    category: "alert",
    priority: "high",
    title:    "Risk level increased",
    body:     "A drop in the independence score triggered this change. Review the care plan for next steps.",
    time:     "Yesterday",
    timeGroup: "yesterday",
    read:     false,
    actions:  [{ label: "View Risk Profile", href: "/dashboard" }],
  },
  {
    id: "n6",
    source:   "appointment",
    category: "alert",
    priority: "high",
    title:    "Appointment rescheduled",
    body:     "Your GP consultation on Aug 12 has been moved to Aug 19 at 10:30 AM.",
    time:     "Yesterday",
    timeGroup: "yesterday",
    read:     true,
    actions:  [{ label: "View Appointments", href: "/care/appointments" }],
  },
  // ── Reminders (yesterday) ─────────────────────────────────────────────────
  {
    id: "n7",
    source:   "appointment",
    category: "reminder",
    priority: "normal",
    title:    "Nurse visit tomorrow",
    body:     "Nurse Sneha is scheduled for a home visit tomorrow. Please stay available for the visit.",
    time:     "Yesterday",
    timeGroup: "yesterday",
    read:     true,
    actions:  [],
  },
  // ── Updates (yesterday) ───────────────────────────────────────────────────
  {
    id: "n8",
    source:   "encounter",
    category: "update",
    priority: "normal",
    title:    "Home visit completed",
    body:     "The five domain encounter record is ready to review. Status is Completed.",
    time:     "Yesterday",
    timeGroup: "yesterday",
    read:     true,
    actions:  [],
  },
  // ── Updates (earlier) ─────────────────────────────────────────────────────
  {
    id: "n9",
    source:   "assessment",
    category: "update",
    priority: "low",
    title:    "Assessment submitted",
    body:     "Your caregiver submitted an assessment with a score of 62% and a Moderate risk band.",
    time:     "2 days ago",
    timeGroup: "earlier",
    read:     true,
    actions:  [],
  },
  {
    id: "n10",
    source:   "care-plan",
    category: "update",
    priority: "low",
    title:    "Care plan updated",
    body:     "Your care plan was revised and two new mobility goals were added.",
    time:     "3 days ago",
    timeGroup: "earlier",
    read:     true,
    actions:  [],
  },
];

// ─── Helpers ────────────────────────────────────────────────────────────────────

export function filterNotifications(
  items: NotificationItem[],
  tab: NotificationTabKey,
  query: string,
): NotificationItem[] {
  return items.filter((item) => {
    const matchesTab = tab === "all" || item.category === tab;
    const q = query.trim().toLowerCase();
    const matchesQuery =
      !q ||
      item.title.toLowerCase().includes(q) ||
      item.body.toLowerCase().includes(q) ||
      SOURCE_META[item.source].label.toLowerCase().includes(q);
    return matchesTab && matchesQuery;
  });
}

export function groupNotifications(
  items: NotificationItem[],
): [NotificationTimeGroup, NotificationItem[]][] {
  const map = new Map<NotificationTimeGroup, NotificationItem[]>();
  for (const g of TIME_GROUP_ORDER) map.set(g, []);
  for (const item of items) map.get(item.timeGroup)!.push(item);
  const result: [NotificationTimeGroup, NotificationItem[]][] = [];
  for (const g of TIME_GROUP_ORDER) {
    const group = map.get(g)!;
    if (group.length > 0) result.push([g, group]);
  }
  return result;
}

export const TOTAL_UNREAD = MOCK_NOTIFICATIONS.filter((n) => !n.read).length;
