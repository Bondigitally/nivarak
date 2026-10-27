import { Hono } from 'hono';

import { rateLimiter } from '../../middleware/rate-limiter.js';
import { ValidationError } from '../../shared/errors.js';
import { successResponse } from '../../shared/response.js';
import {
  readIaspAccessToken,
  setIaspAccessCookie,
} from '../iasp-sessions/iasp-access-cookie.js';
import {
  createIaspReportOrderSchema,
  iaspPaymentStatusQuerySchema,
  verifyIaspReportPaymentSchema,
} from './payment.schema.js';
import {
  createIaspReportOrder,
  getIaspReportPaymentStatus,
  handleRazorpayWebhook,
  verifyIaspReportPayment,
} from './payment.service.js';

export const paymentRoutes = new Hono();

/**
 * Registered before the per-IP limiter: Razorpay delivers every merchant event
 * from a small set of addresses, so a shared limit could reject real events.
 * The HMAC signature is the access control for this route.
 */
paymentRoutes.post('/razorpay/webhook', async (c) => {
  const rawBody = await c.req.text();
  const result = await handleRazorpayWebhook(
    rawBody,
    c.req.header('x-razorpay-signature'),
    c.req.header('x-razorpay-event-id'),
  );
  if (result.status === 200) {
    return c.json(successResponse({ received: true }), 200);
  }
  return c.json(
    {
      success: false,
      data: null,
      error: {
        code: result.status === 503 ? 'PAYMENT_NOT_CONFIGURED' : 'INVALID_WEBHOOK',
        message: result.status === 503 ? 'Webhook secret is not configured' : 'Invalid webhook',
      },
    },
    result.status,
  );
});

paymentRoutes.use(
  '*',
  rateLimiter({ windowMs: 60_000, max: 30, name: 'payments' }),
);

paymentRoutes.post('/razorpay/iasp-report-order', async (c) => {
  const body = await c.req.json();
  const parsed = createIaspReportOrderSchema.safeParse(body);
  if (!parsed.success) {
    throw new ValidationError(
      'Validation failed',
      parsed.error.errors.map((e) => ({
        field: e.path.join('.'),
        message: e.message,
      })),
    );
  }

  const sessionId = parsed.data.sessionId;
  const token = readIaspAccessToken(c, sessionId);
  const order = await createIaspReportOrder(parsed.data, token);
  if (token) setIaspAccessCookie(c, sessionId, token);
  return c.json(successResponse(order));
});

paymentRoutes.post('/razorpay/iasp-report-verify', async (c) => {
  const body = await c.req.json();
  const parsed = verifyIaspReportPaymentSchema.safeParse(body);
  if (!parsed.success) {
    throw new ValidationError(
      'Validation failed',
      parsed.error.errors.map((e) => ({
        field: e.path.join('.'),
        message: e.message,
      })),
    );
  }

  const sessionId = parsed.data.sessionId;
  const token = readIaspAccessToken(c, sessionId);
  const result = await verifyIaspReportPayment(parsed.data, token);
  if (token) setIaspAccessCookie(c, sessionId, token);
  return c.json(successResponse(result));
});

paymentRoutes.get('/razorpay/iasp-report-status', async (c) => {
  const parsed = iaspPaymentStatusQuerySchema.safeParse({
    sessionId: c.req.query('sessionId'),
  });
  if (!parsed.success) {
    throw new ValidationError(
      'Validation failed',
      parsed.error.errors.map((e) => ({
        field: e.path.join('.'),
        message: e.message,
      })),
    );
  }

  const sessionId = parsed.data.sessionId;
  const token = readIaspAccessToken(c, sessionId);
  const result = await getIaspReportPaymentStatus(sessionId, token);
  if (token) setIaspAccessCookie(c, sessionId, token);
  return c.json(successResponse(result));
});
