/**
 * ScoringModule — IAS-P v2.0 (Independent Ageing Score — Proxy Version)
 *
 * Clinically validated 24-item instrument across 8 sections.
 * Each item scored 0–2 (2 = Independent, 1 = Some support, 0 = Dependent).
 * Max raw score = 48. IAS % = (raw / 48) × 100.
 * Includes red flag system with urgency tiers.
 *
 * Submission restricted to caregiver/patient (proxy assessment) + clinical staff.
 * Dry-run calculation endpoint is public (no auth).
 */

import { Hono } from 'hono';
import { z } from 'zod';
import { eq, desc, count } from 'drizzle-orm';
import { db, queryClient } from '../../db/connection.js';
import { agingScores, patients } from '../../db/schema/index.js';
import { eventBus } from '../../shared/event-bus.js';
import { logger } from '../../shared/logger.js';
import { NotFoundError, ValidationError } from '../../shared/errors.js';
import { authMiddleware, requireRoles } from '../../middleware/auth.js';
import { successResponse, paginatedResponse } from '../../shared/response.js';

// ─── IAS-P v2.0 Domain Configuration ───────────────────
export interface IASDomain {
  key: string;
  label: string;
  parameters: string[];
}

export const IAS_DOMAINS: IASDomain[] = [
  {
    key: 'basic_self_care',
    label: 'Section A — Basic Self-Care',
    parameters: ['bathing', 'dressing', 'toileting', 'feeding'],
  },
  {
    key: 'daily_life_function',
    label: 'Section B — Daily Life Function',
    parameters: ['phone_communication', 'daily_home_tasks', 'simple_purchases', 'organizing_essentials'],
  },
  {
    key: 'mobility',
    label: 'Section C — Mobility',
    parameters: ['moving_inside_house', 'getting_up', 'walking_outside', 'falls_6_months'],
  },
  {
    key: 'thinking_decision',
    label: 'Section D — Thinking & Decision-Making',
    parameters: ['remembering_routine', 'understanding_instructions', 'safe_decisions'],
  },
  {
    key: 'health_management',
    label: 'Section E — Health Management',
    parameters: ['taking_medicines', 'understanding_health', 'following_appointments'],
  },
  {
    key: 'nutrition_continence',
    label: 'Section F — Nutrition & Continence',
    parameters: ['eating_drinking', 'weight_appetite', 'bladder_bowel'],
  },
  {
    key: 'social_function',
    label: 'Section G — Social Function',
    parameters: ['communicating_needs', 'social_contact'],
  },
  {
    key: 'safety_support',
    label: 'Section H — Safety & Support',
    parameters: ['emergency_help'],
  },
];

export const ALL_IAS_PARAMETERS = IAS_DOMAINS.flatMap((d) => d.parameters);
// Total: 24 parameters, max 48

// ─── Red Flag Definitions ──────────────────────────────
export const RED_FLAGS = [
  'two_or_more_falls',
  'missed_incorrect_medicines',
  'unsafe_decisions',
  'significant_weight_loss',
  'social_isolation',
  'recurrent_hospital_admissions',
  'caregiver_struggling',
  'no_emergency_response',
] as const;

export type RedFlag = typeof RED_FLAGS[number];

// ─── Risk Band Mapping (IAS-P v2.0 Interpretation) ────
export function calculateIASBand(iasPercentage: number): { riskBand: string; recommendedPathway: string } {
  if (iasPercentage >= 85) return { riskBand: 'strong_independent', recommendedPathway: 'home_care' };
  if (iasPercentage >= 70) return { riskBand: 'independent_vulnerable', recommendedPathway: 'home_care' };
  if (iasPercentage >= 55) return { riskBand: 'supported_independence', recommendedPathway: 'hybrid' };
  if (iasPercentage >= 40) return { riskBand: 'limited_independence', recommendedPathway: 'clinic' };
  return { riskBand: 'high_dependence', recommendedPathway: 'high_dependency' };
}

// ─── Red Flag Urgency ──────────────────────────────────
export function evaluateRedFlagUrgency(flagCount: number): string {
  if (flagCount === 0) return 'routine_monitoring';
  if (flagCount <= 2) return 'review_needed';
  return 'urgent_care_planning';
}

// ─── IAS Score Calculation (Pure Function) ─────────────
export interface IASDomainScore {
  raw: number;
  max: number;
  percentage: number;
}

export interface IASResult {
  rawScore: number;
  maxScore: number;
  iasPercentage: number;
  domainScores: Record<string, IASDomainScore>;
  riskBand: string;
  recommendedPathway: string;
}

