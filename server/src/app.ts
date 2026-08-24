/**
 * Nivarak API — Main Application
 *
 * Modular monolith entry point.
 * Mounts all modules under /api/v1 with global middleware.
 */

import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { config } from './config/index.js';
import { requestLogger } from './middleware/request-logger.js';
import { errorHandler } from './middleware/error-handler.js';
import { requirePatientAccess } from './middleware/abac.js';
import { rateLimiter } from './middleware/rate-limiter.js';
import { authMiddleware } from './middleware/auth.js';
import { testConnection } from './db/connection.js';
import { registerDomainEvents } from './bootstrap/events.js';

import { authRoutes } from './modules/auth/auth.routes.js';
import { patientRoutes } from './modules/patients/patient.routes.js';
import { encounterRoutes } from './modules/encounters/encounter.routes.js';
import { vitalsRoutes } from './modules/vitals/vitals.routes.js';
import { scoringRoutes, patientScoringRoutes } from './modules/scoring/scoring.routes.js';
import { taskRoutes } from './modules/tasks/task.routes.js';
import { alertRoutes, patientAlertRoutes } from './modules/alerts/alert.routes.js';
import { documentRoutes } from './modules/documents/document.routes.js';
import { dashboardRoutes } from './modules/dashboard/dashboard.routes.js';
import { notificationRoutes } from './modules/notifications/notification.routes.js';
import { auditRoutes } from './modules/audit/audit.routes.js';

registerDomainEvents();

const app = new Hono();

app.use(
  '*',
  cors({
    origin: config.cors.origins,
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization', 'X-Correlation-ID'],
    credentials: true,
  })
);

app.use('*', requestLogger);

app.use('*', async (c, next) => {
  const contentLength = c.req.header('content-length');
  if (contentLength) {
    const size = parseInt(contentLength, 10);
    const isUploadRoute = c.req.path.includes('/documents');
    const maxSize = isUploadRoute ? 50 * 1024 * 1024 : 1 * 1024 * 1024;
    if (size > maxSize) {
      return c.json({
        success: false,
        data: null,
        error: { code: 'PAYLOAD_TOO_LARGE', message: `Request body exceeds ${isUploadRoute ? '50MB' : '1MB'} limit` },
      }, 413);
    }
  }
  await next();
});

app.get('/health', async (c) => {
  return c.json({
    status: 'healthy',
    version: '1.0.0',
    uptime_seconds: Math.floor(process.uptime()),
    environment: config.nodeEnv,
    timestamp: new Date().toISOString(),
  });
});

app.get('/health/ready', async (c) => {
  const dbOk = await testConnection();
  if (!dbOk) {
    return c.json({
      status: 'not_ready',
      checks: { database: 'failed' },
      timestamp: new Date().toISOString(),
    }, 503);
  }
  return c.json({
    status: 'ready',
    checks: { database: 'ok' },
    timestamp: new Date().toISOString(),
  });
});

const api = new Hono();

const authWithRateLimit = new Hono();
authWithRateLimit.use('*', rateLimiter({ windowMs: 60_000, max: 20, name: 'auth_general' }));
authWithRateLimit.route('/', authRoutes);
api.route('/auth', authWithRateLimit);

api.route('/patients', patientRoutes);

const patientScoped = new Hono();
patientScoped.use('*', authMiddleware);
patientScoped.use('*', requirePatientAccess('id'));

patientScoped.route('/:id/encounters', encounterRoutes);
patientScoped.route('/:id/vitals', vitalsRoutes);
patientScoped.route('/:id/scores', patientScoringRoutes);
patientScoped.route('/:id/documents', documentRoutes);
patientScoped.route('/:id/alerts', patientAlertRoutes);
api.route('/patients', patientScoped);

api.route('/scores', scoringRoutes);
api.route('/tasks', taskRoutes);
api.route('/alerts', alertRoutes);
api.route('/dashboard', dashboardRoutes);
api.route('/notifications', notificationRoutes);
api.route('/audit-logs', auditRoutes);

app.route(`/api/${config.apiVersion}`, api);

app.notFound((c) => {
  return c.json(
    {
      success: false,
      data: null,
      error: { code: 'NOT_FOUND', message: `Route ${c.req.method} ${c.req.path} not found` },
    },
    404
  );
});

app.onError(errorHandler);

export { app };
