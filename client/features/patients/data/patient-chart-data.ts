import type { RiskLevel } from "@/lib/domain";
import { getDoctorPatientById } from "@/features/patients/data/doctor-patients-data";

export type ChartTab =
  | "overview"
  | "assessments"
  | "vitals"
  | "care-plan"
  | "notes";

export interface PatientChartKpis {
  iasScore: number;
  iasBand: string;
  lastHr: string;
  lastBp: string;
  openAlerts: number;
  carePlanStatus: string;
}

/** IAS-P overview panel — Figma node 644:43359 */
export type IaspDomainBand = "good" | "moderate" | "low";

export interface IaspOverviewDomain {
  id: string;
  name: string;
  score: number;
  max: number;
  band: IaspDomainBand;
  flagged?: boolean;
  /** Short clinical note shown when the domain row is expanded. */
  detail: string;
}

export interface IaspOverviewConcern {
  id: string;
  title: string;
  body: string;
}

export interface IaspOverviewProxyField {
  id: string;
  label: string;
  value: string;
}

export interface PatientOverviewIasp {
  score: number;
  maxScore: number;
  riskLabel: string;
  riskTone: "moderate" | "elevated" | "low";
  summary: string;
  allergy: string;
  dobLabel: string;
  /** Next scheduled IAS-P reassessment date label */
  nextAssessmentDate: string;
  /** Relative timing chip, e.g. "In 3 months" */
  nextAssessmentBadge: string;
  domains: IaspOverviewDomain[];
  concerns: IaspOverviewConcern[];
  proxy: IaspOverviewProxyField[];
}

export interface CgaDomainScore {
  id: string;
  name: string;
  score: string;
  note: string;
}

export interface ClinicalInsight {
  id: string;
  title: string;
  body: string;
}

export interface CarePlanGoal {
  id: string;
  title: string;
  status: "On track" | "At risk" | "Completed" | "Not started";
  progress: number;
  owner: string;
  dueDate: string;
  description: string;
}

export interface GoalProgressEntry {
  id: string;
  date: string;
  author: string;
  note: string;
}

export interface SoapNoteDetail {
  id: string;
  patientId: string;
  title: string;
  type: string;
  status: "Signed" | "Draft";
  date: string;
  author: string;
  subjective: string;
  objective: string;
  assessment: string;
  plan: string;
}

export interface AlertDetail {
  id: string;
  patientId: string;
  patientName: string;
  title: string;
  detail: string;
  severity: "critical" | "warning" | "info";
  timeLabel: string;
  status: "Open" | "Acknowledged" | "Resolved";
  source: string;
  timeline: { id: string; time: string; text: string }[];
}

export function getPatientChartKpis(patientId: string): PatientChartKpis {
  const patient = getDoctorPatientById(patientId);
  return {
    iasScore: patient?.riskLevel === "high" ? 72 : 48,
    iasBand: patient?.riskLevel === "high" ? "Elevated" : "Moderate",
    lastHr: "78 bpm",
    lastBp: "128/82",
    openAlerts: patient?.riskLevel === "high" ? 2 : 0,
    carePlanStatus: patient?.carePlanStatus ?? "None",
  };
}

