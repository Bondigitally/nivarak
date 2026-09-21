export type StaffRole =
  | "Doctor"
  | "Nurse"
  | "Physiotherapist"
  | "Care Coordinator"
  | "Social Worker";

export type StaffAvailability = "available" | "busy" | "off-duty";

export interface StaffMember {
  id: string;
  name: string;
  role: StaffRole;
  specialization: string;
  patientsAssigned: number;
  availability: StaffAvailability;
  initials: string;
  phone: string;
}

/** Lifecycle of a prospective patient from referral to enrolment. */
export type LeadStatus = "new" | "contacted" | "assessing" | "enrolled" | "declined";

export interface Lead {
  id: string;
  name: string;
  age: number;
  /** Free-text referral origin, e.g. "GP Referral", "Family Inquiry". */
  referralSource: string;
  status: LeadStatus;
  /** ISO date string of when the lead was received. */
  dateReceived: string;
  notes: string;
  initials: string;
}

export interface CoordinatorStats {
  activePatients: number;
  /**
   * Week-over-week change in active patients.
   * Positive = growth, negative = decline — rendered as a trend chip.
   */
  patientsDelta: number;
  tasksDueToday: number;
  /** Tasks past their due date and still incomplete. */
  tasksOverdue: number;
  appointmentsToday: number;
  /** Display string for the next upcoming appointment, e.g. "10:30 AM". */
  nextAppointmentTime: string;
  unreadAlerts: number;
  /** Subset of unread alerts with critical severity — shown in the danger badge. */
  criticalAlerts: number;
}
