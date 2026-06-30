/**
 * AlertModule — Service + Routes
 * Alert creation, routing, acknowledgement, resolution.
 */

import { Hono } from 'hono';
import { z } from 'zod';
import { eq, and, desc, count } from 'drizzle-orm';
import { db, queryClient } from '../../db/connection.js';
import { alerts, alertRules } from '../../db/schema/index.js';
import { eventBus, DomainEvents } from '../../shared/event-bus.js';
import { logger } from '../../shared/logger.js';
import { NotFoundError, BusinessRuleError, ValidationError } from '../../shared/errors.js';
import { authMiddleware, requirePermission } from '../../middleware/auth.js';
import { successResponse, paginatedResponse } from '../../shared/response.js';

// ─── Service ────────────────────────────────────────────
class AlertService {
  constructor() {
    // Wire up event listeners for automatic alert creation
    this.registerEventHandlers();
  }

  private registerEventHandlers() {
    // Vital threshold breach → create alert
    eventBus.on('vital.threshold_breached', async (data) => {
      await this.createAlert({
        patientId: data.patientId,
        alertType: 'vital_threshold',
        severity: data.severity,
        title: `${data.parameterType} threshold breached`,
        body: `Value: ${data.value} (threshold: ${data.threshold})`,
        sourceEntityType: 'vital',
      });
    });

    // Risk band change → create alert
    eventBus.on('risk_band.changed', async (data) => {
      await this.createAlert({
        patientId: data.patientId,
        alertType: 'risk_escalation',
        severity: data.newBand === 'critical' ? 'critical' : 'warning',
        title: `Risk band changed: ${data.previousBand} → ${data.newBand}`,
        body: `Patient risk has ${data.newBand > data.previousBand ? 'increased' : 'decreased'}.`,
        sourceEntityType: 'score',
        sourceEntityId: data.scoreId,
      });
    });

    // Task overdue → create alert
    eventBus.on('task.overdue', async (data) => {
      await this.createAlert({
        patientId: data.patientId,
        alertType: 'task_overdue',
        severity: 'warning',
        title: `Task overdue`,
        body: `Task ${data.taskId} is past its due date.`,
        sourceEntityType: 'task',
        sourceEntityId: data.taskId,
        deduplicationKey: `task_overdue:${data.taskId}`,
      });
    });

    // IAS-P v2.0 red flags detected → create alert based on urgency
    eventBus.on('score.red_flags_detected', async (data) => {
      const severity = data.urgency === 'urgent_care_planning' ? 'critical' : 'warning';
      const flagList = data.redFlags.join(', ').replace(/_/g, ' ');
      await this.createAlert({
        patientId: data.patientId,
        alertType: 'red_flag_assessment',
        severity,
        title: `IAS-P Red Flags: ${data.urgency.replace(/_/g, ' ')}`,
        body: `${data.redFlags.length} red flag(s) detected: ${flagList}`,
        sourceEntityType: 'aging_score',
        sourceEntityId: data.scoreId,
        deduplicationKey: `red_flag:${data.patientId}:${data.scoreId}`,
      });
    });

    // Task completed → resolve linked alerts
    eventBus.on('task.completed', async (data) => {
      await queryClient`
        UPDATE alerts SET status = 'resolved', resolved_at = NOW()
        WHERE source_entity_type = 'task'
          AND source_entity_id = ${data.taskId}
          AND status != 'resolved'
      `;
    });
  }

  async createAlert(data: {
    patientId: string;
    alertType: string;
    severity: string;
    title: string;
    body?: string;
    sourceEntityType?: string;
    sourceEntityId?: string;
    deduplicationKey?: string;
  }) {
    // Check for duplicate alert if deduplication key is provided
    if (data.deduplicationKey) {
      const existing = await queryClient`
        SELECT id FROM alerts WHERE deduplication_key = ${data.deduplicationKey} AND status != 'resolved' LIMIT 1
      `;
      if (existing.length > 0) {
        logger.debug({ deduplicationKey: data.deduplicationKey }, 'Alert deduplicated — skipping');
        return existing[0];
      }
    }

    const [alert] = await db.insert(alerts).values({
      patientId: data.patientId,
      alertType: data.alertType,
      severity: data.severity,
      title: data.title,
      body: data.body,
      sourceEntityType: data.sourceEntityType,
      sourceEntityId: data.sourceEntityId,
      deduplicationKey: data.deduplicationKey,
      status: 'open',
    }).returning();

    eventBus.emit('alert.created', {
      alertId: alert.id,
      patientId: data.patientId,
      severity: data.severity,
      alertType: data.alertType,
    });

    logger.info({ alertId: alert.id, patientId: data.patientId, alertType: data.alertType, severity: data.severity }, 'Alert created');
    return alert;
  }

