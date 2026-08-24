import { Hono } from 'hono';
import { authMiddleware, requirePermission } from '../../middleware/auth.js';
import { successResponse, paginatedResponse } from '../../shared/response.js';
import { PERMISSIONS } from '../../shared/permissions.js';
import { alertService } from './alert.service.js';

export const alertRoutes = new Hono();
alertRoutes.use('*', authMiddleware);

alertRoutes.get('/', async (c) => {
  const page = parseInt(c.req.query('page') || '1');
  const limit = parseInt(c.req.query('limit') || '20');
  const { data, total } = await alertService.listAlerts({
    page, limit,
    patientId: c.req.query('patient_id'),
    status: c.req.query('status'),
    severity: c.req.query('severity'),
  });
  return c.json(paginatedResponse(data, page, limit, total));
});

alertRoutes.get('/:id', async (c) => {
  const alert = await alertService.getAlert(c.req.param('id'));
  return c.json(successResponse(alert));
});

alertRoutes.post('/:id/acknowledge', async (c) => {
  const user = c.get('user');
  const alert = await alertService.acknowledgeAlert(c.req.param('id'), user.userId);
  return c.json(successResponse(alert));
});

alertRoutes.post('/:id/resolve', async (c) => {
  const alert = await alertService.resolveAlert(c.req.param('id'));
  return c.json(successResponse(alert));
});

export const patientAlertRoutes = new Hono();

patientAlertRoutes.get('/', async (c) => {
  const page = parseInt(c.req.query('page') || '1');
  const limit = parseInt(c.req.query('limit') || '20');
  const { data, total } = await alertService.listAlerts({
    page, limit, patientId: c.req.param('id'),
    status: c.req.query('status'),
  });
  return c.json(paginatedResponse(data, page, limit, total));
});

patientAlertRoutes.get('/alert-rules', async (c) => {
  const rules = await alertService.listAlertRules(c.req.param('id')!);
  return c.json(successResponse(rules));
});

patientAlertRoutes.post('/alert-rules', requirePermission(PERMISSIONS.ALERT_RULES_CONFIGURE), async (c) => {
  const body = await c.req.json();
  const user = c.get('user');
  const rule = await alertService.createAlertRule(c.req.param('id')!, body, user.userId);
  return c.json(successResponse(rule), 201);
});
