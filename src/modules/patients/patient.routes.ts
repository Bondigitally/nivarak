/**
 * PatientModule — Route Handlers
 */

import { Hono } from 'hono';
import { patientService } from './patient.service.js';
import { createPatientSchema, updatePatientSchema, linkCaregiverSchema, patientQuerySchema } from './patient.schema.js';
import { authMiddleware, requireRoles, requirePermission } from '../../middleware/auth.js';
import { successResponse, paginatedResponse } from '../../shared/response.js';
import { ValidationError } from '../../shared/errors.js';

export const patientRoutes = new Hono();

// All patient routes require authentication
patientRoutes.use('*', authMiddleware);

// POST /patients — Create patient
patientRoutes.post('/', requirePermission('patients.create'), async (c) => {
  const body = await c.req.json();
  const parsed = createPatientSchema.safeParse(body);
  if (!parsed.success) {
    throw new ValidationError('Validation failed', parsed.error.errors.map((e) => ({
      field: e.path.join('.'),
      message: e.message,
    })));
  }

  const user = c.get('user');
  const patient = await patientService.createPatient(parsed.data, user.userId);
  return c.json(successResponse(patient), 201);
});

// GET /patients — List patients
patientRoutes.get('/', async (c) => {
  const query = patientQuerySchema.parse({
    page: c.req.query('page'),
    limit: c.req.query('limit'),
    search: c.req.query('search'),
    carePathway: c.req.query('carePathway'),
  });

  const user = c.get('user');
  const { data, total } = await patientService.listPatients(user, query);
  return c.json(paginatedResponse(data, query.page, query.limit, total));
});

// GET /patients/:id — Get patient profile
patientRoutes.get('/:id', async (c) => {
  const user = c.get('user');
  const patient = await patientService.getPatient(c.req.param('id'), user);
  return c.json(successResponse(patient));
});

// PUT /patients/:id — Update patient profile
patientRoutes.put('/:id', requirePermission('patients.edit'), async (c) => {
  const body = await c.req.json();
  const parsed = updatePatientSchema.safeParse(body);
  if (!parsed.success) {
    throw new ValidationError('Validation failed', parsed.error.errors.map((e) => ({
      field: e.path.join('.'),
      message: e.message,
    })));
  }

  const user = c.get('user');
  const patient = await patientService.updatePatient(c.req.param('id'), parsed.data, user.userId);
  return c.json(successResponse(patient));
});

// GET /patients/:id/summary — Dashboard summary card
patientRoutes.get('/:id/summary', async (c) => {
  const user = c.get('user');
  const summary = await patientService.getPatientSummary(c.req.param('id'), user);
  return c.json(successResponse(summary));
});

// POST /patients/:id/caregivers — Link caregiver
patientRoutes.post('/:id/caregivers', requirePermission('patients.link_caregiver'), async (c) => {
  const body = await c.req.json();
  const parsed = linkCaregiverSchema.safeParse(body);
  if (!parsed.success) {
    throw new ValidationError('Validation failed', parsed.error.errors.map((e) => ({
      field: e.path.join('.'),
      message: e.message,
    })));
  }

  const user = c.get('user');
  const link = await patientService.linkCaregiver(c.req.param('id'), parsed.data, user.userId);
  return c.json(successResponse(link), 201);
});

// DELETE /patients/:id/caregivers/:userId — Unlink caregiver
patientRoutes.delete('/:id/caregivers/:userId', requirePermission('patients.link_caregiver'), async (c) => {
  await patientService.unlinkCaregiver(c.req.param('id'), c.req.param('userId'));
  return c.json(successResponse({ message: 'Caregiver unlinked' }));
});

// GET /patients/:id/caregivers — List linked caregivers
patientRoutes.get('/:id/caregivers', async (c) => {
  const caregivers = await patientService.listCaregivers(c.req.param('id'));
  return c.json(successResponse(caregivers));
});
