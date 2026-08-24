import { z } from 'zod';

const encounterTypeEnum = z.enum(['home_visit', 'telehealth', 'clinic', 'carer_report', 'emergency', 'review']);
const clinicianRoleEnum = z.enum(['gp', 'nurse', 'carer', 'physiotherapist', 'ot', 'social_worker', 'other']);
const primaryReasonEnum = z.enum(['medical', 'medicines_review', 'mobility', 'social', 'nutritional', 'cognitive', 'routine', 'emergency', 'other']);
const impressionEnum = z.enum(['stable', 'monitor_closely', 'action_required', 'urgent']);

const medicalDomainSchema = z.object({
  medicationsStatus: z.enum(['no_change', 'new_added', 'removed', 'dose_changed', 'concerns_flagged']),
  vitals: z.object({
    bpSystolic: z.number().optional(),
    bpDiastolic: z.number().optional(),
    pulse: z.number().optional(),
    weight: z.number().optional(),
    temperature: z.number().optional(),
    spo2: z.number().optional(),
  }).optional(),
  chronicConditionStatus: z.enum(['stable', 'deteriorating', 'improved', 'new_condition']),
  acuteConcernPresent: z.boolean(),
  medicationAdherence: z.string().optional(),
  sideEffects: z.object({ selected: z.array(z.string()), other: z.string().optional() }).optional(),
  prescriberReviewNeeded: z.boolean().optional(),
  painLevel: z.number().min(0).max(10).optional(),
  clinicianNotes: z.string().max(2000).optional(),
  escalationLevel: z.string().optional(),
  referredTo: z.string().optional(),
  referredToOther: z.string().optional(),
  referralDate: z.string().optional(),
  referralUrgency: z.string().optional(),
});

const mobilityDomainSchema = z.object({
  mobilityStatus: z.enum(['no_change', 'improved', 'declined', 'first_visit']),
  assistiveEquipment: z.array(z.string()),
  fallInLastPeriod: z.enum(['yes', 'no', 'unknown']),
  fallDate: z.string().optional(),
  gaitBalance: z.string().optional(),
  transferAbility: z.string().optional(),
  painOnMovement: z.boolean().optional(),
  painOnMovementLocation: z.string().optional(),
  homeEnvironmentRisk: z.array(z.string()).optional(),
  clinicianNotes: z.string().max(2000).optional(),
  formalAssessmentNeeded: z.boolean().optional(),
  formalAssessmentType: z.string().optional(),
  referralMobility: z.string().optional(),
  urgentMobilityConcern: z.boolean().optional(),
});

const socialDomainSchema = z.object({
  socialStatus: z.enum(['no_change', 'improved', 'declined', 'first_visit']),
  meaningfulSocialContact: z.enum(['daily', 'several_times', 'once', 'none']),
  livingSituation: z.enum(['alone', 'with_spouse', 'with_family', 'shared_care_home', 'other']),
  isolationIndicators: z.array(z.string()).optional(),
  carerFamilyInvolvement: z.string().optional(),
  communityParticipation: z.string().optional(),
  safeguardingConcern: z.boolean().optional(),
  technologyAccess: z.array(z.string()).optional(),
  clinicianNotes: z.string().max(2000).optional(),
  safeguardingLevel: z.string().optional(),
  referralSocial: z.string().optional(),
});

const nutritionalDomainSchema = z.object({
  nutritionalStatus: z.enum(['no_change', 'concern_noted', 'improved', 'first_visit']),
  appetiteChange: z.enum(['no_change', 'increased', 'decreased', 'very_poor', 'unable_to_assess']),
  mealPreparation: z.enum(['independent', 'needs_prompting', 'needs_assistance', 'cannot_prepare']),
  weightValue: z.number().optional(),
  weightSource: z.string().optional(),
  hydrationStatus: z.string().optional(),
  dietaryRestrictions: z.object({ selected: z.array(z.string()), allergy: z.string().optional() }).optional(),
  foodAccess: z.string().optional(),
  supplementsInUse: z.string().max(500).optional(),
  clinicianNotes: z.string().max(2000).optional(),
  mustScore: z.number().min(0).optional(),
  referralNutritional: z.string().optional(),
});

const cognitiveDomainSchema = z.object({
  cognitiveStatus: z.enum(['no_change', 'improved', 'possible_decline', 'clear_decline', 'unable_to_assess']),
  orientationObserved: z.enum(['fully_oriented', 'minor_confusion', 'moderate_confusion', 'severely_disoriented']),
  consistencyWithPrevious: z.enum(['consistent', 'minor_discrepancies', 'significant_discrepancies', 'first_visit']),
  memoryConcernType: z.array(z.string()).optional(),
  behaviourChanges: z.array(z.string()).optional(),
  medicationManagementAbility: z.string().optional(),
  capacityConcern: z.boolean().optional(),
  carerCognitiveReport: z.string().optional(),
  clinicianNotes: z.string().max(2000).optional(),
  formalScreeningCompleted: z.boolean().optional(),
  formalScreeningTool: z.string().optional(),
  formalScreenScore: z.number().optional(),
  referralCognitive: z.string().optional(),
});

export const createEncounterSchema = z.object({
  encounterDate: z.string().datetime(),
  encounterType: encounterTypeEnum,
  clinicianRole: clinicianRoleEnum,
  primaryReason: primaryReasonEnum,
  primaryReasonNotes: z.string().optional(),
  overallClinicalImpression: impressionEnum,
  nextVisitDate: z.string().optional(),
  nextVisitFrequency: z.enum(['daily', 'weekly', 'fortnightly', 'monthly', 'as_needed']).optional(),
  medical: medicalDomainSchema,
  mobility: mobilityDomainSchema,
  social: socialDomainSchema,
  nutritional: nutritionalDomainSchema,
  cognitive: cognitiveDomainSchema,
});

export type CreateEncounterInput = z.infer<typeof createEncounterSchema>;
