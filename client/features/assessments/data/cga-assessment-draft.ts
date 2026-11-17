import {
  barthelItemFieldId,
  CGA_BARTHEL_ITEMS,
  CGA_COGNITION_LIMITS,
  CGA_DEFAULT_CARE_PLAN_ACTIONS,
  CGA_DEFAULT_CARE_PLAN_REFERRALS,
  CGA_DEFAULT_MEDICATIONS,
  CGA_DEFAULT_OTC,
  CGA_DEFAULT_PROBLEMS,
  CGA_GDS15_LIMITS,
  CGA_MUST_LIMITS,
  CGA_NOTTINGHAM_ITEMS,
  CGA_PHYSICAL_LIMITS,
  CGA_SYSTEMIC_EXAM_FIELDS,
  CGA_SECTIONS,
  ensureCarePlanActionRows,
  ensureCarePlanReferralRows,
  ensureProblemRows,
  hasCompletedCarePlanAction,
  hasCompletedProblem,
  isCarePlanActionRowValid,
  isCarePlanReferralRowValid,
  isProblemRowValid,
  nottinghamItemFieldId,
  type CgaCarePlanActionRow,
  type CgaCarePlanReferralRow,
  type CgaField,
  type CgaMedicationRow,
  type CgaOtcRow,
  type CgaProblemRow,
  type CgaSection,
} from "./cga-sections-data";
import {
  CGA_DEFAULT_ACTIVE_DIAGNOSES,
  CGA_DEFAULT_HOSPITALISATIONS,
  CGA_DEFAULT_PAST_SURGERIES,
  isActiveDiagnosisRowValid,
  isHospitalisationRowValid,
  isPastSurgeryRowValid,
  normalizeActiveDiagnosisRow,
  normalizeHospitalisationRow,
  normalizePastSurgeryRow,
  type CgaActiveDiagnosisRow,
  type CgaHospitalisationRow,
  type CgaPastSurgeryRow,
} from "./cga-medical-history-data";
import {
  CGA_DEFAULT_IMAGING,
  CGA_DEFAULT_LABS,
  CGA_DEFAULT_PENDING,
  ensureRecentResultRows,
  findLabCatalogItem,
  hasCompletedRecentResult,
  isLabRowValid,
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
  activeDiagnoses: CgaActiveDiagnosisRow[];
  pastSurgeries: CgaPastSurgeryRow[];
  hospitalisations: CgaHospitalisationRow[];
  problems: CgaProblemRow[];
  carePlanActions: CgaCarePlanActionRow[];
  carePlanReferrals: CgaCarePlanReferralRow[];
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
        familyContactName: "Rahul Patil",
        familyContactPhone: "+91 98765 43210",
        relationship: "Son",
        livingSituation: "spouse",
        referralSource: "Self-referred",
        gpName: "Dr. Amit Desai",
      },
      medications: {
        adherence: "occasional",
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
        designation: clinician.designation ?? "Geriatrician",
      },
    },
    medications: CGA_DEFAULT_MEDICATIONS.map((m) => ({ ...m })),
    otcMedications: CGA_DEFAULT_OTC.map((m) => ({ ...m })),
    activeDiagnoses: CGA_DEFAULT_ACTIVE_DIAGNOSES.map((row) => ({ ...row })),
    pastSurgeries: CGA_DEFAULT_PAST_SURGERIES.map((row) => ({ ...row })),
    hospitalisations: CGA_DEFAULT_HOSPITALISATIONS.map((row) => ({ ...row })),
    problems: CGA_DEFAULT_PROBLEMS.map((p) => ({ ...p })),
    carePlanActions: CGA_DEFAULT_CARE_PLAN_ACTIONS.map((row) => ({ ...row })),
    carePlanReferrals: CGA_DEFAULT_CARE_PLAN_REFERRALS.map((row) => ({
      ...row,
    })),
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
  const seeded = ensureProblemRows([]);
  return ensureProblemRows(
    lines.map((problem, index) => ({
      ...(seeded[index] ?? seeded[0]!),
      id: seeded[index]?.id ?? `prob-legacy-${index + 1}`,
      problem,
      notes: "",
      priority: "" as const,
    })),
  );
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
      action: "",
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

