import Razorpay from 'razorpay';
import { and, eq, inArray } from 'drizzle-orm';

import { config } from '../../config/index.js';
import { db } from '../../db/connection.js';
import { isUniqueViolation } from '../../db/postgres-errors.js';
import { iaspGuestSessions } from '../../db/schema/iasp_guest_sessions.js';
import { iaspPaymentWebhookEvents } from '../../db/schema/iasp_report_payments.js';
import { iaspReportPayments } from '../../db/schema/iasp_report_payments.js';
import { AppError, BusinessRuleError } from '../../shared/errors.js';
import { logger } from '../../shared/logger.js';
import {
  loadSessionForCaller,
  sessionReportUnlocked,
} from '../iasp-sessions/iasp-session.service.js';
import {
  findLatestPayment,
  findOpenPayment,
  findPaidPayment,
  findPaymentByOrderId,
  markPaymentPending,
  settleIaspReportPayment,
} from './iasp-payment-settlement.js';
import { verifyRazorpayPaymentSignature, verifyRazorpayWebhookSignature } from './razorpay-signature.js';
import type { CreateIaspReportOrderInput, VerifyIaspReportPaymentInput } from './payment.schema.js';

/**
 * Auto-capture: Nivarak expects Razorpay auto-capture enabled (the dashboard
 * default). A payment that stays `authorized` is stored as `pending` and is
 * not captured here — this server never calls payments.capture. It becomes
 * `paid` only after a fetch or a `payment.captured` / `order.paid` event
 * shows status `captured` with the stored amount and currency.
 *
 * Follow-up: a scheduled job should reconcile orders left in `created` or
 * `pending` when the buyer never returns and no webhook arrives.
 */
const PRODUCT = 'iasp_detailed_report';

export type RazorpayPaymentEntity = {
  id: string;
  orderId: string;
  status: string;
  amount: number;
  currency: string;
};

export type RazorpayGateway = {
  createOrder(input: {
    amount: number;
    currency: string;
    receipt: string;
    notes: Record<string, string>;
  }): Promise<{ id: string; amount: number; currency: string }>;
  fetchPayment(paymentId: string): Promise<RazorpayPaymentEntity>;
  fetchOrderPayments(orderId: string): Promise<RazorpayPaymentEntity[]>;
};

let gatewayOverride: RazorpayGateway | null = null;

export function setRazorpayGatewayForTests(gateway: RazorpayGateway | null): void {
  if (process.env.VITEST !== 'true') {
    throw new Error('Razorpay test gateway is only available under Vitest');
  }
  gatewayOverride = gateway;
}

type PaymentRow = typeof iaspReportPayments.$inferSelect;

function assertRazorpayConfigured(): void {
  if (!config.razorpay.keyId || !config.razorpay.keySecret) {
    throw new AppError(503, 'PAYMENT_NOT_CONFIGURED', 'Razorpay is not configured on the server');
  }
}

function normalizePayment(raw: {
  id?: string;
  order_id?: string;
  status?: string;
  amount?: number | string;
  currency?: string;
}): RazorpayPaymentEntity {
  return {
    id: String(raw.id ?? ''),
    orderId: String(raw.order_id ?? ''),
    status: String(raw.status ?? ''),
    amount: Number(raw.amount),
    currency: String(raw.currency ?? ''),
  };
}

function getRazorpayGateway(): RazorpayGateway {
  if (gatewayOverride) return gatewayOverride;
  assertRazorpayConfigured();
  const client = new Razorpay({
    key_id: config.razorpay.keyId,
    key_secret: config.razorpay.keySecret,
  });

  return {
    async createOrder(input) {
      const order = await client.orders.create({
        amount: input.amount,
        currency: input.currency,
        receipt: input.receipt,
        notes: input.notes,
      });
      return {
        id: order.id,
        amount: Number(order.amount),
        currency: order.currency,
      };
    },
    async fetchPayment(paymentId) {
      const payment = await client.payments.fetch(paymentId);
      return normalizePayment(payment);
    },
    async fetchOrderPayments(orderId) {
      const result = await client.orders.fetchPayments(orderId);
      const items = Array.isArray(result)
        ? result
        : Array.isArray(result?.items)
          ? result.items
          : [];
      return items.map((item) => normalizePayment(item));
    },
  };
}

