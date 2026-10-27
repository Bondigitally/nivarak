import { randomUUID } from 'node:crypto';
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { eq } from 'drizzle-orm';

import { db, queryClient } from '../../db/connection.js';
import {
  applyIaspLifecycleMigration,
  listUnverifiedUnlockedSessionIds,
} from '../../db/iasp-lifecycle-migration.js';
import { iaspGuestSessions } from '../../db/schema/iasp_guest_sessions.js';
import { iaspReportPayments } from '../../db/schema/iasp_report_payments.js';
import {
  AssessmentReplacedError,
  AuthorizationError,
  BusinessRuleError,
  NotFoundError,
  ValidationError,
} from '../../shared/errors.js';
import { buildPaidIaspReportPdf } from '../../modules/iasp-report/iasp-report.service.js';
import {
  abandonIaspSession,
  completeIaspSession,
  createIaspSession,
  getIaspSession,
  patchIaspSession,
} from '../../modules/iasp-sessions/iasp-session.service.js';
import {
  iaspSettlementTestHooks,
  settleIaspReportPayment,
} from '../../modules/payments/iasp-payment-settlement.js';
import {
  handleRazorpayWebhook,
  setRazorpayGatewayForTests,
  type RazorpayGateway,
  createIaspReportOrder,
  getIaspReportPaymentStatus,
  verifyIaspReportPayment,
} from '../../modules/payments/payment.service.js';
import {
  signRazorpayPayment,
  signRazorpayWebhook,
} from '../../modules/payments/razorpay-signature.js';

const KEY_SECRET = 'test_key_secret_local';
const WEBHOOK_SECRET = 'test_webhook_secret_local';
const ABOUT = {
  relationship: null,
  age: '74',
  location: null,
  visitFrequency: null,
  livingSituation: null,
  livingSituationOther: '',
};
const CONTACT = {
  fullName: 'Asha Rao',
  phoneNumber: '+919876543210',
  email: 'asha@example.com',
};

let dbReady = false;
try {
  await queryClient`
    CREATE TABLE IF NOT EXISTS users (
      id uuid PRIMARY KEY
    )
  `;
  await queryClient`
    CREATE TABLE IF NOT EXISTS iasp_guest_sessions (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      status varchar(20) NOT NULL DEFAULT 'in_progress',
      created_at timestamptz NOT NULL DEFAULT now(),
      updated_at timestamptz NOT NULL DEFAULT now(),
      expires_at timestamptz,
      completed_at timestamptz,
      about_you jsonb NOT NULL DEFAULT '{}'::jsonb,
      answers jsonb NOT NULL DEFAULT '{}'::jsonb,
      red_flags jsonb NOT NULL DEFAULT '[]'::jsonb,
      flow_step varchar(20),
      page_index integer NOT NULL DEFAULT 0,
      raw_score integer,
      max_score integer,
      ias_percentage numeric(5, 2),
      risk_band varchar(30),
      red_flag_count integer NOT NULL DEFAULT 0,
      red_flag_urgency varchar(30),
      detailed_report_unlocked_at timestamptz,
      razorpay_order_id varchar(100),
      razorpay_payment_id varchar(100),
      privacy_consent_at timestamptz,
      user_id uuid REFERENCES users(id),
      CONSTRAINT iasp_guest_sessions_status_check CHECK (status IN ('in_progress', 'completed'))
    )
  `;
  await applyIaspLifecycleMigration(queryClient, 49900);
  dbReady = true;
} catch {
  dbReady = false;
}

const createdSessionIds: string[] = [];

const remote = {
  orderId: '',
  paymentId: 'pay_test',
  status: 'captured',
  amount: 49900,
  currency: 'INR',
  payments: [] as Array<{
    id: string;
    orderId: string;
    status: string;
    amount: number;
    currency: string;
  }>,
};

