import { Hono } from 'hono';

import { rateLimiter } from '../../middleware/rate-limiter.js';
import { ValidationError } from '../../shared/errors.js';
import { successResponse } from '../../shared/response.js';
import { createContactInquirySchema } from './contact.schema.js';
import { createContactInquiry } from './contact.service.js';

export const contactRoutes = new Hono();

contactRoutes.use(
  '*',
  rateLimiter({ windowMs: 60_000, max: 10, name: 'contact' }),
);

contactRoutes.post('/', async (c) => {
  const body = await c.req.json();
  const parsed = createContactInquirySchema.safeParse(body);
  if (!parsed.success) {
    throw new ValidationError(
      'Validation failed',
      parsed.error.errors.map((e) => ({
        field: e.path.join('.') || '_form',
        message: e.message,
      })),
    );
  }

  const inquiry = await createContactInquiry(parsed.data);
  return c.json(successResponse(inquiry), 201);
});
