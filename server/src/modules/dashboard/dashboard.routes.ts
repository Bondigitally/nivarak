import { Hono } from 'hono';
import { authMiddleware, requireRoles } from '../../middleware/auth.js';
import { successResponse } from '../../shared/response.js';
import {
  getCoordinatorDashboard,
  getDoctorDashboard,
  getCaregiverDashboard,
  getAdminDashboard,
} from './dashboard.service.js';

export const dashboardRoutes = new Hono();
dashboardRoutes.use('*', authMiddleware);

dashboardRoutes.get('/coordinator', requireRoles('coordinator', 'admin'), async (c) => {
  return c.json(successResponse(await getCoordinatorDashboard()));
});

dashboardRoutes.get('/doctor', requireRoles('doctor', 'admin'), async (c) => {
  const user = c.get('user');
  return c.json(successResponse(await getDoctorDashboard(user.userId)));
});

dashboardRoutes.get('/caregiver', requireRoles('caregiver'), async (c) => {
  const user = c.get('user');
  return c.json(successResponse(await getCaregiverDashboard(user.userId)));
});

dashboardRoutes.get('/admin', requireRoles('admin'), async (c) => {
  return c.json(successResponse(await getAdminDashboard()));
});
