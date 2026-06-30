/**
 * Nivarak — Complete Database Schema (Drizzle ORM)
 *
 * All 13 core tables from the architecture document, Section 7.
 * Each table matches the data model specification exactly.
 */

import {
  pgTable,
  uuid,
  varchar,
  text,
  boolean,
  timestamp,
  date,
  numeric,
  integer,
  bigint,
  jsonb,
  inet,
  index,
  uniqueIndex,
  check,
} from 'drizzle-orm/pg-core';
import { relations, sql } from 'drizzle-orm';

// ─── USERS ──────────────────────────────────────────────
export const users = pgTable(
  'users',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    phone: varchar('phone', { length: 15 }).notNull(),
    email: varchar('email', { length: 255 }),
    fullName: varchar('full_name', { length: 255 }).notNull(),
    passwordHash: text('password_hash'),
    preferredLanguage: varchar('preferred_language', { length: 10 }).default('en'),
    avatarUrl: text('avatar_url'),
    isActive: boolean('is_active').default(true).notNull(),
    lastLoginAt: timestamp('last_login_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex('users_phone_unique').on(table.phone),
    uniqueIndex('users_email_unique').on(table.email),
  ]
);

// ─── ROLES ──────────────────────────────────────────────
export const roles = pgTable('roles', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 50 }).notNull().unique(),
  description: text('description'),
  permissions: jsonb('permissions').$type<string[]>().default([]),
});

// ─── USER_ROLES ─────────────────────────────────────────
export const userRoles = pgTable(
  'user_roles',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id),
    roleId: uuid('role_id')
      .notNull()
      .references(() => roles.id),
    assignedBy: uuid('assigned_by').references(() => users.id),
    assignedAt: timestamp('assigned_at', { withTimezone: true }).defaultNow().notNull(),
    expiresAt: timestamp('expires_at', { withTimezone: true }),
  },
  (table) => [
    uniqueIndex('user_roles_user_role_unique').on(table.userId, table.roleId),
  ]
);

// ─── PATIENTS ───────────────────────────────────────────
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

// ─── CAREGIVER_LINKS (Consent Records) ─────────────────
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

// ─── VISITS ─────────────────────────────────────────────
export const visits = pgTable(
  'visits',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    patientId: uuid('patient_id')
      .notNull()
      .references(() => patients.id),
    visitType: varchar('visit_type', { length: 50 }).notNull(), // home_visit, clinic, teleconsult, emergency
    status: varchar('status', { length: 20 }).default('draft').notNull(), // draft, completed, cancelled
    visitedAt: timestamp('visited_at', { withTimezone: true }).notNull(),
    location: varchar('location', { length: 255 }),
    chiefComplaint: text('chief_complaint'),
    systemicExam: jsonb('systemic_exam'),
    clinicalNotes: text('clinical_notes'),
    medicationsReviewed: jsonb('medications_reviewed'),
    createdBy: uuid('created_by')
      .notNull()
      .references(() => users.id),
    attendingClinicians: jsonb('attending_clinicians').$type<string[]>().default([]),
    completedAt: timestamp('completed_at', { withTimezone: true }),
    cancelledReason: text('cancelled_reason'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index('visits_patient_date_idx').on(table.patientId, table.visitedAt),
    index('visits_created_by_idx').on(table.createdBy),
    index('visits_status_idx').on(table.status),
    check('visits_status_check', sql`${table.status} IN ('draft', 'completed', 'cancelled')`),
    check('visits_type_check', sql`${table.visitType} IN ('home_visit', 'clinic', 'teleconsult', 'emergency')`),
  ]
);

