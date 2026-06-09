/**
 * VisitModule — Service + Routes
 * Visit/event creation, editing, locking, retrieval.
 */

import { Hono } from 'hono';
import { z } from 'zod';
import { eq, and, desc, count } from 'drizzle-orm';
import { db, queryClient } from '../../db/connection.js';
import { visits } from '../../db/schema/index.js';
import { eventBus } from '../../shared/event-bus.js';
import { logger } from '../../shared/logger.js';
import { NotFoundError, BusinessRuleError, ValidationError } from '../../shared/errors.js';
import { authMiddleware, requirePermission } from '../../middleware/auth.js';
import { successResponse, paginatedResponse } from '../../shared/response.js';

// ─── Schemas ────────────────────────────────────────────
const createVisitSchema = z.object({
  visitType: z.enum(['home_visit', 'clinic', 'teleconsult', 'emergency']),
  visitedAt: z.string().datetime(),
  location: z.string().max(255).optional(),
  chiefComplaint: z.string().optional(),
  systemicExam: z.record(z.any()).optional(),
  clinicalNotes: z.string().max(10000).optional(),
  medicationsReviewed: z.any().optional(),
  attendingClinicians: z.array(z.string().uuid()).optional(),
});

const updateVisitSchema = createVisitSchema.partial();

// ─── Service ────────────────────────────────────────────
class VisitService {
  async createVisit(patientId: string, data: z.infer<typeof createVisitSchema>, createdBy: string) {
    const [visit] = await db.insert(visits).values({
      patientId,
      visitType: data.visitType,
      visitedAt: new Date(data.visitedAt),
      location: data.location,
      chiefComplaint: data.chiefComplaint,
      systemicExam: data.systemicExam,
      clinicalNotes: data.clinicalNotes,
      medicationsReviewed: data.medicationsReviewed,
      attendingClinicians: data.attendingClinicians || [createdBy],
      createdBy,
      status: 'draft',
    }).returning();

    logger.info({ visitId: visit.id, patientId }, 'Visit created (draft)');
    return visit;
  }

  async getVisit(patientId: string, visitId: string) {
    const [visit] = await db.select().from(visits)
      .where(and(eq(visits.id, visitId), eq(visits.patientId, patientId)))
      .limit(1);
    if (!visit) throw new NotFoundError('Visit', visitId);
    return visit;
  }

  async listVisits(patientId: string, page: number, limit: number) {
    const offset = (page - 1) * limit;
    const [totalResult] = await db.select({ count: count() }).from(visits)
      .where(eq(visits.patientId, patientId));
    const data = await db.select().from(visits)
      .where(eq(visits.patientId, patientId))
      .orderBy(desc(visits.visitedAt))
      .limit(limit).offset(offset);
    return { data, total: totalResult.count };
  }

  async updateVisit(patientId: string, visitId: string, data: any) {
    const visit = await this.getVisit(patientId, visitId);
    if (visit.status !== 'draft') {
      throw new BusinessRuleError('Cannot edit a completed or cancelled visit');
    }
    const [updated] = await db.update(visits).set({ ...data, updatedAt: new Date() })
      .where(eq(visits.id, visitId)).returning();
    return updated;
  }

  async completeVisit(patientId: string, visitId: string, completedBy: string) {
    const visit = await this.getVisit(patientId, visitId);
    if (visit.status !== 'draft') {
      throw new BusinessRuleError('Visit is already completed or cancelled');
    }
    const [completed] = await db.update(visits).set({
      status: 'completed',
      completedAt: new Date(),
      updatedAt: new Date(),
    }).where(eq(visits.id, visitId)).returning();

    eventBus.emit('visit.completed', { visitId, patientId, completedBy });
    logger.info({ visitId, patientId }, 'Visit completed and locked');
    return completed;
  }

  async cancelVisit(patientId: string, visitId: string) {
    const visit = await this.getVisit(patientId, visitId);
    if (visit.status !== 'draft') {
      throw new BusinessRuleError('Only draft visits can be cancelled');
    }
    const [cancelled] = await db.update(visits).set({
      status: 'cancelled',
      updatedAt: new Date(),
    }).where(eq(visits.id, visitId)).returning();
    return cancelled;
  }
}

const visitService = new VisitService();

// ─── Routes ─────────────────────────────────────────────
export const visitRoutes = new Hono();
visitRoutes.use('*', authMiddleware);

// POST /patients/:id/visits
visitRoutes.post('/', requirePermission('visits.create'), async (c) => {
  const patientId = c.req.param('id');
  const body = await c.req.json();
  const parsed = createVisitSchema.safeParse(body);
  if (!parsed.success) throw new ValidationError('Validation failed', parsed.error.errors.map(e => ({ field: e.path.join('.'), message: e.message })));

  const user = c.get('user');
  const visit = await visitService.createVisit(patientId, parsed.data, user.userId);
  return c.json(successResponse(visit), 201);
});

// GET /patients/:id/visits
visitRoutes.get('/', async (c) => {
  const patientId = c.req.param('id');
  const page = parseInt(c.req.query('page') || '1');
  const limit = parseInt(c.req.query('limit') || '20');
  const { data, total } = await visitService.listVisits(patientId, page, limit);
  return c.json(paginatedResponse(data, page, limit, total));
});

// GET /patients/:id/visits/:visitId
visitRoutes.get('/:visitId', async (c) => {
  const visit = await visitService.getVisit(c.req.param('id'), c.req.param('visitId'));
  return c.json(successResponse(visit));
});

// PUT /patients/:id/visits/:visitId
visitRoutes.put('/:visitId', requirePermission('visits.edit'), async (c) => {
  const body = await c.req.json();
  const parsed = updateVisitSchema.safeParse(body);
  if (!parsed.success) throw new ValidationError('Validation failed', parsed.error.errors.map(e => ({ field: e.path.join('.'), message: e.message })));
  const visit = await visitService.updateVisit(c.req.param('id'), c.req.param('visitId'), parsed.data);
  return c.json(successResponse(visit));
});

// POST /patients/:id/visits/:visitId/complete
visitRoutes.post('/:visitId/complete', requirePermission('visits.create'), async (c) => {
  const user = c.get('user');
  const visit = await visitService.completeVisit(c.req.param('id'), c.req.param('visitId'), user.userId);
  return c.json(successResponse(visit));
});

// DELETE /patients/:id/visits/:visitId (cancel draft)
visitRoutes.delete('/:visitId', requirePermission('visits.create'), async (c) => {
  const visit = await visitService.cancelVisit(c.req.param('id'), c.req.param('visitId'));
  return c.json(successResponse(visit));
});
