/**
 * CGA Investigations — structured lab / imaging / pending tracking.
 * Units may be suggested for known tests; reference ranges are never invented.
 */

export type CgaInvestigationStatus =
  | "ordered"
  | "completed"
  | "reviewed";

export type CgaPendingStatus =
  | "ordered"
  | "awaiting"
  | "completed"
  | "cancelled";

export type CgaLabResultType = "numeric" | "qualitative" | "text";

export type CgaLabCatalogItem = {
  id: string;
  name: string;
  /** Suggested unit only — never invent reference ranges. */
  unit?: string;
  resultType: CgaLabResultType;
};

export type CgaLabRow = {
  id: string;
  testName: string;
  result: string;
  unit: string;
  referenceRange: string;
  testDate: string;
  status: CgaInvestigationStatus;
  resultType: CgaLabResultType;
  /** 15.1 Action / flag */
  action: string;
};

/** Fixed 15.1 Recent results available checklist. */
export const CGA_RECENT_RESULT_TESTS = [
  { id: "ue", label: "Urea & electrolytes" },
  { id: "creatinine-egfr", label: "Serum creatinine / eGFR" },
  { id: "glucose-hba1c", label: "Glucose / HbA1c" },
  { id: "fbc", label: "Full blood count (FBC)" },
  { id: "haemoglobin", label: "Haemoglobin" },
  { id: "lft", label: "Liver function tests" },
  { id: "calcium-phosphate", label: "Calcium / phosphate" },
  { id: "tsh", label: "Thyroid function (TSH)" },
  { id: "vitd", label: "Vitamin D (25-OH)" },
  { id: "b12-folate", label: "Vitamin B12 / folate" },
  { id: "lipid", label: "Lipid profile" },
  { id: "crp", label: "C-reactive protein (CRP)" },
  { id: "psa", label: "PSA (if appropriate)" },
  { id: "ecg", label: "ECG" },
  { id: "cxr", label: "Chest X-ray" },
  { id: "urine-msu", label: "Urinalysis / MSU" },
  { id: "dxa", label: "Bone density (DXA)" },
  { id: "other", label: "Other" },
] as const;

export type CgaImagingModality =
  | "xray"
  | "ct"
  | "mri"
  | "ultrasound"
  | "other";

export type CgaImagingRow = {
  id: string;
  modality: CgaImagingModality | "";
  bodyRegion: string;
  examDate: string;
  findings: string;
  reportName: string;
  status: CgaInvestigationStatus;
};

export type CgaPendingCategory = "lab" | "imaging" | "other";

export type CgaPendingRow = {
  id: string;
  name: string;
  category: CgaPendingCategory | "";
  orderedDate: string;
  expectedDate: string;
  status: CgaPendingStatus;
};

export const CGA_LAB_CATALOG: readonly CgaLabCatalogItem[] = [
  { id: "cbc", name: "CBC", resultType: "text" },
  { id: "hemoglobin", name: "Hemoglobin", unit: "g/dL", resultType: "numeric" },
  { id: "wbc", name: "WBC", unit: "×10⁹/L", resultType: "numeric" },
  { id: "platelet", name: "Platelet count", unit: "×10⁹/L", resultType: "numeric" },
  { id: "hba1c", name: "HbA1c", unit: "%", resultType: "numeric" },
  { id: "glucose", name: "Fasting glucose", unit: "mg/dL", resultType: "numeric" },
  { id: "lipid", name: "Lipid profile", resultType: "text" },
  { id: "tsh", name: "TSH", unit: "mIU/L", resultType: "numeric" },
  { id: "b12", name: "Vitamin B12", unit: "pg/mL", resultType: "numeric" },
  { id: "vitd", name: "Vitamin D (25-OH)", unit: "ng/mL", resultType: "numeric" },
  { id: "creatinine", name: "Creatinine", unit: "mg/dL", resultType: "numeric" },
  { id: "egfr", name: "eGFR", unit: "mL/min/1.73m²", resultType: "numeric" },
  { id: "sodium", name: "Sodium", unit: "mmol/L", resultType: "numeric" },
  { id: "potassium", name: "Potassium", unit: "mmol/L", resultType: "numeric" },
  { id: "crp", name: "CRP", unit: "mg/L", resultType: "numeric" },
  { id: "ua", name: "Urinalysis", resultType: "text" },
  {
    id: "covid",
    name: "COVID-19 PCR",
    resultType: "qualitative",
  },
  {
    id: "urine-culture",
    name: "Urine culture",
    resultType: "qualitative",
  },
] as const;

export const CGA_INVESTIGATION_STATUS_OPTIONS = [
  { id: "ordered", label: "Ordered" },
  { id: "completed", label: "Completed" },
  { id: "reviewed", label: "Reviewed" },
] as const;

export const CGA_PENDING_STATUS_OPTIONS = [
  { id: "ordered", label: "Ordered" },
  { id: "awaiting", label: "Awaiting Results" },
  { id: "completed", label: "Completed" },
  { id: "cancelled", label: "Cancelled" },
] as const;

