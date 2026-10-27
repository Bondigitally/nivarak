import { Hono } from 'hono';

import { rateLimiter } from '../../middleware/rate-limiter.js';
import { ValidationError } from '../../shared/errors.js';
import { successResponse } from '../../shared/response.js';
import { createBookingInquirySchema } from './booking.schema.js';
import { createBookingInquiry } from './booking.service.js';

export const bookingRoutes = new Hono();

bookingRoutes.use(
  '*',
  rateLimiter({ windowMs: 60_000, max: 10, name: 'bookings' }),
);

bookingRoutes.post('/', async (c) => {
  const body = await c.req.json();
  const parsed = createBookingInquirySchema.safeParse(body);
  if (!parsed.success) {
    throw new ValidationError(
      'Validation failed',
      parsed.error.errors.map((e) => ({
        field: e.path.join('.') || '_form',
        message: e.message,
      })),
    );
  }

  const inquiry = await createBookingInquiry(parsed.data);
  return c.json(successResponse(inquiry), 201);
});
