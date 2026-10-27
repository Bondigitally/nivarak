import { Hono } from 'hono';

import { rateLimiter } from '../../middleware/rate-limiter.js';
import { ValidationError } from '../../shared/errors.js';
import { successResponse } from '../../shared/response.js';
import { buildPaidIaspReportPdf } from '../iasp-report/iasp-report.service.js';
import {
  clearIaspAccessCookie,
  readIaspAccessToken,
  setIaspAccessCookie,
} from './iasp-access-cookie.js';
import {
  completeIaspSessionSchema,
  createIaspSessionSchema,
  patchIaspSessionSchema,
} from './iasp-session.schema.js';
import {
  abandonIaspSession,
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
  const body = await c.req.json();
  const parsed = createIaspSessionSchema.safeParse(body);
  if (!parsed.success) {
    throw new ValidationError(
      'Validation failed',
      parsed.error.errors.map((e) => ({
        field: e.path.join('.'),
        message: e.message,
      })),
    );
  }

  const supersedeSessionId = parsed.data.supersedeSessionId;
  const session = await createIaspSession({
    ...parsed.data,
    supersedeAccessToken: supersedeSessionId
      ? readIaspAccessToken(c, supersedeSessionId)
      : undefined,
  });
  // Bind the create-body token into an HttpOnly cookie so the browser never
  // needs to keep it in localStorage for later calls.
  setIaspAccessCookie(c, session.sessionId, parsed.data.accessToken);
  return c.json(successResponse(session), 201);
});

iaspSessionRoutes.get('/:id/report', async (c) => {
  const sessionId = c.req.param('id');
  const token = readIaspAccessToken(c, sessionId);
  const pdf = await buildPaidIaspReportPdf(sessionId, token);
  if (token) setIaspAccessCookie(c, sessionId, token);
  return new Response(new Uint8Array(pdf), {
    status: 200,
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'inline; filename="nivarak-iasp-report.pdf"',
      'Cache-Control': 'private, no-store',
      'X-Content-Type-Options': 'nosniff',
    },
  });
});

iaspSessionRoutes.get('/:id', async (c) => {
  const sessionId = c.req.param('id');
  const token = readIaspAccessToken(c, sessionId);
  const session = await getIaspSession(sessionId, token);
  if (token) setIaspAccessCookie(c, sessionId, token);
  return c.json(successResponse(session));
});

iaspSessionRoutes.patch('/:id', async (c) => {
  const sessionId = c.req.param('id');
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

  const token = readIaspAccessToken(c, sessionId);
  const session = await patchIaspSession(sessionId, parsed.data, token);
  if (token) setIaspAccessCookie(c, sessionId, token);
  return c.json(successResponse(session));
});

iaspSessionRoutes.post('/:id/complete', async (c) => {
  const sessionId = c.req.param('id');
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

  const token = readIaspAccessToken(c, sessionId);
  const session = await completeIaspSession(sessionId, parsed.data, token);
  if (token) setIaspAccessCookie(c, sessionId, token);
  return c.json(successResponse(session));
});

iaspSessionRoutes.post('/:id/abandon', async (c) => {
  const sessionId = c.req.param('id');
  const token = readIaspAccessToken(c, sessionId);
  const session = await abandonIaspSession(sessionId, token);
  clearIaspAccessCookie(c, sessionId);
  return c.json(successResponse(session));
});
