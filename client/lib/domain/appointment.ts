export type VisitType = "Home Visit" | "Teleconsult" | "Clinic";
export type AppointmentStatus = "confirmed" | "pending" | "completed" | "cancelled";

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
