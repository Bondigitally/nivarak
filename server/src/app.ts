/**
 * Nivarak API — Main Application
 *
 * Modular monolith entry point.
 * Mounts all modules under /api/v1 with global middleware.
 * Includes ABAC enforcement, rate limiting, and body size limits.
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

// Module routes
import { authRoutes } from './modules/auth/auth.routes.js';
import { patientRoutes } from './modules/patients/patient.routes.js';
import { encounterRoutes } from './modules/encounters/encounter.module.js';
import { vitalsRoutes } from './modules/vitals/vitals.module.js';
import { scoringRoutes, patientScoringRoutes } from './modules/scoring/scoring.module.js';
import { taskRoutes } from './modules/tasks/task.module.js';
import { alertRoutes, patientAlertRoutes } from './modules/alerts/alert.module.js';
import { documentRoutes } from './modules/documents/document.module.js';
import { dashboardRoutes } from './modules/dashboard/dashboard.module.js';
import { notificationRoutes } from './modules/notifications/notification.module.js';
import { auditRoutes } from './modules/audit/audit.module.js';

// Initialize event-driven modules (side effects: register event handlers)
import './modules/audit/audit.module.js';
import './modules/alerts/alert.module.js';
import './modules/notifications/notification.module.js';

import { successResponse } from './shared/response.js';

const app = new Hono();

// ─── Global Middleware ──────────────────────────────────
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

// ─── Request Body Size Limit ────────────────────────────
// Default: 1MB for all routes. Document upload routes have separate 50MB limit.
app.use('*', async (c, next) => {
  const contentLength = c.req.header('content-length');
  if (contentLength) {
    const size = parseInt(contentLength, 10);
    const isUploadRoute = c.req.path.includes('/documents');
    const maxSize = isUploadRoute ? 50 * 1024 * 1024 : 1 * 1024 * 1024; // 50MB or 1MB
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

// ─── Health Checks ──────────────────────────────────────
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

// ─── API Routes (versioned: /api/v1) ───────────────────
const api = new Hono();

// Auth (rate limited: 10 OTP requests per minute, 20 login attempts per minute)
const authWithRateLimit = new Hono();
authWithRateLimit.use('*', rateLimiter({ windowMs: 60_000, max: 20, name: 'auth_general' }));
authWithRateLimit.use('/request-otp', rateLimiter({ windowMs: 60_000, max: 10, name: 'auth_otp' }));
authWithRateLimit.route('/', authRoutes);
api.route('/auth', authWithRateLimit);

// Resource routes
api.route('/patients', patientRoutes);

// Patient-nested routes with ABAC enforcement
// authMiddleware is applied inside each module, but ABAC is applied here at the router level
const patientScoped = new Hono();
patientScoped.use('*', authMiddleware);
patientScoped.use('*', requirePatientAccess('id'));

// Mount patient-scoped sub-routes through the ABAC-protected router
patientScoped.route('/:id/encounters', encounterRoutes);
patientScoped.route('/:id/vitals', vitalsRoutes);
patientScoped.route('/:id/scores', patientScoringRoutes);
patientScoped.route('/:id/documents', documentRoutes);
patientScoped.route('/:id/alerts', patientAlertRoutes);
api.route('/patients', patientScoped);

// Score calculation (non-patient-scoped, public)
api.route('/scores', scoringRoutes);

// Top-level resource routes
api.route('/tasks', taskRoutes);
api.route('/alerts', alertRoutes);
api.route('/dashboard', dashboardRoutes);
api.route('/notifications', notificationRoutes);
api.route('/audit-logs', auditRoutes);

// Mount API under version prefix
app.route(`/api/${config.apiVersion}`, api);

// ─── 404 Handler ────────────────────────────────────────
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

// ─── Global Error Handler ───────────────────────────────
app.onError(errorHandler);

export { app };
