import {
  CGA_COGNITION_LIMITS,
  CGA_DEFAULT_MEDICATIONS,
  CGA_DEFAULT_OTC,
  CGA_DEFAULT_PROBLEMS,
  CGA_PHYSICAL_LIMITS,
  CGA_SECTIONS,
  type CgaField,
  type CgaMedicationRow,
  type CgaOtcRow,
  type CgaProblemRow,
  type CgaSection,
} from "./cga-sections-data";
import {
  CGA_DEFAULT_IMAGING,
  CGA_DEFAULT_LABS,
  CGA_DEFAULT_PENDING,
  findLabCatalogItem,
  isImagingRowValid,
  isLabRowValid,
  isPendingRowValid,
  type CgaImagingRow,
  type CgaLabRow,
  type CgaPendingRow,
} from "./cga-investigations-data";
import { getCurrentUserProfile } from "@/lib/auth/current-user-profile";

export type CgaSectionValues = Record<string, string | string[]>;

export type CgaDraftState = {
  patientId: string;
  activeSectionId: string;
  completedSectionIds: string[];
  valuesBySection: Record<string, CgaSectionValues>;
  medications: CgaMedicationRow[];
  otcMedications: CgaOtcRow[];
  problems: CgaProblemRow[];
  labs: CgaLabRow[];
  imaging: CgaImagingRow[];
  pendingInvestigations: CgaPendingRow[];
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
        reviewSummary:
          "Amitriptyline flagged under STOP (anticholinergic). Consider deprescribing or safer alternative for neuropathy. Metformin and amlodipine continue. Review BP and renal function before adjusting diuretics).",
      },
      "medical-history": {
        allergies: "Penicillin",
      },
      "sign-off": {
        signer: clinician.displayName,
      },
    },
    medications: CGA_DEFAULT_MEDICATIONS.map((m) => ({ ...m })),
    otcMedications: CGA_DEFAULT_OTC.map((m) => ({ ...m })),
    problems: CGA_DEFAULT_PROBLEMS.map((p) => ({ ...p })),
    labs: CGA_DEFAULT_LABS.map((row) => ({ ...row })),
    imaging: CGA_DEFAULT_IMAGING.map((row) => ({ ...row })),
    pendingInvestigations: CGA_DEFAULT_PENDING.map((row) => ({ ...row })),
    updatedAt: Date.now(),
  };
}

function problemsFromLegacyText(raw: string): CgaProblemRow[] {
  const lines = raw
    .split(/\n+/)
    .map((line) => line.replace(/^\s*\d+[.)]\s*/, "").trim())
    .filter(Boolean);
  if (lines.length === 0) return CGA_DEFAULT_PROBLEMS.map((p) => ({ ...p }));
  return lines.map((problem, index) => ({
    id: `prob-legacy-${index + 1}`,
    problem,
    notes: "",
  }));
}

function labsFromLegacyText(raw: string): CgaLabRow[] {
  const lines = raw
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean);
  if (lines.length === 0) return CGA_DEFAULT_LABS.map((row) => ({ ...row }));
  return lines.map((line, index) => {
    const catalog = findLabCatalogItem(line);
    return {
      id: `lab-legacy-${index + 1}`,
      testName: catalog?.name ?? line,
      result: "",
      unit: catalog?.unit ?? "",
      referenceRange: "",
      testDate: "",
      status: "ordered" as const,
      resultType: catalog?.resultType ?? "text",
    };
  });
}

function imagingFromLegacyText(raw: string): CgaImagingRow[] {
  const lines = raw
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean);
  if (lines.length === 0) return CGA_DEFAULT_IMAGING.map((row) => ({ ...row }));
  return lines.map((line, index) => ({
    id: `img-legacy-${index + 1}`,
    modality: "" as const,
    bodyRegion: "",
    examDate: "",
    findings: line,
    reportName: "",
    status: "ordered" as const,
  }));
}

