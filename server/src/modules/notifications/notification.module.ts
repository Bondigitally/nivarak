/**
 * NotificationModule — Dispatcher + In-App Adapter (Phase 1)
 *
 * Routes notifications to appropriate channel adapters.
 * Phase 1: in-app + console logging (WhatsApp/SMS stubs ready).
 */

import { Hono } from 'hono';
import { eq, desc, count, and } from 'drizzle-orm';
import { db, queryClient } from '../../db/connection.js';
import { notifications } from '../../db/schema/index.js';
import { eventBus } from '../../shared/event-bus.js';
import { logger } from '../../shared/logger.js';
import { authMiddleware } from '../../middleware/auth.js';
import { successResponse, paginatedResponse } from '../../shared/response.js';

// ─── Channel Adapters (Phase 1: stubs) ─────────────────
interface NotificationPayload {
  recipientUserId: string;
  type: string;
  channel: string;
  payload: Record<string, any>;
  relatedAlertId?: string;
  relatedTaskId?: string;
}

async function sendInApp(data: NotificationPayload) {
  const [notif] = await db.insert(notifications).values({
    recipientUserId: data.recipientUserId,
    channel: 'in_app',
    type: data.type,
    status: 'delivered',
    payload: data.payload,
    sentAt: new Date(),
    deliveredAt: new Date(),
    relatedAlertId: data.relatedAlertId,
    relatedTaskId: data.relatedTaskId,
  }).returning();
  return notif;
}

async function sendWhatsApp(data: NotificationPayload) {
  // Phase 1 stub — log to console
  logger.info({ ...data, channel: 'whatsapp' }, '📱 WhatsApp notification (stub — not sent)');

  const [notif] = await db.insert(notifications).values({
    recipientUserId: data.recipientUserId,
    channel: 'whatsapp',
    type: data.type,
    status: 'queued', // Would be 'sent' after actual API call
    payload: data.payload,
    relatedAlertId: data.relatedAlertId,
    relatedTaskId: data.relatedTaskId,
  }).returning();
  return notif;
}

async function sendSMS(data: NotificationPayload) {
  logger.info({ ...data, channel: 'sms' }, '💬 SMS notification (stub — not sent)');
  return null;
}

// ─── Dispatcher ─────────────────────────────────────────
class NotificationService {
  constructor() {
    this.registerEventHandlers();
  }

  private registerEventHandlers() {
    eventBus.on('alert.created', async (data) => {
      // Notify all linked users for this patient
      const linkedUsers = await queryClient`
        SELECT user_id FROM caregiver_links
        WHERE patient_id = ${data.patientId} AND revoked_at IS NULL
      `;

      for (const user of linkedUsers) {
        await this.dispatch({
          recipientUserId: user.user_id,
          type: 'alert',
          channel: 'in_app',
          payload: {
            alertId: data.alertId,
            alertType: data.alertType,
            severity: data.severity,
          },
          relatedAlertId: data.alertId,
        });
      }
    });

    eventBus.on('task.created', async (data) => {
      if (data.assignedTo) {
        await this.dispatch({
          recipientUserId: data.assignedTo,
          type: 'task_assignment',
          channel: 'in_app',
          payload: { taskId: data.taskId, patientId: data.patientId },
          relatedTaskId: data.taskId,
        });
      }
    });
  }

  async dispatch(data: NotificationPayload) {
    try {
      switch (data.channel) {
        case 'in_app':
          return await sendInApp(data);
        case 'whatsapp':
          return await sendWhatsApp(data);
        case 'sms':
          return await sendSMS(data);
        default:
          return await sendInApp(data);
      }
    } catch (err) {
      logger.error({ err, data }, 'Notification dispatch failed');
    }
  }

  async listNotifications(userId: string, page: number, limit: number) {
    const offset = (page - 1) * limit;
    const [totalResult] = await db.select({ count: count() }).from(notifications)
      .where(eq(notifications.recipientUserId, userId));
    const data = await db.select().from(notifications)
      .where(eq(notifications.recipientUserId, userId))
      .orderBy(desc(notifications.sentAt)).limit(limit).offset(offset);
    return { data, total: totalResult.count };
  }

  async markAsRead(notificationId: string, userId: string) {
    await db.update(notifications).set({ status: 'read' })
      .where(and(eq(notifications.id, notificationId), eq(notifications.recipientUserId, userId)));
  }

  async markAllAsRead(userId: string) {
    await queryClient`
      UPDATE notifications SET status = 'read'
      WHERE recipient_user_id = ${userId} AND status != 'read'
    `;
  }
}

const notificationService = new NotificationService();
export { notificationService };

// ─── Routes ─────────────────────────────────────────────
export const notificationRoutes = new Hono();
notificationRoutes.use('*', authMiddleware);

// GET /notifications
notificationRoutes.get('/', async (c) => {
  const user = c.get('user');
  const page = parseInt(c.req.query('page') || '1');
  const limit = parseInt(c.req.query('limit') || '20');
  const { data, total } = await notificationService.listNotifications(user.userId, page, limit);
  return c.json(paginatedResponse(data, page, limit, total));
});

// PUT /notifications/:id/read
notificationRoutes.put('/:id/read', async (c) => {
  const user = c.get('user');
  await notificationService.markAsRead(c.req.param('id'), user.userId);
  return c.json(successResponse({ message: 'Marked as read' }));
});

// PUT /notifications/read-all
notificationRoutes.put('/read-all', async (c) => {
  const user = c.get('user');
  await notificationService.markAllAsRead(user.userId);
  return c.json(successResponse({ message: 'All notifications marked as read' }));
});
