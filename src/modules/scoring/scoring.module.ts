/**
 * ScoringModule — Independent Aging Score Engine
 *
 * Pure function scoring engine with configurable weights.
 * 25 parameters grouped into 8 domains.
 * Score maps to risk bands → care pathways.
 */

import { Hono } from 'hono';
import { z } from 'zod';
import { eq, desc, count } from 'drizzle-orm';
import { db, queryClient } from '../../db/connection.js';
import { agingScores, patients } from '../../db/schema/index.js';
import { eventBus } from '../../shared/event-bus.js';
import { logger } from '../../shared/logger.js';
import { NotFoundError, ValidationError } from '../../shared/errors.js';
import { authMiddleware, requirePermission } from '../../middleware/auth.js';
import { successResponse, paginatedResponse } from '../../shared/response.js';

// ─── Scoring Configuration ─────────────────────────────
// Each parameter is scored 0–4 (higher = worse)
// Total possible raw score = 25 * 4 = 100

interface ScoringDomain {
  name: string;
  parameters: string[];
  weight: number; // multiplier
}

const SCORING_DOMAINS: ScoringDomain[] = [
  {
    name: 'physical_function',
    parameters: ['bathing', 'dressing', 'toileting', 'transferring', 'feeding', 'cooking', 'shopping'],
    weight: 1.2,
  },
  {
    name: 'cognitive_function',
    parameters: ['orientation', 'memory', 'judgment', 'communication'],
    weight: 1.3,
  },
  {
    name: 'fall_risk',
    parameters: ['balance', 'gait', 'fall_history'],
    weight: 1.1,
  },
  {
    name: 'nutritional_status',
    parameters: ['bmi_status', 'appetite', 'weight_change'],
    weight: 1.0,
  },
  {
    name: 'social_support',
    parameters: ['living_alone', 'caregiver_availability', 'social_engagement'],
    weight: 0.9,
  },
  {
    name: 'medication_adherence',
    parameters: ['polypharmacy', 'compliance', 'self_management'],
    weight: 1.0,
  },
  {
    name: 'comorbidity_burden',
    parameters: ['chronic_conditions_count', 'disease_severity'],
    weight: 1.1,
  },
  {
    name: 'sensory_function',
    parameters: ['vision', 'hearing'],
    weight: 0.8,
  },
];

const ALL_PARAMETERS = SCORING_DOMAINS.flatMap((d) => d.parameters);

// ─── Risk Band Mapping ──────────────────────────────────
function calculateRiskBand(totalScore: number): { riskBand: string; recommendedPathway: string } {
  if (totalScore <= 25) return { riskBand: 'low', recommendedPathway: 'home_care' };
  if (totalScore <= 50) return { riskBand: 'moderate', recommendedPathway: 'hybrid' };
  if (totalScore <= 75) return { riskBand: 'high', recommendedPathway: 'clinic' };
  return { riskBand: 'critical', recommendedPathway: 'high_dependency' };
}

// ─── Score Calculation (Pure Function) ──────────────────
function calculateScore(parameters: Record<string, number>): {
  totalScore: number;
  domainScores: Record<string, number>;
  riskBand: string;
  recommendedPathway: string;
} {
  const domainScores: Record<string, number> = {};
  let weightedSum = 0;
  let totalWeight = 0;

  for (const domain of SCORING_DOMAINS) {
    let domainRawSum = 0;
    let domainParamCount = 0;

    for (const param of domain.parameters) {
      const val = parameters[param];
      if (val !== undefined && val !== null) {
        domainRawSum += Math.min(Math.max(val, 0), 4); // Clamp 0–4
        domainParamCount++;
      }
    }

    if (domainParamCount > 0) {
      const domainAvg = domainRawSum / domainParamCount;
      const domainWeighted = domainAvg * domain.weight;
      domainScores[domain.name] = Math.round(domainWeighted * 100) / 100;
      weightedSum += domainWeighted * domain.parameters.length;
      totalWeight += domain.weight * domain.parameters.length;
    }
  }

  // Normalize to 0–100
  const totalScore = totalWeight > 0
    ? Math.round((weightedSum / (totalWeight * 4)) * 100)
    : 0;

  const { riskBand, recommendedPathway } = calculateRiskBand(totalScore);

  return { totalScore, domainScores, riskBand, recommendedPathway };
}

