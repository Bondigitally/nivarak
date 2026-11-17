/**
 * Comprehensive Geriatric Assessment — 20 clinician sections (Nivarak UI Figma).
 */

export type CgaFieldOption = { id: string; label: string };

export type CgaField =
  | {
      id: string;
      label: string;
      kind: "text" | "textarea" | "date";
      placeholder?: string;
      hint?: string;
    }
  | {
      id: string;
      label: string;
      kind: "select";
      options: readonly CgaFieldOption[];
      placeholder?: string;
    }
  | {
      id: string;
      label: string;
      kind: "radio" | "chips";
      options: readonly CgaFieldOption[];
      multi?: boolean;
    }
  | {
      id: string;
      label: string;
      kind: "checkbox-list";
      options: readonly CgaFieldOption[];
    };

export type CgaSection = {
  id: string;
  number: number;
  title: string;
  /** Short rail label when title is long */
  shortTitle?: string;
  description?: string;
  callout?: { tone: "warning" | "info"; title?: string; body: string };
  fields: readonly CgaField[];
};

export type CgaMedicationRow = {
  id: string;
  drug: string;
  dose: string;
  frequency: string;
  indication: string;
  flag?: string;
};

export type CgaOtcRow = {
  id: string;
  drug: string;
  dose: string;
  frequency: string;
  notes: string;
};

export type CgaProblemPriority = "high" | "medium" | "low" | "";

export type CgaProblemRow = {
  id: string;
  /**
   * Fixed domain id from CGA_PROBLEM_DOMAINS.
   * Optional so mid-stack wizard builds stay valid before the tip rewrite.
   */
  domainId?: string;
  domain?: string;
  problem: string;
  priority?: CgaProblemPriority;
  notes: string;
};

export const CGA_PROBLEM_PRIORITY_OPTIONS = [
  { id: "high", label: "High" },
  { id: "medium", label: "Medium" },
  { id: "low", label: "Low" },
] as const;

/** Fixed problem-list domains (# / Domain). */
export const CGA_PROBLEM_DOMAINS = [
  { id: "medical-1", number: 1, label: "Medical" },
  { id: "medical-2", number: 2, label: "Medical" },
  { id: "medicines", number: 3, label: "Medicines" },
  { id: "mobility-bone", number: 4, label: "Mobility / bone" },
  { id: "cognitive", number: 5, label: "Cognitive" },
  { id: "psychological", number: 6, label: "Psychological" },
  { id: "nutritional", number: 7, label: "Nutritional" },
  { id: "social-environmental", number: 8, label: "Social / environmental" },
  { id: "continence", number: 9, label: "Continence" },
  { id: "eol-acp", number: 10, label: "End of life / advance care" },
  { id: "vaccinations", number: 11, label: "Vaccinations" },
  {
    id: "screening",
    number: 12,
    label: "Screening (Mammo, Prostate or other)",
  },
] as const;

export function emptyProblemRow(
  domain: (typeof CGA_PROBLEM_DOMAINS)[number],
): CgaProblemRow {
  return {
    id: domain.id,
    domainId: domain.id,
    domain: domain.label,
    problem: "",
    priority: "",
    notes: "",
  };
}

export function ensureProblemRows(problems: CgaProblemRow[]): CgaProblemRow[] {
  return CGA_PROBLEM_DOMAINS.map((domain) => {
    const existing = problems.find(
      (row) => row.domainId === domain.id || row.id === domain.id,
    );
    if (!existing) return emptyProblemRow(domain);
    return {
      ...emptyProblemRow(domain),
      problem: existing.problem ?? "",
      priority:
        existing.priority === "high" ||
        existing.priority === "medium" ||
        existing.priority === "low"
          ? existing.priority
          : "",
      notes: existing.notes ?? "",
    };
  });
}

export function isProblemRowEmpty(row: CgaProblemRow): boolean {
  return !row.problem.trim() && !row.priority;
}

export function isProblemRowValid(row: CgaProblemRow): boolean {
  if (isProblemRowEmpty(row)) return true;
  return (
    row.problem.trim().length > 0 &&
    (row.priority === "high" ||
      row.priority === "medium" ||
      row.priority === "low")
  );
}

export function hasCompletedProblem(rows: CgaProblemRow[]): boolean {
  return rows.some((row) => !isProblemRowEmpty(row) && isProblemRowValid(row));
}

export type CgaCarePlanResponsible =
  | "patient"
  | "doctor"
  | "carer"
  | "nurse"
  | "";

export type CgaCarePlanActionStatus = "high" | "medium" | "low" | "";

export type CgaCarePlanActionRow = {
  id: string;
  number: number;
  /** Action / intervention option id (see CGA_CARE_PLAN_ACTION_OPTIONS). */
  action: string;
  /** Free text when action is `other`. */
  actionOther: string;
  responsible: CgaCarePlanResponsible;
  /** Timeframe date (YYYY-MM-DD). */
  timeframe: string;
  status: CgaCarePlanActionStatus;
};

export const CGA_CARE_PLAN_ACTION_SLOT_COUNT = 8;

export const CGA_CARE_PLAN_ACTION_OPTIONS = [
  { id: "medication-review", label: "Medication review / deprescribing" },
  { id: "falls-prevention", label: "Falls prevention / strength & balance" },
  { id: "bone-health", label: "Bone health / osteoporosis treatment" },
  { id: "cognitive-follow-up", label: "Cognitive assessment follow-up" },
  { id: "psychological-support", label: "Mood / psychological support" },
  { id: "nutrition-support", label: "Nutritional support / dietitian" },
  { id: "continence", label: "Continence management" },
  { id: "social-care", label: "Social care / carer support" },
  { id: "advance-care", label: "Advance care planning" },
  { id: "physiotherapy", label: "Physiotherapy referral" },
  { id: "ot-home-safety", label: "OT / home safety assessment" },
  { id: "other", label: "Other" },
] as const;

export const CGA_CARE_PLAN_RESPONSIBLE_OPTIONS = [
  { id: "patient", label: "Patient" },
  { id: "doctor", label: "Doctor" },
  { id: "carer", label: "Carer" },
  { id: "nurse", label: "Nurse" },
] as const;

export const CGA_CARE_PLAN_ACTION_STATUS_OPTIONS = [
  { id: "high", label: "High" },
  { id: "medium", label: "Medium" },
  { id: "low", label: "Low" },
] as const;

const CGA_CARE_PLAN_ACTION_IDS = new Set<string>(
  CGA_CARE_PLAN_ACTION_OPTIONS.map((opt) => opt.id),
);

export function emptyCarePlanActionRow(number: number): CgaCarePlanActionRow {
  return {
    id: `care-action-${number}`,
    number,
    action: "",
    actionOther: "",
    responsible: "",
    timeframe: "",
    status: "",
  };
}

