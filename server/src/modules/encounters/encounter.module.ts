/**
 * EncounterModule — Service + Routes
 * 6-Domain Encounter Framework: create, complete, amend, retrieve encounters.
 * Replaces the legacy visit module.
 */

import { Hono } from 'hono';
import { z } from 'zod';
import { eq, and, desc, count } from 'drizzle-orm';
import { db, queryClient } from '../../db/connection.js';
import {
  encounters,
  encounterMedical,
  encounterMobility,
  encounterSocial,
  encounterNutritional,
  encounterCognitive,
} from '../../db/schema/index.js';
import { eventBus } from '../../shared/event-bus.js';
import { logger } from '../../shared/logger.js';
import { NotFoundError, BusinessRuleError, ValidationError } from '../../shared/errors.js';
import { authMiddleware, requirePermission } from '../../middleware/auth.js';
import { successResponse, paginatedResponse } from '../../shared/response.js';

// ─── Schemas ────────────────────────────────────────────

const encounterTypeEnum = z.enum(['home_visit', 'telehealth', 'clinic', 'carer_report', 'emergency', 'review']);
const clinicianRoleEnum = z.enum(['gp', 'nurse', 'carer', 'physiotherapist', 'ot', 'social_worker', 'other']);
const primaryReasonEnum = z.enum(['medical', 'medicines_review', 'mobility', 'social', 'nutritional', 'cognitive', 'routine', 'emergency', 'other']);
const impressionEnum = z.enum(['stable', 'monitor_closely', 'action_required', 'urgent']);

// Domain tier-1 schemas (mandatory on every encounter)
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
  // Tier 2/3 optional
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

const createEncounterSchema = z.object({
  encounterDate: z.string().datetime(),
  encounterType: encounterTypeEnum,
  clinicianRole: clinicianRoleEnum,
  primaryReason: primaryReasonEnum,
  primaryReasonNotes: z.string().optional(),
  overallClinicalImpression: impressionEnum,
  nextVisitDate: z.string().optional(),
  nextVisitFrequency: z.enum(['daily', 'weekly', 'fortnightly', 'monthly', 'as_needed']).optional(),
  // All 5 domain status records
  medical: medicalDomainSchema,
  mobility: mobilityDomainSchema,
  social: socialDomainSchema,
  nutritional: nutritionalDomainSchema,
  cognitive: cognitiveDomainSchema,
});

// ─── Service ────────────────────────────────────────────

class EncounterService {
  async createEncounter(
    patientId: string,
    data: z.infer<typeof createEncounterSchema>,
    clinicianId: string,
    clinicianRole: string
  ) {
    // Insert encounter record
    const [encounter] = await db.insert(encounters).values({
      patientId,
      encounterDate: new Date(data.encounterDate),
      encounterType: data.encounterType,
      clinicianId,
      clinicianRole: data.clinicianRole || clinicianRole,
      primaryReason: data.primaryReason,
      primaryReasonNotes: data.primaryReasonNotes,
      overallClinicalImpression: data.overallClinicalImpression,
      nextVisitDate: data.nextVisitDate,
      nextVisitFrequency: data.nextVisitFrequency,
      status: 'draft',
    }).returning();

    // Insert all 5 domain records
    await Promise.all([
      db.insert(encounterMedical).values({ encounterId: encounter.id, ...data.medical }),
      db.insert(encounterMobility).values({ encounterId: encounter.id, ...data.mobility }),
      db.insert(encounterSocial).values({ encounterId: encounter.id, ...data.social }),
      db.insert(encounterNutritional).values({ 
        encounterId: encounter.id, 
        ...data.nutritional,
        weightValue: data.nutritional.weightValue?.toString(),
      }),
      db.insert(encounterCognitive).values({ 
        encounterId: encounter.id, 
        ...data.cognitive,
        formalScreenScore: data.cognitive.formalScreenScore?.toString(),
      }),
    ]);

    // Compute cross-domain flags on creation
    await this.computeCrossFlags(encounter.id, data);

    logger.info({ encounterId: encounter.id, patientId }, 'Encounter created (draft)');
    return encounter;
  }

