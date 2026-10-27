import { and, desc, eq, inArray, ne } from 'drizzle-orm';

import { db } from '../../db/connection.js';
import type { IaspPaymentAttempt } from '../../db/schema/iasp_report_payments.js';
import { iaspGuestSessions } from '../../db/schema/iasp_guest_sessions.js';
import { iaspReportPayments } from '../../db/schema/iasp_report_payments.js';
import { BusinessRuleError, NotFoundError } from '../../shared/errors.js';
import { logger } from '../../shared/logger.js';
import {
  canTransitionPayment,
  isPaymentStatus,
  type PaymentStatus,
} from '../iasp-sessions/iasp-assessment-state.js';

export type SettlementResult = {
  status: PaymentStatus;
  unlocked: boolean;
  transitioned: boolean;
};

/**
 * Test-only seam. A throw here rolls back the settlement transaction, which
 * writes payment status and report entitlement together.
 */
export const iaspSettlementTestHooks: {
  beforeCommit: (() => void) | null;
} = { beforeCommit: null };

type PaymentRow = typeof iaspReportPayments.$inferSelect;

function asStatus(value: string): PaymentStatus {
  if (!isPaymentStatus(value)) {
    throw new BusinessRuleError('Payment is in an unknown state');
  }
  return value;
}

/**
 * Single settlement path for the Checkout callback and webhooks.
 * Locks the session, then the payment row. Exactly one caller performs a
 * transition; everyone else observes the committed state and returns success.
 */
export async function settleIaspReportPayment(input: {
  orderId: string;
  paymentId: string;
  outcome: 'paid' | 'failed';
  amountPaise: number;
  currency: string;
}): Promise<SettlementResult> {
  return db.transaction(async (tx) => {
    const [peek] = await tx
      .select()
      .from(iaspReportPayments)
      .where(eq(iaspReportPayments.razorpayOrderId, input.orderId))
      .limit(1);

    if (!peek) {
      throw new NotFoundError('IASP payment order', input.orderId);
    }

    await tx
      .select({ id: iaspGuestSessions.id })
      .from(iaspGuestSessions)
      .where(eq(iaspGuestSessions.id, peek.sessionId))
      .for('update');

    const [payment] = await tx
      .select()
      .from(iaspReportPayments)
      .where(eq(iaspReportPayments.id, peek.id))
      .for('update');

    if (!payment) {
      throw new NotFoundError('IASP payment order', input.orderId);
    }

    const current = asStatus(payment.status);
    if (current === 'paid') {
      return { status: 'paid', unlocked: true, transitioned: false };
    }

    if (input.outcome === 'failed') {
      if (!canTransitionPayment(current, 'failed')) {
        return {
          status: current,
          unlocked: false,
          transitioned: false,
        };
      }

      const attempts = appendAttempt(payment.paymentAttempts, input.paymentId, 'failed');
      const [updated] = await tx
        .update(iaspReportPayments)
        .set({
          status: 'failed',
          razorpayPaymentId: input.paymentId,
          paymentAttempts: attempts,
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(iaspReportPayments.id, payment.id),
            eq(iaspReportPayments.status, current),
          ),
        )
        .returning();

      if (process.env.VITEST === 'true') iaspSettlementTestHooks.beforeCommit?.();

      if (!updated) {
        return { status: current, unlocked: false, transitioned: false };
      }
      return { status: 'failed', unlocked: false, transitioned: true };
    }

    if (input.amountPaise !== payment.amountPaise || input.currency !== payment.currency) {
      throw new BusinessRuleError('Payment amount or currency does not match this order');
    }

    const [existingPaid] = await tx
      .select()
      .from(iaspReportPayments)
      .where(
        and(
          eq(iaspReportPayments.sessionId, payment.sessionId),
          eq(iaspReportPayments.status, 'paid'),
        ),
      )
      .for('update');

    if (existingPaid && existingPaid.id !== payment.id) {
      logger.error(
        { sessionId: payment.sessionId, orderId: payment.razorpayOrderId },
        'Captured Razorpay order was not unlocked because this assessment is already paid',
      );
      return { status: current, unlocked: true, transitioned: false };
    }

    if (!canTransitionPayment(current, 'paid')) {
      return { status: current, unlocked: false, transitioned: false };
    }

    const now = new Date();
    const attempts = appendAttempt(payment.paymentAttempts, input.paymentId, 'paid');
    const [updated] = await tx
      .update(iaspReportPayments)
      .set({
        status: 'paid',
        razorpayPaymentId: input.paymentId,
        paymentAttempts: attempts,
        verifiedAt: now,
        updatedAt: now,
      })
      .where(
        and(
          eq(iaspReportPayments.id, payment.id),
          inArray(iaspReportPayments.status, ['created', 'pending', 'failed', 'cancelled']),
        ),
      )
      .returning();

    if (!updated) {
      const [reread] = await tx
        .select()
        .from(iaspReportPayments)
        .where(eq(iaspReportPayments.id, payment.id))
        .limit(1);
      const status = asStatus(reread?.status ?? current);
      return { status, unlocked: status === 'paid', transitioned: false };
    }

    await tx
      .update(iaspReportPayments)
      .set({ status: 'cancelled', updatedAt: now })
      .where(
        and(
          eq(iaspReportPayments.sessionId, payment.sessionId),
          inArray(iaspReportPayments.status, ['created', 'pending']),
          ne(iaspReportPayments.id, payment.id),
        ),
      );

    const [session] = await tx
      .select({
        detailedReportUnlockedAt: iaspGuestSessions.detailedReportUnlockedAt,
      })
      .from(iaspGuestSessions)
      .where(eq(iaspGuestSessions.id, payment.sessionId))
      .limit(1);

    await tx
      .update(iaspGuestSessions)
      .set({
        detailedReportUnlockedAt: session?.detailedReportUnlockedAt ?? now,
        razorpayOrderId: payment.razorpayOrderId,
        razorpayPaymentId: input.paymentId,
        updatedAt: now,
      })
      .where(eq(iaspGuestSessions.id, payment.sessionId));

    if (process.env.VITEST === 'true') iaspSettlementTestHooks.beforeCommit?.();

    logger.info(
      { sessionId: payment.sessionId, orderId: payment.razorpayOrderId },
      'IASP report payment settled',
    );

    return { status: 'paid', unlocked: true, transitioned: true };
  });
}

