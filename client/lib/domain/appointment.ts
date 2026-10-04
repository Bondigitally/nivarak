export type VisitType = "Home Visit" | "Teleconsult" | "Clinic";

/** Canonical appointment status — patient + coordinator surfaces. */
export type AppointmentStatus = "Scheduled" | "Completed" | "Cancelled";

export interface Appointment {
  id: string;
  time: string;
  endTime: string;
  patientName: string;
  patientInitials: string;
  visitType: VisitType;
  assignedTo: string;
  status: AppointmentStatus;
  notes?: string;
}
