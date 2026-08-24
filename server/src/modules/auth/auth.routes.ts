/**
 * AuthModule — Route Handlers (Hono)
 *
 * Identity (OTP, password, tokens) is handled by Cognito.
 * These routes cover app-level user provisioning only.
 */

import { Hono } from 'hono';
import { authService } from './auth.service.js';
import { inviteSchema } from './auth.schema.js';
import { authMiddleware, requireRoles } from '../../middleware/auth.js';
import { successResponse } from '../../shared/response.js';
import { ValidationError } from '../../shared/errors.js';

export const authRoutes = new Hono();

// POST /auth/logout — Sign out (Cognito GlobalSignOut will replace this)
authRoutes.post('/logout', authMiddleware, async (c) => {
  const user = c.get('user');
  await authService.logout(user.userId);
  return c.json(successResponse({ message: 'Logged out successfully' }));
});

// POST /auth/invite — Send invite to new user (Admin/Coordinator only)
authRoutes.post('/invite', authMiddleware, requireRoles('admin', 'coordinator'), async (c) => {
  const body = await c.req.json();
  const parsed = inviteSchema.safeParse(body);
  if (!parsed.success) {
    throw new ValidationError('Validation failed', parsed.error.errors.map((e) => ({
      field: e.path.join('.'),
      message: e.message,
    })));
  }

  const user = c.get('user');
  const result = await authService.inviteUser(
    parsed.data.phone,
    parsed.data.fullName,
    parsed.data.role,
    user.userId,
    user.roles || []
  );

  return c.json(successResponse(result), 201);
});
