import {
  CGA_DEFAULT_MEDICATIONS,
  CGA_SECTIONS,
  type CgaField,
  type CgaMedicationRow,
  type CgaSection,
} from "./cga-sections-data";
import { getCurrentUserProfile } from "@/lib/auth/current-user-profile";

export type CgaSectionValues = Record<string, string | string[]>;

export type CgaDraftState = {
  patientId: string;
  activeSectionId: string;
  completedSectionIds: string[];
  valuesBySection: Record<string, CgaSectionValues>;
  medications: CgaMedicationRow[];
  updatedAt: number;
};

const DRAFT_KEY_PREFIX = "nivarak:cga-draft:";

export function createEmptyCgaDraft(patientId: string): CgaDraftState {
  const clinician = getCurrentUserProfile("doctor");

  return {
    patientId,
    activeSectionId: CGA_SECTIONS[0].id,
    completedSectionIds: [],
    valuesBySection: {
      "visit-details": {
        visitDate: "2023-10-24",
        visitTime: "09:30",
        visitNumber: "VIS-8472-A",
        assessingClinician: clinician.displayName,
        designation: clinician.designation ?? "Geriatrician",
        address: "42 Lotus Apartments, Navrangpura, Ahmedabad 380009",
        mobileNumbers: "+91 98234 56789",
        language: ["english", "gujarati"],
        familyContact: "Rahul Patil (+91 98765 43210)",
        relationship: "Son",
        livingSituation: "spouse",
        referralSource: "Self-referred",
        gpName: "Dr. Amit Desai",
      },
      medications: {
        adherence: "partial",
        administration: "self",
        storage: "dosette",
        supplements:
          "Calcium + Vit D (patient self-reports). OTC: occasional paracetamol.",
        reviewSummary:
          "Amitriptyline flagged under STOPP (anticholinergic). Consider deprescribing or safer alternative for neuropathy. Metformin and amlodipine continue. Review BP and renal function before adjusting diuretics).",
      },
      "medical-history": {
        allergies: "Penicillin",
      },
      "sign-off": {
        signer: "Dr. Mehta",
      },
    },
    medications: CGA_DEFAULT_MEDICATIONS.map((m) => ({ ...m })),
    updatedAt: Date.now(),
  };
}

export function loadCgaDraft(patientId: string): CgaDraftState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(DRAFT_KEY_PREFIX + patientId);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CgaDraftState;
    if (parsed.patientId !== patientId) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function saveCgaDraft(draft: CgaDraftState) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(
      DRAFT_KEY_PREFIX + draft.patientId,
      JSON.stringify({ ...draft, updatedAt: Date.now() }),
    );
  } catch {
    /* ignore quota */
  }
}

export function clearCgaDraft(patientId: string) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(DRAFT_KEY_PREFIX + patientId);
  } catch {
    /* ignore */
  }
}

export function getCgaProgressPct(completedCount: number) {
  return Math.round((completedCount / CGA_SECTIONS.length) * 100);
}

export function isCgaSectionComplete(
  sectionId: string,
  draft: CgaDraftState,
): boolean {
  return draft.completedSectionIds.includes(sectionId);
}

function isFilledValue(value: string | string[] | undefined): boolean {
  if (value == null) return false;
  if (Array.isArray(value)) return value.length > 0;
  return value.trim().length > 0;
}

const VISIT_DETAILS_REQUIRED_KEYS = [
  "visitDate",
  "visitTime",
  "gender",
  "address",
  "mobileNumbers",
  "language",
  "familyContact",
  "relationship",
  "livingSituation",
  "referralSource",
  "gpName",
] as const;

const MEDICATIONS_REQUIRED_KEYS = [
  "supplements",
  "adherence",
  "administration",
  "storage",
  "reviewSummary",
] as const;

function isGenericFieldFilled(
  field: CgaField,
  values: CgaSectionValues,
): boolean {
  return isFilledValue(values[field.id]);
}

/** True when every editable field in the active section has a value. */
export function isCgaSectionFormFilled(
  section: CgaSection,
  draft: CgaDraftState,
): boolean {
  const values = draft.valuesBySection[section.id] ?? {};

  if (section.id === "visit-details") {
    return VISIT_DETAILS_REQUIRED_KEYS.every((key) =>
      isFilledValue(values[key]),
    );
  }

  if (section.id === "medications") {
    if (
      !MEDICATIONS_REQUIRED_KEYS.every((key) => isFilledValue(values[key]))
    ) {
      return false;
    }
    // Every listed medication row must have core fields filled.
    return draft.medications.every(
      (row) =>
        row.drug.trim().length > 0 &&
        row.dose.trim().length > 0 &&
        row.frequency.trim().length > 0 &&
        row.indication.trim().length > 0,
    );
  }

  if (section.fields.length === 0) return true;
  return section.fields.every((field) => isGenericFieldFilled(field, values));
}