function presentOrder(payment: PaymentRow, alreadyPaid: boolean) {
  return {
    alreadyPaid,
    unlocked: alreadyPaid,
    orderId: payment.razorpayOrderId,
    amount: payment.amountPaise,
    currency: payment.currency,
    keyId: config.razorpay.keyId,
    sessionId: payment.sessionId,
  };
}

export async function createIaspReportOrder(
  input: CreateIaspReportOrderInput,
  accessToken: string | undefined,
) {
  const session = await loadSessionForCaller(input.sessionId, accessToken);
  if (session.status !== 'completed') {
    throw new BusinessRuleError('Complete the assessment before unlocking the report');
  }

  const expectedAmount = config.razorpay.iaspReportAmountPaise;
  const expectedCurrency = config.razorpay.iaspReportCurrency;
  const now = new Date();

  const prepared = await db.transaction(async (tx) => {
    await tx
      .select({ id: iaspGuestSessions.id })
      .from(iaspGuestSessions)
      .where(eq(iaspGuestSessions.id, session.id))
      .for('update');

    const [paid] = await tx
      .select()
      .from(iaspReportPayments)
      .where(
        and(eq(iaspReportPayments.sessionId, session.id), eq(iaspReportPayments.status, 'paid')),
      )
      .for('update')
      .limit(1);

    if (paid) return { kind: 'entitled' as const, payment: paid };

    const [open] = await tx
      .select()
      .from(iaspReportPayments)
      .where(
        and(
          eq(iaspReportPayments.sessionId, session.id),
          inArray(iaspReportPayments.status, ['created', 'pending']),
        ),
      )
      .for('update')
      .limit(1);

    // Only the token holder reaches this point; pre-migration rows are read-only.
    await tx
      .update(iaspGuestSessions)
      .set({
        fullName: input.fullName,
        phoneNumber: input.phoneNumber,
        email: input.email,
        updatedAt: now,
      })
      .where(eq(iaspGuestSessions.id, session.id));

    if (
      open &&
      open.amountPaise === expectedAmount &&
      open.currency === expectedCurrency
    ) {
      return { kind: 'reuse' as const, payment: open };
    }

    if (open) {
      await tx
        .update(iaspReportPayments)
        .set({ status: 'cancelled', updatedAt: now })
        .where(
          and(
            eq(iaspReportPayments.id, open.id),
            inArray(iaspReportPayments.status, ['created', 'pending']),
          ),
        );
    }

    return { kind: 'create' as const };
  });

  if (prepared.kind === 'entitled') {
    return presentOrder(prepared.payment, true);
  }
  if (prepared.kind === 'reuse') {
    assertRazorpayConfigured();
    return presentOrder(prepared.payment, false);
  }

  assertRazorpayConfigured();
  const gateway = getRazorpayGateway();
  const order = await gateway.createOrder({
    amount: expectedAmount,
    currency: expectedCurrency,
    receipt: `iasp_${session.id.replace(/-/g, '').slice(0, 12)}_${Date.now()}`.slice(0, 40),
    notes: {
      product: PRODUCT,
      purchase: PRODUCT,
      sessionId: session.id,
    },
  });

  if (order.amount !== expectedAmount || order.currency !== expectedCurrency) {
    throw new AppError(
      502,
      'PAYMENT_PROVIDER_ERROR',
      'Payment provider returned an unexpected amount',
    );
  }

  try {
    await db.transaction(async (tx) => {
      await tx.insert(iaspReportPayments).values({
        sessionId: session.id,
        razorpayOrderId: order.id,
        status: 'created',
        amountPaise: expectedAmount,
        currency: expectedCurrency,
        product: PRODUCT,
        paymentAttempts: [],
      });
      await tx
        .update(iaspGuestSessions)
        .set({ razorpayOrderId: order.id, updatedAt: new Date() })
        .where(eq(iaspGuestSessions.id, session.id));
    });
  } catch (error) {
    if (!isUniqueViolation(error)) throw error;
    await db
      .insert(iaspReportPayments)
      .values({
        sessionId: session.id,
        razorpayOrderId: order.id,
        status: 'cancelled',
        amountPaise: expectedAmount,
        currency: expectedCurrency,
        product: PRODUCT,
        paymentAttempts: [],
      })
      .onConflictDoNothing({ target: iaspReportPayments.razorpayOrderId });

    const open = await findOpenPayment(session.id);
    if (!open) throw error;
    return presentOrder(open, false);
  }

  const stored = await findPaymentByOrderId(order.id);
  if (!stored) {
    throw new AppError(500, 'PAYMENT_NOT_RECORDED', 'Payment order could not be stored');
  }
  return presentOrder(stored, false);
}

