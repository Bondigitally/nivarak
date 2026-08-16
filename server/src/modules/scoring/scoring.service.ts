import { eq, and, desc, count } from 'drizzle-orm';
import { db, queryClient } from '../../db/connection.js';
import { agingScores } from '../../db/schema/index.js';
import { eventBus } from '../../shared/event-bus.js';
import { logger } from '../../shared/logger.js';
import { NotFoundError } from '../../shared/errors.js';
import { calculateIAS, evaluateRedFlagUrgency } from './ias-calculator.js';
import type { SubmitIASInput } from './scoring.schema.js';

class ScoringService {
  async submitScore(patientId: string, data: SubmitIASInput, assessedBy: string) {
    const result = calculateIAS(data.parameters);
    const redFlagCount = data.redFlags.length;
    const redFlagUrgency = evaluateRedFlagUrgency(redFlagCount);

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
      encounterId: data.encounterId,
      proxyRelationship: data.proxyRelationship,
      proxyProximity: data.proxyProximity,
      visitFrequency: data.visitFrequency,
      parentAge: data.parentAge,
      livingSituation: data.livingSituation,
      livingSituationOther: data.livingSituationOther,
      redFlags: data.redFlags,
      redFlagCount,
      redFlagUrgency,
    }).returning();

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

    if (redFlagCount > 0) {
      eventBus.emit('score.red_flags_detected', {
        scoreId: score.id,
        patientId,
        redFlags: data.redFlags,
        urgency: redFlagUrgency,
        assessedBy,
      });
    }

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
      .where(and(eq(agingScores.id, scoreId), eq(agingScores.patientId, patientId)))
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

export const scoringService = new ScoringService();