  async listAlerts(query: { page: number; limit: number; patientId?: string; status?: string; severity?: string }) {
    const offset = (query.page - 1) * query.limit;
    let conditions: any[] = [];

    if (query.patientId) conditions.push(eq(alerts.patientId, query.patientId));
    if (query.status) conditions.push(eq(alerts.status, query.status));
    if (query.severity) conditions.push(eq(alerts.severity, query.severity));

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const [totalResult] = await db.select({ count: count() }).from(alerts).where(whereClause);
    const data = await db.select().from(alerts).where(whereClause)
      .orderBy(desc(alerts.triggeredAt)).limit(query.limit).offset(offset);

    return { data, total: totalResult.count };
  }

  async acknowledgeAlert(alertId: string, userId: string) {
    const [alert] = await db.select().from(alerts).where(eq(alerts.id, alertId)).limit(1);
    if (!alert) throw new NotFoundError('Alert', alertId);
    if (alert.status === 'resolved') throw new BusinessRuleError('Alert is already resolved');

    const [updated] = await db.update(alerts).set({
      status: 'acknowledged',
      acknowledgedBy: userId,
      acknowledgedAt: new Date(),
    }).where(eq(alerts.id, alertId)).returning();

    return updated;
  }

  async resolveAlert(alertId: string) {
    const [alert] = await db.select().from(alerts).where(eq(alerts.id, alertId)).limit(1);
    if (!alert) throw new NotFoundError('Alert', alertId);

    const [updated] = await db.update(alerts).set({
      status: 'resolved',
      resolvedAt: new Date(),
    }).where(eq(alerts.id, alertId)).returning();

    return updated;
  }

  // Alert rules CRUD
  async createAlertRule(patientId: string | null, data: {
    parameterType: string;
    condition: string;
    thresholdValue: number;
    severity: string;
  }, createdBy: string) {
    const [rule] = await db.insert(alertRules).values({
      patientId,
      parameterType: data.parameterType,
      condition: data.condition,
      thresholdValue: data.thresholdValue.toString(),
      severity: data.severity,
      createdBy,
    }).returning();

    return rule;
  }

  async listAlertRules(patientId: string) {
    const rules = await queryClient`
      SELECT * FROM alert_rules
      WHERE (patient_id = ${patientId} OR patient_id IS NULL) AND is_active = true
      ORDER BY parameter_type
    `;
    return rules;
  }
}

const alertService = new AlertService();
export { alertService };

// ─── Routes ─────────────────────────────────────────────
export const alertRoutes = new Hono();
alertRoutes.use('*', authMiddleware);

// GET /alerts
alertRoutes.get('/', async (c) => {
  const page = parseInt(c.req.query('page') || '1');
  const limit = parseInt(c.req.query('limit') || '20');
  const { data, total } = await alertService.listAlerts({
    page, limit,
    patientId: c.req.query('patient_id'),
    status: c.req.query('status'),
    severity: c.req.query('severity'),
  });
  return c.json(paginatedResponse(data, page, limit, total));
});

// GET /alerts/:id
alertRoutes.get('/:id', async (c) => {
  const [alert] = await db.select().from(alerts).where(eq(alerts.id, c.req.param('id'))).limit(1);
  if (!alert) throw new NotFoundError('Alert', c.req.param('id'));
  return c.json(successResponse(alert));
});

// POST /alerts/:id/acknowledge
alertRoutes.post('/:id/acknowledge', async (c) => {
  const user = c.get('user');
  const alert = await alertService.acknowledgeAlert(c.req.param('id'), user.userId);
  return c.json(successResponse(alert));
});

// POST /alerts/:id/resolve
alertRoutes.post('/:id/resolve', async (c) => {
  const alert = await alertService.resolveAlert(c.req.param('id'));
  return c.json(successResponse(alert));
});

// Patient-scoped alert routes
export const patientAlertRoutes = new Hono();
patientAlertRoutes.use('*', authMiddleware);

// GET /patients/:id/alerts
patientAlertRoutes.get('/', async (c) => {
  const page = parseInt(c.req.query('page') || '1');
  const limit = parseInt(c.req.query('limit') || '20');
  const { data, total } = await alertService.listAlerts({
    page, limit, patientId: c.req.param('id'),
    status: c.req.query('status'),
  });
  return c.json(paginatedResponse(data, page, limit, total));
});

// GET /patients/:id/alert-rules
patientAlertRoutes.get('/alert-rules', async (c) => {
  const rules = await alertService.listAlertRules(c.req.param('id')!);
  return c.json(successResponse(rules));
});

// POST /patients/:id/alert-rules
patientAlertRoutes.post('/alert-rules', requirePermission('alert_rules.configure'), async (c) => {
  const body = await c.req.json();
  const user = c.get('user');
  const rule = await alertService.createAlertRule(c.req.param('id')!, body, user.userId);
  return c.json(successResponse(rule), 201);
});
