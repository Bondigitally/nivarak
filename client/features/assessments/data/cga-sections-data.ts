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
  callout?: { tone: "warning" | "info"; title: string; body: string };
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

/** Visit Details — Figma node 644:35321 */
export const CGA_GENDER_OPTIONS = [
  { id: "male", label: "Male" },
  { id: "female", label: "Female" },
  { id: "other", label: "Other" },
] as const;

export const CGA_LIVING_SITUATION_OPTIONS = [
  { id: "alone", label: "Alone" },
  { id: "spouse", label: "Spouse" },
  { id: "adult-child", label: "Adult child" },
  { id: "hired-help", label: "Hired help" },
  { id: "care-home", label: "Care home" },
] as const;

export const CGA_LANGUAGE_OPTIONS = [
  { id: "english", label: "English" },
  { id: "gujarati", label: "Gujarati" },
  { id: "hindi", label: "Hindi" },
  { id: "marathi", label: "Marathi" },
  { id: "tamil", label: "Tamil" },
  { id: "telugu", label: "Telugu" },
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
    flag: "STOPP: Anticholinergic",
  },
];

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
    fields: [
      {
        id: "pmh",
        label: "Past medical history",
        kind: "textarea",
        placeholder: "Chronic conditions, surgeries, hospitalizations…",
      },
      {
        id: "allergies",
        label: "Allergies",
        kind: "text",
        placeholder: "e.g. Penicillin",
      },
      {
        id: "familyHistory",
        label: "Relevant family history",
        kind: "textarea",
      },
    ],
  },
  {
    id: "medications",
    number: 3,
    title: "Medications",
    callout: {
      tone: "warning",
      title: "STOPP/START Criteria",
      body: "Review for potentially inappropriate medications and omitted clinical indications in older patients.",
    },
    fields: [], // custom UI
  },
  {
    id: "physical",
    number: 4,
    title: "Physical Assessment",
    fields: [
      {
        id: "bp",
        label: "Blood pressure",
        kind: "text",
        placeholder: "e.g. 128/82",
      },
      {
        id: "hr",
        label: "Heart rate",
        kind: "text",
        placeholder: "e.g. 78 bpm",
      },
      {
        id: "weight",
        label: "Weight",
        kind: "text",
        placeholder: "kg",
      },
      {
        id: "examNotes",
        label: "Examination notes",
        kind: "textarea",
      },
    ],
  },
  {
    id: "mobility-falls",
    number: 5,
    title: "Mobility & Falls",
    shortTitle: "Mobility & Falls",
    fields: [
      {
        id: "falls6m",
        label: "Falls in last 6 months",
        kind: "radio",
        options: [
          { id: "none", label: "None" },
          { id: "one", label: "One" },
          { id: "twoPlus", label: "Two or more" },
        ],
      },
      {
        id: "aids",
        label: "Mobility aids",
        kind: "chips",
        multi: true,
        options: [
          { id: "none", label: "None" },
          { id: "cane", label: "Cane" },
          { id: "walker", label: "Walker" },
          { id: "wheelchair", label: "Wheelchair" },
        ],
      },
      {
        id: "gaitNotes",
        label: "Gait / balance notes",
        kind: "textarea",
      },
    ],
  },
  {
    id: "bone-health",
    number: 6,
    title: "Bone Health",
    fields: [
      {
        id: "fractureHistory",
        label: "Fracture history",
        kind: "textarea",
      },
      {
        id: "boneDensity",
        label: "Bone density / DEXA",
        kind: "text",
        placeholder: "Result or date if known",
      },
      {
        id: "calciumVitD",
        label: "Calcium / Vitamin D",
        kind: "chips",
        options: [
          { id: "adequate", label: "Adequate" },
          { id: "deficient", label: "Deficient" },
          { id: "unknown", label: "Unknown" },
        ],
      },
    ],
  },
  {
    id: "cognition",
    number: 7,
    title: "Cognition",
    fields: [
      {
        id: "moca",
        label: "MoCA / MMSE score",
        kind: "text",
        placeholder: "e.g. 26/30",
      },
      {
        id: "cognitiveConcerns",
        label: "Cognitive concerns",
        kind: "textarea",
      },
      {
        id: "orientation",
        label: "Orientation",
        kind: "chips",
        options: [
          { id: "oriented", label: "Oriented ×3" },
          { id: "partial", label: "Partially oriented" },
          { id: "disoriented", label: "Disoriented" },
        ],
      },
    ],
  },
  {
    id: "mood",
    number: 8,
    title: "Mood",
    fields: [
      {
        id: "gds",
        label: "GDS / PHQ screen",
        kind: "text",
        placeholder: "Score if completed",
      },
      {
        id: "moodNotes",
        label: "Mood / affect notes",
        kind: "textarea",
      },
      {
        id: "anxiety",
        label: "Anxiety symptoms",
        kind: "radio",
        options: [
          { id: "none", label: "None" },
          { id: "mild", label: "Mild" },
          { id: "moderate", label: "Moderate+" },
        ],
      },
    ],
  },
  {
    id: "delirium",
    number: 9,
    title: "Delirium",
    fields: [
      {
        id: "cam",
        label: "CAM / delirium screen",
        kind: "radio",
        options: [
          { id: "negative", label: "Negative" },
          { id: "positive", label: "Positive" },
          { id: "notDone", label: "Not done" },
        ],
      },
      {
        id: "deliriumNotes",
        label: "Notes",
        kind: "textarea",
      },
    ],
  },
  {
    id: "function",
    number: 10,
    title: "Function (ADL & iADL)",
    shortTitle: "Function (ADL & iADL)",
    fields: [
      {
        id: "adl",
        label: "ADL independence",
        kind: "chips",
        options: [
          { id: "independent", label: "Independent" },
          { id: "assist", label: "Needs assistance" },
          { id: "dependent", label: "Dependent" },
        ],
      },
      {
        id: "iadl",
        label: "IADL independence",
        kind: "chips",
        options: [
          { id: "independent", label: "Independent" },
          { id: "assist", label: "Needs assistance" },
          { id: "dependent", label: "Dependent" },
        ],
      },
      {
        id: "functionNotes",
        label: "Functional notes",
        kind: "textarea",
      },
    ],
  },
  {
    id: "social-home",
    number: 11,
    title: "Social & Home",
    fields: [
      {
        id: "livingSituation",
        label: "Living situation",
        kind: "text",
        placeholder: "Alone / with family / assisted living…",
      },
      {
        id: "caregiver",
        label: "Primary caregiver",
        kind: "text",
      },
      {
        id: "homeSafety",
        label: "Home safety concerns",
        kind: "textarea",
      },
    ],
  },
  {
    id: "continence",
    number: 12,
    title: "Continence",
    fields: [
      {
        id: "bladder",
        label: "Bladder",
        kind: "chips",
        options: [
          { id: "continent", label: "Continent" },
          { id: "urge", label: "Urge incontinence" },
          { id: "stress", label: "Stress" },
          { id: "other", label: "Other" },
        ],
      },
      {
        id: "bowel",
        label: "Bowel",
        kind: "chips",
        options: [
          { id: "continent", label: "Continent" },
          { id: "constipation", label: "Constipation" },
          { id: "incontinence", label: "Incontinence" },
        ],
      },
      {
        id: "continenceNotes",
        label: "Notes",
        kind: "textarea",
      },
    ],
  },
  {
    id: "nutrition",
    number: 13,
    title: "Nutrition",
    fields: [
      {
        id: "appetite",
        label: "Appetite",
        kind: "chips",
        options: [
          { id: "good", label: "Good" },
          { id: "reduced", label: "Reduced" },
          { id: "poor", label: "Poor" },
        ],
      },
      {
        id: "weightChange",
        label: "Recent weight change",
        kind: "text",
        placeholder: "e.g. −3 kg in 3 months",
      },
      {
        id: "nutritionNotes",
        label: "Nutrition notes",
        kind: "textarea",
      },
    ],
  },
  {
    id: "advance-care",
    number: 14,
    title: "Advance Care",
    fields: [
      {
        id: "acpDiscussed",
        label: "Advance care planning discussed",
        kind: "radio",
        options: [
          { id: "yes", label: "Yes" },
          { id: "no", label: "No" },
          { id: "deferred", label: "Deferred" },
        ],
      },
      {
        id: "proxy",
        label: "Healthcare proxy / surrogate",
        kind: "text",
      },
      {
        id: "acpNotes",
        label: "Preferences / notes",
        kind: "textarea",
      },
    ],
  },
  {
    id: "investigations",
    number: 15,
    title: "Investigations",
    fields: [
      {
        id: "labs",
        label: "Relevant labs",
        kind: "textarea",
        placeholder: "CBC, BMP, HbA1c, etc.",
      },
      {
        id: "imaging",
        label: "Imaging",
        kind: "textarea",
      },
      {
        id: "pending",
        label: "Pending investigations",
        kind: "textarea",
      },
    ],
  },
  {
    id: "frailty-flags",
    number: 16,
    title: "Frailty Flags",
    fields: [
      {
        id: "frailtyFlags",
        label: "Flags present",
        kind: "checkbox-list",
        options: [
          { id: "weightLoss", label: "Unintentional weight loss" },
          { id: "exhaustion", label: "Exhaustion" },
          { id: "weakness", label: "Weakness / low grip" },
          { id: "slowWalk", label: "Slow walking speed" },
          { id: "lowActivity", label: "Low physical activity" },
        ],
      },
      {
        id: "frailtyNotes",
        label: "Notes",
        kind: "textarea",
      },
    ],
  },
  {
    id: "problem-list",
    number: 17,
    title: "Problem List",
    fields: [
      {
        id: "problems",
        label: "Active problems (prioritized)",
        kind: "textarea",
        placeholder: "1. …\n2. …",
      },
    ],
  },
  {
    id: "care-plan",
    number: 18,
    title: "Care Plan",
    fields: [
      {
        id: "goals",
        label: "Goals of care",
        kind: "textarea",
      },
      {
        id: "interventions",
        label: "Planned interventions",
        kind: "textarea",
      },
      {
        id: "followUp",
        label: "Follow-up plan",
        kind: "text",
      },
    ],
  },
  {
    id: "capacity",
    number: 19,
    title: "Capacity",
    fields: [
      {
        id: "decisionCapacity",
        label: "Decision-making capacity",
        kind: "radio",
        options: [
          { id: "intact", label: "Intact" },
          { id: "impaired", label: "Impaired" },
          { id: "fluctuating", label: "Fluctuating" },
        ],
      },
      {
        id: "capacityNotes",
        label: "Assessment notes",
        kind: "textarea",
      },
    ],
  },
  {
    id: "sign-off",
    number: 20,
    title: "Sign-off",
    fields: [
      {
        id: "summary",
        label: "Clinician summary",
        kind: "textarea",
        placeholder: "Overall impression and next steps…",
      },
      {
        id: "attestation",
        label: "Attestation",
        kind: "checkbox-list",
        options: [
          {
            id: "reviewed",
            label: "I have reviewed all completed sections",
          },
          {
            id: "accurate",
            label: "Findings accurately reflect this encounter",
          },
        ],
      },
      {
        id: "signer",
        label: "Signing clinician",
        kind: "text",
        placeholder: "Dr. Mehta",
      },
    ],
  },
] as const;

export const CGA_SECTION_COUNT = CGA_SECTIONS.length;

export function getCgaSectionById(id: string): CgaSection | undefined {
  return CGA_SECTIONS.find((s) => s.id === id);
}

export function getCgaSectionIndex(id: string): number {
  return CGA_SECTIONS.findIndex((s) => s.id === id);
}
