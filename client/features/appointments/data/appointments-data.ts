export type AppointmentTab = "upcoming" | "past";

export type AppointmentVisitType = "Home Visit" | "Teleconsult";

export type AppointmentStatus = "Confirmed" | "Scheduled" | "Completed" | "Cancelled";

export type AppointmentPlaceKind = "location" | "video";

export type AppointmentItem = {
  id: string;
  tab: AppointmentTab;
  dateLabel: string;
  /** Full date shown in the details drawer, e.g. "15 Jul, 2026". */
  dateFullLabel: string;
  timeLabel: string;
  /** Time range shown in the details drawer, e.g. "10:00 AM – 11:30 AM". */
  timeWindowLabel: string;
  clinician: string;
  clinicianRole: string;
  clinicianInitials: string;
  clinicianAvatarUrl: string | null;
  visitType: AppointmentVisitType;
  placeLabel: string;
  placeKind: AppointmentPlaceKind;
  addressLines: string[] | null;
  reason: string;
  status: AppointmentStatus;
  showMap: boolean;
};

/** Sample payload matching Figma Appointments (node 936:5825) + drawer (936:7164). */
export const APPOINTMENTS: AppointmentItem[] = [
  {
    id: "ap1",
    tab: "upcoming",
    dateLabel: "15 Jul",
    dateFullLabel: "15 Jul, 2026",
    timeLabel: "10:00 AM",
    timeWindowLabel: "10:00 AM – 11:30 AM",
    clinician: "Dr. Aris Mehta",
    clinicianRole: "General Practitioner",
    clinicianInitials: "AM",
    clinicianAvatarUrl: "/images/appointments/book-visit/dr-aris-mehta.jpg",
    visitType: "Home Visit",
    placeLabel: "Home Visit",
    placeKind: "location",
    addressLines: ["123 Maple Street, Apt 4B", "Metropolis, NY 10001"],
    reason: "Routine monthly health assessment and mobility check.",
    status: "Confirmed",
    showMap: true,
  },
  {
    id: "ap2",
    tab: "upcoming",
    dateLabel: "22 Jul",
    dateFullLabel: "22 Jul, 2026",
    timeLabel: "02:30 PM",
    timeWindowLabel: "02:30 PM – 03:00 PM",
    clinician: "Sarah Jenkins (Nurse)",
    clinicianRole: "Home Nurse",
    clinicianInitials: "SJ",
    clinicianAvatarUrl: null,
    visitType: "Teleconsult",
    placeLabel: "Teleconsult",
    placeKind: "video",
    addressLines: null,
    reason: "Follow-up on medication adherence and vitals review.",
    status: "Scheduled",
    showMap: false,
  },
  {
    id: "ap3",
    tab: "past",
    dateLabel: "02 Jun",
    dateFullLabel: "02 Jun, 2026",
    timeLabel: "11:00 AM",
    timeWindowLabel: "11:00 AM – 12:00 PM",
    clinician: "Dr. Kapoor",
    clinicianRole: "General Practitioner",
    clinicianInitials: "DK",
    clinicianAvatarUrl: null,
    visitType: "Home Visit",
    placeLabel: "Home Visit",
    placeKind: "location",
    addressLines: ["123 Maple Street, Apt 4B", "Metropolis, NY 10001"],
    reason: "Post-assessment care plan review.",
    status: "Completed",
    showMap: true,
  },
  {
    id: "ap4",
    tab: "past",
    dateLabel: "18 May",
    dateFullLabel: "18 May, 2026",
    timeLabel: "03:00 PM",
    timeWindowLabel: "03:00 PM – 03:30 PM",
    clinician: "Priya (Care Coordinator)",
    clinicianRole: "Care Coordinator",
    clinicianInitials: "P",
    clinicianAvatarUrl: null,
    visitType: "Teleconsult",
    placeLabel: "Teleconsult",
    placeKind: "video",
    addressLines: null,
    reason: "Care coordination check-in and caregiver updates.",
    status: "Completed",
    showMap: false,
  },
];

export function getAppointmentsByTab(tab: AppointmentTab): AppointmentItem[] {
  return APPOINTMENTS.filter((item) => item.tab === tab);
}

export function getAppointmentById(id: string): AppointmentItem | undefined {
  return APPOINTMENTS.find((item) => item.id === id);
}
