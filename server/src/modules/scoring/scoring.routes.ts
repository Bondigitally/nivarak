import { Hono } from 'hono';
import { ValidationError } from '../../shared/errors.js';
import { requireRoles } from '../../middleware/auth.js';
import { successResponse, paginatedResponse } from '../../shared/response.js';
import { dryRunSchema, submitIASSchema } from './scoring.schema.js';
import { scoringService } from './scoring.service.js';

export const scoringRoutes = new Hono();

scoringRoutes.post('/calculate', async (c) => {
  const body = await c.req.json();
  const parsed = dryRunSchema.safeParse(body);
  if (!parsed.success) {
    throw new ValidationError('Validation failed', parsed.error.errors.map((e) => ({
      field: e.path.join('.'),
      message: e.message,
    })));
  }
  const result = scoringService.dryRunCalculation(parsed.data.parameters, parsed.data.redFlags);
  return c.json(successResponse(result));
});

export const patientScoringRoutes = new Hono();

patientScoringRoutes.post(
  '/',
  requireRoles('caregiver', 'patient', 'nurse', 'doctor', 'coordinator', 'admin'),
  async (c) => {
    const body = await c.req.json();
    const parsed = submitIASSchema.safeParse(body);
    if (!parsed.success) {
      throw new ValidationError('Validation failed', parsed.error.errors.map((e) => ({
        field: e.path.join('.'),
        message: e.message,
      })));
    }

    const user = c.get('user');
    const score = await scoringService.submitScore(c.req.param('id')!, parsed.data, user.userId);
    return c.json(successResponse(score), 201);
  }
);

patientScoringRoutes.get('/', async (c) => {
  const page = parseInt(c.req.query('page') || '1');
  const limit = parseInt(c.req.query('limit') || '20');
  const { data, total } = await scoringService.listScores(c.req.param('id')!, page, limit);
  return c.json(paginatedResponse(data, page, limit, total));
});

patientScoringRoutes.get('/latest', async (c) => {
  const score = await scoringService.getLatestScore(c.req.param('id')!);
  return c.json(successResponse(score));
});

patientScoringRoutes.get('/:scoreId', async (c) => {
  const score = await scoringService.getScore(c.req.param('id')!, c.req.param('scoreId')!);
  return c.json(successResponse(score));
});
