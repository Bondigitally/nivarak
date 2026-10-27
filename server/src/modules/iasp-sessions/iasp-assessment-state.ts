/**
 * Assessment progress and payment status are separate lifecycles.
 * Assessment transitions are closed: anything not listed here is rejected.
 * `cancelled → paid` and `failed → paid` exist so a later Razorpay-verified
 * capture can still settle an order that failed or was replaced first.
 * `paid` has no outgoing transition: a late failure cannot downgrade it.
 */

export const ASSESSMENT_STATUSES = [
  'in_progress',
  'completed',
  'abandoned',
  'superseded',
  'expired',
] as const;

export type AssessmentStatus = (typeof ASSESSMENT_STATUSES)[number];

export const PAYMENT_STATUSES = [
  'created',
  'pending',
  'paid',
  'failed',
  'cancelled',
] as const;

export type PaymentStatus = (typeof PAYMENT_STATUSES)[number];

const ASSESSMENT_TRANSITIONS: Record<AssessmentStatus, readonly AssessmentStatus[]> = {
  in_progress: ['completed', 'abandoned', 'superseded', 'expired'],
  completed: [],
  abandoned: [],
  superseded: [],
  expired: [],
};

const PAYMENT_TRANSITIONS: Record<PaymentStatus, readonly PaymentStatus[]> = {
  created: ['pending', 'paid', 'failed', 'cancelled'],
  pending: ['paid', 'failed', 'cancelled'],
  paid: [],
  failed: ['paid'],
  cancelled: ['paid'],
};

export function isAssessmentStatus(value: string): value is AssessmentStatus {
  return (ASSESSMENT_STATUSES as readonly string[]).includes(value);
}

export function isPaymentStatus(value: string): value is PaymentStatus {
  return (PAYMENT_STATUSES as readonly string[]).includes(value);
}

export function canTransitionAssessment(
  from: AssessmentStatus,
  to: AssessmentStatus,
): boolean {
  return ASSESSMENT_TRANSITIONS[from].includes(to);
}

export function canTransitionPayment(from: PaymentStatus, to: PaymentStatus): boolean {
  return PAYMENT_TRANSITIONS[from].includes(to);
}

export function assertAssessmentTransition(
  from: AssessmentStatus,
  to: AssessmentStatus,
): void {
  if (!canTransitionAssessment(from, to)) {
    throw new Error(`Illegal assessment transition: ${from} → ${to}`);
  }
}

export function assertPaymentTransition(from: PaymentStatus, to: PaymentStatus): void {
  if (!canTransitionPayment(from, to)) {
    throw new Error(`Illegal payment transition: ${from} → ${to}`);
  }
}
