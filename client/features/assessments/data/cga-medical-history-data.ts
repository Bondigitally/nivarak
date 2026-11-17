/** CGA Medical History — §2.1–§2.5 (diagnoses, PMH, family, hospitalisation, allergies). */

import { parseDate } from "@internationalized/date";

export type CgaHospitalisationRow = {
  id: string;
  /** Admission date (YYYY-MM-DD). */
  admissionDate: string;
  /** ICD catalog id or `other`. */
  icdCode: string;
  /** Free text when {@link icdCode} is `other`. */
  diagnosisOther: string;
  hospital: string;
  durationDays: string;
  outcome: string;
};

export type CgaPastSurgeryRow = {
  id: string;
  /** Surgery date (YYYY-MM-DD). */
  surgeryDate: string;
  surgeryType: string;
};

export type CgaActiveDiagnosisRow = {
  id: string;
  /** ICD catalog id or `other`. */
  icdCode: string;
  /** Free text when {@link icdCode} is `other`. */
  diagnosisOther: string;
  /** Duration / onset range start (YYYY-MM-DD). */
  onsetDate: string;
  /** Duration / onset range end (YYYY-MM-DD). */
  endDate: string;
  speciality: string;
  treatingSpecialistHospital: string;
};

export const CGA_ICD_OTHER_VALUE = "other" as const;

export const CGA_ICD_DIAGNOSIS_OPTIONS = [
  {
    value: "E11.9",
    label: "E11.9 - Type 2 diabetes mellitus without complications",
  },
  {
    value: "I10",
    label: "I10 - Essential (primary) hypertension",
  },
  {
    value: "I50.9",
    label: "I50.9 - Heart failure, unspecified",
  },
  {
    value: "F03.90",
    label: "F03.90 - Dementia without behavioral disturbance",
  },
  {
    value: "M81.0",
    label: "M81.0 - Age-related osteoporosis",
  },
  {
    value: CGA_ICD_OTHER_VALUE,
    label: "Other",
  },
] as const;

export const CGA_TREATING_SPECIALITY_OPTIONS = [
  { value: "geriatrics", label: "Geriatrics" },
  { value: "cardiology", label: "Cardiology" },
  { value: "neurology", label: "Neurology" },
  { value: "nephrology", label: "Nephrology" },
  { value: "pulmonology", label: "Pulmonology" },
  { value: "orthopedics", label: "Orthopedics" },
  { value: "oncology", label: "Oncology" },
  { value: "general-medicine", label: "General medicine" },
] as const;

const DDMMYYYY_PATTERN = /^\d{8}$/;
const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

function isValidIsoDateString(value: string): boolean {
  const trimmed = value.trim();
  if (!ISO_DATE_PATTERN.test(trimmed)) return false;
  try {
    parseDate(trimmed);
    return true;
  } catch {
    return false;
  }
}

function ddmmyyyyToIso(ddmmyyyy: string): string {
  const trimmed = ddmmyyyy.trim();
  if (!DDMMYYYY_PATTERN.test(trimmed)) return "";
  const day = trimmed.slice(0, 2);
  const month = trimmed.slice(2, 4);
  const year = trimmed.slice(4, 8);
  const iso = `${year}-${month}-${day}`;
  return isValidIsoDateString(iso) ? iso : "";
}

type LegacyActiveDiagnosisRow = Partial<CgaActiveDiagnosisRow> & {
  durationOnset?: string;
};

/** Coerce stored / legacy draft rows into the current shape. */
export function normalizeActiveDiagnosisRow(
  row: LegacyActiveDiagnosisRow,
): CgaActiveDiagnosisRow {
  let onsetDate =
    typeof row.onsetDate === "string" ? row.onsetDate.trim() : "";
  let endDate = typeof row.endDate === "string" ? row.endDate.trim() : "";

  if (
    (!isValidIsoDateString(onsetDate) || !isValidIsoDateString(endDate)) &&
    typeof row.durationOnset === "string"
  ) {
    const migrated = ddmmyyyyToIso(row.durationOnset);
    if (migrated) {
      if (!isValidIsoDateString(onsetDate)) onsetDate = migrated;
      if (!isValidIsoDateString(endDate)) endDate = migrated;
    }
  }

  return {
    id: typeof row.id === "string" ? row.id : `dx-${Date.now()}`,
    icdCode: typeof row.icdCode === "string" ? row.icdCode : "",
    diagnosisOther:
      typeof row.diagnosisOther === "string" ? row.diagnosisOther : "",
    onsetDate,
    endDate,
    speciality: typeof row.speciality === "string" ? row.speciality : "",
    treatingSpecialistHospital:
      typeof row.treatingSpecialistHospital === "string"
        ? row.treatingSpecialistHospital
        : "",
  };
}

export function emptyActiveDiagnosisRow(): CgaActiveDiagnosisRow {
  return {
    id: `dx-${Date.now()}`,
    icdCode: "",
    diagnosisOther: "",
    onsetDate: "",
    endDate: "",
    speciality: "",
    treatingSpecialistHospital: "",
  };
}