// ─── VITALS ─────────────────────────────────────────────
export const vitals = pgTable(
  'vitals',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    patientId: uuid('patient_id')
      .notNull()
      .references(() => patients.id),
    visitId: uuid('visit_id').references(() => visits.id),
    parameterType: varchar('parameter_type', { length: 50 }).notNull(), // bp_systolic, bp_diastolic, hr, spo2, temp, weight, blood_glucose
    value: numeric('value', { precision: 10, scale: 2 }).notNull(),
    unit: varchar('unit', { length: 20 }).notNull(),
    recordedAt: timestamp('recorded_at', { withTimezone: true }).notNull(),
    recordedBy: uuid('recorded_by')
      .notNull()
      .references(() => users.id),
    deviceId: uuid('device_id'),
    source: varchar('source', { length: 20 }).default('manual'), // manual, device, imported
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

// ─── AGING_SCORES (IAS-P v2.0) ─────────────────────────
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
    visitId: uuid('visit_id').references(() => visits.id),
    // ─── IAS-P v2.0 Proxy Metadata ─────
    proxyRelationship: varchar('proxy_relationship', { length: 50 }),
    proxyProximity: varchar('proxy_proximity', { length: 30 }),
    visitFrequency: varchar('visit_frequency', { length: 30 }),
    parentAge: integer('parent_age'),
    livingSituation: varchar('living_situation', { length: 30 }),
    livingSituationOther: varchar('living_situation_other', { length: 100 }),
    // ─── Red Flags ─────
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

// ─── TASKS ──────────────────────────────────────────────
export const tasks = pgTable(
  'tasks',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    patientId: uuid('patient_id')
      .notNull()
      .references(() => patients.id),
    title: varchar('title', { length: 255 }).notNull(),
    description: text('description'),
    category: varchar('category', { length: 50 }).notNull(), // medication, follow_up, lab, visit, equipment, other
    priority: varchar('priority', { length: 20 }).default('medium').notNull(), // low, medium, high, urgent
    status: varchar('status', { length: 20 }).default('created').notNull(), // created, assigned, in_progress, completed, escalated, cancelled
    assignedTo: uuid('assigned_to').references(() => users.id),
    assignedRole: varchar('assigned_role', { length: 50 }),
    dueAt: timestamp('due_at', { withTimezone: true }),
    createdBy: uuid('created_by')
      .notNull()
      .references(() => users.id),
    sourceVisitId: uuid('source_visit_id').references(() => visits.id),
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

// ─── ALERTS ─────────────────────────────────────────────
export const alerts = pgTable(
  'alerts',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    patientId: uuid('patient_id')
      .notNull()
      .references(() => patients.id),
    alertType: varchar('alert_type', { length: 50 }).notNull(), // vital_threshold, risk_escalation, task_overdue, missed_visit, red_flag_assessment
    severity: varchar('severity', { length: 20 }).notNull(), // info, warning, critical
    status: varchar('status', { length: 20 }).default('open').notNull(), // open, acknowledged, resolved
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

// ─── DOCUMENTS ──────────────────────────────────────────
export const documents = pgTable(
  'documents',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    patientId: uuid('patient_id')
      .notNull()
      .references(() => patients.id),
    title: varchar('title', { length: 255 }).notNull(),
    category: varchar('category', { length: 50 }).notNull(), // lab, imaging, prescription, discharge, other
    reportDate: date('report_date'),
    storagePath: text('storage_path').notNull(),
    fileSizeBytes: bigint('file_size_bytes', { mode: 'number' }),
    mimeType: varchar('mime_type', { length: 100 }),
    scanStatus: varchar('scan_status', { length: 20 }).default('pending'), // pending, clean, quarantined
    uploadedBy: uuid('uploaded_by')
      .notNull()
      .references(() => users.id),
    visitId: uuid('visit_id').references(() => visits.id),
    isDeleted: boolean('is_deleted').default(false),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index('documents_patient_category_idx').on(table.patientId, table.category),
    index('documents_patient_date_idx').on(table.patientId, table.reportDate),
  ]
);

// ─── NOTIFICATIONS ──────────────────────────────────────
export const notifications = pgTable(
  'notifications',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    recipientUserId: uuid('recipient_user_id')
      .notNull()
      .references(() => users.id),
    channel: varchar('channel', { length: 20 }).notNull(), // whatsapp, sms, push, in_app
    type: varchar('type', { length: 50 }).notNull(), // alert, task_reminder, visit_summary, etc.
    status: varchar('status', { length: 20 }).default('queued').notNull(), // queued, sent, delivered, read, failed
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

// ─── AUDIT_LOGS ─────────────────────────────────────────
export const auditLogs = pgTable(
  'audit_logs',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    actorId: uuid('actor_id').references(() => users.id),
    actorRole: varchar('actor_role', { length: 50 }),
    action: varchar('action', { length: 100 }).notNull(), // e.g., patient.create, visit.complete, task.assign
    entityType: varchar('entity_type', { length: 50 }).notNull(),
    entityId: uuid('entity_id'),
    patientId: uuid('patient_id'),
    oldValue: jsonb('old_value'),
    newValue: jsonb('new_value'),
    ipAddress: varchar('ip_address', { length: 45 }),
    userAgent: text('user_agent'),
    occurredAt: timestamp('occurred_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index('audit_logs_actor_time_idx').on(table.actorId, table.occurredAt),
    index('audit_logs_patient_time_idx').on(table.patientId, table.occurredAt),
    index('audit_logs_entity_idx').on(table.entityType, table.entityId),
  ]
);

// ─── ALERT_RULES ────────────────────────────────────────
export const alertRules = pgTable(
  'alert_rules',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    patientId: uuid('patient_id').references(() => patients.id), // null = global rule
    parameterType: varchar('parameter_type', { length: 50 }).notNull(),
    condition: varchar('condition', { length: 20 }).notNull(), // lt, gt, lte, gte
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

// ─── SESSIONS ───────────────────────────────────────────
export const sessions = pgTable(
  'sessions',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id),
    tokenFamilyId: varchar('token_family_id', { length: 36 }).notNull(),
    refreshTokenHash: text('refresh_token_hash').notNull(),
    deviceId: varchar('device_id', { length: 255 }),
    ipAddress: varchar('ip_address', { length: 45 }),
    userAgent: text('user_agent'),
    lastActiveAt: timestamp('last_active_at', { withTimezone: true }).defaultNow().notNull(),
    expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
    isRevoked: boolean('is_revoked').default(false),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index('sessions_user_idx').on(table.userId),
    index('sessions_family_idx').on(table.tokenFamilyId),
  ]
);

// ─── OTP STORE ──────────────────────────────────────────
export const otpStore = pgTable(
  'otp_store',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    phone: varchar('phone', { length: 15 }).notNull(),
    otpHash: text('otp_hash').notNull(),
    purpose: varchar('purpose', { length: 30 }).default('login').notNull(), // login, verify, reset
    attempts: integer('attempts').default(0).notNull(),
    expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
    usedAt: timestamp('used_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index('otp_store_phone_idx').on(table.phone),
    check('otp_purpose_check', sql`${table.purpose} IN ('login', 'verify', 'reset')`),
  ]
);

// ─── RELATIONS ──────────────────────────────────────────

export const usersRelations = relations(users, ({ many }) => ({
  userRoles: many(userRoles),
  caregiverLinks: many(caregiverLinks),
  sessions: many(sessions),
}));

export const patientsRelations = relations(patients, ({ one, many }) => ({
  createdByUser: one(users, { fields: [patients.createdBy], references: [users.id] }),
  caregiverLinks: many(caregiverLinks),
  visits: many(visits),
  vitals: many(vitals),
  agingScores: many(agingScores),
  tasks: many(tasks),
  alerts: many(alerts),
  documents: many(documents),
}));

export const visitsRelations = relations(visits, ({ one, many }) => ({
  patient: one(patients, { fields: [visits.patientId], references: [patients.id] }),
  createdByUser: one(users, { fields: [visits.createdBy], references: [users.id] }),
  vitals: many(vitals),
}));

export const vitalsRelations = relations(vitals, ({ one }) => ({
  patient: one(patients, { fields: [vitals.patientId], references: [patients.id] }),
  visit: one(visits, { fields: [vitals.visitId], references: [visits.id] }),
  recordedByUser: one(users, { fields: [vitals.recordedBy], references: [users.id] }),
}));

export const tasksRelations = relations(tasks, ({ one }) => ({
  patient: one(patients, { fields: [tasks.patientId], references: [patients.id] }),
  assignedToUser: one(users, { fields: [tasks.assignedTo], references: [users.id] }),
  createdByUser: one(users, { fields: [tasks.createdBy], references: [users.id] }),
}));

export const alertsRelations = relations(alerts, ({ one }) => ({
  patient: one(patients, { fields: [alerts.patientId], references: [patients.id] }),
}));