export function calculateIAS(parameters: Record<string, number>): IASResult {
  const domainScores: Record<string, IASDomainScore> = {};
  let totalRaw = 0;

  for (const domain of IAS_DOMAINS) {
    let domainSum = 0;
    for (const param of domain.parameters) {
      const val = parameters[param];
      if (val !== undefined && val !== null) {
        domainSum += Math.min(Math.max(val, 0), 2); // Clamp 0–2
      }
    }
    const domainMax = domain.parameters.length * 2;
    domainScores[domain.key] = {
      raw: domainSum,
      max: domainMax,
      percentage: domainMax > 0 ? Math.round((domainSum / domainMax) * 100) : 0,
    };
    totalRaw += domainSum;
  }

  const maxScore = 48;
  const iasPercentage = Math.round((totalRaw / maxScore) * 100 * 100) / 100; // 2 decimal places
  const { riskBand, recommendedPathway } = calculateIASBand(iasPercentage);

  return { rawScore: totalRaw, maxScore, iasPercentage, domainScores, riskBand, recommendedPathway };
}

// ─── Zod Validation Schemas ────────────────────────────
const iasItemScore = z.number().int().min(0).max(2);

const iasParametersSchema = z.object({
  // Section A — Basic Self-Care
  bathing: iasItemScore,
  dressing: iasItemScore,
  toileting: iasItemScore,
  feeding: iasItemScore,
  // Section B — Daily Life Function
  phone_communication: iasItemScore,
  daily_home_tasks: iasItemScore,
  simple_purchases: iasItemScore,
  organizing_essentials: iasItemScore,
  // Section C — Mobility
  moving_inside_house: iasItemScore,
  getting_up: iasItemScore,
  walking_outside: iasItemScore,
  falls_6_months: iasItemScore,
  // Section D — Thinking & Decision-Making
  remembering_routine: iasItemScore,
  understanding_instructions: iasItemScore,
  safe_decisions: iasItemScore,
  // Section E — Health Management
  taking_medicines: iasItemScore,
  understanding_health: iasItemScore,
  following_appointments: iasItemScore,
  // Section F — Nutrition & Continence
  eating_drinking: iasItemScore,
  weight_appetite: iasItemScore,
  bladder_bowel: iasItemScore,
  // Section G — Social Function
  communicating_needs: iasItemScore,
  social_contact: iasItemScore,
  // Section H — Safety & Support
  emergency_help: iasItemScore,
});

export const submitIASSchema = z.object({
  // Proxy metadata
  proxyRelationship: z.enum(['son', 'daughter', 'spouse', 'sibling', 'other_family']),
  proxyProximity: z.enum(['same_city', 'different_city', 'different_country']),
  visitFrequency: z.enum(['daily', 'several_times_week', 'weekly', 'less_than_weekly', 'phone_video_only']),
  parentAge: z.number().int().min(40).max(120),
  livingSituation: z.enum(['alone', 'with_spouse', 'with_family', 'with_caregiver', 'other']),
  livingSituationOther: z.string().max(100).optional(),

  // 24 scored parameters (each 0, 1, or 2)
  parameters: iasParametersSchema,

  // Red flags (binary selection)
  redFlags: z.array(z.enum([
    'two_or_more_falls',
    'missed_incorrect_medicines',
    'unsafe_decisions',
    'significant_weight_loss',
    'social_isolation',
    'recurrent_hospital_admissions',
    'caregiver_struggling',
    'no_emergency_response',
  ])).default([]),

  visitId: z.string().uuid().optional(),
  pathwayOverride: z.string().optional(),
  overrideReason: z.string().optional(),
});

// Dry-run schema (no proxy metadata required)
export const dryRunSchema = z.object({
  parameters: iasParametersSchema,
  redFlags: z.array(z.enum([
    'two_or_more_falls',
    'missed_incorrect_medicines',
    'unsafe_decisions',
    'significant_weight_loss',
    'social_isolation',
    'recurrent_hospital_admissions',
    'caregiver_struggling',
    'no_emergency_response',
  ])).default([]),
});

// ─── Service ────────────────────────────────────────────
class ScoringService {
  async submitScore(patientId: string, data: z.infer<typeof submitIASSchema>, assessedBy: string) {
    const result = calculateIAS(data.parameters);
    const redFlagCount = data.redFlags.length;
    const redFlagUrgency = evaluateRedFlagUrgency(redFlagCount);

    // Get previous score to detect risk band change
    const previousScores = await db.select().from(agingScores)
      .where(eq(agingScores.patientId, patientId))
      .orderBy(desc(agingScores.assessedAt))
      .limit(1);

    const [score] = await db.insert(agingScores).values({
      patientId,
      assessedBy,
      version: 'ias_p_v2',
      parameters: data.parameters,
      domainScores: result.domainScores,
      rawScore: result.rawScore,
      maxScore: result.maxScore,
      iasPercentage: result.iasPercentage.toString(),
      riskBand: result.riskBand,
      recommendedPathway: result.recommendedPathway,
      clinicianPathwayOverride: data.pathwayOverride,
      overrideReason: data.overrideReason,
      visitId: data.visitId,
      // Proxy metadata
      proxyRelationship: data.proxyRelationship,
      proxyProximity: data.proxyProximity,
      visitFrequency: data.visitFrequency,
      parentAge: data.parentAge,
      livingSituation: data.livingSituation,
      livingSituationOther: data.livingSituationOther,
      // Red flags
      redFlags: data.redFlags,
      redFlagCount,
      redFlagUrgency,
    }).returning();

    // Emit score submitted event
    eventBus.emit('score.submitted', {
      scoreId: score.id,
      patientId,
      iasPercentage: result.iasPercentage,
      rawScore: result.rawScore,
      riskBand: result.riskBand,
      redFlagCount,
      redFlagUrgency,
      assessedBy,
    });

    // Emit red flag event if any flags detected
    if (redFlagCount > 0) {
      eventBus.emit('score.red_flags_detected', {
        scoreId: score.id,
        patientId,
        redFlags: data.redFlags,
        urgency: redFlagUrgency,
        assessedBy,
      });
    }

    // Check for risk band change
    if (previousScores.length > 0 && previousScores[0].riskBand !== result.riskBand) {
      const effectivePathway = data.pathwayOverride || result.recommendedPathway;
      await queryClient`
        UPDATE patients SET current_care_pathway = ${effectivePathway}, updated_at = NOW()
        WHERE id = ${patientId}
      `;

      eventBus.emit('risk_band.changed', {
        patientId,
        previousBand: previousScores[0].riskBand,
        newBand: result.riskBand,
        scoreId: score.id,
      });

      logger.warn({
        patientId, scoreId: score.id,
        from: previousScores[0].riskBand, to: result.riskBand,
      }, 'Risk band changed');
    }

    logger.info({
      scoreId: score.id, patientId,
      iasPercentage: result.iasPercentage, riskBand: result.riskBand,
      redFlagCount, redFlagUrgency,
    }, 'IAS-P v2.0 score submitted');

    return score;
  }