const gateway: RazorpayGateway = {
  createOrder: vi.fn(async (input) => ({
    id: `order_${randomUUID().replace(/-/g, '').slice(0, 12)}`,
    amount: input.amount,
    currency: input.currency,
  })),
  fetchPayment: vi.fn(async (paymentId) => ({
    id: paymentId,
    orderId: remote.orderId,
    status: remote.status,
    amount: remote.amount,
    currency: remote.currency,
  })),
  fetchOrderPayments: vi.fn(async (orderId) =>
    remote.payments.length > 0
      ? remote.payments
      : remote.status
        ? [{ id: remote.paymentId, orderId, status: remote.status, amount: remote.amount, currency: remote.currency }]
        : [],
  ),
};

afterEach(async () => {
  iaspSettlementTestHooks.beforeCommit = null;
  remote.orderId = '';
  remote.paymentId = 'pay_test';
  remote.status = 'captured';
  remote.amount = 49900;
  remote.currency = 'INR';
  remote.payments = [];
  vi.mocked(gateway.createOrder).mockClear();
  if (!dbReady || createdSessionIds.length === 0) return;
  const ids = createdSessionIds.splice(0);
  await queryClient`
    delete from iasp_payment_webhook_events
    where razorpay_order_id in (
      select razorpay_order_id from iasp_report_payments where session_id = any(${ids}::uuid[])
    )
  `;
  await queryClient`delete from iasp_report_payments where session_id = any(${ids}::uuid[])`;
  await queryClient`delete from iasp_guest_sessions where id = any(${ids}::uuid[])`;
});

afterAll(async () => {
  setRazorpayGatewayForTests(null);
  await queryClient.end();
});

function token(): string {
  return randomUUID().replace(/-/g, '') + randomUUID().replace(/-/g, '');
}

async function startSession(supersede?: { id: string; token: string }) {
  const accessToken = token();
  const session = await createIaspSession({
    idempotencyKey: randomUUID(),
    accessToken,
    supersedeSessionId: supersede?.id,
    supersedeAccessToken: supersede?.token,
  });
  createdSessionIds.push(session.sessionId);
  return { accessToken, session };
}

async function completedSession() {
  const started = await startSession();
  const session = await completeIaspSession(
    started.session.sessionId,
    {
      aboutYou: ABOUT,
      answers: { bathe: 'independent', dress: 'assistance' },
      redFlags: [],
      rawScore: 12,
      maxScore: 48,
      iasPercentage: 25,
    },
    started.accessToken,
  );
  return { accessToken: started.accessToken, session };
}

