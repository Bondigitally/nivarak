import { queryClient } from '../../db/connection.js';
import { BusinessRuleError } from '../../shared/errors.js';

/** Prefix for display / speakable patient codes. Internal id remains UUID. */
export const PATIENT_MRN_PREFIX = 'NVK';

/**
 * Digit width for auto-allocated MRNs.
 * 7 digits → 9,999,999 codes (≥ 1M requirement with headroom).
 */
export const PATIENT_MRN_DIGITS = 7;

export const PATIENT_MRN_MAX = 10 ** PATIENT_MRN_DIGITS - 1;

/** `NVK-0000001` … `NVK-9999999` */
export function formatPatientMrn(sequenceValue: number): string {
  if (!Number.isInteger(sequenceValue) || sequenceValue < 1) {
    throw new BusinessRuleError('Invalid patient MRN sequence value');
  }
  if (sequenceValue > PATIENT_MRN_MAX) {
    throw new BusinessRuleError('Patient MRN space exhausted');
  }
  return `${PATIENT_MRN_PREFIX}-${String(sequenceValue).padStart(PATIENT_MRN_DIGITS, '0')}`;
}

/**
 * Allocate the next patient MRN via Postgres sequence (safe under concurrency).
 * Requires migration `0003_patient_mrn_sequence`.
 */
export async function allocatePatientMrn(): Promise<string> {
  const rows = await queryClient<{ n: string | number | bigint }[]>`
    SELECT nextval('patient_mrn_seq') AS n
  `;
  const raw = rows[0]?.n;
  const n = typeof raw === 'bigint' ? Number(raw) : Number(raw);
  if (!Number.isFinite(n)) {
    throw new BusinessRuleError('Failed to allocate patient MRN');
  }
  return formatPatientMrn(n);
}
