import {
  HeartPulseIcon,
  CheckListIcon,
  Calendar03Icon,
  StethoscopeIcon,
} from "@hugeicons/core-free-icons";
import type { Notification } from "@/lib/domain";

export function getCoordinatorAlerts(): Notification[] {
  return [
    {
      id: "a1",
      type: "vitals",
      icon: HeartPulseIcon,
      title: "Critical BP reading",
      patientName: "Robert Nair",
      timeLabel: "2 hours ago",
      severity: "critical",
      read: false,
    },
    {
      id: "a2",
      type: "medication",
      icon: CheckListIcon,
      title: "Missed medication doses",
      patientName: "Margaret Chen",
      timeLabel: "5 hours ago",
      severity: "warning",
      read: false,
    },
    {
      id: "a3",
      type: "missed-appointment",
      icon: Calendar03Icon,
      title: "Missed teleconsult",
      patientName: "Sunita Verma",
      timeLabel: "Yesterday, 2:00 PM",
      severity: "warning",
      read: true,
    },
    {
      id: "a4",
      type: "assessment",
      icon: StethoscopeIcon,
      title: "Assessment overdue",
      patientName: "James Okonkwo",
      timeLabel: "2 days ago",
      severity: "info",
      read: true,
    },
  ];
}
