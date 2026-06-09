/**
 * VitalsModule — Service + Routes
 * Vitals capture, threshold evaluation, trending computation.
 */

import { Hono } from 'hono';
import { z } from 'zod';
import { eq, and, desc, gte, lte, count, sql } from 'drizzle-orm';
import { db, queryClient } from '../../db/connection.js';
import { vitals, alertRules } from '../../db/schema/index.js';
import { eventBus } from '../../shared/event-bus.js';
import { logger } from '../../shared/logger.js';
import { NotFoundError, ValidationError } from '../../shared/errors.js';
import { authMiddleware, requirePermission } from '../../middleware/auth.js';
import { successResponse, paginatedResponse } from '../../shared/response.js';

// ─── Physiological Bounds ───────────────────────────────
const VITAL_BOUNDS: Record<string, { min: number; max: number; unit: string }> = {
  bp_systolic: { min: 50, max: 300, unit: 'mmHg' },
  bp_diastolic: { min: 20, max: 200, unit: 'mmHg' },
  hr: { min: 20, max: 300, unit: 'bpm' },
  spo2: { min: 0, max: 100, unit: '%' },
  temp: { min: 30, max: 45, unit: '°C' },
  weight: { min: 10, max: 300, unit: 'kg' },
  blood_glucose: { min: 20, max: 600, unit: 'mg/dL' },
  respiratory_rate: { min: 5, max: 60, unit: 'breaths/min' },
};

// Reference ranges for trending
const REFERENCE_RANGES: Record<string, { min: number; max: number }> = {
  bp_systolic: { min: 90, max: 140 },
  bp_diastolic: { min: 60, max: 90 },
  hr: { min: 60, max: 100 },
  spo2: { min: 95, max: 100 },
  temp: { min: 36.1, max: 37.2 },
  blood_glucose: { min: 70, max: 140 },
  respiratory_rate: { min: 12, max: 20 },
};

// ─── Schemas ────────────────────────────────────────────
const recordVitalSchema = z.object({
  parameterType: z.string().min(1),
  value: z.number(),
  unit: z.string().min(1),
  recordedAt: z.string().datetime(),
  visitId: z.string().uuid().optional(),
  source: z.enum(['manual', 'device', 'imported']).default('manual'),
  notes: z.string().optional(),
});

// ─── Service ────────────────────────────────────────────
class VitalsService {
  async recordVital(patientId: string, data: z.infer<typeof recordVitalSchema>, recordedBy: string) {
    // Validate against physiological bounds
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
      visitId: data.visitId,
      source: data.source,
      notes: data.notes,
    }).returning();

    // Emit event for threshold checking
    eventBus.emit('vital.recorded', {
      vitalId: vital.id,
      patientId,
      parameterType: data.parameterType,
      value: data.value,
      recordedBy,
    });

    // Synchronous threshold check
    await this.checkThresholds(patientId, data.parameterType, data.value);

    logger.info({ vitalId: vital.id, patientId, parameterType: data.parameterType }, 'Vital recorded');
    return vital;
  }

  async listVitals(
    patientId: string,
    query: { parameter?: string; from?: string; to?: string; page: number; limit: number }
  ) {
    const offset = (query.page - 1) * query.limit;
    let conditions: any[] = [eq(vitals.patientId, patientId), eq(vitals.isDeleted, false)];

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
    const result = await queryClient`
      SELECT DISTINCT ON (parameter_type)
        id, parameter_type, value, unit, recorded_at, source, notes
      FROM vitals
      WHERE patient_id = ${patientId} AND is_deleted = false
      ORDER BY parameter_type, recorded_at DESC
    `;
    return result;
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
      data: trends.map((t: any) => ({
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
    // Get applicable rules (patient-specific + global)
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

const vitalsService = new VitalsService();

// ─── Routes ─────────────────────────────────────────────
export const vitalsRoutes = new Hono();
vitalsRoutes.use('*', authMiddleware);

// POST /patients/:id/vitals
vitalsRoutes.post('/', requirePermission('vitals.record'), async (c) => {
  const body = await c.req.json();
  const parsed = recordVitalSchema.safeParse(body);
  if (!parsed.success) throw new ValidationError('Validation failed', parsed.error.errors.map(e => ({ field: e.path.join('.'), message: e.message })));

  const user = c.get('user');
  const vital = await vitalsService.recordVital(c.req.param('id'), parsed.data, user.userId);
  return c.json(successResponse(vital), 201);
});

// GET /patients/:id/vitals
vitalsRoutes.get('/', async (c) => {
  const patientId = c.req.param('id');
  const page = parseInt(c.req.query('page') || '1');
  const limit = parseInt(c.req.query('limit') || '20');
  const { data, total } = await vitalsService.listVitals(patientId, {
    parameter: c.req.query('parameter'),
    from: c.req.query('from'),
    to: c.req.query('to'),
    page, limit,
  });
  return c.json(paginatedResponse(data, page, limit, total));
});

// GET /patients/:id/vitals/latest
vitalsRoutes.get('/latest', async (c) => {
  const data = await vitalsService.getLatestVitals(c.req.param('id'));
  return c.json(successResponse(data));
});

// GET /patients/:id/vitals/trends
vitalsRoutes.get('/trends', async (c) => {
  const parameter = c.req.query('parameter');
  const from = c.req.query('from');
  const to = c.req.query('to');
  const period = c.req.query('period') || 'weekly';

  if (!parameter || !from || !to) {
    throw new ValidationError('parameter, from, and to are required query parameters');
  }

  const trends = await vitalsService.getTrends(c.req.param('id'), parameter, from, to, period);
  return c.json(successResponse(trends));
});

// DELETE /patients/:id/vitals/:vitalId
vitalsRoutes.delete('/:vitalId', requirePermission('vitals.record'), async (c) => {
  await vitalsService.softDeleteVital(c.req.param('id'), c.req.param('vitalId'));
  return c.json(successResponse({ message: 'Vital record soft-deleted' }));
});
