import { createHmac, timingSafeEqual } from 'node:crypto';
import Razorpay from 'razorpay';

import { config } from '../../config/index.js';
import { AppError, BusinessRuleError } from '../../shared/errors.js';
import {
  assertSessionPayable,
  attachRazorpayOrder,
  getIaspSessionByIdForPayment,
  unlockIaspSessionByOrder,
} from '../iasp-sessions/iasp-session.service.js';

function getRazorpayClient() {
  if (!config.razorpay.keyId || !config.razorpay.keySecret) {
    throw new AppError(
      503,
      'PAYMENT_NOT_CONFIGURED',
      'Razorpay is not configured on the server',
    );
  }

  return new Razorpay({
    key_id: config.razorpay.keyId,
    key_secret: config.razorpay.keySecret,
  });
}

function verifyRazorpaySignature(
  orderId: string,
  paymentId: string,
  signature: string,
): boolean {
  const expected = createHmac('sha256', config.razorpay.keySecret)
    .update(`${orderId}|${paymentId}`)
    .digest('hex');

  const expectedBuf = Buffer.from(expected, 'utf8');
  const signatureBuf = Buffer.from(signature, 'utf8');

  if (expectedBuf.length !== signatureBuf.length) {
    return false;
  }

  return timingSafeEqual(expectedBuf, signatureBuf);
}

export async function createIaspReportOrder(sessionId: string) {
  const session = await assertSessionPayable(sessionId);
  const razorpay = getRazorpayClient();

  // Reuse an existing unpaid order if present (avoids duplicate charges on retry).
  if (session.razorpayOrderId) {
    return {
      orderId: session.razorpayOrderId,
      amount: config.razorpay.iaspReportAmountPaise,
      currency: 'INR',
      keyId: config.razorpay.keyId,
      sessionId,
    };
  }

  const order = await razorpay.orders.create({
    amount: config.razorpay.iaspReportAmountPaise,
    currency: 'INR',
    receipt: `iasp_${sessionId.slice(0, 8)}_${Date.now()}`.slice(0, 40),
    notes: {
      product: 'iasp_detailed_report',
      sessionId,
    },
  });

  await attachRazorpayOrder(sessionId, order.id);

  return {
    orderId: order.id,
    amount: Number(order.amount),
    currency: order.currency,
    keyId: config.razorpay.keyId,
    sessionId,
  };
}

export async function verifyIaspReportPayment(input: {
  sessionId: string;
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
}) {
  if (!config.razorpay.keySecret) {
    throw new AppError(
      503,
      'PAYMENT_NOT_CONFIGURED',
      'Razorpay is not configured on the server',
    );
  }

  const session = await getIaspSessionByIdForPayment(input.sessionId);

  if (session.detailedReportUnlockedAt) {
    return {
      sessionId: session.id,
      unlocked: true,
      detailedReportUnlockedAt: session.detailedReportUnlockedAt,
    };
  }

  if (
    session.razorpayOrderId &&
    session.razorpayOrderId !== input.razorpayOrderId
  ) {
    throw new BusinessRuleError('Payment order does not match this assessment');
  }

  const valid = verifyRazorpaySignature(
    input.razorpayOrderId,
    input.razorpayPaymentId,
    input.razorpaySignature,
  );

  if (!valid) {
    throw new BusinessRuleError('Invalid payment signature');
  }

  const unlocked = await unlockIaspSessionByOrder({
    orderId: input.razorpayOrderId,
    paymentId: input.razorpayPaymentId,
  });

  if (unlocked.sessionId !== input.sessionId) {
    throw new BusinessRuleError('Payment order does not match this assessment');
  }

  return {
    sessionId: unlocked.sessionId,
    unlocked: true,
    detailedReportUnlockedAt: unlocked.detailedReportUnlockedAt,
  };
}
