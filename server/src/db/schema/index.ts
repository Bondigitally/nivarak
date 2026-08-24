/**
 * Drizzle schema barrel — tables live in domain files; relations stay here
 * so every table is defined before any relation is declared.
 */

export { users, roles, userRoles } from './users.js';
export { patients, caregiverLinks } from './patients.js';
export {
  encounters,
  encounterMedical,
  encounterMobility,
  encounterSocial,
  encounterNutritional,
  encounterCognitive,
} from './encounters.js';
export { vitals } from './vitals.js';
export { agingScores } from './scoring.js';
export { tasks } from './tasks.js';
export { alerts, alertRules } from './alerts.js';
export { documents } from './documents.js';
export { notifications } from './notifications.js';
export { auditLogs } from './audit.js';

import { relations } from 'drizzle-orm';
import { users, userRoles } from './users.js';
import { patients, caregiverLinks } from './patients.js';
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

// ─── ENCOUNTERS (replaces visits) ───────────────────────
// Domain Encounter Framework. Versioned: amendments link to originals.
export const encounters = pgTable(
  'encounters',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    patientId: uuid('patient_id').notNull().references(() => patients.id),
    encounterDate: timestamp('encounter_date', { withTimezone: true }).notNull(),
    encounterType: varchar('encounter_type', { length: 30 }).notNull(),
    clinicianId: uuid('clinician_id').notNull().references(() => users.id),
    clinicianRole: varchar('clinician_role', { length: 30 }).notNull(),
    primaryReason: varchar('primary_reason', { length: 30 }).notNull(),
    primaryReasonNotes: text('primary_reason_notes'),
    overallClinicalImpression: varchar('overall_clinical_impression', { length: 30 }).notNull(),
    nextVisitDate: date('next_visit_date'),
    nextVisitFrequency: varchar('next_visit_frequency', { length: 20 }),
    status: varchar('status', { length: 20 }).default('draft').notNull(),
    version: integer('version').default(1).notNull(),
    amendmentOf: uuid('amendment_of'), // self-ref FK handled in relations
    amendmentReason: text('amendment_reason'),
    completedAt: timestamp('completed_at', { withTimezone: true }),
    completedBy: uuid('completed_by').references(() => users.id),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index('encounters_patient_date_idx').on(table.patientId, table.encounterDate),
    index('encounters_clinician_idx').on(table.clinicianId),
    index('encounters_status_idx').on(table.status),
    check('encounters_type_check', sql`${table.encounterType} IN ('home_visit', 'telehealth', 'clinic', 'carer_report', 'emergency', 'review')`),
    check('encounters_role_check', sql`${table.clinicianRole} IN ('gp', 'nurse', 'carer', 'physiotherapist', 'ot', 'social_worker', 'other')`),
    check('encounters_reason_check', sql`${table.primaryReason} IN ('medical', 'medicines_review', 'mobility', 'social', 'nutritional', 'cognitive', 'routine', 'emergency', 'other')`),
    check('encounters_impression_check', sql`${table.overallClinicalImpression} IN ('stable', 'monitor_closely', 'action_required', 'urgent')`),
    check('encounters_status_check', sql`${table.status} IN ('draft', 'completed', 'amended')`),
  ]
);

