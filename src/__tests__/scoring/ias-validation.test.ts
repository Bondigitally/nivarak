/**
 * IAS-P v2.0 Validation Schema — Unit Tests
 *
 * Tests Zod validation for the IAS-P v2.0 submission and dry-run schemas.
 */
import { describe, it, expect } from 'vitest';
import { submitIASSchema, dryRunSchema } from '../../modules/scoring/scoring.module.js';

// Helper: valid full submission payload
function validSubmission() {
  return {
    proxyRelationship: 'son' as const,
    proxyProximity: 'same_city' as const,
    visitFrequency: 'weekly' as const,
    parentAge: 72,
    livingSituation: 'with_spouse' as const,
    parameters: {
      bathing: 2, dressing: 2, toileting: 2, feeding: 2,
      phone_communication: 1, daily_home_tasks: 1, simple_purchases: 1, organizing_essentials: 1,
      moving_inside_house: 2, getting_up: 2, walking_outside: 1, falls_6_months: 2,
      remembering_routine: 1, understanding_instructions: 2, safe_decisions: 1,
      taking_medicines: 1, understanding_health: 2, following_appointments: 1,
      eating_drinking: 2, weight_appetite: 2, bladder_bowel: 2,
      communicating_needs: 2, social_contact: 2,
      emergency_help: 1,
    },
    redFlags: ['social_isolation'] as const,
  };
}

describe('IAS-P v2.0 Submission Schema', () => {
  it('accepts a valid complete submission', () => {
    const result = submitIASSchema.safeParse(validSubmission());
    expect(result.success).toBe(true);
  });

  it('accepts submission with no red flags', () => {
    const data = validSubmission();
    data.redFlags = [];
    const result = submitIASSchema.safeParse(data);
    expect(result.success).toBe(true);
  });

  it('accepts all valid proxy relationships', () => {
    for (const rel of ['son', 'daughter', 'spouse', 'sibling', 'other_family']) {
      const data = { ...validSubmission(), proxyRelationship: rel };
      const result = submitIASSchema.safeParse(data);
      expect(result.success).toBe(true);
    }
  });

  it('accepts all valid living situations', () => {
    for (const sit of ['alone', 'with_spouse', 'with_family', 'with_caregiver', 'other']) {
      const data = { ...validSubmission(), livingSituation: sit };
      const result = submitIASSchema.safeParse(data);
      expect(result.success).toBe(true);
    }
  });

  it('accepts optional livingSituationOther when livingSituation is other', () => {
    const data = { ...validSubmission(), livingSituation: 'other' as const, livingSituationOther: 'Assisted living facility' };
    const result = submitIASSchema.safeParse(data);
    expect(result.success).toBe(true);
  });

  it('rejects invalid proxy relationship', () => {
    const data = { ...validSubmission(), proxyRelationship: 'friend' };
    const result = submitIASSchema.safeParse(data);
    expect(result.success).toBe(false);
  });

  it('rejects invalid proximity', () => {
    const data = { ...validSubmission(), proxyProximity: 'same_country' };
    const result = submitIASSchema.safeParse(data);
    expect(result.success).toBe(false);
  });

  it('rejects invalid living situation', () => {
    const data = { ...validSubmission(), livingSituation: 'homeless' };
    const result = submitIASSchema.safeParse(data);
    expect(result.success).toBe(false);
  });

  it('rejects parentAge below 40', () => {
    const data = { ...validSubmission(), parentAge: 39 };
    const result = submitIASSchema.safeParse(data);
    expect(result.success).toBe(false);
  });

  it('rejects parentAge above 120', () => {
    const data = { ...validSubmission(), parentAge: 121 };
    const result = submitIASSchema.safeParse(data);
    expect(result.success).toBe(false);
  });

  it('accepts parentAge at boundaries (40 and 120)', () => {
    expect(submitIASSchema.safeParse({ ...validSubmission(), parentAge: 40 }).success).toBe(true);
    expect(submitIASSchema.safeParse({ ...validSubmission(), parentAge: 120 }).success).toBe(true);
  });

  it('rejects non-integer parentAge', () => {
    const data = { ...validSubmission(), parentAge: 72.5 };
    const result = submitIASSchema.safeParse(data);
    expect(result.success).toBe(false);
  });

  it('rejects parameter value = 3 (out of range)', () => {
    const data = validSubmission();
    data.parameters.bathing = 3 as any;
    const result = submitIASSchema.safeParse(data);
    expect(result.success).toBe(false);
  });

  it('rejects negative parameter value', () => {
    const data = validSubmission();
    data.parameters.dressing = -1 as any;
    const result = submitIASSchema.safeParse(data);
    expect(result.success).toBe(false);
  });

  it('rejects non-integer parameter value', () => {
    const data = validSubmission();
    data.parameters.toileting = 1.5 as any;
    const result = submitIASSchema.safeParse(data);
    expect(result.success).toBe(false);
  });

  it('rejects missing required parameter', () => {
    const data = validSubmission();
    delete (data.parameters as any).bathing;
    const result = submitIASSchema.safeParse(data);
    expect(result.success).toBe(false);
  });

  it('rejects missing all parameters', () => {
    const data = { ...validSubmission(), parameters: {} };
    const result = submitIASSchema.safeParse(data);
    expect(result.success).toBe(false);
  });

  it('rejects invalid red flag name', () => {
    const data = { ...validSubmission(), redFlags: ['nonexistent_flag'] };
    const result = submitIASSchema.safeParse(data);
    expect(result.success).toBe(false);
  });

  it('accepts all valid red flags', () => {
    const allFlags = [
      'two_or_more_falls', 'missed_incorrect_medicines', 'unsafe_decisions',
      'significant_weight_loss', 'social_isolation', 'recurrent_hospital_admissions',
      'caregiver_struggling', 'no_emergency_response',
    ] as const;
    const data = { ...validSubmission(), redFlags: [...allFlags] };
    const result = submitIASSchema.safeParse(data);
    expect(result.success).toBe(true);
  });

  it('rejects missing proxyRelationship', () => {
    const data = validSubmission();
    delete (data as any).proxyRelationship;
    const result = submitIASSchema.safeParse(data);
    expect(result.success).toBe(false);
  });

  it('accepts optional visitId and pathwayOverride', () => {
    const data = {
      ...validSubmission(),
      visitId: '550e8400-e29b-41d4-a716-446655440000',
      pathwayOverride: 'clinic',
      overrideReason: 'Clinician assessment override',
    };
    const result = submitIASSchema.safeParse(data);
    expect(result.success).toBe(true);
  });
});

describe('IAS-P v2.0 Dry-Run Schema', () => {
  it('accepts valid parameters without proxy metadata', () => {
    const data = {
      parameters: validSubmission().parameters,
    };
    const result = dryRunSchema.safeParse(data);
    expect(result.success).toBe(true);
  });

  it('accepts parameters with red flags', () => {
    const data = {
      parameters: validSubmission().parameters,
      redFlags: ['two_or_more_falls', 'social_isolation'],
    };
    const result = dryRunSchema.safeParse(data);
    expect(result.success).toBe(true);
  });

  it('rejects invalid parameter values', () => {
    const params = validSubmission().parameters;
    params.bathing = 5 as any;
    const result = dryRunSchema.safeParse({ parameters: params });
    expect(result.success).toBe(false);
  });
});
