import { sql } from 'drizzle-orm';
import {
  check,
  index,
  integer,
  jsonb,
  pgTable,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';

import { iaspGuestSessions } from './iasp_guest_sessions.js';

/** One Razorpay order. Attempt ids are appended; rows are not overwritten away. */
export type IaspPaymentAttempt = {
  paymentId: string;
  outcome: 'paid' | 'failed';
  at: string;
};

/**
 * One row per Razorpay order for an IAS-P detailed report.
 * Separate from assessment status so a failed attempt stays retryable
 * without losing the completed assessment.
 */
export const iaspReportPayments = pgTable(
  'iasp_report_payments',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    sessionId: uuid('session_id')
      .notNull()
      .references(() => iaspGuestSessions.id, { onDelete: 'restrict' }),
    razorpayOrderId: varchar('razorpay_order_id', { length: 100 }).notNull(),
    razorpayPaymentId: varchar('razorpay_payment_id', { length: 100 }),
    status: varchar('status', { length: 20 }).notNull().default('created'),
    amountPaise: integer('amount_paise').notNull(),
    currency: varchar('currency', { length: 3 }).notNull(),
    product: varchar('product', { length: 64 }).notNull().default('iasp_detailed_report'),
    paymentAttempts: jsonb('payment_attempts')
      .$type<IaspPaymentAttempt[]>()
      .notNull()
      .default([]),
    verifiedAt: timestamp('verified_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    check(
      'iasp_report_payments_status_check',
      sql`${table.status} IN ('created', 'pending', 'paid', 'failed', 'cancelled')`,
    ),
    uniqueIndex('iasp_report_payments_order_id_unique').on(table.razorpayOrderId),
    uniqueIndex('iasp_report_payments_payment_id_unique').on(table.razorpayPaymentId),
    uniqueIndex('iasp_report_payments_one_open_idx')
      .on(table.sessionId)
      .where(sql`${table.status} IN ('created', 'pending')`),
    uniqueIndex('iasp_report_payments_one_paid_idx')
      .on(table.sessionId)
      .where(sql`${table.status} = 'paid'`),
    index('iasp_report_payments_session_id_idx').on(table.sessionId),
  ],
);

/** Dedupes Razorpay webhook deliveries. Payload bodies are not stored. */
export const iaspPaymentWebhookEvents = pgTable(
  'iasp_payment_webhook_events',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    eventId: varchar('event_id', { length: 255 }).notNull(),
    eventType: varchar('event_type', { length: 64 }).notNull(),
    razorpayOrderId: varchar('razorpay_order_id', { length: 100 }),
    razorpayPaymentId: varchar('razorpay_payment_id', { length: 100 }),
    receivedAt: timestamp('received_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex('iasp_payment_webhook_events_event_id_unique').on(table.eventId),
  ],
);