function splitLegacyFamilyContact(raw: string): {
  name: string;
  phone: string;
} {
  const trimmed = raw.trim();
  if (!trimmed) return { name: "", phone: "" };

  const parenMatch = trimmed.match(/^(.+?)\s*\(([^)]+)\)\s*$/);
  if (parenMatch) {
    return { name: parenMatch[1].trim(), phone: parenMatch[2].trim() };
  }

  return { name: trimmed, phone: "" };
}

function pastSurgeriesFromLegacyPmh(raw: string): CgaPastSurgeryRow[] {
  const trimmed = raw.trim();
  if (!trimmed) return CGA_DEFAULT_PAST_SURGERIES.map((row) => ({ ...row }));
  return [
    {
      id: "surg-legacy-1",
      surgeryDate: "",
      surgeryType: trimmed,
    },
  ];
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

  let activeDiagnoses = draft.activeDiagnoses;
  if (!Array.isArray(activeDiagnoses) || activeDiagnoses.length === 0) {
    activeDiagnoses = CGA_DEFAULT_ACTIVE_DIAGNOSES.map((row) => ({ ...row }));
  } else {
    activeDiagnoses = activeDiagnoses.map((row) =>
      normalizeActiveDiagnosisRow(row),
    );
  }

  let pastSurgeries = draft.pastSurgeries;
  if (!Array.isArray(pastSurgeries) || pastSurgeries.length === 0) {
    const legacy = draft.valuesBySection?.["medical-history"]?.pmh;
    if (typeof legacy === "string" && legacy.trim().length > 0) {
      pastSurgeries = pastSurgeriesFromLegacyPmh(legacy);
    } else {
      pastSurgeries = CGA_DEFAULT_PAST_SURGERIES.map((row) => ({ ...row }));
    }
  } else {
    pastSurgeries = pastSurgeries.map((row) => normalizePastSurgeryRow(row));
  }

  let hospitalisations = draft.hospitalisations;
  if (!Array.isArray(hospitalisations) || hospitalisations.length === 0) {
    hospitalisations = CGA_DEFAULT_HOSPITALISATIONS.map((row) => ({ ...row }));
  } else {
    hospitalisations = hospitalisations.map((row) =>
      normalizeHospitalisationRow(row),
    );
  }

  const medicalHistorySection = draft.valuesBySection?.["medical-history"];
  if (medicalHistorySection && "pmh" in medicalHistorySection) {
    const { pmh: _removed, ...rest } = medicalHistorySection;
    draft.valuesBySection = {
      ...draft.valuesBySection,
      "medical-history": rest,
    };
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
  problems = ensureProblemRows(problems);

  let carePlanActions = draft.carePlanActions;
  if (!Array.isArray(carePlanActions) || carePlanActions.length === 0) {
    carePlanActions = CGA_DEFAULT_CARE_PLAN_ACTIONS.map((row) => ({ ...row }));
  }
  carePlanActions = ensureCarePlanActionRows(carePlanActions);

  let carePlanReferrals = draft.carePlanReferrals;
  if (!Array.isArray(carePlanReferrals) || carePlanReferrals.length === 0) {
    carePlanReferrals = CGA_DEFAULT_CARE_PLAN_REFERRALS.map((row) => ({
      ...row,
    }));
  }
  carePlanReferrals = ensureCarePlanReferralRows(carePlanReferrals);

  let labs = draft.labs;
  if (!Array.isArray(labs) || labs.length === 0) {
    const legacy = draft.valuesBySection?.investigations?.labs;
    if (typeof legacy === "string" && legacy.trim().length > 0) {
      labs = labsFromLegacyText(legacy);
    } else {
      labs = CGA_DEFAULT_LABS.map((row) => ({ ...row }));
    }
  }
  labs = ensureRecentResultRows(labs);

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
  if (medicationsSection) {
    const adherenceMap: Record<string, string> = {
      full: "good",
      partial: "occasional",
      poor: "frequent",
    };
    const administrationMap: Record<string, string> = {
      caregiver: "carer",
      professional: "carer",
    };
    const rawAdherence =
      typeof medicationsSection.adherence === "string"
        ? medicationsSection.adherence
        : "";
    const rawAdministration =
      typeof medicationsSection.administration === "string"
        ? medicationsSection.administration
        : "";
    const { supplements: _removed, ...rest } = medicationsSection;
    draft.valuesBySection = {
      ...draft.valuesBySection,
      medications: {
        ...rest,
        adherence: adherenceMap[rawAdherence] ?? rawAdherence,
        administration:
          administrationMap[rawAdministration] ?? rawAdministration,
      },
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

  const visitDetails = draft.valuesBySection?.["visit-details"];
  if (visitDetails && "familyContact" in visitDetails) {
    const legacy =
      typeof visitDetails.familyContact === "string"
        ? visitDetails.familyContact
        : "";
    const { familyContact: _removed, ...rest } = visitDetails;
    let familyContactName =
      typeof rest.familyContactName === "string" ? rest.familyContactName : "";
    let familyContactPhone =
      typeof rest.familyContactPhone === "string"
        ? rest.familyContactPhone
        : "";

    if (legacy.trim()) {
      const split = splitLegacyFamilyContact(legacy);
      if (!familyContactName.trim()) familyContactName = split.name;
      if (!familyContactPhone.trim()) familyContactPhone = split.phone;
    }

    draft.valuesBySection = {
      ...draft.valuesBySection,
      "visit-details": {
        ...rest,
        familyContactName,
        familyContactPhone,
      },
    };
  }

  return {
    ...draft,
    otcMedications,
    activeDiagnoses,
    pastSurgeries,
    hospitalisations,
    problems,
    carePlanActions,
    carePlanReferrals,
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
  "familyContactName",
  "familyContactPhone",
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
  "spo2",
  "temp",
  "weight",
  "heightCm",
  "posturalBp",
  "nutritionalAppearance",
] as const;

function isOtherSelected(value: string | string[] | undefined): boolean {
  if (Array.isArray(value)) return value.includes("other");
  return value === "other";
}

function isGenericFieldFilled(
  field: CgaField,
  values: CgaSectionValues,
): boolean {
  if (!isFilledValue(values[field.id])) return false;
  if (
    (field.kind === "select" ||
      field.kind === "radio" ||
      field.kind === "chips" ||
      field.kind === "checkbox-list") &&
    field.options.some((opt) => opt.id === "other") &&
    isOtherSelected(values[field.id])
  ) {
    return isFilledValue(values[`${field.id}Other`]);
  }
  return true;
}

/** True when every editable field in the active section has a value. */
export function isCgaSectionFormFilled(
  section: CgaSection,
  draft: CgaDraftState,
): boolean {
  const values = draft.valuesBySection[section.id] ?? {};

  if (section.id === "visit-details") {
    if (
      !VISIT_DETAILS_REQUIRED_KEYS.every((key) => isFilledValue(values[key]))
    ) {
      return false;
    }
    if (values.gender === "other" && !isFilledValue(values.genderOther)) {
      return false;
    }
    return true;
  }

  if (section.id === "medications") {
    if (
      !MEDICATIONS_REQUIRED_KEYS.every((key) => isFilledValue(values[key]))
    ) {
      return false;
    }
    if (
      values.stoppedMeds === "true" &&
      !isFilledValue(values.stoppedMedsNotes)
    ) {
      return false;
    }
    if (values.storage === "other" && !isFilledValue(values.storageOther)) {
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
    const spo2 = Number(values.spo2);
    const temp = Number(values.temp);
    const weight = Number(values.weight);
    const heightCm = Number(values.heightCm);

    const vitalsValid =
      Number.isFinite(systolic) &&
      systolic >= CGA_PHYSICAL_LIMITS.bpSystolic.min &&
      systolic <= CGA_PHYSICAL_LIMITS.bpSystolic.max &&
      Number.isFinite(diastolic) &&
      diastolic >= CGA_PHYSICAL_LIMITS.bpDiastolic.min &&
      diastolic <= CGA_PHYSICAL_LIMITS.bpDiastolic.max &&
      Number.isFinite(hr) &&
      hr >= CGA_PHYSICAL_LIMITS.hr.min &&
      hr <= CGA_PHYSICAL_LIMITS.hr.max &&
      Number.isFinite(spo2) &&
      spo2 >= CGA_PHYSICAL_LIMITS.spo2.min &&
      spo2 <= CGA_PHYSICAL_LIMITS.spo2.max &&
      Number.isFinite(temp) &&
      temp >= CGA_PHYSICAL_LIMITS.temp.min &&
      temp <= CGA_PHYSICAL_LIMITS.temp.max &&
      Number.isFinite(weight) &&
      weight >= CGA_PHYSICAL_LIMITS.weightKg.min &&
      weight <= CGA_PHYSICAL_LIMITS.weightKg.max &&
      Number.isFinite(heightCm) &&
      heightCm >= CGA_PHYSICAL_LIMITS.heightCm.min &&
      heightCm <= CGA_PHYSICAL_LIMITS.heightCm.max;

    if (!vitalsValid) return false;

    return CGA_SYSTEMIC_EXAM_FIELDS.every((field) => {
      if (!isFilledValue(values[field.id])) return false;
      if (
        field.options.some((opt) => opt.id === "other") &&
        isOtherSelected(values[field.id])
      ) {
        return isFilledValue(values[`${field.id}Other`]);
      }
      return true;
    });
  }

  if (section.id === "medical-history") {
    const dxRows = draft.activeDiagnoses ?? [];
    if (dxRows.length === 0 || !dxRows.every(isActiveDiagnosisRowValid)) {
      return false;
    }
    const surgeryRows = draft.pastSurgeries ?? [];
    if (
      surgeryRows.length === 0 ||
      !surgeryRows.every(isPastSurgeryRowValid)
    ) {
      return false;
    }
    const hospitalRows = draft.hospitalisations ?? [];
    if (
      hospitalRows.length === 0 ||
      !hospitalRows.every(isHospitalisationRowValid)
    ) {
      return false;
    }
    return isFilledValue(values.allergies);
  }

  if (section.id === "cognition") {
    if (!isFilledValue(values.cognitionLastUpdated)) return false;

    function scoreInRange(
      raw: string | string[] | undefined,
      limits: { min: number; max: number },
    ) {
      const n = Number(raw);
      return Number.isFinite(n) && n >= limits.min && n <= limits.max;
    }

    const gpcogComplete =
      isFilledValue(values.gpcogScore) &&
      isFilledValue(values.gpcogInterpretation) &&
      scoreInRange(values.gpcogScore, CGA_COGNITION_LIMITS.gpcog);
    const mocaRaw =
      typeof values.moca === "string" && values.moca.includes("/")
        ? values.moca.split("/")[0]?.trim()
        : values.moca;
    const mocaComplete =
      isFilledValue(mocaRaw) &&
      isFilledValue(values.mocaInterpretation) &&
      scoreInRange(mocaRaw, CGA_COGNITION_LIMITS.moca);
    const amtsComplete =
      isFilledValue(values.amtsScore) &&
      isFilledValue(values.amtsInterpretation) &&
      scoreInRange(values.amtsScore, CGA_COGNITION_LIMITS.amts);

    if (!(gpcogComplete || mocaComplete || amtsComplete)) return false;

    return (
      isFilledValue(values.alertnessAttention) &&
      isFilledValue(values.cognitionOrientation) &&
      isFilledValue(values.memoryImpression) &&
      isFilledValue(values.languageCommunication) &&
      isFilledValue(values.informantReport) &&
      isFilledValue(values.deliriumRisk) &&
      isFilledValue(values.cognitiveObservations)
    );
  }

  if (section.id === "problem-list") {
    const rows = ensureProblemRows(draft.problems ?? []);
    return hasCompletedProblem(rows) && rows.every(isProblemRowValid);
  }

  if (section.id === "investigations") {
    const labRows = ensureRecentResultRows(draft.labs ?? []);
    if (!hasCompletedRecentResult(labRows) || !labRows.every(isLabRowValid)) {
      return false;
    }
    return isFilledValue(values.testsRequestedToday);
  }

  if (section.id === "sign-off") {
    return (
      isFilledValue(values.signer) &&
      isFilledValue(values.designation) &&
      isFilledValue(values.signOffDate) &&
      isFilledValue(values.timeCompleted) &&
      isFilledValue(values.visitDurationMins) &&
      isFilledValue(values.informedFindings) &&
      isFilledValue(values.summaryImpression)
    );
  }

  if (section.id === "mobility-falls") {
    if (
      !isFilledValue(values.falls12m) ||
      !isFilledValue(values.fallsConsequences) ||
      !isFilledValue(values.fearOfFalling)
    ) {
      return false;
    }
    if (values.falls12m === "one" || values.falls12m === "twoPlus") {
      if (
        !isFilledValue(values.fallsCircumstances) ||
        !isFilledValue(values.lastFall) ||
        !isFilledValue(values.medicalAttentionSought)
      ) {
        return false;
      }
    }

    if (values.mobilityVisitParams !== "true") return false;

    return (
      isFilledValue(values.walkingAids) &&
      isFilledValue(values.outdoorMobility) &&
      isFilledValue(values.tugTime) &&
      isFilledValue(values.tugInterpretation) &&
      isFilledValue(values.turnSteps) &&
      isFilledValue(values.turnInterpretation) &&
      isFilledValue(values.gaitSpeedTime) &&
      isFilledValue(values.gaitSpeedInterpretation) &&
      isFilledValue(values.chairStand) &&
      isFilledValue(values.gaitPattern) &&
      isFilledValue(values.balanceImpression) &&
      isFilledValue(values.mobilityObservations) &&
      isFilledValue(values.environmentalHazards) &&
      isFilledValue(values.environmentalObservations)
    );
  }

  if (section.id === "bone-health") {
    if (
      !isFilledValue(values.fragilityFractureHistory) ||
      !isFilledValue(values.osteoporosisDiagnosis) ||
      !isFilledValue(values.boneTreatment) ||
      !isFilledValue(values.boneHealthPlan)
    ) {
      return false;
    }
    const fragility = Array.isArray(values.fragilityFractureHistory)
      ? values.fragilityFractureHistory
      : [];
    if (fragility.includes("other") && !isFilledValue(values.fragilityFractureOther)) {
      return false;
    }
    const treatment = Array.isArray(values.boneTreatment)
      ? values.boneTreatment
      : [];
    if (treatment.includes("other") && !isFilledValue(values.boneTreatmentOther)) {
      return false;
    }
    return true;
  }

  if (section.id === "mood") {
    const gdsScore = Number(values.gds15Score);
    const gdsComplete =
      isFilledValue(values.gds15Score) &&
      isFilledValue(values.gds15Interpretation) &&
      Number.isFinite(gdsScore) &&
      gdsScore >= CGA_GDS15_LIMITS.min &&
      gdsScore <= CGA_GDS15_LIMITS.max;
    const phqComplete = isFilledValue(values.phq2Screen);
    if (!(gdsComplete || phqComplete)) return false;

    return (
      isFilledValue(values.affect) &&
      isFilledValue(values.psychomotor) &&
      isFilledValue(values.sleep) &&
      isFilledValue(values.suicidalIdeation) &&
      isFilledValue(values.anxiety) &&
      isFilledValue(values.lonelinessIsolation) &&
      isFilledValue(values.psychologicalPlan)
    );
  }

  if (section.id === "delirium") {
    return (
      isFilledValue(values.at4Alertness) &&
      isFilledValue(values.at4Amt4) &&
      isFilledValue(values.at4Attention) &&
      isFilledValue(values.at4AcuteChange) &&
      isFilledValue(values.camAcuteFluctuating) &&
      isFilledValue(values.camInattention) &&
      isFilledValue(values.camDisorganisedThinking) &&
      isFilledValue(values.camAlteredConsciousness) &&
      isFilledValue(values.deliriumPlan)
    );
  }

  if (section.id === "function") {
    const barthelFilled = CGA_BARTHEL_ITEMS.every((item) =>
      isFilledValue(values[barthelItemFieldId(item.id)]),
    );
    const nottinghamFilled = CGA_NOTTINGHAM_ITEMS.every((item) =>
      isFilledValue(values[nottinghamItemFieldId(item.id)]),
    );
    return (
      barthelFilled &&
      nottinghamFilled &&
      isFilledValue(values.functionalTrajectory)
    );
  }

  if (section.id === "social-home") {
    return (
      isFilledValue(values.primaryCarer) &&
      isFilledValue(values.carerStrain) &&
      isFilledValue(values.socialEngagement) &&
      isFilledValue(values.communityParticipation) &&
      isFilledValue(values.drivingTransport) &&
      isFilledValue(values.financialSituation) &&
      isFilledValue(values.propertyType) &&
      isFilledValue(values.homeStairs) &&
      isFilledValue(values.bathroomSafety) &&
      isFilledValue(values.homeSafetyDevices) &&
      isFilledValue(values.socialEnvironmentalPlan)
    );
  }

  if (section.id === "continence") {
    return (
      isFilledValue(values.urinaryType) &&
      isFilledValue(values.urinaryOnset) &&
      isFilledValue(values.urinarySeverity) &&
      isFilledValue(values.nocturia) &&
      isFilledValue(values.urgencyToToilet) &&
      isFilledValue(values.urinaryExam) &&
      isFilledValue(values.urineDipstick) &&
      isFilledValue(values.msuSent) &&
      isFilledValue(values.incontinencePlan)
    );
  }

  if (section.id === "nutrition") {
    const mustScore = Number(values.mustScore);
    const weightToday = Number(values.weightTodayKg);
    const weightPrior = Number(values.weightThreeMonthsKg);
    if (
      !isFilledValue(values.mustScore) ||
      !isFilledValue(values.mustInterpretation) ||
      !Number.isFinite(mustScore) ||
      mustScore < CGA_MUST_LIMITS.min ||
      mustScore > CGA_MUST_LIMITS.max ||
      !isFilledValue(values.weightTodayKg) ||
      !isFilledValue(values.weightThreeMonthsKg) ||
      !Number.isFinite(weightToday) ||
      weightToday < CGA_PHYSICAL_LIMITS.weightKg.min ||
      weightToday > CGA_PHYSICAL_LIMITS.weightKg.max ||
      !Number.isFinite(weightPrior) ||
      weightPrior < CGA_PHYSICAL_LIMITS.weightKg.min ||
      weightPrior > CGA_PHYSICAL_LIMITS.weightKg.max
    ) {
      return false;
    }

    return (
      isFilledValue(values.appetite) &&
      isFilledValue(values.swallowing) &&
      isFilledValue(values.oralHealthEating) &&
      isFilledValue(values.tasteChanges) &&
      isFilledValue(values.hydration) &&
      isFilledValue(values.alcoholIntake) &&
      isFilledValue(values.dietaryPlan)
    );
  }

  if (section.id === "advance-care") {
    return (
      isFilledValue(values.prognosisAwareness) &&
      isFilledValue(values.acpDiscussed) &&
      isFilledValue(values.preferredPlaceOfCare) &&
      isFilledValue(values.cprDecision) &&
      isFilledValue(values.palliativeNeeds) &&
      isFilledValue(values.carerWishesAwareness) &&
      isFilledValue(values.eolAcpNotes)
    );
  }

  if (section.id === "care-plan") {
    const actions = ensureCarePlanActionRows(draft.carePlanActions ?? []);
    const referrals = ensureCarePlanReferralRows(
      draft.carePlanReferrals ?? [],
    );
    if (
      !isFilledValue(values.patientGoal1) ||
      !isFilledValue(values.patientGoal2) ||
      !isFilledValue(values.familyCarerPriorities) ||
      !isFilledValue(values.escalationGpContact) ||
      !isFilledValue(values.escalationEmergency) ||
      !isFilledValue(values.nextScheduledReview) ||
      !isFilledValue(values.reviewType) ||
      !isFilledValue(values.otherReviewArrangements)
    ) {
      return false;
    }
    if (!actions.every((row) => isCarePlanActionRowValid(row))) return false;
    if (!referrals.every((row) => isCarePlanReferralRowValid(row))) {
      return false;
    }
    return hasCompletedCarePlanAction(actions);
  }

  if (section.id === "capacity") {
    if (
      !isFilledValue(values.capacityToday) ||
      !isFilledValue(values.formalCapacityAssessment) ||
      !isFilledValue(values.lastingPowerOfAttorney) ||
      !isFilledValue(values.decisionMaker) ||
      !isFilledValue(values.mentalCapacityNotes)
    ) {
      return false;
    }
    if (
      (values.decisionMaker === "family-member" ||
        values.decisionMaker === "legal-guardian") &&
      !isFilledValue(values.namedDecisionMaker)
    ) {
      return false;
    }
    return true;
  }

  if (section.id === "frailty-flags") {
    return isFilledValue(values.frailtyFlags);
  }

  if (section.fields.length === 0) return true;
  return section.fields.every((field) => isGenericFieldFilled(field, values));
}