export function ensureCarePlanActionRows(
  rows: CgaCarePlanActionRow[],
): CgaCarePlanActionRow[] {
  return Array.from({ length: CGA_CARE_PLAN_ACTION_SLOT_COUNT }, (_, index) => {
    const number = index + 1;
    const existing =
      rows.find((row) => row.number === number) ??
      rows.find((row) => row.id === `care-action-${number}`) ??
      rows[index];
    if (!existing) return emptyCarePlanActionRow(number);
    const responsible =
      existing.responsible === "patient" ||
      existing.responsible === "doctor" ||
      existing.responsible === "carer" ||
      existing.responsible === "nurse"
        ? existing.responsible
        : "";
    const status =
      existing.status === "high" ||
      existing.status === "medium" ||
      existing.status === "low"
        ? existing.status
        : "";
    const action =
      typeof existing.action === "string" &&
      CGA_CARE_PLAN_ACTION_IDS.has(existing.action)
        ? existing.action
        : "";
    return {
      ...emptyCarePlanActionRow(number),
      action,
      actionOther: existing.actionOther ?? "",
      responsible,
      timeframe: existing.timeframe ?? "",
      status,
    };
  });
}

export function isCarePlanActionRowEmpty(row: CgaCarePlanActionRow): boolean {
  return (
    !row.action &&
    !row.actionOther.trim() &&
    !row.responsible &&
    !row.timeframe.trim() &&
    !row.status
  );
}

export function isCarePlanActionRowValid(row: CgaCarePlanActionRow): boolean {
  if (isCarePlanActionRowEmpty(row)) return true;
  const actionOk =
    row.action.length > 0 &&
    (row.action !== "other" || row.actionOther.trim().length > 0);
  return (
    actionOk &&
    (row.responsible === "patient" ||
      row.responsible === "doctor" ||
      row.responsible === "carer" ||
      row.responsible === "nurse") &&
    row.timeframe.trim().length > 0 &&
    (row.status === "high" ||
      row.status === "medium" ||
      row.status === "low")
  );
}

export function hasCompletedCarePlanAction(
  rows: CgaCarePlanActionRow[],
): boolean {
  return rows.some(
    (row) => !isCarePlanActionRowEmpty(row) && isCarePlanActionRowValid(row),
  );
}

export const CGA_DEFAULT_CARE_PLAN_ACTIONS: CgaCarePlanActionRow[] =
  ensureCarePlanActionRows([]);

export type CgaCarePlanReferralUrgency =
  | "routine"
  | "soon"
  | "urgent"
  | "";

export type CgaCarePlanReferralRow = {
  id: string;
  number: number;
  /** Referral destination option id (see CGA_CARE_PLAN_REFERRAL_TO_OPTIONS). */
  referralTo: string;
  /** Free text when referralTo is `other`. */
  referralToOther: string;
  reason: string;
  urgency: CgaCarePlanReferralUrgency;
  /** Date sent (YYYY-MM-DD). */
  dateSent: string;
};

export const CGA_CARE_PLAN_REFERRAL_SLOT_COUNT = 6;

export const CGA_CARE_PLAN_REFERRAL_TO_OPTIONS = [
  { id: "physiotherapy", label: "Physiotherapy" },
  { id: "occupational-therapy", label: "Occupational therapy" },
  { id: "dietitian", label: "Dietitian" },
  { id: "speech-language", label: "Speech & language therapy" },
  { id: "social-care", label: "Social worker / adult social care" },
  { id: "memory-clinic", label: "Memory clinic / old age psychiatry" },
  { id: "falls-clinic", label: "Falls clinic" },
  { id: "continence", label: "Continence service" },
  { id: "district-nursing", label: "District nursing" },
  { id: "palliative-care", label: "Palliative care" },
  { id: "cardiology", label: "Cardiology" },
  { id: "other", label: "Other" },
] as const;

export const CGA_CARE_PLAN_REFERRAL_URGENCY_OPTIONS = [
  { id: "routine", label: "Routine" },
  { id: "soon", label: "Soon" },
  { id: "urgent", label: "Urgent" },
] as const;

const CGA_CARE_PLAN_REFERRAL_TO_IDS = new Set<string>(
  CGA_CARE_PLAN_REFERRAL_TO_OPTIONS.map((opt) => opt.id),
);

export function emptyCarePlanReferralRow(
  number: number,
): CgaCarePlanReferralRow {
  return {
    id: `care-referral-${number}`,
    number,
    referralTo: "",
    referralToOther: "",
    reason: "",
    urgency: "",
    dateSent: "",
  };
}

export function ensureCarePlanReferralRows(
  rows: CgaCarePlanReferralRow[],
): CgaCarePlanReferralRow[] {
  return Array.from(
    { length: CGA_CARE_PLAN_REFERRAL_SLOT_COUNT },
    (_, index) => {
      const number = index + 1;
      const existing =
        rows.find((row) => row.number === number) ??
        rows.find((row) => row.id === `care-referral-${number}`) ??
        rows[index];
      if (!existing) return emptyCarePlanReferralRow(number);
      const urgency =
        existing.urgency === "routine" ||
        existing.urgency === "soon" ||
        existing.urgency === "urgent"
          ? existing.urgency
          : "";
      const referralTo =
        typeof existing.referralTo === "string" &&
        CGA_CARE_PLAN_REFERRAL_TO_IDS.has(existing.referralTo)
          ? existing.referralTo
          : "";
      return {
        ...emptyCarePlanReferralRow(number),
        referralTo,
        referralToOther: existing.referralToOther ?? "",
        reason: existing.reason ?? "",
        urgency,
        dateSent: existing.dateSent ?? "",
      };
    },
  );
}

export function isCarePlanReferralRowEmpty(
  row: CgaCarePlanReferralRow,
): boolean {
  return (
    !row.referralTo &&
    !row.referralToOther.trim() &&
    !row.reason.trim() &&
    !row.urgency &&
    !row.dateSent.trim()
  );
}

export function isCarePlanReferralRowValid(
  row: CgaCarePlanReferralRow,
): boolean {
  if (isCarePlanReferralRowEmpty(row)) return true;
  const referralOk =
    row.referralTo.length > 0 &&
    (row.referralTo !== "other" || row.referralToOther.trim().length > 0);
  return (
    referralOk &&
    row.reason.trim().length > 0 &&
    (row.urgency === "routine" ||
      row.urgency === "soon" ||
      row.urgency === "urgent") &&
    row.dateSent.trim().length > 0
  );
}

export const CGA_DEFAULT_CARE_PLAN_REFERRALS: CgaCarePlanReferralRow[] =
  ensureCarePlanReferralRows([]);

