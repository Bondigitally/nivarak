import { db } from '../../db/connection.js';
import { auditLogs } from '../../db/schema/index.js';
import { logger } from '../../shared/logger.js';

export interface AuditEntry {
  actorId?: string;
  actorRole?: string;
  action: string;
  entityType: string;
  entityId?: string;
  patientId?: string;
  oldValue?: unknown;
  newValue?: unknown;
  ipAddress?: string;
  userAgent?: string;
}

class AuditService {
  async log(entry: AuditEntry) {
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
      logger.error({ err, entry }, 'Failed to write audit log');
    }
  }
}

export const auditService = new AuditService();
