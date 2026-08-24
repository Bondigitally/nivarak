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

export const alerts = pgTable(
  'alerts',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    patientId: uuid('patient_id')
      .notNull()
      .references(() => patients.id),
    alertType: varchar('alert_type', { length: 50 }).notNull(),
    severity: varchar('severity', { length: 20 }).notNull(),
    status: varchar('status', { length: 20 }).default('open').notNull(),
    title: varchar('title', { length: 255 }).notNull(),
    body: text('body'),
    sourceEntityType: varchar('source_entity_type', { length: 50 }),
    sourceEntityId: uuid('source_entity_id'),
    deduplicationKey: varchar('deduplication_key', { length: 255 }),
    triggeredAt: timestamp('triggered_at', { withTimezone: true }).defaultNow().notNull(),
    acknowledgedBy: uuid('acknowledged_by').references(() => users.id),
    acknowledgedAt: timestamp('acknowledged_at', { withTimezone: true }),
    resolvedAt: timestamp('resolved_at', { withTimezone: true }),
    autoResolve: boolean('auto_resolve').default(false),
  },
  (table) => [
    index('alerts_patient_status_idx').on(table.patientId, table.status),
    index('alerts_severity_status_idx').on(table.severity, table.status),
    index('alerts_triggered_at_idx').on(table.triggeredAt),
    index('alerts_dedup_key_idx').on(table.deduplicationKey),
    check('alerts_severity_check', sql`${table.severity} IN ('info', 'warning', 'critical')`),
    check('alerts_status_check', sql`${table.status} IN ('open', 'acknowledged', 'resolved')`),
  ]
);

export const alertRules = pgTable(
  'alert_rules',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    patientId: uuid('patient_id').references(() => patients.id),
    parameterType: varchar('parameter_type', { length: 50 }).notNull(),
    condition: varchar('condition', { length: 20 }).notNull(),
    thresholdValue: numeric('threshold_value', { precision: 10, scale: 2 }).notNull(),
    severity: varchar('severity', { length: 20 }).notNull(),
    createdBy: uuid('created_by')
      .notNull()
      .references(() => users.id),
    isActive: boolean('is_active').default(true).notNull(),
  },
  (table) => [
    index('alert_rules_patient_param_idx').on(table.patientId, table.parameterType),
    check('alert_rules_condition_check', sql`${table.condition} IN ('lt', 'gt', 'lte', 'gte')`),
    check('alert_rules_severity_check', sql`${table.severity} IN ('info', 'warning', 'critical')`),
  ]
);
