import type { IaspAboutYouValues } from "./iasp-about-you-data";
import { getIaspLivingSituationDisplay } from "./iasp-about-you-data";
import type { IaspRiskBand } from "./iasp-scoring";
import type { IaspRedFlagId } from "./iasp-red-flags-data";

/** Short domain labels as shown on the PDF (Figma). */
export const IASP_DOMAIN_REPORT_LABELS: Record<string, string> = {
  "basic-self-care": "Self Care",
  "daily-life": "Daily Life",
  mobility: "Mobility",
  thinking: "Thinking",
  health: "Health",
  nutrition: "Nutrition",
  social: "Social",
  safety: "Safety",
};

export type DomainBarLevel = "strong" | "fair" | "high_risk";

/** Domain bar colours from Figma pdf-assessment-report v3. */
export const IASP_DOMAIN_BAR_COLORS: Record<DomainBarLevel, string> = {
  strong: "#0EA5B1",
  fair: "#FEC271",
  high_risk: "#FF6356",
};

export function getDomainBarLevel(percentage: number): DomainBarLevel {
  if (percentage >= 75) return "strong";
  if (percentage >= 45) return "fair";
  return "high_risk";
}

export const IASP_RED_FLAG_GUIDANCE: Record<IaspRedFlagId, string> = {
  two_or_more_falls:
    "Significant mobility risk. Arrange fall assessment, physiotherapy, and a home safety review.",
  missed_incorrect_medicines:
    "Daily health management is unreliable. Introduce blister packs or supervised medication support.",
  unsafe_decisions:
    "Decision-making safety is compromised. Increase supervision for high-risk choices and review cognitive support needs.",
  significant_weight_loss:
    "Nutrition risk needs prompt review. Check appetite, swallowing, and arrange a dietitian or medical follow-up.",
  social_isolation:
    "Limited social contact raises mood and safety risk. Rebuild regular contact and community support.",
  recurrent_hospital_admissions:
    "Repeated admissions suggest unstable care. Coordinate a post-discharge plan and closer clinical monitoring.",
  caregiver_struggling:
    "Primary support is under strain. Arrange respite, shared caregiving, or professional home support.",
  no_emergency_response:
    "No reliable way to summon help. Set up an emergency response system and test it with the family.",
};

type CarePathwayCopy = {
  title: string;
  recommendedLabel: string;
  description: string;
  bullets: readonly string[];
};

export const IASP_CARE_PATHWAYS: Record<IaspRiskBand, CarePathwayCopy> = {
  strong_independent: {
    title: "Home Care Model",
    recommendedLabel: "Home Care",
    description:
      "Maintain independence at home with light-touch monitoring and preventive check-ins.",
    bullets: [
      "Quarterly wellness check-ins",
      "Optional remote vitals for peace of mind",
      "Family dashboard for early change alerts",
    ],
  },
  independent_vulnerable: {
    title: "Home Care Model",
    recommendedLabel: "Home Care",
    description:
      "Stay independent at home with proactive monitoring so early risks are caught before they escalate.",
    bullets: [
      "Monthly home or virtual reviews",
      "Remote vitals monitoring for early alerts",
      "Family caregiver dashboard for daily oversight",
    ],
  },
  supported_independence: {
    title: "Hybrid Care Model",
    recommendedLabel: "Hybrid Care",
    description:
      "Combine clinic and home support so independence continues while mobility and medication risks are covered.",
    bullets: [
      "Scheduled home visits every 2 weeks",
      "Remote vitals monitoring for early alerts",
      "Family caregiver dashboard for daily oversight",
    ],
  },
  limited_independence: {
    title: "Clinic Care Model",
    recommendedLabel: "Clinic Care",
    description:
      "Structured clinical support with home follow-through to stabilise independence risks.",
    bullets: [
      "Clinic reviews every 2–4 weeks",
      "Supervised medication and therapy plans",
      "Caregiver coaching with clear escalation rules",
    ],
  },
  high_dependence: {
    title: "High-Dependency Care Model",
    recommendedLabel: "High-Dependency Care",
    description:
      "Intensive daily support focused on safety, medication reliability, and continuous caregiver coverage.",
    bullets: [
      "Daily or near-daily care coverage",
      "Continuous medication supervision",
      "Rapid-response pathway for red-flag events",
    ],
  },
};

export function formatReportAssessorLine(aboutYou: IaspAboutYouValues): string {
  const age = aboutYou.age?.trim() || "—";
  const relationship = (aboutYou.relationship ?? "proxy")
    .replace(/\s*\/\s*/g, "/")
    .toLowerCase();
  return `Patient, age ${age}, assessed by ${relationship}`;
}

export function formatReportLivingContext(aboutYou: IaspAboutYouValues): string {
  const living = getIaspLivingSituationDisplay(aboutYou);
  const livingText = living
    ? living === "Alone"
      ? "Lives alone."
      : living === "Other" && aboutYou.livingSituationOther.trim()
        ? `Lives ${aboutYou.livingSituationOther.trim().toLowerCase()}.`
        : `Lives ${living.toLowerCase()}.`
    : null;
  const visit = aboutYou.visitFrequency
    ? `Visit frequency: ${aboutYou.visitFrequency.toLowerCase()}.`
    : null;
  return [livingText, visit].filter(Boolean).join(" ") || "Living context not provided.";
}

export function buildAssessorGuidance(input: {
  percentage: number;
  bandLabel: string;
  redFlagIds: readonly IaspRedFlagId[];
}): string {
  const focus =
    input.redFlagIds.includes("two_or_more_falls") &&
    input.redFlagIds.includes("missed_incorrect_medicines")
      ? "Focus first on fall prevention at home, then medication adherence."
      : input.redFlagIds.includes("two_or_more_falls")
        ? "Focus first on fall prevention and home safety."
        : input.redFlagIds.includes("missed_incorrect_medicines")
          ? "Focus first on medication adherence and daily health routines."
          : "Prioritise the lowest-scoring domains and any open red flags.";

  return `IASP score ${input.percentage}% places the patient in ${input.bandLabel}. ${focus} Schedule a follow up review in 3 months, or sooner if new red flags appear.`;
}
