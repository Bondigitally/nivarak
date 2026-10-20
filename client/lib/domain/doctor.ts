import type { RiskLevel } from "./patient";
import type { AlertSeverity } from "./notification";
import type { IconSvgElement } from "@hugeicons/react";

export interface DoctorStats {
  reviewsPending: number;
  reviewsDeltaToday: number;
  unsignedCgas: number;
  openAlerts: number;
  criticalAlerts: number;
  visitsToday: number;
}

export type DoctorAttentionKind =
  | "unsigned-cga"
  | "urgent-alert"
  | "care-plan"
  | "review";

export interface DoctorAttentionItem {
  id: string;
  kind: DoctorAttentionKind;
  title: string;
  detail: string;
  href: string;
  urgent?: boolean;
}

export type DoctorAssessmentType = "IAS-P" | "CGA";
export type DoctorAssessmentStatus =
  | "Signed"
  | "Draft"
  | "Needs review"
  | "In progress";

export interface DoctorAssessmentRow {
  id: string;
  patientId: string;
  patientName: string;
  patientCode: string;
  type: DoctorAssessmentType;
  scoreLabel: string;
  status: DoctorAssessmentStatus;
  riskLevel?: RiskLevel | "mid";
  date: string;
  clinician: string;
}

export interface DoctorPatientRow {
  id: string;
  name: string;
  code: string;
  age: number;
  gender: string;
  riskLevel: RiskLevel;
  lastVisit: string;
  carePlanStatus: "Active" | "Pending Review" | "Draft" | "None";
  assignedNurse: string;
  initials: string;
}

export interface DoctorVitalMonitorRow {
  id: string;
  patientId: string;
  patientName: string;
  patientCode: string;
  metric: string;
  value: string;
  status: "Critical" | "Warning" | "Normal";
  recordedAt: string;
  trend: "up" | "down" | "flat";
}

export interface DoctorCarePlanRow {
  id: string;
  patientId: string;
  patientName: string;
  patientCode: string;
  status: "Active" | "Pending Review" | "Draft" | "Completed";
  goalsCount: number;
  lastUpdated: string;
  owner: string;
}

export interface DoctorNoteRow {
  id: string;
  patientId: string;
  patientName: string;
  patientCode: string;
  type: "SOAP" | "Progress" | "Consult";
  title: string;
  status: "Signed" | "Draft";
  date: string;
  author: string;
}

export interface DoctorAlertRow {
  id: string;
  patientId: string;
  patientName: string;
  title: string;
  detail: string;
  severity: AlertSeverity;
  timeLabel: string;
  status: "Open" | "Acknowledged" | "Resolved";
  source: string;
  icon?: IconSvgElement;
}

export interface DoctorScheduleSlot {
  id: string;
  time: string;
  endTime?: string;
  title: string;
  subtitle: string;
  patientId?: string;
  kind: "visit" | "huddle" | "admin";
  accent?: "primary" | "info" | "warning";
}
