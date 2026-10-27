import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  index,
  check,
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

/**
 * Consultation booking interest (IAS-P / marketing).
 * Slot columns are nullable until the booked-slot modal + server confirmation ship.
 */
export const bookingInquiries = pgTable(
  'booking_inquiries',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    name: varchar('name', { length: 80 }).notNull(),
    email: varchar('email', { length: 254 }).notNull(),
    phone: varchar('phone', { length: 32 }).notNull(),
    message: text('message').notNull(),
    /** Reserved for future slot booking — unused by the current lead form. */
    preferredSlotStart: timestamp('preferred_slot_start', { withTimezone: true }),
    preferredSlotEnd: timestamp('preferred_slot_end', { withTimezone: true }),
    status: varchar('status', { length: 20 }).notNull().default('new'),
    createdAt: timestamp('created_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    check(
      'booking_inquiries_status_check',
      sql`${table.status} IN ('new', 'reviewed', 'scheduled', 'closed')`,
    ),
    index('booking_inquiries_created_at_idx').on(table.createdAt),
    index('booking_inquiries_status_idx').on(table.status),
  ],
);
