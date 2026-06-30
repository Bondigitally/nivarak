/**
 * Nivarak — Auth Middleware
 *
 * JWT validation, user context injection, and role-based access control.
 * Three-tier enforcement: JWT → Role Check → Business Logic (RLS at DB).
 */

import { Context, Next } from 'hono';
import jwt from 'jsonwebtoken';
import { config } from '../config/index.js';
import { AuthenticationError, AuthorizationError } from '../shared/errors.js';
import { db } from '../db/connection.js';
import { users, userRoles, roles, caregiverLinks } from '../db/schema/index.js';
import { eq, and, isNull } from 'drizzle-orm';

export interface AuthUser {
  userId: string;
  phone: string;
  fullName: string;
  roles: string[];
  permissions: string[];
  linkedPatientIds: string[];
}

declare module 'hono' {
  interface ContextVariableMap {
    user: AuthUser;
    correlationId: string;
  }
}

/**
 * Authenticate incoming requests via JWT Bearer token.
 */
export async function authMiddleware(c: Context, next: Next): Promise<void | Response> {
  const authHeader = c.req.header('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    throw new AuthenticationError('Missing or invalid Authorization header');
  }

  const token = authHeader.slice(7);

  try {
    const payload = jwt.verify(token, config.jwt.accessSecret) as {
      sub: string;
      phone: string;
      roles: string[];
    };

    // Load full user context from DB
    const user = await loadUserContext(payload.sub);
    if (!user) {
      throw new AuthenticationError('User not found or deactivated');
    }

    c.set('user', user);
    await next();
  } catch (err) {
    if (err instanceof AuthenticationError) throw err;
    if (err instanceof jwt.TokenExpiredError) {
      throw new AuthenticationError('Token expired');
    }
    if (err instanceof jwt.JsonWebTokenError) {
      throw new AuthenticationError('Invalid token');
    }
    throw err;
  }
}

/**
 * Role guard — restricts route access to specific roles.
 */
export function requireRoles(...allowedRoles: string[]) {
  return async (c: Context, next: Next): Promise<void | Response> => {
    const user = c.get('user');
    if (!user) throw new AuthenticationError();

    const hasRole = user.roles.some((r) => allowedRoles.includes(r));
    if (!hasRole) {
      throw new AuthorizationError(
        `This action requires one of: ${allowedRoles.join(', ')}`
      );
    }

    await next();
  };
}

/**
 * Permission guard — checks for specific permission strings.
 */
export function requirePermission(permission: string) {
  return async (c: Context, next: Next): Promise<void | Response> => {
    const user = c.get('user');
    if (!user) throw new AuthenticationError();

    if (!user.permissions.includes(permission)) {
      throw new AuthorizationError(`Missing required permission: ${permission}`);
    }

    await next();
  };
}

/**
 * Load full user context including roles, permissions, and linked patients.
 */
async function loadUserContext(userId: string): Promise<AuthUser | null> {
  const userRows = await db
    .select({
      id: users.id,
      phone: users.phone,
      fullName: users.fullName,
      isActive: users.isActive,
    })
    .from(users)
    .where(and(eq(users.id, userId), eq(users.isActive, true)))
    .limit(1);

  if (userRows.length === 0) return null;
  const userRow = userRows[0];

  // Load roles and permissions
  const roleRows = await db
    .select({
      roleName: roles.name,
      permissions: roles.permissions,
    })
    .from(userRoles)
    .innerJoin(roles, eq(userRoles.roleId, roles.id))
    .where(eq(userRoles.userId, userId));

  const userRoleNames = roleRows.map((r) => r.roleName);
  const allPermissions = [...new Set(roleRows.flatMap((r) => r.permissions || []))];

  // Load linked patient IDs (for ABAC)
  const linkRows = await db
    .select({ patientId: caregiverLinks.patientId })
    .from(caregiverLinks)
    .where(
      and(
        eq(caregiverLinks.userId, userId),
        isNull(caregiverLinks.revokedAt)
      )
    );

  return {
    userId: userRow.id,
    phone: userRow.phone,
    fullName: userRow.fullName,
    roles: userRoleNames,
    permissions: allPermissions,
    linkedPatientIds: linkRows.map((l) => l.patientId),
  };
}