export function getPatientOverviewIasp(patientId: string): PatientOverviewIasp {
  const patient = getDoctorPatientById(patientId);
  const elevated = patient?.riskLevel === "high";
  const score = elevated ? 28 : 36;
  const maxScore = 48;
  const birthYear = patient ? new Date().getFullYear() - patient.age : 1950;

  return {
    score,
    maxScore,
    riskLabel: elevated ? "Elevated Risk" : "Moderate Risk",
    riskTone: elevated ? "elevated" : "moderate",
    summary: elevated
      ? "Score indicates significant functional dependencies across multiple domains. Prioritize flagged areas in the care plan."
      : "Score indicates emerging functional dependencies. Review lower-scoring domains for targeted support.",
    allergy: "Penicillin",
    dobLabel: `12-May-${birthYear}`,
    nextAssessmentDate: elevated ? "15-Oct-2026" : "28-Oct-2026",
    nextAssessmentBadge: elevated ? "In 3 weeks" : "In 1 month",
    domains: [
      {
        id: "memory",
        name: "Memory & Orientation",
        score: 4,
        max: 6,
        band: "moderate",
        detail:
          "Score 4/6 reflects occasional lapses in recent recall and time orientation. Cueing helps; no acute safety concerns, but continue monitoring and consider cognitive follow-up if decline continues.",
      },
      {
        id: "mobility",
        name: "Navigation & Mobility",
        score: 5,
        max: 6,
        band: "good",
        detail:
          "Score 5/6 indicates largely independent indoor and outdoor mobility with minor assistance for uneven surfaces. Fall risk remains low with current aids and home setup.",
      },
      {
        id: "social",
        name: "Social Interaction",
        score: elevated ? 1 : 2,
        max: 6,
        band: "low",
        flagged: true,
        detail: elevated
          ? "Score 1/6 signals marked social withdrawal. Proxy reports reduced community participation; prioritize engagement goals and caregiver support in the care plan."
          : "Score 2/6 indicates limited social contact. Encourage structured activities and family check-ins to reverse withdrawal trends.",
      },
      {
        id: "financial",
        name: "Financial Management",
        score: elevated ? 2 : 3,
        max: 6,
        band: "low",
        flagged: true,
        detail: elevated
          ? "Score 2/6 reflects difficulty managing bills and money. Missed payments reported — arrange supervised bill pay and review POA / banking supports."
          : "Score 3/6 shows emerging difficulty with bills and budgeting. Shared oversight of finances is recommended before errors escalate.",
      },
      {
        id: "medication",
        name: "Medication Management",
        score: 6,
        max: 6,
        band: "good",
        detail:
          "Score 6/6 — independent and reliable with current regimen. Continue dosette/reminder setup and reassess after any prescription changes.",
      },
    ],
    concerns: [
      {
        id: "c1",
        title: "Social Withdrawal",
        body: "Proxy reports significant decrease in attending community events over last 3 months.",
      },
      {
        id: "c2",
        title: "Bill Payment Difficulties",
        body: "Two instances of missed utility payments reported by family.",
      },
    ],
    proxy: [
      { id: "relationship", label: "Informant Relationship", value: "Daughter" },
      { id: "proximity", label: "Proximity", value: "Co-resident" },
      { id: "completed", label: "Date of Completion", value: "24-Oct-2023" },
      {
        id: "method",
        label: "Assessment Method",
        value: "In-person Interview",
      },
    ],
  };
}

export function getCgaDomains(): CgaDomainScore[] {
  return [
    {
      id: "d1",
      name: "Medical / Physical",
      score: "8 / 10",
      note: "Stable chronic conditions; mild mobility limits.",
    },
    {
      id: "d2",
      name: "Functional",
      score: "7 / 10",
      note: "Independent ADLs with occasional assist for IADLs.",
    },
    {
      id: "d3",
      name: "Cognitive",
      score: "9 / 10",
      note: "No acute cognitive concerns; MoCA within range.",
    },
    {
      id: "d4",
      name: "Psychological",
      score: "6 / 10",
      note: "Mild anxiety; continue monitoring mood.",
    },
    {
      id: "d5",
      name: "Social / Environmental",
      score: "8 / 10",
      note: "Strong family support; home safety reviewed.",
    },
  ];
}

export function getClinicalInsights(): ClinicalInsight[] {
  return [
    {
      id: "ci-1",
      title: "Fall risk elevated",
      body: "Gait assessment and recent near-fall suggest physiotherapy follow-up within 2 weeks.",
    },
    {
      id: "ci-2",
      title: "Medication reconciliation due",
      body: "Three active prescriptions may interact with planned analgesic changes.",
    },
  ];
}

export function getCarePlanGoals(patientId: string): CarePlanGoal[] {
  void patientId;
  return [
    {
      id: "goal-1",
      title: "Reduce resting heart rate variability",
      status: "At risk",
      progress: 45,
      owner: "Dr. Mehta",
      dueDate: "Nov 15, 2023",
      description: "Monitor daily HR and escalate if sustained >100 bpm.",
    },
    {
      id: "goal-2",
      title: "Improve medication adherence",
      status: "On track",
      progress: 70,
      owner: "Nurse K. Lin",
      dueDate: "Nov 30, 2023",
      description: "Weekly pill-box checks and caregiver education.",
    },
    {
      id: "goal-3",
      title: "Complete physiotherapy sessions",
      status: "Not started",
      progress: 10,
      owner: "Physio Raj",
      dueDate: "Dec 10, 2023",
      description: "Twice-weekly sessions focused on balance and gait.",
    },
    {
      id: "goal-4",
      title: "Home safety assessment",
      status: "Completed",
      progress: 100,
      owner: "Coordinator",
      dueDate: "Oct 20, 2023",
      description: "Grab bars installed; trip hazards removed.",
    },
  ];
}

