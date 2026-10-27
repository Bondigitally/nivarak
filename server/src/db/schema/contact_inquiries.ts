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
 * Public “Contact Us” form submissions only.
 * Book-consultation requests live in `booking_inquiries`.
 */
export const contactInquiries = pgTable(
  'contact_inquiries',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    name: varchar('name', { length: 80 }).notNull(),
    email: varchar('email', { length: 254 }).notNull(),
    phone: varchar('phone', { length: 32 }).notNull(),
    subject: varchar('subject', { length: 120 }),
    message: text('message').notNull(),
    status: varchar('status', { length: 20 }).notNull().default('new'),
    createdAt: timestamp('created_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    check(
      'contact_inquiries_status_check',
      sql`${table.status} IN ('new', 'reviewed', 'closed')`,
    ),
    index('contact_inquiries_created_at_idx').on(table.createdAt),
    index('contact_inquiries_status_idx').on(table.status),
  ],
);
