import {
  pgTable,
  uuid,
  varchar,
  timestamp,
  integer,
  numeric,
  jsonb,
  index,
  uniqueIndex,
  check,
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { users } from './users.js';

/** Mirrors client `IaspAboutYouValues` for guest IASP sessions. */
export type IaspGuestAboutYou = {
  relationship: string | null;
  age: string;
  location: string | null;
  visitFrequency: string | null;
  livingSituation: string | null;
  livingSituationOther: string;
};

export const iaspGuestSessions = pgTable(
  'iasp_guest_sessions',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    status: varchar('status', { length: 20 }).notNull().default('in_progress'),
    createdAt: timestamp('created_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
    expiresAt: timestamp('expires_at', { withTimezone: true }),
    completedAt: timestamp('completed_at', { withTimezone: true }),

    aboutYou: jsonb('about_you')
      .$type<IaspGuestAboutYou>()
      .notNull()
      .default({
        relationship: null,
        age: '',
        location: null,
        visitFrequency: null,
        livingSituation: null,
        livingSituationOther: '',
      }),
    answers: jsonb('answers').$type<Record<string, string>>().notNull().default({}),
    redFlags: jsonb('red_flags').$type<string[]>().notNull().default([]),
    flowStep: varchar('flow_step', { length: 20 }),
    pageIndex: integer('page_index').notNull().default(0),

    rawScore: integer('raw_score'),
    maxScore: integer('max_score'),
    iasPercentage: numeric('ias_percentage', { precision: 5, scale: 2 }),
    riskBand: varchar('risk_band', { length: 30 }),
    redFlagCount: integer('red_flag_count').notNull().default(0),
    redFlagUrgency: varchar('red_flag_urgency', { length: 30 }),

    detailedReportUnlockedAt: timestamp('detailed_report_unlocked_at', {
      withTimezone: true,
    }),
    /**
     * Denormalized cache of the latest order / the payment that unlocked the
     * report. Payment rows in `iasp_report_payments` are the source of truth.
     */
    razorpayOrderId: varchar('razorpay_order_id', { length: 100 }),
    razorpayPaymentId: varchar('razorpay_payment_id', { length: 100 }),

    /** One key per explicit Start / Start new action. Replay returns this row. */
    idempotencyKey: varchar('idempotency_key', { length: 64 }),
    /** SHA-256 hex of the client-held access token. Null on legacy rows. */
    accessTokenHash: varchar('access_token_hash', { length: 64 }),
    /** Report purchaser, collected at checkout. Not copied onto payment rows. */
    fullName: varchar('full_name', { length: 255 }),
    phoneNumber: varchar('phone_number', { length: 32 }),
    email: varchar('email', { length: 255 }),

    privacyConsentAt: timestamp('privacy_consent_at', { withTimezone: true }),
    userId: uuid('user_id').references(() => users.id),
  },
  (table) => [
    check(
      'iasp_guest_sessions_status_check',
      sql`${table.status} IN ('in_progress', 'completed', 'abandoned', 'superseded', 'expired')`,
    ),
    index('iasp_guest_sessions_expires_at_idx').on(table.expiresAt),
    index('iasp_guest_sessions_status_idx').on(table.status),
    uniqueIndex('iasp_guest_sessions_razorpay_order_id_unique').on(
      table.razorpayOrderId,
    ),
    uniqueIndex('iasp_guest_sessions_razorpay_payment_id_unique').on(
      table.razorpayPaymentId,
    ),
    uniqueIndex('iasp_guest_sessions_idempotency_key_unique').on(table.idempotencyKey),
    uniqueIndex('iasp_guest_sessions_access_token_hash_unique').on(table.accessTokenHash),
  ],
);
