/**
 * Request logging and correlation ID middleware.
 */

import { Context, Next } from 'hono';
import { v4 as uuidv4 } from 'uuid';
import { logger } from '../shared/logger.js';

export async function requestLogger(c: Context, next: Next): Promise<void | Response> {
  const correlationId = c.req.header('X-Correlation-ID') || uuidv4();
  c.set('correlationId', correlationId);

  const start = Date.now();
  const method = c.req.method;
  const path = c.req.path;

  logger.info(
    { correlationId, method, path },
    `→ ${method} ${path}`
  );

  await next();

  const duration = Date.now() - start;
  const status = c.res.status;

  logger.info(
    { correlationId, method, path, status, duration_ms: duration },
    `← ${method} ${path} ${status} (${duration}ms)`
  );

  // Set correlation ID in response header
  c.header('X-Correlation-ID', correlationId);
}
