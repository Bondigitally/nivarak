export type RiskLevel = "critical" | "high" | "medium" | "low";

export type PatientStatus = "active" | "inactive" | "pending";

export interface Patient {
  id: string;
  name: string;
  age: number;
  initials: string;
  riskLevel: RiskLevel;
  status?: PatientStatus;
}

export interface PriorityPatient extends Patient {
  condition: string;
  lastActivity: string;
  pendingTasks: number;
}

export interface PatientListItem extends Patient {
  conditions: string[];
  assignedNurse: string;
  lastVisit: string;
  nextVisit: string;
  status: PatientStatus;
}