export const CGA_CARE_PLAN_REVIEW_TYPE_OPTIONS = [
  { id: "home-visit", label: "Home visit" },
  { id: "teleconsult", label: "Teleconsult" },
  { id: "clinic", label: "Clinic" },
] as const;

export const CGA_CAPACITY_TODAY_OPTIONS = [
  { id: "assumed", label: "Capacity assumed - no concerns" },
  {
    id: "assessed-present",
    label: "Capacity formally assessed - present",
  },
  {
    id: "assessed-absent",
    label: "Capacity formally assessed - absent for specific decision",
  },
  {
    id: "uncertain",
    label: "Capacity uncertain - further assessment needed",
  },
] as const;

export const CGA_FORMAL_CAPACITY_ASSESSMENT_OPTIONS = [
  { id: "not-required", label: "Not required" },
  { id: "yes-documented", label: "Yes - documented separately" },
] as const;

export const CGA_LPA_OPTIONS = [
  { id: "no", label: "No" },
  { id: "health-welfare", label: "Yes - health and welfare" },
  { id: "property-financial", label: "Yes - property and financial" },
  { id: "both", label: "Both" },
] as const;

export const CGA_DECISION_MAKER_OPTIONS = [
  { id: "patient", label: "Patient manages own decisions" },
  { id: "family-member", label: "Family member (named below)" },
  { id: "legal-guardian", label: "Legal guardian / attorney" },
] as const;

/** Visit Details — Figma node 644:35321 */
export const CGA_GENDER_OPTIONS = [
  { id: "male", label: "Male" },
  { id: "female", label: "Female" },
  { id: "other", label: "Other" },
] as const;

export const CGA_LIVING_SITUATION_OPTIONS = [
  { id: "alone", label: "Alone" },
  { id: "spouse", label: "With spouse / partner" },
  { id: "adult-child", label: "With adult child" },
  { id: "hired-help", label: "With hired help" },
  { id: "care-home", label: "Care home / assisted living" },
] as const;

export const CGA_LANGUAGE_OPTIONS = [
  { id: "english", label: "English" },
  { id: "gujarati", label: "Gujarati" },
  { id: "hindi", label: "Hindi" },
  { id: "marathi", label: "Marathi" },
  { id: "tamil", label: "Tamil" },
  { id: "telugu", label: "Telugu" },
] as const;

export const CGA_ADHERENCE_OPTIONS = [
  { id: "good", label: "Good" },
  { id: "occasional", label: "Occasional misses" },
  { id: "frequent", label: "Frequent misses" },
  { id: "unable", label: "Unable to assess" },
] as const;

export const CGA_ADMINISTRATION_OPTIONS = [
  { id: "self", label: "Self-manages" },
  { id: "carer", label: "Carer administers" },
  { id: "blister", label: "Blister pack used" },
  { id: "swallowing", label: "Swallowing difficulty" },
  { id: "packaging", label: "Cannot open packaging" },
] as const;

export const CGA_POSTURAL_BP_OPTIONS = [
  { id: "not-checked", label: "Not checked" },
  { id: "no-drop", label: "No drop" },
  { id: "drop-systolic", label: "Drop >20 mmHg systolic" },
  { id: "symptomatic", label: "Symptomatic on standing" },
] as const;

export const CGA_NUTRITIONAL_APPEARANCE_OPTIONS = [
  { id: "normal", label: "Normal" },
  { id: "loose-skin", label: "Loose skin / recent weight loss" },
  { id: "poorly-fitting", label: "Poorly fitting clothing" },
  { id: "cachexia", label: "Cachexia / wasting" },
] as const;

export const CGA_FALLS_12M_OPTIONS = [
  { id: "none", label: "None" },
  { id: "one", label: "One fall" },
  { id: "twoPlus", label: "Two or more falls" },
] as const;

export const CGA_FALLS_CIRCUMSTANCES_OPTIONS = [
  { id: "mechanical", label: "Mechanical / trip" },
  { id: "dizziness", label: "Dizziness / postural" },
  { id: "blackout", label: "Blackout / syncope" },
  { id: "unexplained", label: "No warning / unexplained" },
  { id: "night", label: "Night-time (toilet trip)" },
  { id: "unable-recall", label: "Unable to recall" },
] as const;

export const CGA_FALLS_CONSEQUENCES_OPTIONS = [
  { id: "none", label: "None" },
  { id: "soft-tissue", label: "Soft tissue injury" },
  { id: "fracture", label: "Fracture" },
  { id: "confidence", label: "Loss of confidence" },
  { id: "restricted", label: "Restricted activity" },
] as const;

export const CGA_FEAR_OF_FALLING_OPTIONS = [
  { id: "none", label: "None" },
  { id: "mild", label: "Mild - some avoided activities" },
  { id: "significant", label: "Significant restriction of activity" },
] as const;

export const CGA_WALKING_AIDS_OPTIONS = [
  { id: "none", label: "None" },
  { id: "stick", label: "Walking stick" },
  { id: "zimmer", label: "Zimmer frame / walker" },
  { id: "wheelchair", label: "Wheelchair" },
  { id: "housebound", label: "Housebound" },
] as const;

export const CGA_OUTDOOR_MOBILITY_OPTIONS = [
  { id: "independent", label: "Independent outdoors" },
  { id: "company", label: "Outdoors with company only" },
  { id: "indoors", label: "Indoors only" },
  { id: "bedbound", label: "Bedbound / chair-bound" },
] as const;

export const CGA_CHAIR_STAND_OPTIONS = [
  { id: "able", label: "Able" },
  { id: "requires-arms", label: "Requires arms" },
  { id: "unable", label: "Unable" },
] as const;

export const CGA_GAIT_PATTERN_OPTIONS = [
  { id: "normal", label: "Normal" },
  { id: "shuffling", label: "Shuffling / short steps" },
  { id: "wide-based", label: "Wide-based" },
  { id: "antalgic", label: "Antalgic" },
  { id: "parkinsonian", label: "Parkinsonian features" },
  { id: "foot-drop", label: "Foot drop" },
  { id: "ataxic", label: "Ataxic" },
  { id: "circumduction", label: "Circumduction" },
] as const;

export const CGA_BALANCE_IMPRESSION_OPTIONS = [
  { id: "normal", label: "Normal" },
  { id: "mild", label: "Mild impairment" },
  { id: "moderate", label: "Moderate" },
] as const;

export const CGA_ENVIRONMENTAL_HAZARDS_OPTIONS = [
  { id: "none", label: "None obvious" },
  { id: "mats", label: "Loose mats / carpets" },
  { id: "lighting", label: "Poor lighting" },
  { id: "clutter", label: "Cluttered walkways" },
  { id: "grab-rails", label: "No grab rails (bathroom / toilet)" },
  { id: "wet-floor", label: "Wet bathroom floor" },
  { id: "steps", label: "Steps without rail" },
  { id: "low-seating", label: "Low seating" },
] as const;

