/**
 * Nivarak — In-Process Event Bus (Phase 1)
 *
 * Typed EventEmitter for internal domain events.
 * In Phase 2, these become message queue events (SQS / BullMQ).
 */

import { EventEmitter } from 'events';
import { logger } from './logger.js';

export interface DomainEvents {
  'patient.created': { patientId: string; createdBy: string };
  'caregiver.linked': { patientId: string; caregiverId: string; grantedBy: string };
  'visit.completed': { visitId: string; patientId: string; completedBy: string };
  'vital.recorded': { vitalId: string; patientId: string; parameterType: string; value: number; recordedBy: string };
  'vital.threshold_breached': { patientId: string; parameterType: string; value: number; threshold: number; severity: string };
  'score.submitted': { scoreId: string; patientId: string; totalScore: number; riskBand: string; assessedBy: string };
  'risk_band.changed': { patientId: string; previousBand: string; newBand: string; scoreId: string };
  'task.created': { taskId: string; patientId: string; assignedTo: string | null; createdBy: string };
  'task.overdue': { taskId: string; patientId: string; assignedTo: string | null };
  'task.completed': { taskId: string; patientId: string; completedBy: string };
  'alert.created': { alertId: string; patientId: string; severity: string; alertType: string };
  'alert.escalated': { alertId: string; patientId: string; escalationLevel: number };
  'document.uploaded': { documentId: string; patientId: string; uploadedBy: string };
  'user.login': { userId: string; ip: string; userAgent: string };
  'user.login_failed': { phone: string; ip: string; reason: string };
}

class TypedEventBus {
  private emitter = new EventEmitter();

  constructor() {
    this.emitter.setMaxListeners(50);
  }

  emit<K extends keyof DomainEvents>(event: K, data: DomainEvents[K]): void {
    logger.debug({ event, data }, `Event emitted: ${event}`);
    this.emitter.emit(event, data);
  }

  on<K extends keyof DomainEvents>(event: K, handler: (data: DomainEvents[K]) => void | Promise<void>): void {
    this.emitter.on(event, async (data) => {
      try {
        await handler(data);
      } catch (err) {
        logger.error({ event, data, err }, `Error handling event: ${event}`);
      }
    });
  }

  off<K extends keyof DomainEvents>(event: K, handler: (data: DomainEvents[K]) => void): void {
    this.emitter.off(event, handler);
  }
}

export const eventBus = new TypedEventBus();