// ─── Schema ─────────────────────────────────────────────
const submitScoreSchema = z.object({
  parameters: z.record(z.number().min(0).max(4)),
  visitId: z.string().uuid().optional(),
  pathwayOverride: z.string().optional(),
  overrideReason: z.string().optional(),
});

// ─── Service ────────────────────────────────────────────
class ScoringService {
  async submitScore(patientId: string, data: z.infer<typeof submitScoreSchema>, assessedBy: string) {
    const result = calculateScore(data.parameters);

    // Get previous score to detect risk band change
    const previousScores = await db.select().from(agingScores)
      .where(eq(agingScores.patientId, patientId))
      .orderBy(desc(agingScores.assessedAt))
      .limit(1);

    const [score] = await db.insert(agingScores).values({
      patientId,
      assessedBy,
      parameters: data.parameters,
      domainScores: result.domainScores,
      totalScore: result.totalScore,
      riskBand: result.riskBand,
      recommendedPathway: result.recommendedPathway,
      clinicianPathwayOverride: data.pathwayOverride,
      overrideReason: data.overrideReason,
      visitId: data.visitId,
    }).returning();

    // Emit score submitted event
    eventBus.emit('score.submitted', {
      scoreId: score.id,
      patientId,
      totalScore: result.totalScore,
      riskBand: result.riskBand,
      assessedBy,
    });

    // Check for risk band change
    if (previousScores.length > 0 && previousScores[0].riskBand !== result.riskBand) {
      // Update patient care pathway
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

    logger.info({ scoreId: score.id, patientId, totalScore: result.totalScore, riskBand: result.riskBand }, 'Aging score submitted');
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

  dryRunCalculation(parameters: Record<string, number>) {
    return calculateScore(parameters);
  }
}

const scoringService = new ScoringService();

// ─── Routes ─────────────────────────────────────────────
export const scoringRoutes = new Hono();

// Dry-run calculation (no auth needed for preview)
scoringRoutes.post('/calculate', async (c) => {
  const body = await c.req.json();
  const { parameters } = body;
  if (!parameters) throw new ValidationError('parameters object is required');
  const result = scoringService.dryRunCalculation(parameters);
  return c.json(successResponse(result));
});

// Patient-scoped routes
export const patientScoringRoutes = new Hono();
patientScoringRoutes.use('*', authMiddleware);

// POST /patients/:id/scores
patientScoringRoutes.post('/', requirePermission('scores.submit'), async (c) => {
  const body = await c.req.json();
  const parsed = submitScoreSchema.safeParse(body);
  if (!parsed.success) throw new ValidationError('Validation failed', parsed.error.errors.map(e => ({ field: e.path.join('.'), message: e.message })));

  const user = c.get('user');
  const score = await scoringService.submitScore(c.req.param('id'), parsed.data, user.userId);
  return c.json(successResponse(score), 201);
});

// GET /patients/:id/scores
patientScoringRoutes.get('/', async (c) => {
  const page = parseInt(c.req.query('page') || '1');
  const limit = parseInt(c.req.query('limit') || '20');
  const { data, total } = await scoringService.listScores(c.req.param('id'), page, limit);
  return c.json(paginatedResponse(data, page, limit, total));
});

// GET /patients/:id/scores/latest
patientScoringRoutes.get('/latest', async (c) => {
  const score = await scoringService.getLatestScore(c.req.param('id'));
  return c.json(successResponse(score));
});

// GET /patients/:id/scores/:scoreId
patientScoringRoutes.get('/:scoreId', async (c) => {
  const score = await scoringService.getScore(c.req.param('id'), c.req.param('scoreId'));
  return c.json(successResponse(score));
});