export const CGA_FRAGILITY_FRACTURE_OPTIONS = [
  { id: "none", label: "None" },
  { id: "wrist", label: "Wrist" },
  { id: "vertebral", label: "Vertebral / height loss" },
  { id: "hip", label: "Hip" },
  { id: "other", label: "Other low-impact fracture" },
] as const;

export const CGA_OSTEOPOROSIS_DIAGNOSIS_OPTIONS = [
  { id: "none", label: "None known" },
  { id: "confirmed", label: "Confirmed osteoporosis" },
  { id: "osteopenia", label: "Osteopenia" },
  { id: "unknown", label: "Unknown" },
] as const;

export const CGA_BONE_RISK_FACTOR_OPTIONS = [
  { id: "postmenopausal", label: "Female post-menopausal" },
  { id: "steroids", label: "Prolonged steroid use" },
  { id: "low-bmi", label: "Low BMI (<20)" },
  { id: "alcohol", label: "Excess alcohol" },
  { id: "smoking", label: "Smoking" },
  { id: "sedentary", label: "Sedentary" },
  { id: "family", label: "Family history of osteoporosis" },
  { id: "malabsorption", label: "Malabsorption" },
] as const;

export const CGA_BONE_TREATMENT_OPTIONS = [
  { id: "none", label: "None" },
  { id: "calcium-vitd", label: "Calcium + Vitamin D supplementation" },
  { id: "bisphosphonate", label: "Bisphosphonate" },
  { id: "other", label: "Other treatment" },
  { id: "not-assessed", label: "Not assessed" },
] as const;

export type CgaSystemicExamField = {
  id: string;
  label: string;
  multi: boolean;
  options: readonly { id: string; label: string }[];
};

/** 4.2 Systemic examination — multi-select findings (except vision/hearing). */
export const CGA_SYSTEMIC_EXAM_FIELDS: readonly CgaSystemicExamField[] = [
  {
    id: "examCardiovascular",
    label: "Cardiovascular",
    multi: true,
    options: [
      { id: "normal", label: "Normal" },
      { id: "irregular", label: "Irregular rhythm" },
      { id: "murmur", label: "Murmur" },
      { id: "oedema", label: "Peripheral oedema" },
      { id: "raised-jvp", label: "Raised JVP" },
      { id: "other", label: "Other" },
    ],
  },
  {
    id: "examRespiratory",
    label: "Respiratory",
    multi: true,
    options: [
      { id: "normal", label: "Normal" },
      { id: "wheeze", label: "Wheeze" },
      { id: "crepitations", label: "Crepitations" },
      { id: "reduced-air", label: "Reduced air entry" },
      { id: "other", label: "Other" },
    ],
  },
  {
    id: "examAbdomen",
    label: "Abdomen",
    multi: true,
    options: [
      { id: "normal", label: "Normal" },
      { id: "tenderness", label: "Tenderness" },
      { id: "organomegaly", label: "Organomegaly" },
      { id: "ascites", label: "Ascites" },
      { id: "constipation", label: "Constipation suspected" },
      { id: "other", label: "Other" },
    ],
  },
  {
    id: "examNeurological",
    label: "Neurological (gross)",
    multi: true,
    options: [
      { id: "normal", label: "Normal" },
      { id: "focal", label: "Focal deficit" },
      { id: "tremor", label: "Tremor" },
      { id: "rigidity", label: "Rigidity" },
      { id: "sensory", label: "Sensory loss" },
      { id: "other", label: "Other" },
    ],
  },
  {
    id: "examMusculoskeletal",
    label: "Musculoskeletal",
    multi: true,
    options: [
      { id: "normal", label: "Normal" },
      { id: "joint-oa", label: "Joint swelling / OA" },
      { id: "kyphosis", label: "Kyphosis / postural change" },
      { id: "limited-rom", label: "Limited range of movement" },
      { id: "pain", label: "Pain on movement" },
      { id: "other", label: "Other" },
    ],
  },
  {
    id: "examSkin",
    label: "Skin",
    multi: true,
    options: [
      { id: "normal", label: "Normal" },
      { id: "oedema", label: "Oedema" },
      { id: "pressure", label: "Pressure area risk" },
      { id: "ulcer", label: "Ulcer / wound" },
      { id: "rash", label: "Rash" },
      { id: "pallor", label: "Pallor" },
      { id: "other", label: "Other" },
    ],
  },
  {
    id: "examFeet",
    label: "Feet",
    multi: true,
    options: [
      { id: "normal", label: "Normal" },
      { id: "oedema", label: "Oedema" },
      { id: "ulcer", label: "Ulcer / wound" },
      { id: "fungal", label: "Fungal nails" },
      { id: "perfusion", label: "Poor perfusion" },
      { id: "sensory", label: "Sensory loss" },
      { id: "footwear", label: "Inappropriate footwear" },
    ],
  },
  {
    id: "examOral",
    label: "Oral health",
    multi: true,
    options: [
      { id: "normal", label: "Normal" },
      { id: "dentures-well", label: "Dentures - well fitting" },
      { id: "dentures-poor", label: "Dentures - poor fit" },
      { id: "dental", label: "Dental concerns" },
      { id: "hygiene", label: "Poor hygiene" },
    ],
  },
  {
    id: "examVision",
    label: "Vision (gross)",
    multi: false,
    options: [
      { id: "normal", label: "Normal / corrected" },
      { id: "reduced", label: "Reduced acuity" },
      { id: "not-assessed", label: "Not assessed" },
    ],
  },
  {
    id: "examHearing",
    label: "Hearing (gross)",
    multi: false,
    options: [
      { id: "normal", label: "Normal / aided" },
      { id: "reduced", label: "Reduced" },
      { id: "not-assessed", label: "Not assessed" },
    ],
  },
] as const;

export const CGA_CLINICIAN_OPTIONS = [
  "Dr. Sarah Jenkins",
  "Dr. M. Aris",
  "Dr. S. Patel",
  "Dr. Mehta",
  "Nurse K. Lin",
  "Nurse Anita Roy",
  "Nurse Sneha",
] as const;

export const CGA_DESIGNATION_OPTIONS = [
  "Geriatrician",
  "General Practitioner",
  "Home Nurse",
  "Care Coordinator",
] as const;

/** Cognition orientation chips — kept for mid-stack wizard until tip rewrite lands. */
export const CGA_ORIENTATION_OPTIONS = [
  { id: "oriented", label: "Oriented ×3" },
  { id: "partial", label: "Partially oriented" },
  { id: "disoriented", label: "Disoriented" },
] as const;

export const CGA_RELATIONSHIP_OPTIONS = [
  "Son",
  "Daughter",
  "Spouse",
  "Sibling",
  "Other family",
  "Caregiver",
  "Friend",
] as const;

