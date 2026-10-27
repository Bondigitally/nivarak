import type { IaspAboutYouValues } from "./iasp-about-you-data.js";
import { getIaspLivingSituationDisplay } from "./iasp-about-you-data.js";
import {
  formatIaspAssessmentDate,
  getIaspBand,
  type IaspRiskBand,
} from "./iasp-scoring.js";
import type { IaspRedFlagId } from "./iasp-red-flags-data.js";

/** Helpline on /contact — used for report WhatsApp CTAs. */
export const NIVARAK_WHATSAPP_PHONE_E164 = "919371090980";
export const NIVARAK_WHATSAPP_CTA_LABEL = "Message us on WhatsApp";

/**
 * Strip em/en dashes from report WhatsApp copy and chat prefills.
 * Keeps newlines; normalizes dash punctuation to commas / hyphens.
 */
export function sanitizeWhatsAppCopy(text: string): string {
  return text
    .replace(/\s*\u2014\s*/g, ", ")
    .replace(/\u2013/g, "-")
    .replace(/[ \t]*,[ \t]*/g, ", ")
    .replace(/[ \t]{2,}/g, " ")
    .replace(/ ?, ?\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export function getNivarakWhatsAppUrl(prefill?: string): string {
  const base = `https://wa.me/${NIVARAK_WHATSAPP_PHONE_E164}`;
  if (!prefill?.trim()) return base;
  return `${base}?text=${encodeURIComponent(sanitizeWhatsAppCopy(prefill))}`;
}

export function getIaspReportWhatsAppPrefill(input: {
  percentage: number;
  bandLabel: string;
}): string {
  return sanitizeWhatsAppCopy(
    `Hi Nivarak, I completed the IAS-P assessment (${input.percentage}%, ${input.bandLabel}). I'd like to discuss next steps.`,
  );
}

export type IaspScoreReportBlock =
  | { type: "text"; heading: string; body: string }
  | { type: "list"; heading: string; items: readonly string[] }
  | {
      type: "action";
      heading: string;
      body: string;
      actionLabel: string;
      actionUrl: string;
    };

export type IaspScoreReportTemplate = {
  headline: string;
  subheadline: string;
  bandTagline: string;
  blocks: readonly IaspScoreReportBlock[];
};

function whatsAppBlock(input: {
  heading: string;
  body: string;
  percentage: number;
  bandLabel: string;
}): IaspScoreReportBlock {
  return {
    type: "action",
    heading: sanitizeWhatsAppCopy(input.heading),
    body: sanitizeWhatsAppCopy(input.body),
    actionLabel: NIVARAK_WHATSAPP_CTA_LABEL,
    actionUrl: getNivarakWhatsAppUrl(
      getIaspReportWhatsAppPrefill({
        percentage: input.percentage,
        bandLabel: input.bandLabel,
      }),
    ),
  };
}

export const IASP_SCORE_REPORT_TEMPLATES: Record<
  IaspRiskBand,
  Omit<IaspScoreReportTemplate, "blocks"> & {
    buildBlocks: (ctx: { percentage: number; bandLabel: string }) => readonly IaspScoreReportBlock[];
  }
> = {
  strong_independent: {
    headline: "Ageing well — keep it that way",
    subheadline: "Strong independent ageing",
    bandTagline: "Strong independent ageing",
    buildBlocks: ({ percentage, bandLabel }) => [
      {
        type: "text",
        heading: "What the score tells us",
        body:
          "Your parent is managing well across physical function, cognition, health habits, and daily life. At this stage, the goal is to protect this independence — because the factors that erode it are often gradual and invisible until a crisis forces the issue.",
      },
      {
        type: "list",
        heading: "Areas to look at closely",
        items: [
          "Watch for slow changes in stamina, mood, or daily routines — early drift is easy to miss when someone still seems fine.",
          "Medication load can creep up quietly — even \"well\" elders benefit from a periodic review.",
          "Balance and gait are worth checking before a first fall ever happens.",
          "Confirm there is a reliable way to summon help in an emergency.",
        ],
      },
      {
        type: "list",
        heading: "What Nivarak recommends",
        items: [
          "A baseline comprehensive elder health assessment — labs, mobility, cognition, medications — so we have a reference point if things change.",
          "Annual Comprehensive Elder Profile (CEP) to track trends, not just snapshots.",
          "Medication review — even \"well\" elders accumulate prescriptions. A single review prevents future problems.",
          "Establish a reliable emergency contact system if one isn't already in place.",
          "Reassess with the IAS-P in 6 months or after any significant health event.",
        ],
      },
      whatsAppBlock({
        heading: "Suggested next step",
        body:
          "Start with a Nivarak baseline assessment\nPrevention works best when there's something to compare against. A one-time baseline now means we can catch change early — before it becomes a crisis. Most families tell us they wish they'd started sooner.",
        percentage,
        bandLabel,
      }),
    ],
  },
  independent_vulnerable: {
    headline: "Independent, but with gaps worth addressing",
    subheadline: "Independent but vulnerable",
    bandTagline: "Independent but vulnerable",
    buildBlocks: ({ percentage, bandLabel }) => [
      {
        type: "text",
        heading: "What the score tells us",
        body:
          "Your parent is largely independent, but this score sits in a zone where small unaddressed gaps — a medication that isn't managed well, a balance issue not yet causing falls, mild forgetfulness — can compound quietly. At 70–84, early intervention has the highest return.",
      },
      {
        type: "list",
        heading: "Areas to look at closely",
        items: [
          "Review any items scored 0 or 1 in the assessment — these are where risk is currently concentrated.",
          "Medication management is frequently the hidden vulnerability at this score — a structured review is worthwhile.",
          "A falls-risk evaluation if mobility scored low, even without a fall yet.",
          "Verify that a functioning emergency response system is in place.",
        ],
      },
      {
        type: "list",
        heading: "What Nivarak recommends",
        items: [
          "Comprehensive elder health assessment within 4–6 weeks.",
          "Medication reconciliation — Beers Criteria review for any potentially inappropriate drugs.",
          "Structured monitoring plan with quarterly check-ins rather than waiting for a crisis.",
          "Reassess IAS-P in 3–4 months.",
        ],
      },
      whatsAppBlock({
        heading: "Suggested next step",
        body:
          "A focused assessment now, before a gap becomes a fall\nThe 70–84 zone is actually the most important moment to act. Independence is still largely intact — a targeted review can keep it that way. We can assess within the week.",
        percentage,
        bandLabel,
      }),
    ],
  },
  supported_independence: {
    headline: "Some independence remains — support it well",
    subheadline: "Supported independence",
    bandTagline: "Supported independence",
    buildBlocks: ({ percentage, bandLabel }) => [
      {
        type: "text",
        heading: "What the score tells us",
        body:
          "Your parent needs regular support in several domains but retains meaningful independence in others. The risk here is allowing dependence to spread — when one area isn't supported well, others deteriorate faster. Structured, consistent support now protects what's still functioning independently.",
      },
      {
        type: "list",
        heading: "Common patterns at this score",
        items: [
          "Medication adherence is often inconsistent — a structured system (pill organiser, call reminders, teleconsult follow-up) makes a measurable difference.",
          "Mobility is usually partially affected — risk of falls is real and prevention is far easier than recovery.",
          "Nutritional adequacy may be declining — often invisible from a distance.",
          "Social isolation is common and accelerates cognitive decline.",
        ],
      },
      {
        type: "list",
        heading: "What Nivarak recommends",
        items: [
          "Comprehensive in-home elder assessment — we need to see the environment, not just the person.",
          "Multi-domain monitoring plan covering the specific areas where support is needed.",
          "Medication management system with monthly reconciliation.",
          "Home safety review — fall hazards, kitchen safety, emergency access.",
          "If red flags are present: escalate to urgent review (see below).",
          "Reassess IAS-P in 6–8 weeks.",
        ],
      },
      whatsAppBlock({
        heading: "Suggested next step",
        body:
          "A comprehensive review within the next 2 weeks\nAt this score, the right support structure can genuinely preserve independence. We'd recommend starting with our full elder health assessment and building a care plan from there. Most families find it brings immediate clarity and relief.",
        percentage,
        bandLabel,
      }),
    ],
  },
  limited_independence: {
    headline: "Significant support needed — act now",
    subheadline: "Limited independence",
    bandTagline: "Limited independence",
    buildBlocks: ({ percentage, bandLabel }) => [
      {
        type: "text",
        heading: "What the score tells us",
        body:
          "Your parent's independence is significantly limited across multiple domains. This does not mean they cannot live well — but it does mean the current level of informal or ad-hoc support is likely insufficient. Without a structured care plan, the risk of hospitalisation, falls, or a rapid decline is high.",
      },
      {
        type: "list",
        heading: "What needs attention immediately",
        items: [
          "Is there a safe system for getting help in an emergency? If not, this is the first thing to fix.",
          "Are medications being taken correctly? Missed or wrong doses at this stage carry serious health risk.",
          "Is nutrition adequate? Unintentional weight loss is a clinical concern at this level of dependence.",
          "Who is currently providing support — and are they managing without burning out?",
        ],
      },
      {
        type: "list",
        heading: "What Nivarak recommends",
        items: [
          "Priority elder assessment within 1 week — in-home wherever possible.",
          "Structured daily monitoring plan with defined escalation criteria.",
          "Caregiver support assessment — who is helping now, what do they need?",
          "Review of home environment for immediate safety risks.",
          "Medication reconciliation and adherence system.",
          "Discussion of appropriate care model — this may include professional caregiver support.",
        ],
      },
      whatsAppBlock({
        heading: "Urgent — please reach out today",
        body:
          "This score needs a proper plan in place — soon\nWe understand it can be hard to act on this when you're far away. That's exactly what Nivarak is here for. Message us today and we'll prioritise your parent's assessment.",
        percentage,
        bandLabel,
      }),
    ],
  },
  high_dependence: {
    headline: "High dependence — professional care planning needed",
    subheadline: "High dependence",
    bandTagline: "High dependence",
    buildBlocks: ({ percentage, bandLabel }) => [
      {
        type: "text",
        heading: "What the score tells us",
        body:
          "Your parent requires substantial daily assistance across most domains of life. This score reflects high dependence — not a failure, but a clinical reality that needs a structured professional response. Ad-hoc family support alone is unlikely to be sufficient or sustainable at this level.",
      },
      {
        type: "list",
        heading: "What needs to be in place",
        items: [
          "Supervised medication administration — not just reminders.",
          "Dedicated caregiver presence — professional or trained family member.",
          "Emergency access system that works even if your parent cannot operate it independently.",
          "Nutritional support — meal preparation assistance, monitoring for adequate intake.",
          "Continence management plan if applicable.",
          "Regular professional medical review — not just when things get worse.",
        ],
      },
      {
        type: "list",
        heading: "What Nivarak recommends",
        items: [
          "Urgent comprehensive assessment — within this week if possible.",
          "Full care planning session — not a check-in but a structured multi-domain care plan.",
          "Caregiver assessment and training if family members are primary carers.",
          "Coordinator-led case management so nothing falls through the gap.",
          "Discussion of appropriate longer-term care model.",
        ],
      },
      whatsAppBlock({
        heading: "Please reach out today",
        body:
          "Your parent needs a care plan — and you need support too\nManaging a highly dependent parent from a different city or country is genuinely hard. Nivarak is designed for exactly this situation. We will assess, plan, and coordinate — and keep you informed at every step.",
        percentage,
        bandLabel,
      }),
    ],
  },
};

export function formatIaspReportForLine(input: {
  parentName?: string | null;
  aboutYou: IaspAboutYouValues;
  assessedOn: string;
  locationLabel?: string | null;
}): string {
  const parent = input.parentName?.trim() || "Your parent";
  const age = input.aboutYou.age?.trim() || "—";
  const location =
    input.locationLabel?.trim() ||
    input.aboutYou.location?.trim() ||
    "Location not specified";
  return `For: ${parent}, ${age}  Assessed: ${input.assessedOn}  ${location}`;
}

export function buildIaspScoreReport(input: {
  percentage: number;
  aboutYou: IaspAboutYouValues;
  parentName?: string | null;
  completedAt?: string | null;
}): IaspScoreReportTemplate & {
  band: IaspRiskBand;
  bandLabel: string;
  forLine: string;
  blocks: readonly IaspScoreReportBlock[];
} {
  const bandResult = getIaspBand(input.percentage);
  const template = IASP_SCORE_REPORT_TEMPLATES[bandResult.band];
  const assessedOn = formatIaspAssessmentDate(
    input.completedAt ? new Date(input.completedAt) : undefined,
  );
  const forLine = formatIaspReportForLine({
    parentName: input.parentName,
    aboutYou: input.aboutYou,
    assessedOn,
  });
  const blocks = template.buildBlocks({
    percentage: input.percentage,
    bandLabel: bandResult.label,
  });
  return {
    headline: template.headline,
    subheadline: template.subheadline,
    bandTagline: template.bandTagline,
    forLine,
    band: bandResult.band,
    bandLabel: bandResult.label,
    blocks,
  };
}

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
