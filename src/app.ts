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

// Module routes
import { authRoutes } from './modules/auth/auth.routes.js';
import { patientRoutes } from './modules/patients/patient.routes.js';
import { visitRoutes } from './modules/visits/visit.module.js';
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

// ─── Health Check ───────────────────────────────────────
app.get('/health', async (c) => {
  return c.json({
    status: 'healthy',
    version: '1.0.0',
    uptime_seconds: Math.floor(process.uptime()),
    environment: config.nodeEnv,
    timestamp: new Date().toISOString(),
  });
});

// ─── API Routes (versioned: /api/v1) ───────────────────
const api = new Hono();

// Auth (no patient prefix)
api.route('/auth', authRoutes);

// Resource routes
api.route('/patients', patientRoutes);

// Patient-nested routes (visits, vitals, scores, documents, alerts)
// These are mounted on patientRoutes via parameter passthrough
api.route('/patients/:id/visits', visitRoutes);
api.route('/patients/:id/vitals', vitalsRoutes);
api.route('/patients/:id/scores', patientScoringRoutes);
api.route('/patients/:id/documents', documentRoutes);
api.route('/patients/:id/alerts', patientAlertRoutes);

// Score calculation (non-patient-scoped)
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