export async function verifyIaspReportPayment(
  input: VerifyIaspReportPaymentInput,
  accessToken: string | undefined,
): Promise<IaspPaymentStatusResult> {
  assertRazorpayConfigured();
  const session = await loadSessionForCaller(input.sessionId, accessToken);
  const paid = await findPaidPayment(session.id);
  if (paid) {
    return {
      sessionId: session.id,
      unlocked: true,
      paymentStatus: 'paid',
      orderId: paid.razorpayOrderId,
      problem: null,
    };
  }

  // The order row comes from the database. The request id only selects which
  // of this session's own orders the buyer paid, so a payment on an order that
  // was replaced by a newer one still settles instead of being left unlocked.
  const open = await findPaymentByOrderId(input.razorpayOrderId);
  if (!open || open.sessionId !== session.id) {
    throw new BusinessRuleError('Payment order does not match this assessment');
  }

  const valid = verifyRazorpayPaymentSignature(
    config.razorpay.keySecret,
    open.razorpayOrderId,
    input.razorpayPaymentId,
    input.razorpaySignature,
  );
  if (!valid) {
    throw new BusinessRuleError('Invalid payment signature');
  }

  const remote = await getRazorpayGateway().fetchPayment(input.razorpayPaymentId);
  if (remote.orderId !== open.razorpayOrderId) {
    throw new BusinessRuleError('Payment order does not match this assessment');
  }

  return applyRemotePayment(open, remote);
}

export type IaspPaymentStatusResult = {
  sessionId: string;
  orderId: string | null;
  paymentStatus: 'created' | 'pending' | 'paid' | 'failed' | 'cancelled' | null;
  unlocked: boolean;
  problem: 'amount_mismatch' | null;
};

export async function getIaspReportPaymentStatus(
  sessionId: string,
  accessToken: string | undefined,
): Promise<IaspPaymentStatusResult> {
  // Read access: Razorpay is the source of truth here, so a pre-migration row
  // can still settle a payment that was captured before the upgrade.
  const session = await loadSessionForCaller(sessionId, accessToken, 'read');
  const paid = await findPaidPayment(session.id);
  if (paid) {
    return {
      sessionId: session.id,
      orderId: paid.razorpayOrderId,
      paymentStatus: 'paid',
      unlocked: true,
      problem: null,
    };
  }

  const payment = (await findOpenPayment(session.id)) ?? (await findLatestPayment(session.id));
  if (!payment) {
    return {
      sessionId: session.id,
      orderId: null,
      paymentStatus: null,
      unlocked: await sessionReportUnlocked(session),
      problem: null,
    };
  }

  if (payment.status === 'paid') {
    return {
      sessionId: session.id,
      orderId: payment.razorpayOrderId,
      paymentStatus: 'paid',
      unlocked: true,
      problem: null,
    };
  }

  return reconcilePayment(session.id, payment);
}