function appendAttempt(
  existing: IaspPaymentAttempt[],
  paymentId: string,
  outcome: 'paid' | 'failed',
): IaspPaymentAttempt[] {
  return [...existing, { paymentId, outcome, at: new Date().toISOString() }];
}

export async function markPaymentPending(paymentRowId: string): Promise<void> {
  await db
    .update(iaspReportPayments)
    .set({ status: 'pending', updatedAt: new Date() })
    .where(
      and(eq(iaspReportPayments.id, paymentRowId), eq(iaspReportPayments.status, 'created')),
    );
}

export async function findPaymentByOrderId(orderId: string): Promise<PaymentRow | undefined> {
  const [row] = await db
    .select()
    .from(iaspReportPayments)
    .where(eq(iaspReportPayments.razorpayOrderId, orderId))
    .limit(1);
  return row;
}

export async function findOpenPayment(sessionId: string): Promise<PaymentRow | undefined> {
  const [row] = await db
    .select()
    .from(iaspReportPayments)
    .where(
      and(
        eq(iaspReportPayments.sessionId, sessionId),
        inArray(iaspReportPayments.status, ['created', 'pending']),
      ),
    )
    .limit(1);
  return row;
}

export async function findPaidPayment(sessionId: string): Promise<PaymentRow | undefined> {
  const [row] = await db
    .select()
    .from(iaspReportPayments)
    .where(
      and(eq(iaspReportPayments.sessionId, sessionId), eq(iaspReportPayments.status, 'paid')),
    )
    .limit(1);
  return row;
}

export async function findLatestPayment(sessionId: string): Promise<PaymentRow | undefined> {
  const [row] = await db
    .select()
    .from(iaspReportPayments)
    .where(eq(iaspReportPayments.sessionId, sessionId))
    .orderBy(desc(iaspReportPayments.createdAt))
    .limit(1);
  return row;
}
