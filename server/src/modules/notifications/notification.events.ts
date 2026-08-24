import { eventBus } from '../../shared/event-bus.js';
import { notificationService } from './notification.service.js';

export function registerNotificationHandlers(): void {
  eventBus.on('alert.created', async (data) => {
    const linkedUserIds = await notificationService.listLinkedUserIds(data.patientId);
    await Promise.all(linkedUserIds.map((userId) =>
      notificationService.dispatch({
        recipientUserId: userId,
        type: 'alert',
        channel: 'in_app',
        payload: {
          alertId: data.alertId,
          alertType: data.alertType,
          severity: data.severity,
        },
        relatedAlertId: data.alertId,
      })
    ));
  });

  eventBus.on('task.created', async (data) => {
    if (data.assignedTo) {
      await notificationService.dispatch({
        recipientUserId: data.assignedTo,
        type: 'task_assignment',
        channel: 'in_app',
        payload: { taskId: data.taskId, patientId: data.patientId },
        relatedTaskId: data.taskId,
      });
    }
  });
}
