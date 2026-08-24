import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  numeric,
  integer,
  jsonb,
  index,
  check,
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { users } from './users.js';
import { patients } from './patients.js';
import { encounters } from './encounters.js';

export const agingScores = pgTable(
  'aging_scores',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    patientId: uuid('patient_id')
      .notNull()
      .references(() => patients.id),
    assessedBy: uuid('assessed_by')
      .notNull()
      .references(() => users.id),
    assessedAt: timestamp('assessed_at', { withTimezone: true }).defaultNow().notNull(),
    version: varchar('version', { length: 20 }).default('ias_p_v2').notNull(),
    parameters: jsonb('parameters').$type<Record<string, number>>().notNull(),
    domainScores: jsonb('domain_scores').$type<Record<string, any>>().notNull(),
    rawScore: integer('raw_score').notNull(),
    maxScore: integer('max_score').notNull(),
    iasPercentage: numeric('ias_percentage', { precision: 5, scale: 2 }).notNull(),
    riskBand: varchar('risk_band', { length: 30 }).notNull(),
    recommendedPathway: varchar('recommended_pathway', { length: 50 }).notNull(),
    clinicianPathwayOverride: varchar('clinician_pathway_override', { length: 50 }),
    overrideReason: text('override_reason'),
    encounterId: uuid('encounter_id').references(() => encounters.id),
    proxyRelationship: varchar('proxy_relationship', { length: 50 }),
    proxyProximity: varchar('proxy_proximity', { length: 30 }),
    visitFrequency: varchar('visit_frequency', { length: 30 }),
    parentAge: integer('parent_age'),
    livingSituation: varchar('living_situation', { length: 30 }),
    livingSituationOther: varchar('living_situation_other', { length: 100 }),
    redFlags: jsonb('red_flags').$type<string[]>().default([]),
    redFlagCount: integer('red_flag_count').default(0),
    redFlagUrgency: varchar('red_flag_urgency', { length: 30 }),
  },
  (table) => [
    index('aging_scores_patient_time_idx').on(table.patientId, table.assessedAt),
    index('aging_scores_version_idx').on(table.version),
    check('aging_scores_risk_band_check', sql`${table.riskBand} IN ('strong_independent', 'independent_vulnerable', 'supported_independence', 'limited_independence', 'high_dependence', 'low', 'moderate', 'high', 'critical')`),
  ]
);