// ─── DOMAIN 1: MEDICAL & MEDICINES ──────────────────────
export const encounterMedical = pgTable(
  'encounter_medical',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    encounterId: uuid('encounter_id').notNull().references(() => encounters.id),
    // Tier 1 — mandatory
    medicationsStatus: varchar('medications_status', { length: 30 }).notNull(),
    vitals: jsonb('vitals').$type<{
      bpSystolic?: number; bpDiastolic?: number; pulse?: number;
      weight?: number; temperature?: number; spo2?: number;
    }>(),
    chronicConditionStatus: varchar('chronic_condition_status', { length: 30 }).notNull(),
    acuteConcernPresent: boolean('acute_concern_present').notNull(),
    // Tier 2 — optional observations
    medicationAdherence: varchar('medication_adherence', { length: 30 }),
    sideEffects: jsonb('side_effects').$type<{ selected: string[]; other?: string }>(),
    prescriberReviewNeeded: boolean('prescriber_review_needed'),
    painLevel: integer('pain_level'),
    clinicianNotes: text('clinician_notes'),
    // Tier 3 — escalation
    escalationLevel: varchar('escalation_level', { length: 30 }),
    referredTo: varchar('referred_to', { length: 30 }),
    referredToOther: text('referred_to_other'),
    referralDate: date('referral_date'),
    referralUrgency: varchar('referral_urgency', { length: 20 }),
  },
  (table) => [
    uniqueIndex('enc_medical_encounter_idx').on(table.encounterId),
    check('med_status_check', sql`${table.medicationsStatus} IN ('no_change', 'new_added', 'removed', 'dose_changed', 'concerns_flagged')`),
    check('med_chronic_check', sql`${table.chronicConditionStatus} IN ('stable', 'deteriorating', 'improved', 'new_condition')`),
  ]
);

// ─── DOMAIN 2: MOBILITY ────────────────────────────────
export const encounterMobility = pgTable(
  'encounter_mobility',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    encounterId: uuid('encounter_id').notNull().references(() => encounters.id),
    // Tier 1
    mobilityStatus: varchar('mobility_status', { length: 30 }).notNull(),
    assistiveEquipment: jsonb('assistive_equipment').$type<string[]>().notNull(),
    fallInLastPeriod: varchar('fall_in_last_period', { length: 10 }).notNull(), // yes / no / unknown
    fallDate: date('fall_date'),
    // Tier 2
    gaitBalance: varchar('gait_balance', { length: 30 }),
    transferAbility: varchar('transfer_ability', { length: 30 }),
    painOnMovement: boolean('pain_on_movement'),
    painOnMovementLocation: text('pain_on_movement_location'),
    homeEnvironmentRisk: jsonb('home_environment_risk').$type<string[]>(),
    clinicianNotes: text('clinician_notes'),
    // Tier 3
    formalAssessmentNeeded: boolean('formal_assessment_needed'),
    formalAssessmentType: varchar('formal_assessment_type', { length: 30 }),
    referralMobility: varchar('referral_mobility', { length: 30 }),
    urgentMobilityConcern: boolean('urgent_mobility_concern'),
  },
  (table) => [
    uniqueIndex('enc_mobility_encounter_idx').on(table.encounterId),
    check('mob_status_check', sql`${table.mobilityStatus} IN ('no_change', 'improved', 'declined', 'first_visit')`),
    check('mob_fall_check', sql`${table.fallInLastPeriod} IN ('yes', 'no', 'unknown')`),
  ]
);

// ─── DOMAIN 3: SOCIAL ──────────────────────────────────
export const encounterSocial = pgTable(
  'encounter_social',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    encounterId: uuid('encounter_id').notNull().references(() => encounters.id),
    // Tier 1
    socialStatus: varchar('social_status', { length: 30 }).notNull(),
    meaningfulSocialContact: varchar('meaningful_social_contact', { length: 30 }).notNull(),
    livingSituation: varchar('living_situation', { length: 30 }).notNull(),
    // Tier 2
    isolationIndicators: jsonb('isolation_indicators').$type<string[]>(),
    carerFamilyInvolvement: varchar('carer_family_involvement', { length: 30 }),
    communityParticipation: varchar('community_participation', { length: 30 }),
    safeguardingConcern: boolean('safeguarding_concern'),
    technologyAccess: jsonb('technology_access').$type<string[]>(),
    clinicianNotes: text('clinician_notes'),
    // Tier 3
    safeguardingLevel: varchar('safeguarding_level', { length: 30 }),
    referralSocial: varchar('referral_social', { length: 50 }),
  },
  (table) => [
    uniqueIndex('enc_social_encounter_idx').on(table.encounterId),
    check('soc_status_check', sql`${table.socialStatus} IN ('no_change', 'improved', 'declined', 'first_visit')`),
    check('soc_contact_check', sql`${table.meaningfulSocialContact} IN ('daily', 'several_times', 'once', 'none')`),
    check('soc_living_check', sql`${table.livingSituation} IN ('alone', 'with_spouse', 'with_family', 'shared_care_home', 'other')`),
  ]
);

