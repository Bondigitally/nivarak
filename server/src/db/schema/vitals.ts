import {
  pgTable,
  uuid,
  varchar,
  text,
  boolean,
  timestamp,
  numeric,
  index,
  check,
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { users } from './users.js';
import { patients } from './patients.js';
import { encounters } from './encounters.js';

export const vitals = pgTable(
  'vitals',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    patientId: uuid('patient_id')
      .notNull()
      .references(() => patients.id),
    encounterId: uuid('encounter_id').references(() => encounters.id),
    parameterType: varchar('parameter_type', { length: 50 }).notNull(),
    value: numeric('value', { precision: 10, scale: 2 }).notNull(),
    unit: varchar('unit', { length: 20 }).notNull(),
    recordedAt: timestamp('recorded_at', { withTimezone: true }).notNull(),
    recordedBy: uuid('recorded_by')
      .notNull()
      .references(() => users.id),
    deviceId: uuid('device_id'),
    source: varchar('source', { length: 20 }).default('manual'),
    notes: text('notes'),
    isDeleted: boolean('is_deleted').default(false),
  },
  (table) => [
    index('vitals_patient_param_time_idx').on(
      table.patientId,
      table.parameterType,
      table.recordedAt
    ),
    check('vitals_source_check', sql`${table.source} IN ('manual', 'device', 'imported')`),
  ]
);
