import { Hono } from 'hono';
import { ValidationError } from '../../shared/errors.js';
import { requirePermission } from '../../middleware/auth.js';
import { successResponse, paginatedResponse } from '../../shared/response.js';
import { PERMISSIONS } from '../../shared/permissions.js';
import { recordVitalSchema } from './vitals.schema.js';
import { vitalsService } from './vitals.service.js';

export const vitalsRoutes = new Hono();

vitalsRoutes.post('/', requirePermission(PERMISSIONS.VITALS_RECORD), async (c) => {
  const body = await c.req.json();
  const parsed = recordVitalSchema.safeParse(body);
  if (!parsed.success) {
    throw new ValidationError('Validation failed', parsed.error.errors.map((e) => ({
      field: e.path.join('.'),
      message: e.message,
    })));
  }

  const user = c.get('user');
  const vital = await vitalsService.recordVital(c.req.param('id')!, parsed.data, user.userId);
  return c.json(successResponse(vital), 201);
});

vitalsRoutes.get('/', async (c) => {
  const patientId = c.req.param('id')!;
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

vitalsRoutes.get('/latest', async (c) => {
  const data = await vitalsService.getLatestVitals(c.req.param('id')!);
  return c.json(successResponse(data));
});

vitalsRoutes.get('/trends', async (c) => {
  const parameter = c.req.query('parameter');
  const from = c.req.query('from');
  const to = c.req.query('to');
  const period = c.req.query('period') || 'weekly';

  if (!parameter || !from || !to) {
    throw new ValidationError('parameter, from, and to are required query parameters');
  }

  const trends = await vitalsService.getTrends(c.req.param('id')!, parameter, from, to, period);
  return c.json(successResponse(trends));
});

vitalsRoutes.delete('/:vitalId', requirePermission(PERMISSIONS.VITALS_RECORD), async (c) => {
  await vitalsService.softDeleteVital(c.req.param('id')!, c.req.param('vitalId')!);
  return c.json(successResponse({ message: 'Vital record soft-deleted' }));
});
