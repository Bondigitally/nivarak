import { Hono } from 'hono';

import { rateLimiter } from '../../middleware/rate-limiter.js';
import { successResponse } from '../../shared/response.js';
import { createIaspReportOrder } from './payment.service.js';

export const paymentRoutes = new Hono();

paymentRoutes.use(
  '*',
  rateLimiter({ windowMs: 60_000, max: 30, name: 'payments' }),
);

paymentRoutes.post('/razorpay/iasp-report-order', async (c) => {
  const order = await createIaspReportOrder();
  return c.json(successResponse(order));
});