// ─── DOMAIN 4: NUTRITIONAL ─────────────────────────────
export const encounterNutritional = pgTable(
  'encounter_nutritional',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    encounterId: uuid('encounter_id').notNull().references(() => encounters.id),
    // Tier 1
    nutritionalStatus: varchar('nutritional_status', { length: 30 }).notNull(),
    appetiteChange: varchar('appetite_change', { length: 30 }).notNull(),
    mealPreparation: varchar('meal_preparation', { length: 30 }).notNull(),
    // Tier 2
    weightValue: numeric('weight_value', { precision: 5, scale: 1 }),
    weightSource: varchar('weight_source', { length: 20 }),
    hydrationStatus: varchar('hydration_status', { length: 30 }),
    dietaryRestrictions: jsonb('dietary_restrictions').$type<{ selected: string[]; allergy?: string }>(),
    foodAccess: varchar('food_access', { length: 30 }),
    supplementsInUse: varchar('supplements_in_use', { length: 500 }),
    clinicianNotes: text('clinician_notes'),
    // Tier 3
    mustScore: integer('must_score'),
    referralNutritional: varchar('referral_nutritional', { length: 30 }),
    crossFlagCognitiveNutritional: boolean('cross_flag_cognitive_nutritional').default(false),
  },
  (table) => [
    uniqueIndex('enc_nutritional_encounter_idx').on(table.encounterId),
    check('nut_status_check', sql`${table.nutritionalStatus} IN ('no_change', 'concern_noted', 'improved', 'first_visit')`),
    check('nut_appetite_check', sql`${table.appetiteChange} IN ('no_change', 'increased', 'decreased', 'very_poor', 'unable_to_assess')`),
    check('nut_meal_check', sql`${table.mealPreparation} IN ('independent', 'needs_prompting', 'needs_assistance', 'cannot_prepare')`),
  ]
);

