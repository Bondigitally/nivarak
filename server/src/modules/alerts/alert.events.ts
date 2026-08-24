import { eventBus } from '../../shared/event-bus.js';
import { alertService } from './alert.service.js';

export function registerAlertHandlers(): void {
  eventBus.on('vital.threshold_breached', async (data) => {
    await alertService.createAlert({
      patientId: data.patientId,
      alertType: 'vital_threshold',
      severity: data.severity,
      title: `${data.parameterType} threshold breached`,
      body: `Value: ${data.value} (threshold: ${data.threshold})`,
      sourceEntityType: 'vital',
    });
  });

  eventBus.on('risk_band.changed', async (data) => {
    await alertService.createAlert({
      patientId: data.patientId,
      alertType: 'risk_escalation',
      severity: data.newBand === 'critical' ? 'critical' : 'warning',
      title: `Risk band changed: ${data.previousBand} → ${data.newBand}`,
      body: `Patient risk has ${data.newBand > data.previousBand ? 'increased' : 'decreased'}.`,
      sourceEntityType: 'score',
      sourceEntityId: data.scoreId,
    });
  });

  eventBus.on('task.overdue', async (data) => {
    await alertService.createAlert({
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

  eventBus.on('score.red_flags_detected', async (data) => {
    const severity = data.urgency === 'urgent_care_planning' ? 'critical' : 'warning';
    const flagList = data.redFlags.join(', ').replace(/_/g, ' ');
    await alertService.createAlert({
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

  eventBus.on('task.completed', async (data) => {
    await alertService.resolveAlertsForTask(data.taskId);
  });
}