  async getEncounter(patientId: string, encounterId: string) {
    const [encounter] = await db.select().from(encounters)
      .where(and(eq(encounters.id, encounterId), eq(encounters.patientId, patientId)))
      .limit(1);
    if (!encounter) throw new NotFoundError('Encounter', encounterId);

    // Load all domain records
    const [medical] = await db.select().from(encounterMedical).where(eq(encounterMedical.encounterId, encounterId));
    const [mobility] = await db.select().from(encounterMobility).where(eq(encounterMobility.encounterId, encounterId));
    const [social] = await db.select().from(encounterSocial).where(eq(encounterSocial.encounterId, encounterId));
    const [nutritional] = await db.select().from(encounterNutritional).where(eq(encounterNutritional.encounterId, encounterId));
    const [cognitive] = await db.select().from(encounterCognitive).where(eq(encounterCognitive.encounterId, encounterId));

    return { ...encounter, medical, mobility, social, nutritional, cognitive };
  }

  async listEncounters(patientId: string, page: number, limit: number) {
    const offset = (page - 1) * limit;
    const [totalResult] = await db.select({ count: count() }).from(encounters)
      .where(eq(encounters.patientId, patientId));
    const data = await db.select().from(encounters)
      .where(eq(encounters.patientId, patientId))
      .orderBy(desc(encounters.encounterDate))
      .limit(limit).offset(offset);
    return { data, total: totalResult.count };
  }

  async completeEncounter(patientId: string, encounterId: string, completedBy: string) {
    const encounter = await this.getEncounter(patientId, encounterId);
    if (encounter.status !== 'draft') {
      throw new BusinessRuleError('Encounter is already completed or amended');
    }
    const [completed] = await db.update(encounters).set({
      status: 'completed',
      completedAt: new Date(),
      completedBy,
      updatedAt: new Date(),
    }).where(eq(encounters.id, encounterId)).returning();

    eventBus.emit('encounter.completed', { encounterId, patientId, completedBy });
    logger.info({ encounterId, patientId }, 'Encounter completed and locked');
    return completed;
  }

  async amendEncounter(
    patientId: string,
    originalId: string,
    data: z.infer<typeof createEncounterSchema>,
    clinicianId: string,
    clinicianRole: string,
    amendmentReason: string
  ) {
    const original = await this.getEncounter(patientId, originalId);
    if (original.status !== 'completed') {
      throw new BusinessRuleError('Only completed encounters can be amended');
    }
    // Mark original as amended
    await db.update(encounters).set({ status: 'amended', updatedAt: new Date() })
      .where(eq(encounters.id, originalId));

    // Create new versioned record
    const [amended] = await db.insert(encounters).values({
      patientId,
      encounterDate: new Date(data.encounterDate),
      encounterType: data.encounterType,
      clinicianId,
      clinicianRole: data.clinicianRole || clinicianRole,
      primaryReason: data.primaryReason,
      primaryReasonNotes: data.primaryReasonNotes,
      overallClinicalImpression: data.overallClinicalImpression,
      nextVisitDate: data.nextVisitDate,
      nextVisitFrequency: data.nextVisitFrequency,
      status: 'completed',
      version: (original.version || 1) + 1,
      amendmentOf: originalId,
      amendmentReason,
      completedAt: new Date(),
      completedBy: clinicianId,
    }).returning();

    await Promise.all([
      db.insert(encounterMedical).values({ encounterId: amended.id, ...data.medical }),
      db.insert(encounterMobility).values({ encounterId: amended.id, ...data.mobility }),
      db.insert(encounterSocial).values({ encounterId: amended.id, ...data.social }),
      db.insert(encounterNutritional).values({ 
        encounterId: amended.id, 
        ...data.nutritional,
        weightValue: data.nutritional.weightValue?.toString(),
      }),
      db.insert(encounterCognitive).values({ 
        encounterId: amended.id, 
        ...data.cognitive,
        formalScreenScore: data.cognitive.formalScreenScore?.toString(),
      }),
    ]);

    await this.computeCrossFlags(amended.id, data);

    eventBus.emit('encounter.amended', { encounterId: amended.id, originalId, patientId });
    logger.info({ encounterId: amended.id, originalId, patientId }, 'Encounter amended');
    return amended;
  }