export const CGA_IMAGING_MODALITY_OPTIONS = [
  { id: "xray", label: "X-ray" },
  { id: "ct", label: "CT" },
  { id: "mri", label: "MRI" },
  { id: "ultrasound", label: "Ultrasound" },
  { id: "other", label: "Other" },
] as const;

export const CGA_PENDING_CATEGORY_OPTIONS = [
  { id: "lab", label: "Lab" },
  { id: "imaging", label: "Imaging" },
  { id: "other", label: "Other" },
] as const;

export const CGA_QUALITATIVE_RESULT_OPTIONS = [
  { id: "positive", label: "Positive" },
  { id: "negative", label: "Negative" },
  { id: "indeterminate", label: "Indeterminate" },
] as const;

export function emptyRecentResultRow(
  test: (typeof CGA_RECENT_RESULT_TESTS)[number],
): CgaLabRow {
  return {
    id: test.id,
    testName: test.label,
    result: "",
    unit: "",
    referenceRange: "",
    testDate: "",
    status: "ordered",
    resultType: "text",
    action: "",
  };
}

/** Ensure draft labs match the fixed 15.1 test list, preserving entered values. */
export function ensureRecentResultRows(labs: CgaLabRow[]): CgaLabRow[] {
  return CGA_RECENT_RESULT_TESTS.map((test) => {
    const existing =
      labs.find((row) => row.id === test.id) ??
      labs.find(
        (row) => row.testName.trim().toLowerCase() === test.label.toLowerCase(),
      );
    if (!existing) return emptyRecentResultRow(test);
    return {
      ...emptyRecentResultRow(test),
      result: existing.result ?? "",
      unit: existing.unit ?? "",
      referenceRange: existing.referenceRange ?? "",
      testDate: existing.testDate ?? "",
      status: existing.status || "ordered",
      resultType: existing.resultType || "text",
      action: existing.action ?? "",
    };
  });
}

export const CGA_DEFAULT_LABS: CgaLabRow[] = ensureRecentResultRows([]);

export const CGA_DEFAULT_IMAGING: CgaImagingRow[] = [
  {
    id: "img-1",
    modality: "xray",
    bodyRegion: "Chest",
    examDate: "2023-09-15",
    findings: "No acute cardiopulmonary process.",
    reportName: "",
    status: "reviewed",
  },
];

export const CGA_DEFAULT_PENDING: CgaPendingRow[] = [
  {
    id: "pend-1",
    name: "DEXA bone density",
    category: "imaging",
    orderedDate: "2023-10-18",
    expectedDate: "2023-11-01",
    status: "awaiting",
  },
];

export function emptyLabRow(): CgaLabRow {
  return {
    id: `lab-${Date.now()}`,
    testName: "",
    result: "",
    unit: "",
    referenceRange: "",
    testDate: "",
    status: "ordered",
    resultType: "text",
    action: "",
  };
}

export function emptyImagingRow(): CgaImagingRow {
  return {
    id: `img-${Date.now()}`,
    modality: "",
    bodyRegion: "",
    examDate: "",
    findings: "",
    reportName: "",
    status: "ordered",
  };
}

export function emptyPendingRow(): CgaPendingRow {
  return {
    id: `pend-${Date.now()}`,
    name: "",
    category: "",
    orderedDate: "",
    expectedDate: "",
    status: "ordered",
  };
}

export function findLabCatalogItem(
  testName: string,
): CgaLabCatalogItem | undefined {
  const needle = testName.trim().toLowerCase();
  if (!needle) return undefined;
  return CGA_LAB_CATALOG.find((item) => item.name.toLowerCase() === needle);
}

export function isRecentResultRowEmpty(row: CgaLabRow): boolean {
  return (
    !row.result.trim() && !row.testDate.trim() && !(row.action ?? "").trim()
  );
}

export function isLabRowValid(row: CgaLabRow): boolean {
  if (isRecentResultRowEmpty(row)) return true;
  return (
    row.testName.trim().length > 0 &&
    row.result.trim().length > 0 &&
    row.testDate.trim().length > 0 &&
    (row.action ?? "").trim().length > 0
  );
}

export function hasCompletedRecentResult(rows: CgaLabRow[]): boolean {
  return rows.some((row) => !isRecentResultRowEmpty(row) && isLabRowValid(row));
}

export function isImagingRowValid(row: CgaImagingRow): boolean {
  if (!row.modality || !row.bodyRegion.trim() || !row.examDate.trim() || !row.status) {
    return false;
  }
  if (row.status === "ordered") return true;
  return row.findings.trim().length > 0;
}

export function isPendingRowValid(row: CgaPendingRow): boolean {
  return (
    row.name.trim().length > 0 &&
    Boolean(row.category) &&
    row.orderedDate.trim().length > 0 &&
    Boolean(row.status)
  );
}
