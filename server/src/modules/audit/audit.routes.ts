import { Hono } from 'hono';
import { desc, eq, and, count } from 'drizzle-orm';
import { db } from '../../db/connection.js';
import { auditLogs } from '../../db/schema/index.js';
import { authMiddleware, requireRoles } from '../../middleware/auth.js';
import { paginatedResponse } from '../../shared/response.js';

export const auditRoutes = new Hono();
auditRoutes.use('*', authMiddleware);
auditRoutes.use('*', requireRoles('admin'));

auditRoutes.get('/', async (c) => {
  const page = parseInt(c.req.query('page') || '1');
  const limit = parseInt(c.req.query('limit') || '20');
  const offset = (page - 1) * limit;

  const conditions = [];
  const entityType = c.req.query('entity_type');
  const entityId = c.req.query('entity_id');
  const actorId = c.req.query('actor_id');
  const patientId = c.req.query('patient_id');

  if (entityType) conditions.push(eq(auditLogs.entityType, entityType));
  if (entityId) conditions.push(eq(auditLogs.entityId, entityId));
  if (actorId) conditions.push(eq(auditLogs.actorId, actorId));
  if (patientId) conditions.push(eq(auditLogs.patientId, patientId));

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  const [totalResult] = await db.select({ count: count() }).from(auditLogs).where(whereClause);
  const data = await db.select().from(auditLogs).where(whereClause)
    .orderBy(desc(auditLogs.occurredAt)).limit(limit).offset(offset);

  return c.json(paginatedResponse(data, page, limit, totalResult.count));
});
