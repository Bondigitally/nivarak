import { describe, expect, it } from 'vitest';
import {
  assertAssessmentTransition,
  assertPaymentTransition,
  canTransitionAssessment,
  canTransitionPayment,
} from '../../modules/iasp-sessions/iasp-assessment-state.js';

describe('IAS-P assessment state machine', () => {
  it('allows the documented in-progress exits and nothing else', () => {
    expect(canTransitionAssessment('in_progress', 'completed')).toBe(true);
    expect(canTransitionAssessment('in_progress', 'abandoned')).toBe(true);
    expect(canTransitionAssessment('in_progress', 'superseded')).toBe(true);
    expect(canTransitionAssessment('in_progress', 'expired')).toBe(true);
    expect(canTransitionAssessment('in_progress', 'in_progress')).toBe(false);
  });

  it('treats completed, abandoned, superseded, and expired as terminal', () => {
    for (const status of ['completed', 'abandoned', 'superseded', 'expired'] as const) {
      expect(canTransitionAssessment(status, 'in_progress')).toBe(false);
      expect(canTransitionAssessment(status, 'completed')).toBe(false);
      expect(canTransitionAssessment(status, 'superseded')).toBe(false);
      expect(canTransitionAssessment(status, 'abandoned')).toBe(false);
      expect(canTransitionAssessment(status, 'expired')).toBe(false);
    }
  });

  it('rejects an illegal transition', () => {
    expect(() => assertAssessmentTransition('completed', 'superseded')).toThrow(
      /Illegal assessment transition/,
    );
  });
});

describe('IAS-P payment state machine', () => {
  it('allows open orders to be paid, failed, or cancelled', () => {
    expect(canTransitionPayment('created', 'pending')).toBe(true);
    expect(canTransitionPayment('created', 'paid')).toBe(true);
    expect(canTransitionPayment('pending', 'failed')).toBe(true);
    expect(canTransitionPayment('pending', 'cancelled')).toBe(true);
  });

  it('never downgrades a paid order, including a late failure', () => {
    expect(canTransitionPayment('paid', 'failed')).toBe(false);
    expect(canTransitionPayment('paid', 'cancelled')).toBe(false);
    expect(canTransitionPayment('paid', 'pending')).toBe(false);
    expect(() => assertPaymentTransition('paid', 'failed')).toThrow(/Illegal payment transition/);
  });

  it('allows a later verified capture after failure or cancellation', () => {
    expect(canTransitionPayment('failed', 'paid')).toBe(true);
    expect(canTransitionPayment('cancelled', 'paid')).toBe(true);
    expect(canTransitionPayment('failed', 'cancelled')).toBe(false);
    expect(canTransitionPayment('cancelled', 'failed')).toBe(false);
  });
});
