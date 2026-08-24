import { eq, and, desc, gte, lte, count, sql } from 'drizzle-orm';
import { db, queryClient } from '../../db/connection.js';
import { vitals, alertRules } from '../../db/schema/index.js';
import { eventBus } from '../../shared/event-bus.js';
import { logger } from '../../shared/logger.js';
import { NotFoundError, ValidationError } from '../../shared/errors.js';
import { VITAL_BOUNDS, REFERENCE_RANGES, type RecordVitalInput } from './vitals.schema.js';

class VitalsService {
  async recordVital(patientId: string, data: RecordVitalInput, recordedBy: string) {
    const bounds = VITAL_BOUNDS[data.parameterType];
    if (bounds) {
      if (data.value < bounds.min || data.value > bounds.max) {
        throw new ValidationError(
          `${data.parameterType} value ${data.value} is outside physiological range (${bounds.min}-${bounds.max})`
        );
      }
    }

    const [vital] = await db.insert(vitals).values({
      patientId,
      parameterType: data.parameterType,
      value: data.value.toString(),
      unit: data.unit,
      recordedAt: new Date(data.recordedAt),
      recordedBy,
      encounterId: data.encounterId,
      source: data.source,
      notes: data.notes,
    }).returning();

    eventBus.emit('vital.recorded', {
      vitalId: vital.id,
      patientId,
      parameterType: data.parameterType,
      value: data.value,
      recordedBy,
    });

    await this.checkThresholds(patientId, data.parameterType, data.value);

    logger.info({ vitalId: vital.id, patientId, parameterType: data.parameterType }, 'Vital recorded');
    return vital;
  }

  async listVitals(
    patientId: string,
    query: { parameter?: string; from?: string; to?: string; page: number; limit: number }
  ) {
    const offset = (query.page - 1) * query.limit;
    const conditions = [eq(vitals.patientId, patientId), eq(vitals.isDeleted, false)];

    if (query.parameter) conditions.push(eq(vitals.parameterType, query.parameter));
    if (query.from) conditions.push(gte(vitals.recordedAt, new Date(query.from)));
    if (query.to) conditions.push(lte(vitals.recordedAt, new Date(query.to)));

    const whereClause = and(...conditions);
    const [totalResult] = await db.select({ count: count() }).from(vitals).where(whereClause);
    const data = await db.select().from(vitals).where(whereClause)
      .orderBy(desc(vitals.recordedAt)).limit(query.limit).offset(offset);

    return { data, total: totalResult.count };
  }

  async getLatestVitals(patientId: string) {
    return queryClient`
      SELECT DISTINCT ON (parameter_type)
        id, parameter_type, value, unit, recorded_at, source, notes
      FROM vitals
      WHERE patient_id = ${patientId} AND is_deleted = false
      ORDER BY parameter_type, recorded_at DESC
    `;
  }

  async getTrends(patientId: string, parameter: string, from: string, to: string, period: string = 'weekly') {
    const groupBy = period === 'daily' ? 'day' : period === 'monthly' ? 'month' : 'week';

    const trends = await queryClient`
      SELECT
        date_trunc(${groupBy}, recorded_at) as period_start,
        MIN(value::numeric) as min,
        MAX(value::numeric) as max,
        AVG(value::numeric)::numeric(10,2) as avg,
        COUNT(*) as count
      FROM vitals
      WHERE patient_id = ${patientId}
        AND parameter_type = ${parameter}
        AND is_deleted = false
        AND recorded_at >= ${from}::timestamptz
        AND recorded_at <= ${to}::timestamptz
      GROUP BY date_trunc(${groupBy}, recorded_at)
      ORDER BY period_start
    `;

    const refRange = REFERENCE_RANGES[parameter] || null;

    return {
      parameter,
      unit: VITAL_BOUNDS[parameter]?.unit || '',
      period,
      data: (trends as unknown as Array<{
        period_start: unknown;
        min: unknown;
        max: unknown;
        avg: unknown;
        count: unknown;
      }>).map((t) => ({
        period_start: t.period_start,
        min: Number(t.min),
        max: Number(t.max),
        avg: Number(t.avg),
        count: Number(t.count),
      })),
      reference_range: refRange,
    };
  }

  async softDeleteVital(patientId: string, vitalId: string) {
    const result = await queryClient`
      UPDATE vitals SET is_deleted = true
      WHERE id = ${vitalId} AND patient_id = ${patientId}
      RETURNING id
    `;
    if (result.length === 0) throw new NotFoundError('Vital', vitalId);
  }

  private async checkThresholds(patientId: string, parameterType: string, value: number) {
    const rules = await db.select().from(alertRules).where(
      and(
        eq(alertRules.parameterType, parameterType),
        eq(alertRules.isActive, true),
        sql`(${alertRules.patientId} = ${patientId} OR ${alertRules.patientId} IS NULL)`
      )
    );

    for (const rule of rules) {
      const threshold = Number(rule.thresholdValue);
      let breached = false;

      switch (rule.condition) {
        case 'gt': breached = value > threshold; break;
        case 'gte': breached = value >= threshold; break;
        case 'lt': breached = value < threshold; break;
        case 'lte': breached = value <= threshold; break;
      }

      if (breached) {
        eventBus.emit('vital.threshold_breached', {
          patientId,
          parameterType,
          value,
          threshold,
          severity: rule.severity,
        });
        logger.warn({ patientId, parameterType, value, threshold, severity: rule.severity }, 'Vital threshold breached');
      }
    }
  }
}

export const vitalsService = new VitalsService();