export function getGoalById(goalId: string): CarePlanGoal | undefined {
  return getCarePlanGoals("").find((g) => g.id === goalId);
}

export function getGoalProgressLog(goalId: string): GoalProgressEntry[] {
  void goalId;
  return [
    {
      id: "gp-1",
      date: "Oct 28, 2023 · 2:10 PM",
      author: "Dr. Mehta",
      note: "Patient reports improved energy; HR spikes still present after exertion.",
    },
    {
      id: "gp-2",
      date: "Oct 24, 2023 · 11:00 AM",
      author: "Nurse K. Lin",
      note: "Education session completed with daughter caregiver.",
    },
    {
      id: "gp-3",
      date: "Oct 20, 2023 · 9:30 AM",
      author: "Dr. Mehta",
      note: "Goal opened after CGA review.",
    },
  ];
}

export function getSoapNoteDetail(noteId: string): SoapNoteDetail | undefined {
  const notes: Record<string, SoapNoteDetail> = {
    "note-1": {
      id: "note-1",
      patientId: "pt-eleanor",
      title: "Follow-up after CGA",
      type: "SOAP",
      status: "Signed",
      date: "Oct 24, 2023",
      author: "Dr. Mehta",
      subjective:
        "Patient reports mild fatigue and occasional dizziness on standing. Denies chest pain. Sleep is fair.",
      objective:
        "BP 128/82, HR 78, SpO₂ 97%. Alert and oriented. Gait steady with cane. No acute distress.",
      assessment:
        "Stable post-CGA with residual orthostatic symptoms. Fall risk remains moderate.",
      plan: "Continue current antihypertensives. Schedule physiotherapy. Recheck vitals in 1 week. Caregiver education on hydration.",
    },
    "note-2": {
      id: "note-2",
      patientId: "pt-arthur",
      title: "Cardiac observation",
      type: "Progress",
      status: "Draft",
      date: "Oct 26, 2023",
      author: "Dr. Mehta",
      subjective: "Reports palpitations after morning walk.",
      objective: "HR 108 bpm recorded by remote monitor. BP 142/88.",
      assessment: "Possible tachycardic episode; rule out medication timing issue.",
      plan: "Acknowledge alert. Hold stimulant beverages. Cardiology follow-up if recurrence.",
    },
    "note-3": {
      id: "note-3",
      patientId: "pt-martha",
      title: "Post-op wound review",
      type: "Consult",
      status: "Signed",
      date: "Oct 27, 2023",
      author: "Dr. Mehta",
      subjective: "Wound site less tender; no fever.",
      objective: "Incision clean, dry, intact. No erythema.",
      assessment: "Healing appropriately.",
      plan: "Continue wound care. Follow up in clinic next week.",
    },
  };
  return notes[noteId];
}

export function getAlertDetail(id: string): AlertDetail | undefined {
  const alerts: Record<string, AlertDetail> = {
    "alert-hr-1": {
      id: "alert-hr-1",
      patientId: "pt-arthur",
      patientName: "Arthur Pendelton",
      title: "High heart rate",
      detail: "108 BPM recorded by remote monitor",
      severity: "critical",
      timeLabel: "Today, 9:42 AM",
      status: "Open",
      source: "Remote vitals",
      timeline: [
        { id: "t1", time: "9:42 AM", text: "Alert triggered — HR 108 bpm" },
        { id: "t2", time: "9:45 AM", text: "Push notification sent to Dr. Mehta" },
        { id: "t3", time: "9:50 AM", text: "Nurse K. Lin viewed patient chart" },
      ],
    },
  };

  if (alerts[id]) return alerts[id];

  return {
    id,
    patientId: "pt-arthur",
    patientName: "Arthur Pendelton",
    title: "Clinical alert",
    detail: "Requires clinician review",
    severity: "warning",
    timeLabel: "Today",
    status: "Open",
    source: "System",
    timeline: [
      { id: "t1", time: "Just now", text: "Alert opened" },
    ],
  };
}

export function riskLabel(level: RiskLevel) {
  return level.charAt(0).toUpperCase() + level.slice(1);
}