export function getActiveDiagnosisLabel(row: CgaActiveDiagnosisRow): string {
  if (row.icdCode === CGA_ICD_OTHER_VALUE) {
    return row.diagnosisOther.trim();
  }
  const match = CGA_ICD_DIAGNOSIS_OPTIONS.find(
    (opt) => opt.value === row.icdCode,
  );
  return match?.label ?? row.icdCode.trim();
}

export function normalizePastSurgeryRow(
  row: Partial<CgaPastSurgeryRow>,
): CgaPastSurgeryRow {
  return {
    id: typeof row.id === "string" ? row.id : `surg-${Date.now()}`,
    surgeryDate:
      typeof row.surgeryDate === "string" ? row.surgeryDate.trim() : "",
    surgeryType:
      typeof row.surgeryType === "string" ? row.surgeryType.trim() : "",
  };
}

export function emptyPastSurgeryRow(): CgaPastSurgeryRow {
  return {
    id: `surg-${Date.now()}`,
    surgeryDate: "",
    surgeryType: "",
  };
}

export function isPastSurgeryRowValid(row: CgaPastSurgeryRow): boolean {
  return (
    isValidIsoDateString(row.surgeryDate) && row.surgeryType.trim().length > 0
  );
}

export function normalizeHospitalisationRow(
  row: Partial<CgaHospitalisationRow>,
): CgaHospitalisationRow {
  return {
    id: typeof row.id === "string" ? row.id : `hosp-${Date.now()}`,
    admissionDate:
      typeof row.admissionDate === "string" ? row.admissionDate.trim() : "",
    icdCode: typeof row.icdCode === "string" ? row.icdCode : "",
    diagnosisOther:
      typeof row.diagnosisOther === "string" ? row.diagnosisOther : "",
    hospital: typeof row.hospital === "string" ? row.hospital.trim() : "",
    durationDays:
      typeof row.durationDays === "string" ? row.durationDays.trim() : "",
    outcome: typeof row.outcome === "string" ? row.outcome.trim() : "",
  };
}

export function emptyHospitalisationRow(): CgaHospitalisationRow {
  return {
    id: `hosp-${Date.now()}`,
    admissionDate: "",
    icdCode: "",
    diagnosisOther: "",
    hospital: "",
    durationDays: "",
    outcome: "",
  };
}

export function isHospitalisationRowValid(row: CgaHospitalisationRow): boolean {
  const hasDiagnosis =
    row.icdCode === CGA_ICD_OTHER_VALUE
      ? row.diagnosisOther.trim().length > 0
      : row.icdCode.trim().length > 0;
  return (
    isValidIsoDateString(row.admissionDate) &&
    hasDiagnosis &&
    row.hospital.trim().length > 0 &&
    row.durationDays.trim().length > 0
  );
}

export const CGA_DEFAULT_HOSPITALISATIONS: CgaHospitalisationRow[] = [
  {
    id: "hosp-1",
    admissionDate: "2024-02-12",
    icdCode: "I50.9",
    diagnosisOther: "",
    hospital: "Sterling Heart Institute",
    durationDays: "5",
    outcome: "Stabilised on diuretics",
  },
  {
    id: "hosp-2",
    admissionDate: "2023-08-03",
    icdCode: CGA_ICD_OTHER_VALUE,
    diagnosisOther: "Cellulitis left leg",
    hospital: "City General Hospital",
    durationDays: "3",
    outcome: "IV antibiotics; discharged home",
  },
];

export const CGA_DEFAULT_PAST_SURGERIES: CgaPastSurgeryRow[] = [
  {
    id: "surg-1",
    surgeryDate: "2019-03-10",
    surgeryType: "Total knee replacement (right)",
  },
  {
    id: "surg-2",
    surgeryDate: "2016-11-05",
    surgeryType: "Cholecystectomy",
  },
];

export function isActiveDiagnosisRowValid(row: CgaActiveDiagnosisRow): boolean {
  const hasDiagnosis =
    row.icdCode === CGA_ICD_OTHER_VALUE
      ? row.diagnosisOther.trim().length > 0
      : row.icdCode.trim().length > 0;
  const onset = row.onsetDate.trim();
  const end = row.endDate.trim();
  const hasValidRange =
    isValidIsoDateString(onset) &&
    isValidIsoDateString(end) &&
    onset <= end;
  return (
    hasDiagnosis &&
    hasValidRange &&
    row.speciality.trim().length > 0 &&
    row.treatingSpecialistHospital.trim().length > 0
  );
}

export const CGA_DEFAULT_ACTIVE_DIAGNOSES: CgaActiveDiagnosisRow[] = [
  {
    id: "dx-1",
    icdCode: "I10",
    diagnosisOther: "",
    onsetDate: "2018-01-15",
    endDate: "2024-06-01",
    speciality: "cardiology",
    treatingSpecialistHospital: "Dr. Amit Shah / Sterling Heart Institute",
  },
  {
    id: "dx-2",
    icdCode: "E11.9",
    diagnosisOther: "",
    onsetDate: "2015-06-22",
    endDate: "2024-06-01",
    speciality: "general-medicine",
    treatingSpecialistHospital: "City Diabetes Centre",
  },
];