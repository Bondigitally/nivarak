/**
 * AuthModule — Route Handlers (Hono)
 */

import { Hono } from 'hono';
import { authService } from './auth.service.js';
import {
  requestOtpSchema,
  verifyOtpSchema,
  loginSchema,
  registerSchema,
  inviteSchema,
  changePasswordSchema,
  forgotPasswordSchema,
  verifyResetCodeSchema,
  resetPasswordSchema,
} from './auth.schema.js';
import { authMiddleware, requireRoles } from '../../middleware/auth.js';
import { successResponse } from '../../shared/response.js';
import { ValidationError } from '../../shared/errors.js';

export const authRoutes = new Hono();

// POST /auth/request-otp — Send OTP to phone
authRoutes.post('/request-otp', async (c) => {
  const body = await c.req.json();
  const parsed = requestOtpSchema.safeParse(body);
  if (!parsed.success) {
    throw new ValidationError('Validation failed', parsed.error.errors.map((e) => ({
      field: e.path.join('.'),
      message: e.message,
    })));
  }

  const result = await authService.requestOtp(parsed.data.phone);
  return c.json(successResponse(result));
});

// POST /auth/verify-otp — Verify OTP, returns tokens
authRoutes.post('/verify-otp', async (c) => {
  const body = await c.req.json();
  const parsed = verifyOtpSchema.safeParse(body);
  if (!parsed.success) {
    throw new ValidationError('Validation failed', parsed.error.errors.map((e) => ({
      field: e.path.join('.'),
      message: e.message,
    })));
  }

  const ip = c.req.header('X-Forwarded-For') || c.req.header('x-real-ip') || '';
  const userAgent = c.req.header('User-Agent') || '';

  const result = await authService.verifyOtp(parsed.data.phone, parsed.data.otp, ip, userAgent);
  return c.json(successResponse(result));
});

// POST /auth/login — Phone + password login
authRoutes.post('/login', async (c) => {
  const body = await c.req.json();
  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    throw new ValidationError('Validation failed', parsed.error.errors.map((e) => ({
      field: e.path.join('.'),
      message: e.message,
    })));
  }

  const ip = c.req.header('X-Forwarded-For') || '';
  const userAgent = c.req.header('User-Agent') || '';

  const result = await authService.login(parsed.data.phone, parsed.data.password, ip, userAgent);
  return c.json(successResponse(result));
});

// POST /auth/register — Create account after OTP verification
authRoutes.post('/register', async (c) => {
  const body = await c.req.json();
  const parsed = registerSchema.safeParse(body);
  if (!parsed.success) {
    throw new ValidationError('Validation failed', parsed.error.errors.map((e) => ({
      field: e.path.join('.'),
      message: e.message,
    })));
  }

  const result = await authService.register(parsed.data);
  return c.json(successResponse(result), 201);
});

// POST /auth/refresh — Refresh access token
authRoutes.post('/refresh', async (c) => {
  const body = await c.req.json();
  const { refreshToken } = body;
  if (!refreshToken) throw new ValidationError('refreshToken is required');

  const ip = c.req.header('X-Forwarded-For') || '';
  const userAgent = c.req.header('User-Agent') || '';

  const result = await authService.refreshToken(refreshToken, ip, userAgent);
  return c.json(successResponse(result));
});

// POST /auth/logout — Invalidate session (requires auth)
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

// POST /auth/forgot-password — Initiate email-based password reset
authRoutes.post('/forgot-password', async (c) => {
  const body = await c.req.json();
  const parsed = forgotPasswordSchema.safeParse(body);
  if (!parsed.success) {
    throw new ValidationError('Validation failed', parsed.error.errors.map((e) => ({
      field: e.path.join('.'),
      message: e.message,
    })));
  }

  const result = await authService.forgotPassword(parsed.data.email);
  return c.json(successResponse(result));
});

// POST /auth/verify-reset-code — Validate the 6-digit reset code (non-consuming)
authRoutes.post('/verify-reset-code', async (c) => {
  const body = await c.req.json();
  const parsed = verifyResetCodeSchema.safeParse(body);
  if (!parsed.success) {
    throw new ValidationError('Validation failed', parsed.error.errors.map((e) => ({
      field: e.path.join('.'),
      message: e.message,
    })));
  }

  const result = await authService.verifyResetCode(parsed.data.email, parsed.data.code);
  return c.json(successResponse(result));
});

// POST /auth/reset-password — Set new password (re-verifies code, consumes it, revokes sessions)
authRoutes.post('/reset-password', async (c) => {
  const body = await c.req.json();
  const parsed = resetPasswordSchema.safeParse(body);
  if (!parsed.success) {
    throw new ValidationError('Validation failed', parsed.error.errors.map((e) => ({
      field: e.path.join('.'),
      message: e.message,
    })));
  }

  const result = await authService.resetPassword(
    parsed.data.email,
    parsed.data.code,
    parsed.data.newPassword,
  );
  return c.json(successResponse(result));
});