  /**
   * Compute cross-domain flags on submission.
   * Cognitive + Nutritional decline → flag on both domain records.
   * Cognitive decline + Medication non-adherence → flag on cognitive record.
   */
  private async computeCrossFlags(encounterId: string, data: z.infer<typeof createEncounterSchema>) {
    const cogDecline = ['possible_decline', 'clear_decline'].includes(data.cognitive.cognitiveStatus);
    const nutDecline = data.nutritional.nutritionalStatus === 'concern_noted';
    const medNonAdherence = data.medical.medicationAdherence &&
      ['partial', 'not_taking'].includes(data.medical.medicationAdherence);

    if (cogDecline && nutDecline) {
      await queryClient`UPDATE encounter_nutritional SET cross_flag_cognitive_nutritional = true WHERE encounter_id = ${encounterId}`;
      await queryClient`UPDATE encounter_cognitive SET cross_flag_cognitive_nutritional = true WHERE encounter_id = ${encounterId}`;
    }

    if (cogDecline && medNonAdherence) {
      await queryClient`UPDATE encounter_cognitive SET cross_flag_cognitive_medicines = true WHERE encounter_id = ${encounterId}`;
    }
  }
}

const encounterService = new EncounterService();

// ─── Routes ─────────────────────────────────────────────
export const encounterRoutes = new Hono();
encounterRoutes.use('*', authMiddleware);

// POST /patients/:id/encounters
encounterRoutes.post('/', requirePermission('encounters.create'), async (c) => {
  const patientId = c.req.param('id')!;
  const body = await c.req.json();
  const parsed = createEncounterSchema.safeParse(body);
  if (!parsed.success) throw new ValidationError('Validation failed', parsed.error.errors.map(e => ({ field: e.path.join('.'), message: e.message })));

  const user = c.get('user');
  const encounter = await encounterService.createEncounter(patientId, parsed.data, user.userId, user.roles?.[0] || 'other');
  return c.json(successResponse(encounter), 201);
});

// GET /patients/:id/encounters
encounterRoutes.get('/', async (c) => {
  const patientId = c.req.param('id')!;
  const page = parseInt(c.req.query('page') || '1');
  const limit = parseInt(c.req.query('limit') || '20');
  const { data, total } = await encounterService.listEncounters(patientId, page, limit);
  return c.json(paginatedResponse(data, page, limit, total));
});

// GET /patients/:id/encounters/:encounterId
encounterRoutes.get('/:encounterId', async (c) => {
  const encounter = await encounterService.getEncounter(c.req.param('id')!, c.req.param('encounterId')!);
  return c.json(successResponse(encounter));
});

// POST /patients/:id/encounters/:encounterId/complete
encounterRoutes.post('/:encounterId/complete', requirePermission('encounters.create'), async (c) => {
  const user = c.get('user');
  const encounter = await encounterService.completeEncounter(c.req.param('id')!, c.req.param('encounterId')!, user.userId);
  return c.json(successResponse(encounter));
});

// POST /patients/:id/encounters/:encounterId/amend
encounterRoutes.post('/:encounterId/amend', requirePermission('encounters.create'), async (c) => {
  const body = await c.req.json();
  const { amendmentReason, ...encounterData } = body;
  if (!amendmentReason) throw new ValidationError('amendmentReason is required');

  const parsed = createEncounterSchema.safeParse(encounterData);
  if (!parsed.success) throw new ValidationError('Validation failed', parsed.error.errors.map((e: any) => ({ field: e.path.join('.'), message: e.message })));

  const user = c.get('user');
  const encounter = await encounterService.amendEncounter(
    c.req.param('id')!,
    c.req.param('encounterId')!,
    parsed.data,
    user.userId,
    user.roles?.[0] || 'other',
    amendmentReason,
  );
  return c.json(successResponse(encounter), 201);
});
