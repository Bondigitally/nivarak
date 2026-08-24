/**
 * IAS-P v2.0 Calculator — Unit Tests
 *
 * Tests the pure scoring calculation function, risk bands, and red flag urgency.
 */
import { describe, it, expect } from 'vitest';
import {
  calculateIAS,
  calculateIASBand,
  evaluateRedFlagUrgency,
  IAS_DOMAINS,
  ALL_IAS_PARAMETERS,
} from '../../modules/scoring/ias-calculator.js';

// Helper: create parameters with all items set to the same value
function allParams(value: number): Record<string, number> {
  const params: Record<string, number> = {};
  for (const key of ALL_IAS_PARAMETERS) {
    params[key] = value;
  }
  return params;
}

// Helper: create params that give a specific raw score
function paramsForRawScore(target: number): Record<string, number> {
  const params: Record<string, number> = {};
  let remaining = target;
  for (const key of ALL_IAS_PARAMETERS) {
    if (remaining >= 2) {
      params[key] = 2;
      remaining -= 2;
    } else if (remaining >= 1) {
      params[key] = 1;
      remaining -= 1;
    } else {
      params[key] = 0;
    }
  }
  return params;
}

describe('IAS-P v2.0 Calculator', () => {
  describe('Domain Configuration', () => {
    it('has exactly 24 parameters across 8 domains', () => {
      expect(IAS_DOMAINS).toHaveLength(8);
      expect(ALL_IAS_PARAMETERS).toHaveLength(24);
    });

    it('each parameter appears exactly once', () => {
      const unique = new Set(ALL_IAS_PARAMETERS);
      expect(unique.size).toBe(24);
    });

    it('max possible raw score is 48 (24 items × 2)', () => {
      const result = calculateIAS(allParams(2));
      expect(result.rawScore).toBe(48);
      expect(result.maxScore).toBe(48);
    });
  });

  describe('Score Calculation — Edge Cases', () => {
    it('all items = 2 (fully independent) → rawScore=48, IAS=100%', () => {
      const result = calculateIAS(allParams(2));
      expect(result.rawScore).toBe(48);
      expect(result.iasPercentage).toBe(100);
      expect(result.riskBand).toBe('strong_independent');
      expect(result.recommendedPathway).toBe('home_care');
    });

    it('all items = 0 (fully dependent) → rawScore=0, IAS=0%', () => {
      const result = calculateIAS(allParams(0));
      expect(result.rawScore).toBe(0);
      expect(result.iasPercentage).toBe(0);
      expect(result.riskBand).toBe('high_dependence');
      expect(result.recommendedPathway).toBe('high_dependency');
    });

    it('all items = 1 (all need some support) → rawScore=24, IAS=50%', () => {
      const result = calculateIAS(allParams(1));
      expect(result.rawScore).toBe(24);
      expect(result.iasPercentage).toBe(50);
      expect(result.riskBand).toBe('limited_independence');
    });

    it('clamps values above 2 to 2', () => {
      const params = allParams(5); // all values set to 5 (out of range)
      const result = calculateIAS(params);
      expect(result.rawScore).toBe(48); // clamped to 2 each
    });

    it('clamps negative values to 0', () => {
      const params = allParams(-3);
      const result = calculateIAS(params);
      expect(result.rawScore).toBe(0);
    });

    it('handles missing parameters (undefined) as 0', () => {
      const result = calculateIAS({}); // no parameters at all
      expect(result.rawScore).toBe(0);
      expect(result.iasPercentage).toBe(0);
    });
  });

  describe('Domain Score Calculation', () => {
    it('calculates per-domain scores correctly', () => {
      // Set Section A (basic_self_care: 4 items) all to 2, rest to 0
      const params = allParams(0);
      params.bathing = 2;
      params.dressing = 2;
      params.toileting = 2;
      params.feeding = 2;

      const result = calculateIAS(params);
      expect(result.domainScores.basic_self_care.raw).toBe(8);
      expect(result.domainScores.basic_self_care.max).toBe(8);
      expect(result.domainScores.basic_self_care.percentage).toBe(100);
      expect(result.domainScores.mobility.raw).toBe(0);
      expect(result.domainScores.mobility.percentage).toBe(0);
    });

    it('returns all 8 domain scores', () => {
      const result = calculateIAS(allParams(1));
      const domainKeys = Object.keys(result.domainScores);
      expect(domainKeys).toHaveLength(8);
      expect(domainKeys).toContain('basic_self_care');
      expect(domainKeys).toContain('daily_life_function');
      expect(domainKeys).toContain('mobility');
      expect(domainKeys).toContain('thinking_decision');
      expect(domainKeys).toContain('health_management');
      expect(domainKeys).toContain('nutrition_continence');
      expect(domainKeys).toContain('social_function');
      expect(domainKeys).toContain('safety_support');
    });

    it('safety_support has only 1 item (emergency_help)', () => {
      const params = allParams(0);
      params.emergency_help = 2;
      const result = calculateIAS(params);
      expect(result.domainScores.safety_support.raw).toBe(2);
      expect(result.domainScores.safety_support.max).toBe(2);
      expect(result.domainScores.safety_support.percentage).toBe(100);
    });
  });

  describe('IAS Percentage Calculation — Formula Verification', () => {
    it('score 34 → IAS = 70.83% (from spec example)', () => {
      const params = paramsForRawScore(34);
      const result = calculateIAS(params);
      expect(result.rawScore).toBe(34);
      // 34/48*100 = 70.833...
      expect(result.iasPercentage).toBeCloseTo(70.83, 1);
    });

    it('score 41 → IAS = 85.42%', () => {
      const params = paramsForRawScore(41);
      const result = calculateIAS(params);
      expect(result.rawScore).toBe(41);
      expect(result.iasPercentage).toBeCloseTo(85.42, 1);
    });
  });

  describe('Risk Band Boundaries', () => {
    it('IAS >= 85 → strong_independent', () => {
      expect(calculateIASBand(85).riskBand).toBe('strong_independent');
      expect(calculateIASBand(100).riskBand).toBe('strong_independent');
      expect(calculateIASBand(92.5).riskBand).toBe('strong_independent');
    });

    it('IAS 70-84.99 → independent_vulnerable', () => {
      expect(calculateIASBand(70).riskBand).toBe('independent_vulnerable');
      expect(calculateIASBand(84.99).riskBand).toBe('independent_vulnerable');
      expect(calculateIASBand(77).riskBand).toBe('independent_vulnerable');
    });

    it('IAS 55-69.99 → supported_independence', () => {
      expect(calculateIASBand(55).riskBand).toBe('supported_independence');
      expect(calculateIASBand(69.99).riskBand).toBe('supported_independence');
      expect(calculateIASBand(62).riskBand).toBe('supported_independence');
    });

    it('IAS 40-54.99 → limited_independence', () => {
      expect(calculateIASBand(40).riskBand).toBe('limited_independence');
      expect(calculateIASBand(54.99).riskBand).toBe('limited_independence');
      expect(calculateIASBand(47).riskBand).toBe('limited_independence');
    });

    it('IAS < 40 → high_dependence', () => {
      expect(calculateIASBand(39.99).riskBand).toBe('high_dependence');
      expect(calculateIASBand(0).riskBand).toBe('high_dependence');
      expect(calculateIASBand(20).riskBand).toBe('high_dependence');
    });

    it('maps correct care pathways', () => {
      expect(calculateIASBand(90).recommendedPathway).toBe('home_care');
      expect(calculateIASBand(75).recommendedPathway).toBe('home_care');
      expect(calculateIASBand(60).recommendedPathway).toBe('hybrid');
      expect(calculateIASBand(45).recommendedPathway).toBe('clinic');
      expect(calculateIASBand(30).recommendedPathway).toBe('high_dependency');
    });
  });

  describe('Red Flag Urgency', () => {
    it('0 red flags → routine_monitoring', () => {
      expect(evaluateRedFlagUrgency(0)).toBe('routine_monitoring');
    });

    it('1 red flag → review_needed', () => {
      expect(evaluateRedFlagUrgency(1)).toBe('review_needed');
    });

    it('2 red flags → review_needed', () => {
      expect(evaluateRedFlagUrgency(2)).toBe('review_needed');
    });

    it('3 red flags → urgent_care_planning', () => {
      expect(evaluateRedFlagUrgency(3)).toBe('urgent_care_planning');
    });

    it('8 red flags (maximum) → urgent_care_planning', () => {
      expect(evaluateRedFlagUrgency(8)).toBe('urgent_care_planning');
    });
  });

  describe('Mixed Scores — Realistic Scenarios', () => {
    it('mostly independent elder with mild cognitive decline', () => {
      const params = allParams(2);
      // Cognitive decline
      params.remembering_routine = 1;
      params.understanding_instructions = 1;
      params.safe_decisions = 1;
      // One fall
      params.falls_6_months = 1;

      const result = calculateIAS(params);
      expect(result.rawScore).toBe(44); // 48 - 4 = 44
      expect(result.iasPercentage).toBeCloseTo(91.67, 1);
      expect(result.riskBand).toBe('strong_independent');
    });

    it('elder needing significant support across domains', () => {
      const params = allParams(1); // all need some support
      params.bathing = 0; // dependent on bathing
      params.dressing = 0; // dependent on dressing
      params.falls_6_months = 0; // 2+ falls
      params.safe_decisions = 0; // unsafe decisions

      const result = calculateIAS(params);
      expect(result.rawScore).toBe(20); // 24 - 4 = 20
      expect(result.iasPercentage).toBeCloseTo(41.67, 1);
      expect(result.riskBand).toBe('limited_independence');
    });
  });
});