// ─── DOMAIN 5: COGNITIVE ───────────────────────────────
export const encounterCognitive = pgTable(
  'encounter_cognitive',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    encounterId: uuid('encounter_id').notNull().references(() => encounters.id),
    // Tier 1
    cognitiveStatus: varchar('cognitive_status', { length: 30 }).notNull(),
    orientationObserved: varchar('orientation_observed', { length: 30 }).notNull(),
    consistencyWithPrevious: varchar('consistency_with_previous', { length: 30 }).notNull(),
    // Tier 2
    memoryConcernType: jsonb('memory_concern_type').$type<string[]>(),
    behaviourChanges: jsonb('behaviour_changes').$type<string[]>(),
    medicationManagementAbility: varchar('medication_management_ability', { length: 30 }),
    capacityConcern: boolean('capacity_concern'),
    carerCognitiveReport: varchar('carer_cognitive_report', { length: 30 }),
    clinicianNotes: text('clinician_notes'),
    // Tier 3
    formalScreeningCompleted: boolean('formal_screening_completed'),
    formalScreeningTool: varchar('formal_screening_tool', { length: 20 }),
    formalScreenScore: numeric('formal_screen_score', { precision: 5, scale: 1 }),
    referralCognitive: varchar('referral_cognitive', { length: 30 }),
    crossFlagCognitiveNutritional: boolean('cross_flag_cognitive_nutritional').default(false),
    crossFlagCognitiveMedicines: boolean('cross_flag_cognitive_medicines').default(false),
  },
  (table) => [
    uniqueIndex('enc_cognitive_encounter_idx').on(table.encounterId),
    check('cog_status_check', sql`${table.cognitiveStatus} IN ('no_change', 'improved', 'possible_decline', 'clear_decline', 'unable_to_assess')`),
    check('cog_orient_check', sql`${table.orientationObserved} IN ('fully_oriented', 'minor_confusion', 'moderate_confusion', 'severely_disoriented')`),
    check('cog_consist_check', sql`${table.consistencyWithPrevious} IN ('consistent', 'minor_discrepancies', 'significant_discrepancies', 'first_visit')`),
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
    encounterId: uuid('encounter_id').references(() => encounters.id),
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
    encounterId: uuid('encounter_id').references(() => encounters.id),
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
    encounterId: uuid('encounter_id').references(() => encounters.id),
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



// ─── RELATIONS ──────────────────────────────────────────

export const usersRelations = relations(users, ({ many }) => ({
  userRoles: many(userRoles),
  caregiverLinks: many(caregiverLinks),
  encounters: many(encounters),
}));

export const patientsRelations = relations(patients, ({ one, many }) => ({
  createdByUser: one(users, { fields: [patients.createdBy], references: [users.id] }),
  caregiverLinks: many(caregiverLinks),
  encounters: many(encounters),
  vitals: many(vitals),
  agingScores: many(agingScores),
  tasks: many(tasks),
  alerts: many(alerts),
  documents: many(documents),
}));

export const encountersRelations = relations(encounters, ({ one, many }) => ({
  patient: one(patients, { fields: [encounters.patientId], references: [patients.id] }),
  clinician: one(users, { fields: [encounters.clinicianId], references: [users.id] }),
  medical: one(encounterMedical),
  mobility: one(encounterMobility),
  social: one(encounterSocial),
  nutritional: one(encounterNutritional),
  cognitive: one(encounterCognitive),
  vitals: many(vitals),
  agingScores: many(agingScores),
}));

export const encounterMedicalRelations = relations(encounterMedical, ({ one }) => ({
  encounter: one(encounters, { fields: [encounterMedical.encounterId], references: [encounters.id] }),
}));

export const encounterMobilityRelations = relations(encounterMobility, ({ one }) => ({
  encounter: one(encounters, { fields: [encounterMobility.encounterId], references: [encounters.id] }),
}));

export const encounterSocialRelations = relations(encounterSocial, ({ one }) => ({
  encounter: one(encounters, { fields: [encounterSocial.encounterId], references: [encounters.id] }),
}));

export const encounterNutritionalRelations = relations(encounterNutritional, ({ one }) => ({
  encounter: one(encounters, { fields: [encounterNutritional.encounterId], references: [encounters.id] }),
}));

export const encounterCognitiveRelations = relations(encounterCognitive, ({ one }) => ({
  encounter: one(encounters, { fields: [encounterCognitive.encounterId], references: [encounters.id] }),
}));

export const vitalsRelations = relations(vitals, ({ one }) => ({
  patient: one(patients, { fields: [vitals.patientId], references: [patients.id] }),
  encounter: one(encounters, { fields: [vitals.encounterId], references: [encounters.id] }),
  recordedByUser: one(users, { fields: [vitals.recordedBy], references: [users.id] }),
}));

export const tasksRelations = relations(tasks, ({ one }) => ({
  patient: one(patients, { fields: [tasks.patientId], references: [patients.id] }),
  assignedToUser: one(users, { fields: [tasks.assignedTo], references: [users.id] }),
  createdByUser: one(users, { fields: [tasks.createdBy], references: [users.id] }),
  sourceEncounter: one(encounters, { fields: [tasks.sourceEncounterId], references: [encounters.id] }),
}));

export const alertsRelations = relations(alerts, ({ one }) => ({
  patient: one(patients, { fields: [alerts.patientId], references: [patients.id] }),
}));

export const documentsRelations = relations(documents, ({ one }) => ({
  patient: one(patients, { fields: [documents.patientId], references: [patients.id] }),
  encounter: one(encounters, { fields: [documents.encounterId], references: [encounters.id] }),
  uploadedByUser: one(users, { fields: [documents.uploadedBy], references: [users.id] }),
}));
