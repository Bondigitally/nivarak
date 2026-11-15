import { describe, expect, it } from 'vitest';
import {
  formatPatientMrn,
  PATIENT_MRN_DIGITS,
  PATIENT_MRN_MAX,
} from '../../modules/patients/patient-mrn.js';

describe('formatPatientMrn', () => {
  it('pads to 7 digits for ≥1M capacity display codes', () => {
    expect(PATIENT_MRN_DIGITS).toBe(7);
    expect(PATIENT_MRN_MAX).toBe(9_999_999);
    expect(formatPatientMrn(1)).toBe('NVK-0000001');
    expect(formatPatientMrn(3382)).toBe('NVK-0003382');
    expect(formatPatientMrn(1_000_000)).toBe('NVK-1000000');
    expect(formatPatientMrn(PATIENT_MRN_MAX)).toBe('NVK-9999999');
  });

  it('rejects exhausted or invalid sequence values', () => {
    expect(() => formatPatientMrn(0)).toThrow(/Invalid/);
    expect(() => formatPatientMrn(1.5)).toThrow(/Invalid/);
    expect(() => formatPatientMrn(PATIENT_MRN_MAX + 1)).toThrow(/exhausted/);
  });
});
