import { eq, and, desc, count } from 'drizzle-orm';
import { db, queryClient } from '../../db/connection.js';
import { alerts, alertRules } from '../../db/schema/index.js';
import { eventBus } from '../../shared/event-bus.js';
import { logger } from '../../shared/logger.js';
import { NotFoundError, BusinessRuleError } from '../../shared/errors.js';

export interface CreateAlertInput {
  patientId: string;
  alertType: string;
  severity: string;
  title: string;
  body?: string;
  sourceEntityType?: string;
  sourceEntityId?: string;
  deduplicationKey?: string;
}

class AlertService {
  async createAlert(data: CreateAlertInput) {
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
    const conditions = [];

    if (query.patientId) conditions.push(eq(alerts.patientId, query.patientId));
    if (query.status) conditions.push(eq(alerts.status, query.status));
    if (query.severity) conditions.push(eq(alerts.severity, query.severity));

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const [totalResult] = await db.select({ count: count() }).from(alerts).where(whereClause);
    const data = await db.select().from(alerts).where(whereClause)
      .orderBy(desc(alerts.triggeredAt)).limit(query.limit).offset(offset);

    return { data, total: totalResult.count };
  }

  async getAlert(alertId: string) {
    const [alert] = await db.select().from(alerts).where(eq(alerts.id, alertId)).limit(1);
    if (!alert) throw new NotFoundError('Alert', alertId);
    return alert;
  }

  async acknowledgeAlert(alertId: string, userId: string) {
    const alert = await this.getAlert(alertId);
    if (alert.status === 'resolved') throw new BusinessRuleError('Alert is already resolved');

    const [updated] = await db.update(alerts).set({
      status: 'acknowledged',
      acknowledgedBy: userId,
      acknowledgedAt: new Date(),
    }).where(eq(alerts.id, alertId)).returning();

    return updated;
  }

  async resolveAlert(alertId: string) {
    await this.getAlert(alertId);

    const [updated] = await db.update(alerts).set({
      status: 'resolved',
      resolvedAt: new Date(),
    }).where(eq(alerts.id, alertId)).returning();

    return updated;
  }

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
    return queryClient`
      SELECT * FROM alert_rules
      WHERE (patient_id = ${patientId} OR patient_id IS NULL) AND is_active = true
      ORDER BY parameter_type
    `;
  }

  async resolveAlertsForTask(taskId: string) {
    await queryClient`
      UPDATE alerts SET status = 'resolved', resolved_at = NOW()
      WHERE source_entity_type = 'task'
        AND source_entity_id = ${taskId}
        AND status != 'resolved'
    `;
  }
}

export const alertService = new AlertService();