function pendingFromLegacyText(raw: string): CgaPendingRow[] {
  const lines = raw
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean);
  if (lines.length === 0) return CGA_DEFAULT_PENDING.map((row) => ({ ...row }));
  return lines.map((line, index) => ({
    id: `pend-legacy-${index + 1}`,
    name: line,
    category: "" as const,
    orderedDate: "",
    expectedDate: "",
    status: "ordered" as const,
  }));
}

function normalizeCgaDraft(draft: CgaDraftState): CgaDraftState {
  let otcMedications = draft.otcMedications;
  if (!Array.isArray(otcMedications) || otcMedications.length === 0) {
    const legacy = draft.valuesBySection?.medications?.supplements;
    if (typeof legacy === "string" && legacy.trim().length > 0) {
      otcMedications = [
        {
          id: "otc-legacy",
          drug: legacy.trim(),
          dose: "",
          frequency: "",
          notes: "",
        },
      ];
    } else {
      otcMedications = CGA_DEFAULT_OTC.map((m) => ({ ...m }));
    }
  }

  let problems = draft.problems;
  if (!Array.isArray(problems) || problems.length === 0) {
    const legacy = draft.valuesBySection?.["problem-list"]?.problems;
    if (typeof legacy === "string" && legacy.trim().length > 0) {
      problems = problemsFromLegacyText(legacy);
    } else {
      problems = CGA_DEFAULT_PROBLEMS.map((p) => ({ ...p }));
    }
  }

  let labs = draft.labs;
  if (!Array.isArray(labs) || labs.length === 0) {
    const legacy = draft.valuesBySection?.investigations?.labs;
    if (typeof legacy === "string" && legacy.trim().length > 0) {
      labs = labsFromLegacyText(legacy);
    } else {
      labs = CGA_DEFAULT_LABS.map((row) => ({ ...row }));
    }
  }

  let imaging = draft.imaging;
  if (!Array.isArray(imaging) || imaging.length === 0) {
    const legacy = draft.valuesBySection?.investigations?.imaging;
    if (typeof legacy === "string" && legacy.trim().length > 0) {
      imaging = imagingFromLegacyText(legacy);
    } else {
      imaging = CGA_DEFAULT_IMAGING.map((row) => ({ ...row }));
    }
  }

  let pendingInvestigations = draft.pendingInvestigations;
  if (
    !Array.isArray(pendingInvestigations) ||
    pendingInvestigations.length === 0
  ) {
    const legacy = draft.valuesBySection?.investigations?.pending;
    if (typeof legacy === "string" && legacy.trim().length > 0) {
      pendingInvestigations = pendingFromLegacyText(legacy);
    } else {
      pendingInvestigations = CGA_DEFAULT_PENDING.map((row) => ({ ...row }));
    }
  }

  const medicationsSection = draft.valuesBySection?.medications;
  if (medicationsSection && "supplements" in medicationsSection) {
    const { supplements: _removed, ...rest } = medicationsSection;
    draft.valuesBySection = {
      ...draft.valuesBySection,
      medications: rest,
    };
  }

  const problemSection = draft.valuesBySection?.["problem-list"];
  if (problemSection && "problems" in problemSection) {
    const { problems: _removed, ...rest } = problemSection;
    draft.valuesBySection = {
      ...draft.valuesBySection,
      "problem-list": rest,
    };
  }

  const investigationsSection = draft.valuesBySection?.investigations;
  if (investigationsSection) {
    const {
      labs: _labs,
      imaging: _imaging,
      pending: _pending,
      ...rest
    } = investigationsSection;
    draft.valuesBySection = {
      ...draft.valuesBySection,
      investigations: rest,
    };
  }

  return {
    ...draft,
    otcMedications,
    problems,
    labs,
    imaging,
    pendingInvestigations,
  };
}

export function loadCgaDraft(patientId: string): CgaDraftState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(DRAFT_KEY_PREFIX + patientId);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CgaDraftState;
    if (parsed.patientId !== patientId) return null;
    return normalizeCgaDraft(parsed);
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
  "adherence",
  "administration",
  "storage",
  "reviewSummary",
] as const;