async function reconcilePayment(
  sessionId: string,
  payment: PaymentRow,
): Promise<IaspPaymentStatusResult> {
  let remote: RazorpayPaymentEntity[];
  try {
    remote = await getRazorpayGateway().fetchOrderPayments(payment.razorpayOrderId);
  } catch {
    logger.warn({ orderId: payment.razorpayOrderId }, 'Could not reconcile Razorpay order');
    return {
      sessionId,
      orderId: payment.razorpayOrderId,
      paymentStatus: payment.status as IaspPaymentStatusResult['paymentStatus'],
      unlocked: false,
      problem: null,
    };
  }

  const captured = remote.find(
    (item) => item.status === 'captured' && item.orderId === payment.razorpayOrderId,
  );
  if (captured) {
    return applyRemotePayment(payment, captured);
  }

  const authorized = remote.find((item) => item.status === 'authorized');
  if (authorized) {
    await markPaymentPending(payment.id);
    return {
      sessionId,
      orderId: payment.razorpayOrderId,
      paymentStatus: 'pending',
      unlocked: false,
      problem: null,
    };
  }

  const failed = remote.find((item) => item.status === 'failed');
  if (failed && (payment.status === 'created' || payment.status === 'pending')) {
    return applyRemotePayment(payment, failed);
  }

  return {
    sessionId,
    orderId: payment.razorpayOrderId,
    paymentStatus: payment.status as IaspPaymentStatusResult['paymentStatus'],
    unlocked: false,
    problem: null,
  };
}

async function applyRemotePayment(
  payment: PaymentRow,
  remote: RazorpayPaymentEntity,
): Promise<IaspPaymentStatusResult> {
  if (remote.status === 'authorized' || (remote.status !== 'captured' && remote.status !== 'failed')) {
    await markPaymentPending(payment.id);
    return {
      sessionId: payment.sessionId,
      orderId: payment.razorpayOrderId,
      paymentStatus: 'pending',
      unlocked: false,
      problem: null,
    };
  }

  if (remote.status === 'captured') {
    if (remote.amount !== payment.amountPaise || remote.currency !== payment.currency) {
      await markPaymentPending(payment.id);
      logger.warn(
        {
          orderId: payment.razorpayOrderId,
          expectedAmount: payment.amountPaise,
          receivedAmount: remote.amount,
        },
        'IASP payment amount mismatch',
      );
      return {
        sessionId: payment.sessionId,
        orderId: payment.razorpayOrderId,
        paymentStatus: 'pending',
        unlocked: false,
        problem: 'amount_mismatch',
      };
    }
  }

  if (payment.status === 'created') {
    await markPaymentPending(payment.id);
  }

  try {
    const result = await settleIaspReportPayment({
      orderId: payment.razorpayOrderId,
      paymentId: remote.id,
      outcome: remote.status === 'captured' ? 'paid' : 'failed',
      amountPaise: remote.amount,
      currency: remote.currency,
    });
    return {
      sessionId: payment.sessionId,
      orderId: payment.razorpayOrderId,
      paymentStatus: result.status,
      unlocked: result.unlocked,
      problem: null,
    };
  } catch (error) {
    if (error instanceof BusinessRuleError) {
      return {
        sessionId: payment.sessionId,
        orderId: payment.razorpayOrderId,
        paymentStatus: 'pending',
        unlocked: false,
        problem: 'amount_mismatch',
      };
    }
    throw error;
  }
}

type WebhookAction =
  | { type: 'ignore' }
  | { type: 'authorized'; orderId: string }
  | { type: 'reconcile'; orderId: string }
  | {
      type: 'captured' | 'failed';
      orderId: string;
      paymentId: string;
      amount: number;
      currency: string;
    };

function stringField(value: unknown): string | null {
  return typeof value === 'string' && value.length > 0 ? value : null;
}

function numberField(value: unknown): number | null {
  const amount = typeof value === 'number' ? value : typeof value === 'string' ? Number(value) : NaN;
  return Number.isFinite(amount) ? amount : null;
}

