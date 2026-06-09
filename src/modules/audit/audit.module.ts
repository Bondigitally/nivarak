/**
 * AuditModule — Immutable Audit Log Service
 *
 * Listens to all domain events and writes append-only audit records.
 * No UPDATE or DELETE on audit_logs table.
 */

import { Hono } from 'hono';
import { desc, eq, and, count } from 'drizzle-orm';
import { db } from '../../db/connection.js';
import { auditLogs } from '../../db/schema/index.js';
import { eventBus } from '../../shared/event-bus.js';
import { logger } from '../../shared/logger.js';
import { authMiddleware, requireRoles } from '../../middleware/auth.js';
import { successResponse, paginatedResponse } from '../../shared/response.js';

class AuditService {
  constructor() {
    this.registerEventHandlers();
  }

  private registerEventHandlers() {
    eventBus.on('patient.created', (data) => {
      this.log({
        actorId: data.createdBy,
        action: 'patient.create',
        entityType: 'patient',
        entityId: data.patientId,
        patientId: data.patientId,
      });
    });

    eventBus.on('caregiver.linked', (data) => {
      this.log({
        actorId: data.grantedBy,
        action: 'caregiver.link',
        entityType: 'caregiver_link',
        patientId: data.patientId,
        newValue: { caregiverId: data.caregiverId },
      });
    });

    eventBus.on('visit.completed', (data) => {
      this.log({
        actorId: data.completedBy,
        action: 'visit.complete',
        entityType: 'visit',
        entityId: data.visitId,
        patientId: data.patientId,
      });
    });

    eventBus.on('vital.recorded', (data) => {
      this.log({
        actorId: data.recordedBy,
        action: 'vital.record',
        entityType: 'vital',
        entityId: data.vitalId,
        patientId: data.patientId,
        newValue: { parameterType: data.parameterType, value: data.value },
      });
    });

    eventBus.on('score.submitted', (data) => {
      this.log({
        actorId: data.assessedBy,
        action: 'score.submit',
        entityType: 'aging_score',
        entityId: data.scoreId,
        patientId: data.patientId,
        newValue: { totalScore: data.totalScore, riskBand: data.riskBand },
      });
    });

    eventBus.on('risk_band.changed', (data) => {
      this.log({
        action: 'risk_band.change',
        entityType: 'patient',
        entityId: data.patientId,
        patientId: data.patientId,
        oldValue: { riskBand: data.previousBand },
        newValue: { riskBand: data.newBand },
      });
    });

    eventBus.on('task.created', (data) => {
      this.log({
        actorId: data.createdBy,
        action: 'task.create',
        entityType: 'task',
        entityId: data.taskId,
        patientId: data.patientId,
      });
    });

    eventBus.on('task.completed', (data) => {
      this.log({
        actorId: data.completedBy,
        action: 'task.complete',
        entityType: 'task',
        entityId: data.taskId,
        patientId: data.patientId,
      });
    });

    eventBus.on('document.uploaded', (data) => {
      this.log({
        actorId: data.uploadedBy,
        action: 'document.upload',
        entityType: 'document',
        entityId: data.documentId,
        patientId: data.patientId,
      });
    });

    eventBus.on('user.login', (data) => {
      this.log({
        actorId: data.userId,
        action: 'user.login',
        entityType: 'session',
        ipAddress: data.ip,
        userAgent: data.userAgent,
      });
    });

    eventBus.on('user.login_failed', (data) => {
      this.log({
        action: 'user.login_failed',
        entityType: 'session',
        ipAddress: data.ip,
        newValue: { phone: data.phone, reason: data.reason },
      });
    });
  }

  async log(entry: {
    actorId?: string;
    actorRole?: string;
    action: string;
    entityType: string;
    entityId?: string;
    patientId?: string;
    oldValue?: any;
    newValue?: any;
    ipAddress?: string;
    userAgent?: string;
  }) {
    try {
      await db.insert(auditLogs).values({
        actorId: entry.actorId,
        actorRole: entry.actorRole,
        action: entry.action,
        entityType: entry.entityType,
        entityId: entry.entityId,
        patientId: entry.patientId,
        oldValue: entry.oldValue,
        newValue: entry.newValue,
        ipAddress: entry.ipAddress,
        userAgent: entry.userAgent,
      });
    } catch (err) {
      // Audit log failures should never crash the system
      logger.error({ err, entry }, 'Failed to write audit log');
    }
  }
}

const auditService = new AuditService();
export { auditService };

// ─── Routes (Admin only) ────────────────────────────────
export const auditRoutes = new Hono();
auditRoutes.use('*', authMiddleware);
auditRoutes.use('*', requireRoles('admin'));

// GET /audit-logs
auditRoutes.get('/', async (c) => {
  const page = parseInt(c.req.query('page') || '1');
  const limit = parseInt(c.req.query('limit') || '20');
  const offset = (page - 1) * limit;

  let conditions: any[] = [];
  const entityType = c.req.query('entity_type');
  const entityId = c.req.query('entity_id');
  const actorId = c.req.query('actor_id');
  const patientId = c.req.query('patient_id');

  if (entityType) conditions.push(eq(auditLogs.entityType, entityType));
  if (entityId) conditions.push(eq(auditLogs.entityId, entityId));
  if (actorId) conditions.push(eq(auditLogs.actorId, actorId));
  if (patientId) conditions.push(eq(auditLogs.patientId, patientId));

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  const [totalResult] = await db.select({ count: count() }).from(auditLogs).where(whereClause);
  const data = await db.select().from(auditLogs).where(whereClause)
    .orderBy(desc(auditLogs.occurredAt)).limit(limit).offset(offset);

  return c.json(paginatedResponse(data, page, limit, totalResult.count));
});
