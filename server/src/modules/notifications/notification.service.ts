import { eq, desc, count, and } from 'drizzle-orm';
import { db, queryClient } from '../../db/connection.js';
import { notifications } from '../../db/schema/index.js';
import { logger } from '../../shared/logger.js';

export interface NotificationPayload {
  recipientUserId: string;
  type: string;
  channel: string;
  payload: Record<string, unknown>;
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
  logger.info({ ...data, channel: 'whatsapp' }, 'WhatsApp notification (stub — not sent)');

  const [notif] = await db.insert(notifications).values({
    recipientUserId: data.recipientUserId,
    channel: 'whatsapp',
    type: data.type,
    status: 'queued',
    payload: data.payload,
    relatedAlertId: data.relatedAlertId,
    relatedTaskId: data.relatedTaskId,
  }).returning();
  return notif;
}

async function sendSMS(data: NotificationPayload) {
  logger.info({ ...data, channel: 'sms' }, 'SMS notification (stub — not sent)');
  return null;
}

class NotificationService {
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

  async listLinkedUserIds(patientId: string): Promise<string[]> {
    const linkedUsers = await queryClient`
      SELECT user_id FROM caregiver_links
      WHERE patient_id = ${patientId} AND revoked_at IS NULL
    `;
    return (linkedUsers as unknown as { user_id: string }[]).map((u) => u.user_id);
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

export const notificationService = new NotificationService();