export function mapPatientGenderToCga(gender: string): string {
  const g = gender.trim().toUpperCase();
  if (g === "M" || g === "MALE") return "male";
  if (g === "F" || g === "FEMALE") return "female";
  return "other";
}

export function approximateDobFromAge(age: number): string {
  const year = new Date().getFullYear() - age;
  return `01/01/${year}`;
}

export const CGA_DEFAULT_MEDICATIONS: CgaMedicationRow[] = [
  {
    id: "med-1",
    drug: "Amlodipine",
    dose: "5mg",
    frequency: "OD",
    indication: "Hypertension",
  },
  {
    id: "med-2",
    drug: "Metformin",
    dose: "500mg",
    frequency: "BD",
    indication: "T2DM",
  },
  {
    id: "med-3",
    drug: "Atorvastatin",
    dose: "20mg",
    frequency: "ON",
    indication: "Dyslipidemia",
  },
  {
    id: "med-4",
    drug: "Amitriptyline",
    dose: "25mg",
    frequency: "ON",
    indication: "Neuropathy",
    flag: "STOP: Anticholinergic",
  },
];

export const CGA_DEFAULT_OTC: CgaOtcRow[] = [
  {
    id: "otc-1",
    drug: "Calcium + Vit D",
    dose: "Combo tab",
    frequency: "Daily",
    notes: "Patient self-reports",
  },
  {
    id: "otc-2",
    drug: "Paracetamol",
    dose: "500mg",
    frequency: "Occasional",
    notes: "OTC",
  },
];

export const CGA_DEFAULT_PROBLEMS: CgaProblemRow[] = ensureProblemRows([]);

export const CGA_SECTIONS: readonly CgaSection[] = [
  {
    id: "visit-details",
    number: 1,
    title: "Visit Details",
    callout: {
      tone: "info",
      title: "",
      body: "Demographics and contact information sync to the patient chart automatically upon save.",
    },
    fields: [], // custom VisitDetailsSection UI (Figma 644:35321)
  },
  {
    id: "medical-history",
    number: 2,
    title: "Medical History",
    fields: [], // custom UI — CgaMedicalHistorySection
  },
  {
    id: "medications",
    number: 3,
    title: "Medications",
    callout: {
      tone: "warning",
      title: "STOP/START Criteria",
      body: "Review for potentially inappropriate medications and omitted clinical indications in older patients.",
    },
    fields: [], // custom UI
  },
  {
    id: "physical",
    number: 4,
    title: "Physical Assessment",
    fields: [], // custom UI — PhysicalAssessmentSection
  },
  {
    id: "mobility-falls",
    number: 5,
    title: "Mobility, Balance & Falls",
    shortTitle: "Mobility, Balance & Falls",
    callout: {
      tone: "warning",
      body: "BGS: Perform mobility assessment in all older adults with frailty. TUG and chair stand are standard home visit tests requiring no equipment.",
    },
    fields: [], // custom UI — MobilityFallsSection (5.1 Falls history)
  },
  {
    id: "bone-health",
    number: 6,
    title: "Bone Health",
    fields: [], // custom UI — BoneHealthSection
  },
  {
    id: "cognition",
    number: 7,
    title: "Cognitive Assessment",
    callout: {
      tone: "warning",
      body: "Use GP-Cog (5 min, includes informant interview) or MoCA (requires registration at mocatest.org). AMTS is a fast screen but misses executive dysfunction.",
    },
    fields: [], // custom UI — CognitionSection (7.1 Screening tool)
  },
  {
    id: "mood",
    number: 8,
    title: "Psychological Assessment",
    callout: {
      tone: "warning",
      body: "Depression prevalence 5–10% in over-65s; frequently under-recognised. Ask mood questions privately where possible.",
    },
    fields: [], // custom UI — PsychologicalAssessmentSection
  },
  {
    id: "delirium",
    number: 9,
    title: "Delirium Assessment",
    callout: {
      tone: "warning",
      body: "Delirium = acute confusional state, usually with fluctuating course. Diagnose using Confusion Assessment Method (CAM). Community prevalence 1–2%; rises to 14% in over-85s.",
    },
    fields: [], // custom UI — DeliriumAssessmentSection (9.1 4AT, 9.2 CAM)
  },
  {
    id: "function",
    number: 10,
    title: "Functional Assessment (ADL & iADL)",
    shortTitle: "Function (ADL & iADL)",
    callout: {
      tone: "warning",
      body: "Score each item. Document change from prior level. Barthel ceiling effect: patients may score well yet still depend on others for iADL.",
    },
    fields: [], // custom UI — FunctionalAssessmentSection (10.1 Barthel, 10.2 Nottingham)
  },
  {
    id: "social-home",
    number: 11,
    title: "Social & Environmental Assessment",
    shortTitle: "Social & Environmental",
    fields: [], // custom UI — SocialEnvironmentalSection (11.1 / 11.2)
  },
  {
    id: "continence",
    number: 12,
    title: "Urinary Incontinence",
    callout: {
      tone: "warning",
      body: "Screen all older patients. Two in five women over 60 affected. Urgency to toilet significantly increases falls risk.",
    },
    fields: [], // custom UI — UrinaryIncontinenceSection
  },
  {
    id: "nutrition",
    number: 13,
    title: "Nutritional Assessment & Weight",
    shortTitle: "Nutrition & Weight",
    callout: {
      tone: "warning",
      body: "MUST 0: low risk. 1: medium risk - observe. ≥2: high risk - refer dietitian. Unintentional weight loss >5% in 1 month or >10% in 6 months is a red flag.",
    },
    fields: [], // custom UI — NutritionalAssessmentSection
  },
  {
    id: "advance-care",
    number: 14,
    title: "End of Life & Advance Care Planning",
    shortTitle: "Advance Care",
    callout: {
      tone: "warning",
      body: "Many principles of CGA overlap with end of life care. Frailty correlates with prognosis but is often missed due to insidious progression. Raise sensitively where appropriate.",
    },
    fields: [], // custom UI — EndOfLifeSection
  },
  {
    id: "investigations",
    number: 15,
    title: "Investigations",
    fields: [], // custom UI — CgaInvestigationsSection
  },
  {
    id: "frailty-flags",
    number: 16,
    title: "Frailty Syndrome Summary Flags",
    shortTitle: "Frailty Flags",
    callout: {
      tone: "warning",
      body: "Tick all that apply. These feed the problem list and care plan priorities.",
    },
    fields: [], // custom UI — FrailtyFlagsSection
  },
  {
    id: "problem-list",
    number: 17,
    title: "Problem List",
    callout: {
      tone: "warning",
      body: "Develop collaboratively with patient and family. Prioritise: acute / high-risk problems first. Problems in frailty often interact - average of 6 per patient.",
    },
    fields: [], // custom UI — ProblemListSection
  },
  {
    id: "care-plan",
    number: 18,
    title: "Personalised Care & Support Plan",
    shortTitle: "Care Plan",
    callout: {
      tone: "warning",
      body: "BGS: Care planning is a continuous, collaborative process - not a one-off event. Goals should be patient-centred, SMART, and linked to functional outcomes that matter to the individual.",
    },
    fields: [], // custom UI — CarePlanSection (18.1–18.5)
  },
  {
    id: "capacity",
    number: 19,
    title: "Mental Capacity",
    shortTitle: "Mental Capacity",
    callout: {
      tone: "warning",
      body: "Capacity is assumed present unless shown otherwise. Capacity is decision-specific - assess for each significant decision separately.",
    },
    fields: [], // custom UI — MentalCapacitySection
  },
  {
    id: "sign-off",
    number: 20,
    title: "Sign-off",
    fields: [], // custom UI — SignOffSection (signer locked to logged-in clinician)
  },
] as const;