export function assessmentTypeDescription(type: "IAS-P" | "CGA"): string {
  if (type === "IAS-P") {
    return "Integrated Assessment Screen for Patients — structured domains for rapid clinical triage.";
  }
  return "Comprehensive Geriatric Assessment — multi-domain evaluation for older adults.";
}

export function assessmentNeedsSignature(
  status: string,
): boolean {
  return (
    status === "Needs review" ||
    status === "Draft" ||
    status === "In progress"
  );
}

export function getAssessmentDetailExtra(assessmentId: string) {
  void assessmentId;
  return {
    summary:
      "Domain scores and narrative summary from the completed assessment. Review carefully before signing.",
    clinicalInsights: getClinicalInsights().map((i) => i.body),
    domains: getCgaDomains().map((d) => ({
      id: d.id,
      domain: d.name,
      score: d.score.split(" / ")[0] ?? d.score,
      max: d.score.split(" / ")[1] ?? "10",
      note: d.note,
    })),
    signedBy: "Dr. M. Aris" as string | undefined,
    signedAt: "Oct 24, 2023 · 4:12 PM" as string | undefined,
    reviewedBy: undefined as string | undefined,
  };
}

export function getSoapNoteContent(noteId: string) {
  const detail = getSoapNoteDetail(noteId);
  return {
    subjective: detail?.subjective ?? "",
    objective: detail?.objective ?? "",
    assessment: detail?.assessment ?? "",
    plan: detail?.plan ?? "",
    signedBy: detail?.status === "Signed" ? detail.author : undefined,
    signedAt: detail?.status === "Signed" ? detail.date : undefined,
  };
}

export function getCarePlanDetail(patientId: string) {
  const patient = getDoctorPatientById(patientId);
  const goals = getCarePlanGoals(patientId);
  return {
    id: `cp-${patientId}`,
    patientId,
    status: (patient?.carePlanStatus === "None"
      ? "Draft"
      : patient?.carePlanStatus ?? "Draft") as
      | "Active"
      | "Pending Review"
      | "Draft"
      | "Completed",
    owner: "Dr. Mehta",
    lastUpdated: "Oct 28, 2023",
    summary:
      "Goals focus on vitals stability, medication adherence, and fall prevention after recent assessment.",
    goals: goals.map((g) => ({
      id: g.id,
      title: g.title,
      status: g.status,
      progressPct: g.progress,
      owner: g.owner,
      dueLabel: g.dueDate,
      interventions: [
        { id: `${g.id}-i1`, label: "Weekly check-in", done: g.progress > 40 },
        { id: `${g.id}-i2`, label: "Document progress", done: g.progress > 70 },
      ],
      progressLog: getGoalProgressLog(g.id),
    })),
    interventionsChecklist: [
      { id: "ic1", label: "Weekly nurse vitals check", checked: true },
      { id: "ic2", label: "Caregiver education packet", checked: true },
      { id: "ic3", label: "Physio referral follow-up", checked: false },
      { id: "ic4", label: "Pharmacy reconciliation", checked: false },
    ],
  };
}

export function getCarePlanGoal(patientId: string, goalId: string) {
  return getCarePlanDetail(patientId).goals.find((g) => g.id === goalId);
}

export function getPatientMedications(_patientId: string) {
  void _patientId;
  return [
    {
      id: "med-1",
      name: "Amlodipine",
      dose: "5 mg",
      schedule: "Once daily · morning",
    },
    {
      id: "med-2",
      name: "Metformin",
      dose: "500 mg",
      schedule: "Twice daily · with meals",
    },
    {
      id: "med-3",
      name: "Atorvastatin",
      dose: "20 mg",
      schedule: "Once daily · evening",
    },
  ];
}

export function getPatientChartActivity(patientId: string) {
  return [
    {
      id: "act-1",
      title: "Assessment updated",
      detail: "Clinician review pending",
      timeLabel: "2d ago",
      href: `/patients/${patientId}/assessments`,
    },
    {
      id: "act-2",
      title: "Vitals logged",
      detail: "Home nurse visit",
      timeLabel: "3d ago",
      href: `/patients/${patientId}/vitals`,
    },
    {
      id: "act-3",
      title: "Care plan updated",
      detail: "Goals refreshed",
      timeLabel: "5d ago",
      href: `/patients/${patientId}/care-plan`,
    },
  ];
}
