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

export type LeadStatus = "new" | "contacted" | "assessing" | "enrolled" | "declined";

export interface Lead {
  id: string;
  name: string;
  age: number;
  referralSource: string;
  status: LeadStatus;
  dateReceived: string;
  notes: string;
  initials: string;
}

export interface CoordinatorStats {
  activePatients: number;
  patientsDelta: number;
  tasksDueToday: number;
  tasksOverdue: number;
  appointmentsToday: number;
  nextAppointmentTime: string;
  unreadAlerts: number;
  criticalAlerts: number;
}