export const CGA_SIGN_OFF_INFORMED_OPTIONS = [
  { id: "verbal-debrief", label: "Yes - verbal debrief given" },
  { id: "written-report", label: "Written report to follow" },
  { id: "pending-supervisor", label: "Pending supervisor review" },
] as const;

/** Legacy sign-off checkboxes — kept so mid-stack wizard builds before the tip rewrite. */
export const CGA_SIGN_OFF_ATTESTATION_OPTIONS = [
  {
    id: "reviewed",
    label: "I have reviewed all completed sections",
  },
  {
    id: "accurate",
    label: "Findings accurately reflect this encounter",
  },
] as const;

/** Clinical entry ceilings for CGA physical vitals (4.1 baseline). */
export const CGA_PHYSICAL_LIMITS = {
  bpSystolic: { min: 40, max: 300 },
  bpDiastolic: { min: 20, max: 200 },
  hr: { min: 20, max: 300 },
  spo2: { min: 50, max: 100 },
  temp: { min: 30, max: 45 },
  weightKg: { min: 1, max: 500 },
  weightLbs: { min: 2, max: 1100 },
  heightCm: { min: 50, max: 250 },
  bmi: { min: 8, max: 80 },
} as const;

/** Cognition screen scores. */
export const CGA_COGNITION_LIMITS = {
  /** Kept for mid-stack wizard until tip cognition UI drops MMSE. */
  mmse: { min: 0, max: 30 },
  gpcog: { min: 0, max: 6 },
  moca: { min: 0, max: 30 },
  amts: { min: 0, max: 10 },
} as const;

/** Rescreen cadence for cognitive screening tools. */
export const CGA_COGNITION_RESCREEN_MONTHS = 4;

export const CGA_ALERTNESS_OPTIONS = [
  { id: "normal", label: "Normal" },
  { id: "distracted", label: "Easily distracted" },
  { id: "drowsy", label: "Drowsy" },
  { id: "hypervigilant", label: "Hypervigilant" },
] as const;

export const CGA_COGNITION_ORIENTATION_OPTIONS = [
  { id: "fully-oriented", label: "Fully oriented" },
  { id: "time", label: "Disoriented to time" },
  { id: "place", label: "Disoriented to place" },
  { id: "confused", label: "Confused" },
] as const;

export const CGA_MEMORY_IMPRESSION_OPTIONS = [
  { id: "normal", label: "Normal" },
  {
    id: "mild",
    label: "Mild forgetfulness - not affecting daily life",
  },
  { id: "affecting", label: "Affecting daily functioning" },
  { id: "significant", label: "Significant decline" },
] as const;

export const CGA_LANGUAGE_COMMUNICATION_OPTIONS = [
  { id: "normal", label: "Normal" },
  { id: "word-finding", label: "Word-finding difficulty" },
  { id: "reduced-fluency", label: "Reduced fluency" },
  { id: "significant", label: "Significant impairment" },
] as const;

export const CGA_INFORMANT_REPORT_OPTIONS = [
  { id: "none", label: "No concerns" },
  { id: "forgetful", label: "Forgetful but manageable" },
  { id: "affecting", label: "Affecting daily tasks" },
  { id: "marked", label: "Marked deterioration" },
] as const;

export const CGA_DELIRIUM_RISK_OPTIONS = [
  { id: "none", label: "No delirium features" },
  {
    id: "possible",
    label: "Possible delirium - acute / fluctuating confusion",
  },
  { id: "active", label: "Active delirium - refer" },
] as const;

/** Psychological assessment — GDS-15 score 0–15. */
export const CGA_GDS15_LIMITS = { min: 0, max: 15 } as const;

export const CGA_PHQ2_SCREEN_OPTIONS = [
  { id: "negative", label: "Negative" },
  { id: "positive", label: "Positive - proceed to GDS or PHQ-9" },
] as const;

export const CGA_AFFECT_OPTIONS = [
  { id: "euthymic", label: "Euthymic" },
  { id: "flat", label: "Flat / blunted" },
  { id: "tearful", label: "Tearful" },
  { id: "anxious", label: "Anxious" },
  { id: "irritable", label: "Irritable" },
] as const;

export const CGA_PSYCHOMOTOR_OPTIONS = [
  { id: "normal", label: "Normal" },
  { id: "retardation", label: "Retardation noted" },
  { id: "agitation", label: "Agitation noted" },
] as const;

export const CGA_SLEEP_OPTIONS = [
  { id: "normal", label: "Normal" },
  { id: "initiating", label: "Difficulty initiating" },
  { id: "early-waking", label: "Early waking" },
  { id: "daytime", label: "Excessive daytime sleep" },
] as const;

export const CGA_SUICIDAL_IDEATION_OPTIONS = [
  { id: "none", label: "None" },
  { id: "passive", label: "Passive thoughts only" },
  { id: "active", label: "Active ideation - requires urgent referral" },
] as const;

export const CGA_ANXIETY_OPTIONS = [
  { id: "none", label: "None" },
  { id: "mild", label: "Mild - not affecting function" },
  { id: "affecting", label: "Affecting daily activities" },
  { id: "significant", label: "Significant" },
] as const;

export const CGA_LONELINESS_OPTIONS = [
  { id: "good-contact", label: "Good social contact" },
  { id: "mild", label: "Mild isolation" },
  { id: "significant", label: "Significant isolation" },
  { id: "housebound", label: "Housebound and alone" },
] as const;

export const CGA_4AT_ALERTNESS_OPTIONS = [
  { id: "0", label: "0" },
  { id: "4", label: "4" },
] as const;

export const CGA_4AT_AMT4_OPTIONS = [
  { id: "0", label: "0" },
  { id: "1", label: "1" },
  { id: "2", label: "2" },
] as const;

