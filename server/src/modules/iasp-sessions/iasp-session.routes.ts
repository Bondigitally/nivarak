import { Hono } from 'hono';

import { rateLimiter } from '../../middleware/rate-limiter.js';
import { ValidationError } from '../../shared/errors.js';
import { successResponse } from '../../shared/response.js';
import {
  completeIaspSessionSchema,
  patchIaspSessionSchema,
} from './iasp-session.schema.js';
import {
  completeIaspSession,
  createIaspSession,
  getIaspSession,
  patchIaspSession,
} from './iasp-session.service.js';

export const iaspSessionRoutes = new Hono();

iaspSessionRoutes.use(
  '*',
  rateLimiter({ windowMs: 60_000, max: 60, name: 'iasp-sessions' }),
);

iaspSessionRoutes.post('/', async (c) => {
  const session = await createIaspSession();
  return c.json(successResponse(session), 201);
});

iaspSessionRoutes.get('/:id', async (c) => {
  const session = await getIaspSession(c.req.param('id'));
  return c.json(successResponse(session));
});

iaspSessionRoutes.patch('/:id', async (c) => {
  const body = await c.req.json();
  const parsed = patchIaspSessionSchema.safeParse(body);
  if (!parsed.success) {
    throw new ValidationError(
      'Validation failed',
      parsed.error.errors.map((e) => ({
        field: e.path.join('.'),
        message: e.message,
      })),
    );
  }

  const session = await patchIaspSession(c.req.param('id'), parsed.data);
  return c.json(successResponse(session));
});

iaspSessionRoutes.post('/:id/complete', async (c) => {
  const body = await c.req.json();
  const parsed = completeIaspSessionSchema.safeParse(body);
  if (!parsed.success) {
    throw new ValidationError(
      'Validation failed',
      parsed.error.errors.map((e) => ({
        field: e.path.join('.'),
        message: e.message,
      })),
    );
  }

  const session = await completeIaspSession(c.req.param('id'), parsed.data);
  return c.json(successResponse(session));
});
