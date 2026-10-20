import { Hono } from 'hono';

import { rateLimiter } from '../../middleware/rate-limiter.js';
import { ValidationError } from '../../shared/errors.js';
import { successResponse } from '../../shared/response.js';
import {
  createIaspReportOrderSchema,
  verifyIaspReportPaymentSchema,
} from './payment.schema.js';
import {
  createIaspReportOrder,
  verifyIaspReportPayment,
} from './payment.service.js';

export const paymentRoutes = new Hono();

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

  const order = await createIaspReportOrder(parsed.data.sessionId);
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

  const result = await verifyIaspReportPayment(parsed.data);
  return c.json(successResponse(result));
});