function paymentAction(
  entity: Record<string, unknown>,
  outcome: 'captured' | 'failed',
): WebhookAction {
  const orderId = stringField(entity.order_id);
  const paymentId = stringField(entity.id);
  const amount = numberField(entity.amount);
  const currency = stringField(entity.currency);
  if (!orderId || !paymentId || amount == null || !currency) return { type: 'ignore' };
  return { type: outcome, orderId, paymentId, amount, currency };
}

export function readWebhookAction(payload: unknown): WebhookAction {
  if (!payload || typeof payload !== 'object') return { type: 'ignore' };
  const event = (payload as { event?: unknown }).event;
  const body = payload as {
    payload?: {
      payment?: { entity?: Record<string, unknown> };
      order?: { entity?: Record<string, unknown> };
    };
  };
  const payment = body.payload?.payment?.entity;
  if (event === 'payment.captured' && payment) return paymentAction(payment, 'captured');
  if (event === 'payment.failed' && payment) return paymentAction(payment, 'failed');
  if (event === 'payment.authorized' && payment) {
    const orderId = stringField(payment.order_id);
    return orderId ? { type: 'authorized', orderId } : { type: 'ignore' };
  }
  if (event === 'order.paid') {
    if (payment && payment.status === 'captured') return paymentAction(payment, 'captured');
    const orderId =
      stringField(body.payload?.order?.entity?.id) ?? (payment ? stringField(payment.order_id) : null);
    return orderId ? { type: 'reconcile', orderId } : { type: 'ignore' };
  }
  return { type: 'ignore' };
}

export async function handleRazorpayWebhook(
  rawBody: string,
  signature: string | undefined,
  eventId: string | undefined,
): Promise<{ status: 200 | 400 | 503 }> {
  if (!config.razorpay.webhookSecret) {
    return { status: 503 };
  }
  if (!signature || !verifyRazorpayWebhookSignature(config.razorpay.webhookSecret, rawBody, signature)) {
    logger.warn('Rejected Razorpay webhook with an invalid signature');
    return { status: 400 };
  }
  if (!eventId) return { status: 400 };

  let payload: unknown;
  try {
    payload = JSON.parse(rawBody) as unknown;
  } catch {
    return { status: 400 };
  }

  const action = readWebhookAction(payload);
  const eventType =
    payload && typeof payload === 'object' && typeof (payload as { event?: unknown }).event === 'string'
      ? (payload as { event: string }).event.slice(0, 64)
      : 'unknown';

  try {
    await db.insert(iaspPaymentWebhookEvents).values({
      eventId,
      eventType,
      razorpayOrderId: 'orderId' in action ? action.orderId : null,
      razorpayPaymentId: 'paymentId' in action ? action.paymentId : null,
    });
  } catch (error) {
    if (isUniqueViolation(error)) return { status: 200 };
    throw error;
  }

  try {
    await applyWebhookAction(action);
    return { status: 200 };
  } catch (error) {
    if (error instanceof BusinessRuleError) {
      logger.warn({ orderId: 'orderId' in action ? action.orderId : undefined }, 'Razorpay webhook did not unlock a report');
      return { status: 200 };
    }
    await db
      .delete(iaspPaymentWebhookEvents)
      .where(eq(iaspPaymentWebhookEvents.eventId, eventId));
    throw error;
  }
}

async function applyWebhookAction(action: WebhookAction): Promise<void> {
  if (action.type === 'ignore') return;

  if (action.type === 'reconcile') {
    const payment = await findPaymentByOrderId(action.orderId);
    if (!payment || payment.status === 'paid') return;
    await reconcilePayment(payment.sessionId, payment);
    return;
  }

  const payment = await findPaymentByOrderId(action.orderId);
  if (!payment) return;

  if (action.type === 'authorized') {
    if (payment.status === 'created') await markPaymentPending(payment.id);
    return;
  }

  if (payment.status === 'paid' && action.type === 'failed') return;

  await applyRemotePayment(payment, {
    id: action.paymentId,
    orderId: action.orderId,
    status: action.type === 'captured' ? 'captured' : 'failed',
    amount: action.amount,
    currency: action.currency,
  });
}
