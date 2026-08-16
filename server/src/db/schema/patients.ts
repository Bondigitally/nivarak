import {
  pgTable,
  uuid,
  varchar,
  boolean,
  timestamp,
  date,
  jsonb,
  index,
} from 'drizzle-orm/pg-core';
import { users } from './users.js';

export const patients = pgTable(
  'patients',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id').references(() => users.id),
    mrn: varchar('mrn', { length: 50 }).notNull().unique(),
    fullName: varchar('full_name', { length: 255 }).notNull(),
    dateOfBirth: date('date_of_birth').notNull(),
    gender: varchar('gender', { length: 20 }).notNull(),
    bloodGroup: varchar('blood_group', { length: 10 }),
    primaryLanguage: varchar('primary_language', { length: 10 }).default('en'),
    address: jsonb('address').$type<{
      line1?: string;
      city?: string;
      state?: string;
      pin?: string;
      coordinates?: { lat: number; lng: number };
    }>(),
    medicalHistory: jsonb('medical_history').$type<{
      conditions?: string[];
      allergies?: string[];
      medications?: string[];
    }>(),
    emergencyContact: jsonb('emergency_contact').$type<{
      name?: string;
      phone?: string;
      relationship?: string;
    }>(),
    currentCarePathway: varchar('current_care_pathway', { length: 50 }).default('home_care'),
    isActive: boolean('is_active').default(true).notNull(),
    createdBy: uuid('created_by')
      .notNull()
      .references(() => users.id),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index('patients_care_pathway_idx').on(table.currentCarePathway),
    index('patients_created_by_idx').on(table.createdBy),
  ]
);

export const caregiverLinks = pgTable(
  'caregiver_links',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    patientId: uuid('patient_id')
      .notNull()
      .references(() => patients.id),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id),
    relationship: varchar('relationship', { length: 50 }).notNull(),
    accessScope: jsonb('access_scope').$type<string[]>().default([]),
    grantedBy: uuid('granted_by')
      .notNull()
      .references(() => users.id),
    grantedAt: timestamp('granted_at', { withTimezone: true }).defaultNow().notNull(),
    revokedAt: timestamp('revoked_at', { withTimezone: true }),
    consentDocumented: boolean('consent_documented').default(false),
  },
  (table) => [
    index('caregiver_links_patient_idx').on(table.patientId),
    index('caregiver_links_user_idx').on(table.userId),
  ]
);
