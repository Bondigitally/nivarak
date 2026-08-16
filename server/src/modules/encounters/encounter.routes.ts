import { Hono } from 'hono';
import { ValidationError } from '../../shared/errors.js';
import { requirePermission } from '../../middleware/auth.js';
import { successResponse, paginatedResponse } from '../../shared/response.js';
import { PERMISSIONS } from '../../shared/permissions.js';
import { createEncounterSchema } from './encounter.schema.js';
import { encounterService } from './encounter.service.js';

export const encounterRoutes = new Hono();

encounterRoutes.post('/', requirePermission(PERMISSIONS.ENCOUNTERS_CREATE), async (c) => {
  const patientId = c.req.param('id')!;
  const body = await c.req.json();
  const parsed = createEncounterSchema.safeParse(body);
  if (!parsed.success) {
    throw new ValidationError('Validation failed', parsed.error.errors.map((e) => ({
      field: e.path.join('.'),
      message: e.message,
    })));
  }

  const user = c.get('user');
  const encounter = await encounterService.createEncounter(
    patientId,
    parsed.data,
    user.userId,
    user.roles?.[0] || 'other'
  );
  return c.json(successResponse(encounter), 201);
});

encounterRoutes.get('/', async (c) => {
  const patientId = c.req.param('id')!;
  const page = parseInt(c.req.query('page') || '1');
  const limit = parseInt(c.req.query('limit') || '20');
  const { data, total } = await encounterService.listEncounters(patientId, page, limit);
  return c.json(paginatedResponse(data, page, limit, total));
});

encounterRoutes.get('/:encounterId', async (c) => {
  const encounter = await encounterService.getEncounter(c.req.param('id')!, c.req.param('encounterId')!);
  return c.json(successResponse(encounter));
});

encounterRoutes.post('/:encounterId/complete', requirePermission(PERMISSIONS.ENCOUNTERS_COMPLETE), async (c) => {
  const user = c.get('user');
  const encounter = await encounterService.completeEncounter(
    c.req.param('id')!,
    c.req.param('encounterId')!,
    user.userId
  );
  return c.json(successResponse(encounter));
});

encounterRoutes.post('/:encounterId/amend', requirePermission(PERMISSIONS.ENCOUNTERS_AMEND), async (c) => {
  const body = await c.req.json();
  const { amendmentReason, ...encounterData } = body;
  if (!amendmentReason) throw new ValidationError('amendmentReason is required');

  const parsed = createEncounterSchema.safeParse(encounterData);
  if (!parsed.success) {
    throw new ValidationError('Validation failed', parsed.error.errors.map((e) => ({
      field: e.path.join('.'),
      message: e.message,
    })));
  }

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