const PHYSICAL_REQUIRED_KEYS = [
  "bpSystolic",
  "bpDiastolic",
  "hr",
  "weight",
  "weightUnit",
  "examNotes",
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
    const rxRowsValid = draft.medications.every(
      (row) =>
        row.drug.trim().length > 0 &&
        row.dose.trim().length > 0 &&
        row.frequency.trim().length > 0 &&
        row.indication.trim().length > 0,
    );
    if (!rxRowsValid) return false;

    const otcRows = draft.otcMedications ?? [];
    if (otcRows.length === 0) return false;
    return otcRows.every(
      (row) =>
        row.drug.trim().length > 0 &&
        row.dose.trim().length > 0 &&
        row.frequency.trim().length > 0 &&
        row.notes.trim().length > 0,
    );
  }

  if (section.id === "physical") {
    if (!PHYSICAL_REQUIRED_KEYS.every((key) => isFilledValue(values[key]))) {
      return false;
    }
    const systolic = Number(values.bpSystolic);
    const diastolic = Number(values.bpDiastolic);
    const hr = Number(values.hr);
    const weight = Number(values.weight);
    const unit = values.weightUnit === "lbs" ? "lbs" : "kg";
    const weightLimit =
      unit === "lbs"
        ? CGA_PHYSICAL_LIMITS.weightLbs
        : CGA_PHYSICAL_LIMITS.weightKg;

    return (
      Number.isFinite(systolic) &&
      systolic >= CGA_PHYSICAL_LIMITS.bpSystolic.min &&
      systolic <= CGA_PHYSICAL_LIMITS.bpSystolic.max &&
      Number.isFinite(diastolic) &&
      diastolic >= CGA_PHYSICAL_LIMITS.bpDiastolic.min &&
      diastolic <= CGA_PHYSICAL_LIMITS.bpDiastolic.max &&
      Number.isFinite(hr) &&
      hr >= CGA_PHYSICAL_LIMITS.hr.min &&
      hr <= CGA_PHYSICAL_LIMITS.hr.max &&
      Number.isFinite(weight) &&
      weight >= weightLimit.min &&
      weight <= weightLimit.max
    );
  }

  if (section.id === "cognition") {
    if (
      !isFilledValue(values.moca) ||
      !isFilledValue(values.mmse) ||
      !isFilledValue(values.cognitiveConcerns) ||
      !isFilledValue(values.orientation)
    ) {
      return false;
    }
    const moca = Number(values.moca);
    const mmse = Number(values.mmse);
    return (
      Number.isFinite(moca) &&
      moca >= CGA_COGNITION_LIMITS.moca.min &&
      moca <= CGA_COGNITION_LIMITS.moca.max &&
      Number.isFinite(mmse) &&
      mmse >= CGA_COGNITION_LIMITS.mmse.min &&
      mmse <= CGA_COGNITION_LIMITS.mmse.max
    );
  }

  if (section.id === "problem-list") {
    const rows = draft.problems ?? [];
    if (rows.length === 0) return false;
    return rows.every((row) => row.problem.trim().length > 0);
  }

  if (section.id === "investigations") {
    const labRows = draft.labs ?? [];
    const imagingRows = draft.imaging ?? [];
    const pendingRows = draft.pendingInvestigations ?? [];
    if (
      labRows.length === 0 ||
      imagingRows.length === 0 ||
      pendingRows.length === 0
    ) {
      return false;
    }
    return (
      labRows.every(isLabRowValid) &&
      imagingRows.every(isImagingRowValid) &&
      pendingRows.every(isPendingRowValid)
    );
  }

  if (section.id === "sign-off") {
    const attestation = Array.isArray(values.attestation)
      ? values.attestation
      : [];
    return (
      isFilledValue(values.summary) &&
      isFilledValue(values.signer) &&
      attestation.includes("reviewed") &&
      attestation.includes("accurate")
    );
  }

  if (section.fields.length === 0) return true;
  return section.fields.every((field) => isGenericFieldFilled(field, values));
}