  async listScores(patientId: string, page: number, limit: number) {
    const offset = (page - 1) * limit;
    const [totalResult] = await db.select({ count: count() }).from(agingScores)
      .where(eq(agingScores.patientId, patientId));
    const data = await db.select().from(agingScores)
      .where(eq(agingScores.patientId, patientId))
      .orderBy(desc(agingScores.assessedAt))
      .limit(limit).offset(offset);
    return { data, total: totalResult.count };
  }

  async getLatestScore(patientId: string) {
    const [score] = await db.select().from(agingScores)
      .where(eq(agingScores.patientId, patientId))
      .orderBy(desc(agingScores.assessedAt))
      .limit(1);
    return score || null;
  }

  async getScore(patientId: string, scoreId: string) {
    const [score] = await db.select().from(agingScores)
      .where(eq(agingScores.id, scoreId))
      .limit(1);
    if (!score) throw new NotFoundError('Score', scoreId);
    return score;
  }

  dryRunCalculation(parameters: Record<string, number>, redFlags: string[] = []) {
    const result = calculateIAS(parameters);
    const redFlagCount = redFlags.length;
    const redFlagUrgency = evaluateRedFlagUrgency(redFlagCount);
    return { ...result, redFlagCount, redFlagUrgency, redFlags };
  }
}

const scoringService = new ScoringService();

// ─── Routes ─────────────────────────────────────────────

// Public dry-run calculation (no auth needed for form preview)
export const scoringRoutes = new Hono();

scoringRoutes.post('/calculate', async (c) => {
  const body = await c.req.json();
  const parsed = dryRunSchema.safeParse(body);
  if (!parsed.success) {
    throw new ValidationError('Validation failed', parsed.error.errors.map(e => ({
      field: e.path.join('.'),
      message: e.message,
    })));
  }
  const result = scoringService.dryRunCalculation(parsed.data.parameters, parsed.data.redFlags);
  return c.json(successResponse(result));
});

// Patient-scoped routes (auth required, caregiver/patient/clinical staff)
export const patientScoringRoutes = new Hono();
patientScoringRoutes.use('*', authMiddleware);

// POST /patients/:id/scores — Submit IAS-P v2.0 assessment
patientScoringRoutes.post(
  '/',
  requireRoles('caregiver', 'patient', 'nurse', 'doctor', 'coordinator', 'admin'),
  async (c) => {
    const body = await c.req.json();
    const parsed = submitIASSchema.safeParse(body);
    if (!parsed.success) {
      throw new ValidationError('Validation failed', parsed.error.errors.map(e => ({
        field: e.path.join('.'),
        message: e.message,
      })));
    }

    const user = c.get('user');
    const score = await scoringService.submitScore(c.req.param('id')!, parsed.data, user.userId);
    return c.json(successResponse(score), 201);
  }
);

// GET /patients/:id/scores
patientScoringRoutes.get('/', async (c) => {
  const page = parseInt(c.req.query('page') || '1');
  const limit = parseInt(c.req.query('limit') || '20');
  const { data, total } = await scoringService.listScores(c.req.param('id')!, page, limit);
  return c.json(paginatedResponse(data, page, limit, total));
});

// GET /patients/:id/scores/latest
patientScoringRoutes.get('/latest', async (c) => {
  const score = await scoringService.getLatestScore(c.req.param('id')!);
  return c.json(successResponse(score));
});

// GET /patients/:id/scores/:scoreId
patientScoringRoutes.get('/:scoreId', async (c) => {
  const score = await scoringService.getScore(c.req.param('id')!, c.req.param('scoreId')!);
  return c.json(successResponse(score));
});
