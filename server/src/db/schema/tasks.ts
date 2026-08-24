import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  integer,
  index,
  check,
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { users } from './users.js';
import { patients } from './patients.js';
import { encounters } from './encounters.js';

export const tasks = pgTable(
  'tasks',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    patientId: uuid('patient_id')
      .notNull()
      .references(() => patients.id),
    title: varchar('title', { length: 255 }).notNull(),
    description: text('description'),
    category: varchar('category', { length: 50 }).notNull(),
    priority: varchar('priority', { length: 20 }).default('medium').notNull(),
    status: varchar('status', { length: 20 }).default('created').notNull(),
    assignedTo: uuid('assigned_to').references(() => users.id),
    assignedRole: varchar('assigned_role', { length: 50 }),
    dueAt: timestamp('due_at', { withTimezone: true }),
    createdBy: uuid('created_by')
      .notNull()
      .references(() => users.id),
    sourceEncounterId: uuid('source_encounter_id').references(() => encounters.id),
    sourceAlertId: uuid('source_alert_id'),
    completedAt: timestamp('completed_at', { withTimezone: true }),
    completedBy: uuid('completed_by').references(() => users.id),
    completionNote: text('completion_note'),
    escalationLevel: integer('escalation_level').default(0),
    escalatedAt: timestamp('escalated_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index('tasks_patient_idx').on(table.patientId),
    index('tasks_assigned_status_idx').on(table.assignedTo, table.status),
    index('tasks_due_status_idx').on(table.dueAt, table.status),
    index('tasks_status_idx').on(table.status),
    check('tasks_status_check', sql`${table.status} IN ('created', 'assigned', 'in_progress', 'completed', 'escalated', 'cancelled')`),
    check('tasks_priority_check', sql`${table.priority} IN ('low', 'medium', 'high', 'urgent')`),
    check('tasks_category_check', sql`${table.category} IN ('medication', 'follow_up', 'lab', 'visit', 'equipment', 'other')`),
  ]
);
