/**
 * Global error handler middleware.
 * Maps AppError subclasses to proper HTTP responses with correlation IDs.
 */

import { Context } from 'hono';
import { AppError } from '../shared/errors.js';
import { errorResponse } from '../shared/response.js';
import { logger } from '../shared/logger.js';
import { v4 as uuidv4 } from 'uuid';

export function errorHandler(err: Error, c: Context): Response {
  const correlationId = c.get('correlationId') || uuidv4();

  if (err instanceof AppError) {
    // Expected application errors
    logger.warn(
      {
        correlationId,
        code: err.code,
        statusCode: err.statusCode,
        message: err.message,
        details: err.details,
      },
      `AppError: ${err.code}`
    );

    return c.json(
      {
        ...errorResponse(err.code, err.message, err.details),
        correlationId,
      },
      err.statusCode as any
    );
  }

  // Unexpected errors — log full stack, return generic message
  logger.error(
    {
      correlationId,
      err: err.message,
      stack: err.stack,
    },
    'Unhandled error'
  );

  return c.json(
    {
      ...errorResponse('INTERNAL_ERROR', 'An unexpected error occurred'),
      correlationId,
    },
    500
  );
}
