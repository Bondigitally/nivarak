import { eventBus } from '../../shared/event-bus.js';
import { auditService } from './audit.service.js';

export function registerAuditHandlers(): void {
  eventBus.on('patient.created', (data) => {
    void auditService.log({
      actorId: data.createdBy,
      action: 'patient.create',
      entityType: 'patient',
      entityId: data.patientId,
      patientId: data.patientId,
    });
  });

  eventBus.on('caregiver.linked', (data) => {
    void auditService.log({
      actorId: data.grantedBy,
      action: 'caregiver.link',
      entityType: 'caregiver_link',
      patientId: data.patientId,
      newValue: { caregiverId: data.caregiverId },
    });
  });

  eventBus.on('encounter.completed', (data) => {
    void auditService.log({
      actorId: data.completedBy,
      action: 'encounter.complete',
      entityType: 'encounter',
      entityId: data.encounterId,
      patientId: data.patientId,
    });
  });

  eventBus.on('encounter.amended', (data) => {
    void auditService.log({
      action: 'encounter.amend',
      entityType: 'encounter',
      entityId: data.encounterId,
      patientId: data.patientId,
      oldValue: { originalId: data.originalId },
    });
  });

  eventBus.on('vital.recorded', (data) => {
    void auditService.log({
      actorId: data.recordedBy,
      action: 'vital.record',
      entityType: 'vital',
      entityId: data.vitalId,
      patientId: data.patientId,
      newValue: { parameterType: data.parameterType, value: data.value },
    });
  });

  eventBus.on('score.submitted', (data) => {
    void auditService.log({
      actorId: data.assessedBy,
      action: 'score.submit',
      entityType: 'aging_score',
      entityId: data.scoreId,
      patientId: data.patientId,
      newValue: {
        iasPercentage: data.iasPercentage,
        rawScore: data.rawScore,
        riskBand: data.riskBand,
        redFlagCount: data.redFlagCount,
      },
    });
  });

  eventBus.on('risk_band.changed', (data) => {
    void auditService.log({
      action: 'risk_band.change',
      entityType: 'patient',
      entityId: data.patientId,
      patientId: data.patientId,
      oldValue: { riskBand: data.previousBand },
      newValue: { riskBand: data.newBand },
    });
  });

  eventBus.on('task.created', (data) => {
    void auditService.log({
      actorId: data.createdBy,
      action: 'task.create',
      entityType: 'task',
      entityId: data.taskId,
      patientId: data.patientId,
    });
  });

  eventBus.on('task.completed', (data) => {
    void auditService.log({
      actorId: data.completedBy,
      action: 'task.complete',
      entityType: 'task',
      entityId: data.taskId,
      patientId: data.patientId,
    });
  });

  eventBus.on('document.uploaded', (data) => {
    void auditService.log({
      actorId: data.uploadedBy,
      action: 'document.upload',
      entityType: 'document',
      entityId: data.documentId,
      patientId: data.patientId,
    });
  });

  eventBus.on('user.login', (data) => {
    void auditService.log({
      actorId: data.userId,
      action: 'user.login',
      entityType: 'session',
      ipAddress: data.ip,
      userAgent: data.userAgent,
    });
  });

  eventBus.on('user.login_failed', (data) => {
    void auditService.log({
      action: 'user.login_failed',
      entityType: 'session',
      ipAddress: data.ip,
      newValue: { phone: data.phone, reason: data.reason },
    });
  });

  eventBus.on('user.password_reset', (data) => {
    void auditService.log({
      actorId: data.userId,
      action: 'user.password_reset',
      entityType: 'user',
      entityId: data.userId,
    });
  });
}