export const CGA_4AT_ATTENTION_OPTIONS = [
  { id: "0", label: "0" },
  { id: "1", label: "1" },
  { id: "2", label: "2" },
] as const;

export const CGA_4AT_ACUTE_CHANGE_OPTIONS = [
  { id: "0", label: "0" },
  { id: "4", label: "4" },
] as const;

export const CGA_YES_NO_OPTIONS = [
  { id: "no", label: "No" },
  { id: "yes", label: "Yes" },
] as const;

export const CGA_CAM_CONSCIOUSNESS_OPTIONS = [
  { id: "alert", label: "Alert (normal)" },
  { id: "hyperalert", label: "Hyperalert" },
  { id: "drowsy", label: "Drowsy" },
  { id: "stuporous", label: "Stuporous" },
] as const;

export const CGA_BARTHEL_LEVEL_OPTIONS = [
  { id: "independent", label: "Independent" },
  { id: "help", label: "With help" },
  { id: "unable", label: "Unable" },
] as const;

export type CgaBarthelLevel = (typeof CGA_BARTHEL_LEVEL_OPTIONS)[number]["id"];

export const CGA_BARTHEL_ITEMS = [
  {
    id: "feeding",
    label: "Feeding",
    max: 10,
    scores: { independent: 10, help: 5, unable: 0 },
  },
  {
    id: "bathing",
    label: "Bathing",
    max: 5,
    scores: { independent: 5, help: 0, unable: 0 },
  },
  {
    id: "grooming",
    label: "Grooming",
    max: 5,
    scores: { independent: 5, help: 0, unable: 0 },
  },
  {
    id: "dressing",
    label: "Dressing",
    max: 10,
    scores: { independent: 10, help: 5, unable: 0 },
  },
  {
    id: "bowel",
    label: "Bowel control",
    max: 10,
    scores: { independent: 10, help: 5, unable: 0 },
  },
  {
    id: "bladder",
    label: "Bladder control",
    max: 10,
    scores: { independent: 10, help: 5, unable: 0 },
  },
  {
    id: "toilet",
    label: "Toilet use",
    max: 10,
    scores: { independent: 10, help: 5, unable: 0 },
  },
  {
    id: "transfers",
    label: "Transfers - bed to chair",
    max: 15,
    scores: { independent: 15, help: 10, unable: 0 },
  },
  {
    id: "mobility",
    label: "Mobility on level surface",
    max: 15,
    scores: { independent: 15, help: 10, unable: 0 },
  },
  {
    id: "stairs",
    label: "Stairs",
    max: 10,
    scores: { independent: 10, help: 5, unable: 0 },
  },
] as const;

export const CGA_NOTTINGHAM_LEVEL_OPTIONS = [
  { id: "independent", label: "Independent" },
  { id: "help", label: "With help" },
  { id: "unable", label: "Unable" },
] as const;

export const CGA_NOTTINGHAM_ITEMS = [
  { id: "medications", label: "Managing medications" },
  { id: "finances", label: "Managing finances / bills" },
  { id: "telephone", label: "Using telephone / smartphone" },
  { id: "shopping", label: "Shopping / ordering groceries" },
  { id: "meals", label: "Preparing meals" },
  { id: "housekeeping", label: "Housekeeping / laundry" },
  { id: "transport", label: "Using transport / travelling outdoors" },
  { id: "driving", label: "Driving" },
] as const;

export function barthelItemFieldId(itemId: string) {
  return `barthel_${itemId}`;
}

export function nottinghamItemFieldId(itemId: string) {
  return `nottingham_${itemId}`;
}

export function barthelScoreForLevel(
  itemId: (typeof CGA_BARTHEL_ITEMS)[number]["id"],
  level: string,
): number | null {
  const item = CGA_BARTHEL_ITEMS.find((entry) => entry.id === itemId);
  if (!item) return null;
  if (level !== "independent" && level !== "help" && level !== "unable") {
    return null;
  }
  return item.scores[level];
}

export const CGA_PRIMARY_CARER_OPTIONS = [
  { id: "none", label: "None - fully independent" },
  { id: "spouse", label: "Spouse / partner" },
  { id: "child-coresident", label: "Adult child (co-resident)" },
  { id: "child-nearby", label: "Adult child (nearby)" },
  { id: "hired", label: "Hired domestic / carer" },
  { id: "agency", label: "Formal care agency" },
] as const;

export const CGA_CARER_STRAIN_OPTIONS = [
  { id: "no-carer", label: "No carer" },
  { id: "coping", label: "Carer coping well" },
  { id: "some-strain", label: "Some strain noted" },
  { id: "significant", label: "Significant carer burden" },
] as const;

export const CGA_SOCIAL_ENGAGEMENT_OPTIONS = [
  { id: "active", label: "Active" },
  { id: "some", label: "Some social contact" },
  { id: "minimal", label: "Minimal - risk of isolation" },
  { id: "isolated", label: "Completely isolated" },
] as const;

export const CGA_COMMUNITY_PARTICIPATION_OPTIONS = [
  { id: "religious", label: "Religious / social group" },
  { id: "exercise", label: "Exercise / walking group" },
  { id: "neighbourhood", label: "Neighbourhood / colony contact" },
  { id: "none", label: "None" },
] as const;

export const CGA_DRIVING_TRANSPORT_OPTIONS = [
  { id: "drives", label: "Drives independently" },
  { id: "public", label: "Uses public transport" },
  { id: "dependent", label: "Dependent on others" },
  { id: "housebound", label: "Housebound" },
] as const;

export const CGA_FINANCIAL_SITUATION_OPTIONS = [
  { id: "self-sufficient", label: "Self-sufficient" },
  { id: "family-supported", label: "Family-supported" },
  { id: "concerns", label: "Potential concerns" },
] as const;

export const CGA_PROPERTY_TYPE_OPTIONS = [
  { id: "house", label: "Independent house" },
  { id: "apartment", label: "Apartment / flat" },
  { id: "gated", label: "Gated community" },
  { id: "joint-family", label: "Joint family household" },
  { id: "care-home", label: "Care home / assisted living" },
] as const;

export const CGA_HOME_STAIRS_OPTIONS = [
  { id: "none", label: "None" },
  { id: "entry", label: "Steps at entry only" },
  { id: "internal", label: "Internal stairs used regularly" },
] as const;

export const CGA_BATHROOM_SAFETY_OPTIONS = [
  { id: "safe", label: "Safe - grab rails present" },
  { id: "no-rails", label: "No grab rails" },
  { id: "no-mat", label: "Non-slip mat absent" },
  { id: "shower-bath", label: "Combined shower / bath risk" },
  { id: "commode", label: "Commode / bath chair in use" },
] as const;

