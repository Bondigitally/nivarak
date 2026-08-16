import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  jsonb,
  index,
} from 'drizzle-orm/pg-core';
import { users } from './users.js';

export const notifications = pgTable(
  'notifications',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    recipientUserId: uuid('recipient_user_id')
      .notNull()
      .references(() => users.id),
    channel: varchar('channel', { length: 20 }).notNull(),
    type: varchar('type', { length: 50 }).notNull(),
    status: varchar('status', { length: 20 }).default('queued').notNull(),
    payload: jsonb('payload'),
    providerMessageId: varchar('provider_message_id', { length: 255 }),
    sentAt: timestamp('sent_at', { withTimezone: true }),
    deliveredAt: timestamp('delivered_at', { withTimezone: true }),
    failedReason: text('failed_reason'),
    relatedAlertId: uuid('related_alert_id'),
    relatedTaskId: uuid('related_task_id'),
  },
  (table) => [
    index('notifications_recipient_idx').on(table.recipientUserId),
    index('notifications_status_idx').on(table.status),
  ]
);
