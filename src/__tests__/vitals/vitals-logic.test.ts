/**
 * Vitals Business Logic — Unit Tests
 *
 * Tests physiological bounds validation and threshold checking.
 * These test the pure logic functions extracted from the vitals module.
 */
import { describe, it, expect } from 'vitest';

// ─── Physiological Bounds (replicated from vitals module for testing) ───
const PHYSIOLOGICAL_BOUNDS: Record<string, { min: number; max: number; unit: string }> = {
  bp_systolic:    { min: 50, max: 300, unit: 'mmHg' },
  bp_diastolic:   { min: 20, max: 200, unit: 'mmHg' },
  heart_rate:     { min: 20, max: 250, unit: 'bpm' },
  spo2:           { min: 50, max: 100, unit: '%' },
  temperature:    { min: 30, max: 45, unit: '°C' },
  respiratory_rate: { min: 5, max: 60, unit: '/min' },
  weight:         { min: 10, max: 300, unit: 'kg' },
  blood_glucose:  { min: 20, max: 600, unit: 'mg/dL' },
};

function validatePhysiologicalBounds(parameterType: string, value: number): { valid: boolean; message?: string } {
  const bounds = PHYSIOLOGICAL_BOUNDS[parameterType];
  if (!bounds) return { valid: true }; // Unknown type — no bounds to check
  if (value < bounds.min || value > bounds.max) {
    return {
      valid: false,
      message: `${parameterType} value ${value} is outside physiological range (${bounds.min}–${bounds.max} ${bounds.unit})`,
    };
  }
  return { valid: true };
}

// ─── Threshold Evaluation ───
function evaluateThreshold(
  value: number,
  condition: string,
  threshold: number
): boolean {
  switch (condition) {
    case 'gt': return value > threshold;
    case 'gte': return value >= threshold;
    case 'lt': return value < threshold;
    case 'lte': return value <= threshold;
    default: return false;
  }
}

describe('Vitals — Physiological Bounds Validation', () => {
  it('bp_systolic in range (50-300) → valid', () => {
    expect(validatePhysiologicalBounds('bp_systolic', 120).valid).toBe(true);
    expect(validatePhysiologicalBounds('bp_systolic', 50).valid).toBe(true);
    expect(validatePhysiologicalBounds('bp_systolic', 300).valid).toBe(true);
  });

  it('bp_systolic out of range → invalid', () => {
    expect(validatePhysiologicalBounds('bp_systolic', 49).valid).toBe(false);
    expect(validatePhysiologicalBounds('bp_systolic', 301).valid).toBe(false);
  });

  it('spo2 at boundary (50, 100) → valid', () => {
    expect(validatePhysiologicalBounds('spo2', 50).valid).toBe(true);
    expect(validatePhysiologicalBounds('spo2', 100).valid).toBe(true);
  });

  it('spo2 out of range → invalid', () => {
    expect(validatePhysiologicalBounds('spo2', 49).valid).toBe(false);
    expect(validatePhysiologicalBounds('spo2', 101).valid).toBe(false);
  });

  it('temperature boundaries (30-45°C)', () => {
    expect(validatePhysiologicalBounds('temperature', 30).valid).toBe(true);
    expect(validatePhysiologicalBounds('temperature', 45).valid).toBe(true);
    expect(validatePhysiologicalBounds('temperature', 29.9).valid).toBe(false);
    expect(validatePhysiologicalBounds('temperature', 45.1).valid).toBe(false);
  });

  it('blood_glucose boundaries (20-600)', () => {
    expect(validatePhysiologicalBounds('blood_glucose', 20).valid).toBe(true);
    expect(validatePhysiologicalBounds('blood_glucose', 600).valid).toBe(true);
    expect(validatePhysiologicalBounds('blood_glucose', 19).valid).toBe(false);
  });

  it('heart_rate boundaries (20-250)', () => {
    expect(validatePhysiologicalBounds('heart_rate', 72).valid).toBe(true);
    expect(validatePhysiologicalBounds('heart_rate', 19).valid).toBe(false);
    expect(validatePhysiologicalBounds('heart_rate', 251).valid).toBe(false);
  });

  it('weight boundaries (10-300 kg)', () => {
    expect(validatePhysiologicalBounds('weight', 65).valid).toBe(true);
    expect(validatePhysiologicalBounds('weight', 9).valid).toBe(false);
  });

  it('unknown parameter type → always valid (no bounds)', () => {
    expect(validatePhysiologicalBounds('custom_param', 99999).valid).toBe(true);
    expect(validatePhysiologicalBounds('unknown_type', -100).valid).toBe(true);
  });

  it('returns descriptive error message on invalid', () => {
    const result = validatePhysiologicalBounds('bp_systolic', 301);
    expect(result.valid).toBe(false);
    expect(result.message).toContain('bp_systolic');
    expect(result.message).toContain('301');
    expect(result.message).toContain('50');
    expect(result.message).toContain('300');
  });
});

describe('Vitals — Threshold Evaluation', () => {
  it('gt: value > threshold → true', () => {
    expect(evaluateThreshold(141, 'gt', 140)).toBe(true);
  });

  it('gt: value = threshold → false', () => {
    expect(evaluateThreshold(140, 'gt', 140)).toBe(false);
  });

  it('gt: value < threshold → false', () => {
    expect(evaluateThreshold(139, 'gt', 140)).toBe(false);
  });

  it('gte: value >= threshold → true', () => {
    expect(evaluateThreshold(140, 'gte', 140)).toBe(true);
    expect(evaluateThreshold(141, 'gte', 140)).toBe(true);
  });

  it('gte: value < threshold → false', () => {
    expect(evaluateThreshold(139, 'gte', 140)).toBe(false);
  });

  it('lt: value < threshold → true', () => {
    expect(evaluateThreshold(89, 'lt', 90)).toBe(true);
  });

  it('lt: value = threshold → false', () => {
    expect(evaluateThreshold(90, 'lt', 90)).toBe(false);
  });

  it('lte: value <= threshold → true', () => {
    expect(evaluateThreshold(90, 'lte', 90)).toBe(true);
    expect(evaluateThreshold(89, 'lte', 90)).toBe(true);
  });

  it('unknown condition → false', () => {
    expect(evaluateThreshold(100, 'eq', 100)).toBe(false);
  });
});