export const CGA_HOME_SAFETY_DEVICE_OPTIONS = [
  { id: "alarm", label: "Personal alarm / emergency button" },
  { id: "smoke", label: "Smoke detector" },
  { id: "none", label: "None" },
] as const;

export const CGA_URINARY_TYPE_OPTIONS = [
  { id: "overflow", label: "Overflow / incomplete emptying" },
  { id: "functional", label: "Functional incontinence" },
] as const;

export const CGA_URINARY_ONSET_OPTIONS = [
  { id: "long-standing", label: "Long-standing" },
  { id: "recent", label: "Recent / new change" },
] as const;

export const CGA_URINARY_SEVERITY_OPTIONS = [
  { id: "occasional", label: "Occasional leakage only" },
  { id: "pads", label: "Regular pads / protection required" },
  { id: "significant", label: "Significant / affecting daily life" },
] as const;

export const CGA_NOCTURIA_OPTIONS = [
  { id: "none", label: "None" },
  { id: "one", label: "1×/night" },
  { id: "two-three", label: "2–3×/night" },
  { id: "more-than-three", label: ">3×/night" },
] as const;

export const CGA_URGENCY_TOILET_OPTIONS = [
  { id: "none", label: "No urgency" },
  { id: "mild", label: "Mild urgency" },
  { id: "significant", label: "Significant urgency - rushing" },
  { id: "en-route", label: "Incontinence en route to toilet" },
] as const;

export const CGA_URINARY_EXAM_OPTIONS = [
  { id: "normal", label: "Normal abdomen and perineum" },
  { id: "pr-pelvic", label: "PR / pelvic examination performed" },
  { id: "bladder-palpable", label: "Bladder palpable" },
  { id: "not-examined", label: "Not examined" },
] as const;

/** MUST score range (Malnutrition Universal Screening Tool). */
export const CGA_MUST_LIMITS = { min: 0, max: 6 } as const;

export const CGA_APPETITE_OPTIONS = [
  { id: "good", label: "Good" },
  { id: "reduced", label: "Reduced" },
  { id: "poor", label: "Poor - skipping meals" },
  { id: "very-poor", label: "Very poor - minimal intake" },
] as const;

export const CGA_SWALLOWING_OPTIONS = [
  { id: "normal", label: "Normal" },
  { id: "occasional", label: "Occasional coughing / choking" },
  { id: "solids", label: "Difficulty with solids" },
  { id: "liquids", label: "Difficulty with liquids - refer for SLT" },
] as const;

export const CGA_ORAL_HEALTH_EATING_OPTIONS = [
  { id: "not-affecting", label: "Not affecting eating" },
  { id: "mild", label: "Mild" },
  { id: "significant", label: "Significantly limiting food intake" },
] as const;

export const CGA_TASTE_CHANGES_OPTIONS = [
  { id: "none", label: "None" },
  { id: "bland", label: "Foods taste bland" },
  { id: "altered", label: "Foods taste salty / sweet - altered" },
  { id: "off-food", label: "Off food due to taste" },
] as const;

export const CGA_HYDRATION_OPTIONS = [
  { id: "adequate", label: "Adequate" },
  { id: "borderline", label: "Borderline - encourage fluids" },
  { id: "dehydrated", label: "Likely dehydrated" },
] as const;

export const CGA_ALCOHOL_INTAKE_OPTIONS = [
  { id: "none", label: "None" },
  { id: "occasional", label: "Occasional / social" },
  { id: "regular", label: "Regular - within safe limits" },
  { id: "excess", label: "Excess / concern" },
] as const;

export const CGA_PROGNOSIS_AWARENESS_OPTIONS = [
  { id: "realistic", label: "Patient appears to have realistic awareness" },
  { id: "limited", label: "Limited awareness" },
  { id: "prefers-not", label: "Prefers not to discuss" },
] as const;

export const CGA_ACP_DISCUSSED_OPTIONS = [
  { id: "not-yet", label: "Not yet raised" },
  { id: "introduced", label: "Introduced - patient open to discussion" },
  { id: "statement", label: "Advance statement in place" },
  { id: "adrt", label: "ADRT in place" },
  { id: "lpa", label: "Lasting Power of Attorney in place" },
] as const;

export const CGA_PREFERRED_PLACE_OPTIONS = [
  { id: "home", label: "Home" },
  { id: "hospital", label: "Hospital" },
  { id: "hospice", label: "Hospice / palliative unit" },
  { id: "not-discussed", label: "Not discussed" },
] as const;

export const CGA_CPR_DECISION_OPTIONS = [
  { id: "not-discussed", label: "Not discussed" },
  { id: "dnacpr", label: "DNACPR in place" },
  { id: "full", label: "For full resuscitation" },
] as const;

export const CGA_PALLIATIVE_NEEDS_OPTIONS = [
  { id: "none", label: "None currently" },
  { id: "symptom", label: "Symptom control needs identified" },
  { id: "referral", label: "Palliative care referral indicated" },
] as const;

export const CGA_CARER_WISHES_AWARENESS_OPTIONS = [
  { id: "yes", label: "Yes - family aware" },
  { id: "partial", label: "Partial awareness" },
  { id: "not-discussed", label: "Not discussed with family" },
] as const;

export const CGA_FRAILTY_FLAG_OPTIONS = [
  { id: "falls", label: "Falls - one or more in last 12 months" },
  { id: "polypharmacy", label: "Polypharmacy (≥5 drugs)" },
  { id: "delirium", label: "Delirium - recent or current episode" },
  {
    id: "weight-loss",
    label: "Unintentional weight loss (>5% in 3 months)",
  },
  { id: "cognitive", label: "Cognitive impairment identified" },
  { id: "depression", label: "Depression screen positive" },
  {
    id: "incontinence",
    label: "Urinary incontinence - new or worsening",
  },
  {
    id: "bone-health",
    label: "Bone health risk / fragility fracture history",
  },
  { id: "mobility", label: "Reduced mobility - new decline" },
  { id: "pain", label: "Pain - chronic, affecting function" },
  { id: "isolation", label: "Significant social isolation" },
  { id: "caregiver-strain", label: "Caregiver strain" },
  { id: "high-risk-prescribing", label: "High-risk prescribing identified" },
  { id: "swallowing-nutrition", label: "Swallowing / nutrition concerns" },
  {
    id: "eol-acp",
    label: "End of life - advance care planning needed",
  },
  { id: "environmental", label: "Environmental hazards identified" },
] as const;

export const CGA_SECTION_COUNT = CGA_SECTIONS.length;

export function getCgaSectionById(id: string): CgaSection | undefined {
  return CGA_SECTIONS.find((s) => s.id === id);
}

export function getCgaSectionIndex(id: string): number {
  return CGA_SECTIONS.findIndex((s) => s.id === id);
}