describe.skipIf(!dbReady)('IAS-P session lifecycle and payments', () => {
  beforeAll(() => {
    setRazorpayGatewayForTests(gateway);
  });

  it('creates one session for the same idempotency key and requires its access token', async () => {
    const accessToken = token();
    const idempotencyKey = randomUUID();
    const first = await createIaspSession({ idempotencyKey, accessToken });
    const second = await createIaspSession({ idempotencyKey, accessToken });
    createdSessionIds.push(first.sessionId);
    expect(second.sessionId).toBe(first.sessionId);
    expect(first.status).toBe('in_progress');
    await expect(getIaspSession(first.sessionId, undefined)).rejects.toBeInstanceOf(NotFoundError);
    await expect(getIaspSession(first.sessionId, 'wrong-token')).rejects.toBeInstanceOf(NotFoundError);
    const loaded = await getIaspSession(first.sessionId, accessToken);
    expect(loaded.sessionId).toBe(first.sessionId);
  });

  it('keeps an abandoned session row', async () => {
    const { accessToken, session } = await startSession();
    const abandoned = await abandonIaspSession(session.sessionId, accessToken);
    expect(abandoned.status).toBe('abandoned');
    const row = await getIaspSession(session.sessionId, accessToken);
    expect(row.status).toBe('abandoned');
  });

  it('supersedes an in-progress session and leaves a completed session completed', async () => {
    const previous = await startSession();
    const next = await startSession({
      id: previous.session.sessionId,
      token: previous.accessToken,
    });
    expect(next.session.sessionId).not.toBe(previous.session.sessionId);
    const old = await getIaspSession(previous.session.sessionId, previous.accessToken);
    expect(old.status).toBe('superseded');
    await expect(
      patchIaspSession(previous.session.sessionId, { pageIndex: 1 }, previous.accessToken),
    ).rejects.toBeInstanceOf(AssessmentReplacedError);

    const done = await completedSession();
    const replacement = await startSession({ id: done.session.sessionId, token: done.accessToken });
    const stillDone = await getIaspSession(done.session.sessionId, done.accessToken);
    expect(stillDone.status).toBe('completed');
    expect(replacement.session.sessionId).not.toBe(done.session.sessionId);
    expect(replacement.session.unlocked).toBe(false);
  });

  it('leaves a token-less legacy session untouched when another caller names it for supersede', async () => {
    const legacyId = randomUUID();
    await queryClient`
      insert into iasp_guest_sessions (id, status, about_you)
      values (${legacyId}::uuid, 'in_progress', '{}'::jsonb)
    `;
    createdSessionIds.push(legacyId);

    const attacker = await startSession({ id: legacyId, token: '' });
    expect(attacker.session.status).toBe('in_progress');
    const [row] = await queryClient`select status from iasp_guest_sessions where id = ${legacyId}::uuid`;
    expect(row.status).toBe('in_progress');
  });

  it('ignores a supersede request that carries the wrong token and still creates the session', async () => {
    const victim = await startSession();
    const attacker = await startSession({ id: victim.session.sessionId, token: token() });
    expect(attacker.session.sessionId).not.toBe(victim.session.sessionId);
    const still = await getIaspSession(victim.session.sessionId, victim.accessToken);
    expect(still.status).toBe('in_progress');
  });

  it('makes a pre-migration session read-only and hides purchaser contact details', async () => {
    const legacyId = randomUUID();
    await queryClient`
      insert into iasp_guest_sessions (id, status, about_you, completed_at, full_name, email)
      values (${legacyId}::uuid, 'completed', '{}'::jsonb, now(), 'Original Buyer', 'owner@example.com')
    `;
    createdSessionIds.push(legacyId);

    const read = await getIaspSession(legacyId, undefined);
    expect(read.status).toBe('completed');
    expect(read.fullName).toBeNull();
    expect(read.email).toBeNull();
    await expect(patchIaspSession(legacyId, { pageIndex: 1 }, undefined)).rejects.toBeInstanceOf(
      AuthorizationError,
    );
    await expect(abandonIaspSession(legacyId, undefined)).rejects.toBeInstanceOf(AuthorizationError);

    const draftId = randomUUID();
    await queryClient`
      insert into iasp_guest_sessions (id, status, about_you) values (${draftId}::uuid, 'in_progress', '{}'::jsonb)
    `;
    createdSessionIds.push(draftId);
    const draft = await getIaspSession(draftId, undefined);
    expect(draft.status).toBe('expired');
  });

  it('rejects unknown answers and ignores scores sent by the browser', async () => {
    const started = await startSession();
    await expect(
      patchIaspSession(started.session.sessionId, { answers: { not_a_question: 'independent' } }, started.accessToken),
    ).rejects.toBeInstanceOf(ValidationError);
    await expect(
      patchIaspSession(started.session.sessionId, { answers: { bathe: 'banana' } }, started.accessToken),
    ).rejects.toBeInstanceOf(ValidationError);

    const done = await completeIaspSession(
      started.session.sessionId,
      {
        aboutYou: ABOUT,
        answers: { bathe: 'independent', dress: 'independent' },
        redFlags: [],
        rawScore: 9999,
        maxScore: 1,
        iasPercentage: 100,
      },
      started.accessToken,
    );
    expect(done.rawScore).toBe(4);
    expect(done.iasPercentage).toBeLessThan(100);
  });

  it('serves the detailed report PDF only after a verified payment', async () => {
    const { accessToken, session } = await completedSession();
    await expect(buildPaidIaspReportPdf(session.sessionId, accessToken)).rejects.toMatchObject({
      code: 'REPORT_LOCKED',
    });

    const order = await createIaspReportOrder({ sessionId: session.sessionId, ...CONTACT }, accessToken);
    remote.orderId = order.orderId;
    remote.paymentId = 'pay_report';
    await verifyIaspReportPayment(
      {
        sessionId: session.sessionId,
        razorpayOrderId: order.orderId,
        razorpayPaymentId: 'pay_report',
        razorpaySignature: signRazorpayPayment(KEY_SECRET, order.orderId, 'pay_report'),
      },
      accessToken,
    );

    const pdf = await buildPaidIaspReportPdf(session.sessionId, accessToken);
    expect(pdf.subarray(0, 5).toString('latin1')).toBe('%PDF-');
    await expect(buildPaidIaspReportPdf(session.sessionId, undefined)).rejects.toBeInstanceOf(NotFoundError);
  });

  it('blocks checkout on a legacy session without a token and keeps its contact details', async () => {
    const legacyId = randomUUID();
    await queryClient`
      insert into iasp_guest_sessions
        (id, status, about_you, completed_at, full_name, phone_number, email)
      values
        (${legacyId}::uuid, 'completed', '{}'::jsonb, now(), 'Original Buyer', '+919876543210', 'owner@example.com')
    `;
    createdSessionIds.push(legacyId);

    await expect(
      createIaspReportOrder(
        {
          sessionId: legacyId,
          fullName: 'Someone Else',
          phoneNumber: '+911234567890',
          email: 'other@example.com',
        },
        undefined,
      ),
    ).rejects.toBeInstanceOf(AuthorizationError);
    const [row] = await queryClient`
      select full_name, phone_number, email from iasp_guest_sessions where id = ${legacyId}::uuid
    `;
    expect(row.full_name).toBe('Original Buyer');
    expect(row.phone_number).toBe('+919876543210');
    expect(row.email).toBe('owner@example.com');
  });

  it('settles a payment made on an order that a newer order replaced', async () => {
    const { accessToken, session } = await completedSession();
    const first = await createIaspReportOrder({ sessionId: session.sessionId, ...CONTACT }, accessToken);
    await queryClient`
      update iasp_report_payments set amount_paise = 1000
      where razorpay_order_id = ${first.orderId}
    `;
    const second = await createIaspReportOrder({ sessionId: session.sessionId, ...CONTACT }, accessToken);
    expect(second.orderId).not.toBe(first.orderId);
    await queryClient`
      update iasp_report_payments set amount_paise = 49900
      where razorpay_order_id = ${first.orderId}
    `;
    const [replaced] = await queryClient`
      select status from iasp_report_payments where razorpay_order_id = ${first.orderId}
    `;
    expect(replaced.status).toBe('cancelled');

    remote.orderId = first.orderId;
    remote.paymentId = 'pay_late';
    remote.status = 'captured';
    const result = await verifyIaspReportPayment(
      {
        sessionId: session.sessionId,
        razorpayOrderId: first.orderId,
        razorpayPaymentId: 'pay_late',
        razorpaySignature: signRazorpayPayment(KEY_SECRET, first.orderId, 'pay_late'),
      },
      accessToken,
    );
    expect(result.unlocked).toBe(true);
    const rows = await db
      .select()
      .from(iaspReportPayments)
      .where(eq(iaspReportPayments.sessionId, session.sessionId));
    expect(rows.filter((row) => row.status === 'paid')).toHaveLength(1);
  });

  it('expires only in-progress sessions lazily and keeps completed sessions payable', async () => {
    const active = await startSession();
    await queryClient`
      update iasp_guest_sessions
      set expires_at = now() - interval '1 day'
      where id = ${active.session.sessionId}::uuid
    `;
    const expired = await getIaspSession(active.session.sessionId, active.accessToken);
    expect(expired.status).toBe('expired');

    const done = await completedSession();
    await queryClient`
      update iasp_guest_sessions
      set expires_at = now() - interval '1 day'
      where id = ${done.session.sessionId}::uuid
    `;
    const stillDone = await getIaspSession(done.session.sessionId, done.accessToken);
    expect(stillDone.status).toBe('completed');
  });

  it('reuses a matching open order, ignores checkout dismiss, and refuses a second order after payment', async () => {
    const { accessToken, session } = await completedSession();
    const first = await createIaspReportOrder({ sessionId: session.sessionId, ...CONTACT }, accessToken);
    const second = await createIaspReportOrder({ sessionId: session.sessionId, ...CONTACT }, accessToken);
    expect(gateway.createOrder).toHaveBeenCalledTimes(1);
    expect(second.orderId).toBe(first.orderId);
    expect(second.alreadyPaid).toBe(false);

    remote.orderId = first.orderId;
    remote.payments = [];
    remote.status = '';
    const dismissed = await getIaspReportPaymentStatus(session.sessionId, accessToken);
    expect(dismissed.paymentStatus).toBe('created');
    expect(dismissed.unlocked).toBe(false);

    remote.status = 'captured';
    remote.paymentId = 'pay_ok';
    remote.payments = [{ id: 'pay_ok', orderId: first.orderId, status: 'captured', amount: 49900, currency: 'INR' }];
    const verified = await verifyIaspReportPayment(
      {
        sessionId: session.sessionId,
        razorpayOrderId: first.orderId,
        razorpayPaymentId: 'pay_ok',
        razorpaySignature: signRazorpayPayment(KEY_SECRET, first.orderId, 'pay_ok'),
      },
      accessToken,
    );
    expect(verified.unlocked).toBe(true);

    const again = await createIaspReportOrder({ sessionId: session.sessionId, ...CONTACT }, accessToken);
    expect(again.alreadyPaid).toBe(true);
    expect(gateway.createOrder).toHaveBeenCalledTimes(1);
    const orders = await db
      .select()
      .from(iaspReportPayments)
      .where(eq(iaspReportPayments.sessionId, session.sessionId));
    expect(orders.filter((order) => order.status !== 'cancelled')).toHaveLength(1);
  });

  it('rejects invalid signatures, amount mismatches, and cross-session verification', async () => {
    const sessionA = await completedSession();
    const sessionB = await completedSession();
    const orderA = await createIaspReportOrder(
      { sessionId: sessionA.session.sessionId, ...CONTACT },
      sessionA.accessToken,
    );
    const orderB = await createIaspReportOrder(
      { sessionId: sessionB.session.sessionId, ...CONTACT },
      sessionB.accessToken,
    );

    await expect(
      verifyIaspReportPayment(
        {
          sessionId: sessionA.session.sessionId,
          razorpayOrderId: orderA.orderId,
          razorpayPaymentId: 'pay_bad',
          razorpaySignature: 'deadbeef',
        },
        sessionA.accessToken,
      ),
    ).rejects.toBeInstanceOf(BusinessRuleError);
    expect((await getIaspSession(sessionA.session.sessionId, sessionA.accessToken)).unlocked).toBe(false);

    remote.orderId = orderA.orderId;
    remote.amount = 100;
    remote.paymentId = 'pay_mismatch';
    const mismatch = await verifyIaspReportPayment(
      {
        sessionId: sessionA.session.sessionId,
        razorpayOrderId: orderA.orderId,
        razorpayPaymentId: 'pay_mismatch',
        razorpaySignature: signRazorpayPayment(KEY_SECRET, orderA.orderId, 'pay_mismatch'),
      },
      sessionA.accessToken,
    );
    expect(mismatch.unlocked).toBe(false);
    expect(mismatch.problem).toBe('amount_mismatch');

    remote.amount = 49900;
    remote.orderId = orderA.orderId;
    await expect(
      verifyIaspReportPayment(
        {
          sessionId: sessionB.session.sessionId,
          razorpayOrderId: orderA.orderId,
          razorpayPaymentId: 'pay_cross',
          razorpaySignature: signRazorpayPayment(KEY_SECRET, orderA.orderId, 'pay_cross'),
        },
        sessionB.accessToken,
      ),
    ).rejects.toBeInstanceOf(BusinessRuleError);
    expect((await getIaspSession(sessionB.session.sessionId, sessionB.accessToken)).unlocked).toBe(false);
    expect(orderB.orderId).not.toBe(orderA.orderId);
  });

  it('unlocks once for parallel verify and webhook calls, and ignores a later failure', async () => {
    const { accessToken, session } = await completedSession();
    const order = await createIaspReportOrder({ sessionId: session.sessionId, ...CONTACT }, accessToken);
    remote.orderId = order.orderId;
    remote.paymentId = 'pay_parallel';
    remote.amount = 49900;
    remote.status = 'captured';
    const signature = signRazorpayPayment(KEY_SECRET, order.orderId, 'pay_parallel');
    const capturedBody = JSON.stringify({
      event: 'payment.captured',
      payload: {
        payment: {
          entity: {
            id: 'pay_parallel',
            order_id: order.orderId,
            status: 'captured',
            amount: 49900,
            currency: 'INR',
          },
        },
      },
    });
    const failedBody = JSON.stringify({
      event: 'payment.failed',
      payload: {
        payment: {
          entity: {
            id: 'pay_late_fail',
            order_id: order.orderId,
            status: 'failed',
            amount: 49900,
            currency: 'INR',
          },
        },
      },
    });

    const calls = Array.from({ length: 8 }, (_, index) =>
      index % 2 === 0
        ? verifyIaspReportPayment(
            {
              sessionId: session.sessionId,
              razorpayOrderId: order.orderId,
              razorpayPaymentId: 'pay_parallel',
              razorpaySignature: signature,
            },
            accessToken,
          )
        : handleRazorpayWebhook(
            capturedBody,
            signRazorpayWebhook(WEBHOOK_SECRET, capturedBody),
            `evt_parallel_${index}`,
          ),
    );
    await Promise.all(calls);

    const duplicate = await handleRazorpayWebhook(
      capturedBody,
      signRazorpayWebhook(WEBHOOK_SECRET, capturedBody),
      'evt_parallel_1',
    );
    expect(duplicate.status).toBe(200);

    const lateFailure = await handleRazorpayWebhook(
      failedBody,
      signRazorpayWebhook(WEBHOOK_SECRET, failedBody),
      'evt_late_failure',
    );
    expect(lateFailure.status).toBe(200);

    const [payment] = await db
      .select()
      .from(iaspReportPayments)
      .where(eq(iaspReportPayments.razorpayOrderId, order.orderId));
    expect(payment?.status).toBe('paid');
    expect(payment?.paymentAttempts.filter((attempt) => attempt.outcome === 'paid')).toHaveLength(1);
    const unlocked = await getIaspSession(session.sessionId, accessToken);
    expect(unlocked.unlocked).toBe(true);
    expect(unlocked.detailedReportUnlockedAt).toBeTruthy();
  });

  it('rejects an invalid webhook signature and rolls back a failed settlement', async () => {
    const { accessToken, session } = await completedSession();
    const order = await createIaspReportOrder({ sessionId: session.sessionId, ...CONTACT }, accessToken);
    const raw = JSON.stringify({ event: 'payment.captured', payload: { payment: { entity: { id: 'pay_x', order_id: order.orderId, amount: 49900, currency: 'INR' } } } });
    const rejected = await handleRazorpayWebhook(raw, 'not-a-signature', 'evt_bad_sig');
    expect(rejected.status).toBe(400);
    expect((await getIaspSession(session.sessionId, accessToken)).unlocked).toBe(false);

    remote.orderId = order.orderId;
    remote.paymentId = 'pay_rollback';
    remote.status = 'captured';
    iaspSettlementTestHooks.beforeCommit = () => {
      throw new Error('database write failed');
    };
    await expect(
      verifyIaspReportPayment(
        {
          sessionId: session.sessionId,
          razorpayOrderId: order.orderId,
          razorpayPaymentId: 'pay_rollback',
          razorpaySignature: signRazorpayPayment(KEY_SECRET, order.orderId, 'pay_rollback'),
        },
        accessToken,
      ),
    ).rejects.toThrow(/database write failed/);

    const [payment] = await db
      .select()
      .from(iaspReportPayments)
      .where(eq(iaspReportPayments.razorpayOrderId, order.orderId));
    expect(payment?.status).toBe('pending');
    const [row] = await db
      .select()
      .from(iaspGuestSessions)
      .where(eq(iaspGuestSessions.id, session.sessionId));
    expect(row?.detailedReportUnlockedAt).toBeNull();

    iaspSettlementTestHooks.beforeCommit = null;
    const settled = await getIaspReportPaymentStatus(session.sessionId, accessToken);
    expect(settled.paymentStatus).toBe('paid');
    expect(settled.unlocked).toBe(true);
  });

  it('rolls a direct settlement back without leaving a paid row or an unlock', async () => {
    const { session } = await completedSession();
    await db.insert(iaspReportPayments).values({
      sessionId: session.sessionId,
      razorpayOrderId: `order_direct_${randomUUID().slice(0, 8)}`,
      status: 'created',
      amountPaise: 49900,
      currency: 'INR',
      product: 'iasp_detailed_report',
      paymentAttempts: [],
    });
    const [created] = await db
      .select()
      .from(iaspReportPayments)
      .where(eq(iaspReportPayments.sessionId, session.sessionId));
    iaspSettlementTestHooks.beforeCommit = () => {
      throw new Error('mid-transaction');
    };
    await expect(
      settleIaspReportPayment({
        orderId: created!.razorpayOrderId,
        paymentId: 'pay_direct',
        outcome: 'paid',
        amountPaise: 49900,
        currency: 'INR',
      }),
    ).rejects.toThrow(/mid-transaction/);
    const [payment] = await db
      .select()
      .from(iaspReportPayments)
      .where(eq(iaspReportPayments.id, created!.id));
    expect(payment?.status).toBe('created');
    const [row] = await db
      .select()
      .from(iaspGuestSessions)
      .where(eq(iaspGuestSessions.id, session.sessionId));
    expect(row?.detailedReportUnlockedAt).toBeNull();
  });

  it('preserves existing rows and lists unlocks that have no verified payment', async () => {
    const legacyUnlock = randomUUID();
    const legacyPaid = randomUUID();
    const stillProgress = randomUUID();
    createdSessionIds.push(legacyUnlock, legacyPaid, stillProgress);
    await queryClient`
      insert into iasp_guest_sessions (id, status, detailed_report_unlocked_at)
      values
        (${legacyUnlock}::uuid, 'completed', now()),
        (${legacyPaid}::uuid, 'completed', now()),
        (${stillProgress}::uuid, 'in_progress', null)
    `;
    await queryClient`
      update iasp_guest_sessions
      set razorpay_order_id = ${`order_legacy_${legacyPaid.slice(0, 8)}`},
          razorpay_payment_id = ${`pay_legacy_${legacyPaid.slice(0, 8)}`}
      where id = ${legacyPaid}::uuid
    `;
    await applyIaspLifecycleMigration(queryClient, 49900);

    const review = await listUnverifiedUnlockedSessionIds(queryClient);
    expect(review).toContain(legacyUnlock);
    expect(review).not.toContain(legacyPaid);
    expect(review).not.toContain(stillProgress);

    const [progress] = await db
      .select()
      .from(iaspGuestSessions)
      .where(eq(iaspGuestSessions.id, stillProgress));
    expect(progress?.status).toBe('in_progress');

    const [paid] = await db
      .select()
      .from(iaspReportPayments)
      .where(eq(iaspReportPayments.sessionId, legacyPaid));
    expect(paid?.status).toBe('paid');
    expect(paid?.verifiedAt).toBeTruthy();

    const [unlockedRow] = await db
      .select()
      .from(iaspGuestSessions)
      .where(eq(iaspGuestSessions.id, legacyUnlock));
    expect(unlockedRow?.detailedReportUnlockedAt).toBeTruthy();
    const unlockedPayments = await db
      .select()
      .from(iaspReportPayments)
      .where(eq(iaspReportPayments.sessionId, legacyUnlock));
    expect(unlockedPayments).toHaveLength(0);
  });
});
