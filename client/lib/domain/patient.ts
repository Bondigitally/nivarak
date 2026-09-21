/**
 * Clinical risk tiers — drive badge color and care pathway routing.
 * critical > high > medium > low maps to destructive/warning/info/success tokens.
 */
export type RiskLevel = "critical" | "high" | "medium" | "low";

/**
 * Lifecycle state of a patient record.
 * `pending` = intake in progress; `inactive` = discharged or paused.
 */
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
  /** Primary diagnosis or condition shown in the coordinator priority list. */
  condition: string;
  /** Human-readable "X hours ago" string from the last care event. */
  lastActivity: string;
  /** Outstanding tasks not yet marked complete — used for coordinator badge counts. */
  pendingTasks: number;
}

export interface PatientListItem extends Patient {
  conditions: string[];
  /** Name of the primary nurse assigned to this patient. */
  assignedNurse: string;
  /** Display string for the last completed visit date. */
  lastVisit: string;
  /** Display string for the next scheduled visit date. */
  nextVisit: string;
  status: PatientStatus;
}
