export type AssessmentStatusType = "high" | "mid" | "normal";

export interface AssessmentRow {
  name: string;
  date: string;
  result: string;
  statusType: AssessmentStatusType;
}

export const ASSESSMENT_ROWS: AssessmentRow[] = [
  { name: "Independent Ageing Score (IAS)", date: "Apr 24, 2026", result: "High Risk", statusType: "high" },
  { name: "Comprehensive Geriatric Assessment (CGA)", date: "Apr 8, 2026", result: "Low Risk", statusType: "normal" },
  { name: "Comprehensive Geriatric Assessment (CGA)", date: "May 13, 2025", result: "High Risk", statusType: "high" },
  { name: "Comprehensive Geriatric Assessment (CGA)", date: "Nov 21, 2025", result: "Mid Risk", statusType: "mid" },
  { name: "Comprehensive Geriatric Assessment (CGA)", date: "Dec 16, 2025", result: "Low Risk", statusType: "normal" },
  { name: "Comprehensive Geriatric Assessment (CGA)", date: "Apr 28, 2026", result: "High Risk", statusType: "high" },
];
