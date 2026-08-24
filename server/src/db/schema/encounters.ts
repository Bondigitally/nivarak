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
  jsonb,
  index,
  uniqueIndex,
  check,
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { users } from './users.js';
import { patients } from './patients.js';

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
    amendmentOf: uuid('amendment_of'),
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

export const encounterMedical = pgTable(
  'encounter_medical',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    encounterId: uuid('encounter_id').notNull().references(() => encounters.id),
    medicationsStatus: varchar('medications_status', { length: 30 }).notNull(),
    vitals: jsonb('vitals').$type<{
      bpSystolic?: number; bpDiastolic?: number; pulse?: number;
      weight?: number; temperature?: number; spo2?: number;
    }>(),
    chronicConditionStatus: varchar('chronic_condition_status', { length: 30 }).notNull(),
    acuteConcernPresent: boolean('acute_concern_present').notNull(),
    medicationAdherence: varchar('medication_adherence', { length: 30 }),
    sideEffects: jsonb('side_effects').$type<{ selected: string[]; other?: string }>(),
    prescriberReviewNeeded: boolean('prescriber_review_needed'),
    painLevel: integer('pain_level'),
    clinicianNotes: text('clinician_notes'),
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

export const encounterMobility = pgTable(
  'encounter_mobility',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    encounterId: uuid('encounter_id').notNull().references(() => encounters.id),
    mobilityStatus: varchar('mobility_status', { length: 30 }).notNull(),
    assistiveEquipment: jsonb('assistive_equipment').$type<string[]>().notNull(),
    fallInLastPeriod: varchar('fall_in_last_period', { length: 10 }).notNull(),
    fallDate: date('fall_date'),
    gaitBalance: varchar('gait_balance', { length: 30 }),
    transferAbility: varchar('transfer_ability', { length: 30 }),
    painOnMovement: boolean('pain_on_movement'),
    painOnMovementLocation: text('pain_on_movement_location'),
    homeEnvironmentRisk: jsonb('home_environment_risk').$type<string[]>(),
    clinicianNotes: text('clinician_notes'),
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

export const encounterSocial = pgTable(
  'encounter_social',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    encounterId: uuid('encounter_id').notNull().references(() => encounters.id),
    socialStatus: varchar('social_status', { length: 30 }).notNull(),
    meaningfulSocialContact: varchar('meaningful_social_contact', { length: 30 }).notNull(),
    livingSituation: varchar('living_situation', { length: 30 }).notNull(),
    isolationIndicators: jsonb('isolation_indicators').$type<string[]>(),
    carerFamilyInvolvement: varchar('carer_family_involvement', { length: 30 }),
    communityParticipation: varchar('community_participation', { length: 30 }),
    safeguardingConcern: boolean('safeguarding_concern'),
    technologyAccess: jsonb('technology_access').$type<string[]>(),
    clinicianNotes: text('clinician_notes'),
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

export const encounterNutritional = pgTable(
  'encounter_nutritional',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    encounterId: uuid('encounter_id').notNull().references(() => encounters.id),
    nutritionalStatus: varchar('nutritional_status', { length: 30 }).notNull(),
    appetiteChange: varchar('appetite_change', { length: 30 }).notNull(),
    mealPreparation: varchar('meal_preparation', { length: 30 }).notNull(),
    weightValue: numeric('weight_value', { precision: 5, scale: 1 }),
    weightSource: varchar('weight_source', { length: 20 }),
    hydrationStatus: varchar('hydration_status', { length: 30 }),
    dietaryRestrictions: jsonb('dietary_restrictions').$type<{ selected: string[]; allergy?: string }>(),
    foodAccess: varchar('food_access', { length: 30 }),
    supplementsInUse: varchar('supplements_in_use', { length: 500 }),
    clinicianNotes: text('clinician_notes'),
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

export const encounterCognitive = pgTable(
  'encounter_cognitive',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    encounterId: uuid('encounter_id').notNull().references(() => encounters.id),
    cognitiveStatus: varchar('cognitive_status', { length: 30 }).notNull(),
    orientationObserved: varchar('orientation_observed', { length: 30 }).notNull(),
    consistencyWithPrevious: varchar('consistency_with_previous', { length: 30 }).notNull(),
    memoryConcernType: jsonb('memory_concern_type').$type<string[]>(),
    behaviourChanges: jsonb('behaviour_changes').$type<string[]>(),
    medicationManagementAbility: varchar('medication_management_ability', { length: 30 }),
    capacityConcern: boolean('capacity_concern'),
    carerCognitiveReport: varchar('carer_cognitive_report', { length: 30 }),
    clinicianNotes: text('clinician_notes'),
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
