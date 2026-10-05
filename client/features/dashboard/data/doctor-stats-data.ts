import type {
  DoctorAttentionItem,
  DoctorScheduleSlot,
  DoctorStats,
} from "@/lib/domain/doctor";

export function getDoctorStats(): DoctorStats {
  return {
    reviewsPending: 12,
    reviewsDeltaToday: 2,
    unsignedCgas: 8,
    openAlerts: 3,
    criticalAlerts: 3,
    visitsToday: 15,
  };
}

export function getDoctorAttentionItems(): DoctorAttentionItem[] {
  return [
    {
      id: "att-1",
      kind: "unsigned-cga",
      title: "Unsigned CGA",
      detail: "Patient: Martha S. • Due by EOD",
      href: "/patients/pt-martha/assessments/cga-1",
    },
    {
      id: "att-2",
      kind: "urgent-alert",
      title: "Urgent Alert",
      detail: "High heart rate - Arthur J. • 108 BPM recorded",
      href: "/notifications/alert-hr-1",
      urgent: true,
    },
    {
      id: "att-3",
      kind: "care-plan",
      title: "Care-plan publish due",
      detail: "Patient: Eleanor R. • 2 days overdue",
      href: "/patients/pt-eleanor/care-plan",
    },
    {
      id: "att-4",
      kind: "care-plan",
      title: "Care-plan publish due",
      detail: "Patient: Eleanor R. • 2 days overdue",
      href: "/patients/pt-eleanor/care-plan",
    },
  ];
}

export function getDoctorTodaySchedule(): DoctorScheduleSlot[] {
  return [
    {
      id: "ds-1",
      time: "10:30 AM",
      title: "Martha S.",
      subtitle: "Post-Op Review",
      patientId: "pt-martha",
      kind: "visit",
      accent: "primary",
    },
    {
      id: "ds-2",
      time: "10:30 AM",
      title: "Arthur J.",
      subtitle: "Cardiac Stress Test",
      patientId: "pt-arthur",
      kind: "visit",
      accent: "info",
    },
    {
      id: "ds-3",
      time: "11:15 AM",
      title: "Team Huddle",
      subtitle: "Conference Room B",
      kind: "huddle",
      accent: "warning",
    },
    {
      id: "ds-4",
      time: "01:00 PM",
      title: "Janet P.",
      subtitle: "Initial Consultation",
      patientId: "pt-janet",
      kind: "visit",
      accent: "info",
    },
    {
      id: "ds-5",
      time: "02:30 PM",
      title: "Administrative",
      subtitle: "CGA Processing",
      kind: "admin",
      accent: "info",
    },
  ];
}
