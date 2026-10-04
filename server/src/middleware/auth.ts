/**
 * Nivarak — Auth Middleware
 *
 * Cognito JWT validation, user context injection, and role-based access control.
 * Three-tier enforcement: JWT → Role Check → Business Logic (RLS at DB).
 */

import { Context, Next } from 'hono';
import { and, eq, isNull } from 'drizzle-orm';
import { AuthenticationError, AuthorizationError } from '../shared/errors.js';
import { db } from '../db/connection.js';
import { users, userRoles, roles, caregiverLinks } from '../db/schema/index.js';
import type { Permission } from '../shared/permissions.js';
import {
  getCognitoAccessTokenVerifier,
  type CognitoAccessTokenPayload,
} from '../lib/cognito-jwt.js';

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
 * Authenticate incoming requests via Cognito access JWT Bearer token.
 */
export async function authMiddleware(c: Context, next: Next): Promise<void | Response> {
  const authHeader = c.req.header('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    throw new AuthenticationError('Missing or invalid Authorization header');
  }

  const token = authHeader.slice(7);

  try {
    const verifier = getCognitoAccessTokenVerifier();
    const payload = (await verifier.verify(token)) as CognitoAccessTokenPayload;

    const user = await resolveUserFromCognitoPayload(payload);
    if (!user) {
      throw new AuthenticationError('User not found or deactivated');
    }

    c.set('user', user);
    await next();
  } catch (err) {
    if (err instanceof AuthenticationError) throw err;
    throw new AuthenticationError('Invalid or expired token');
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
export function requirePermission(permission: Permission) {
  return async (c: Context, next: Next): Promise<void | Response> => {
    const user = c.get('user');
    if (!user) throw new AuthenticationError();

    if (!user.permissions.includes(permission)) {
      throw new AuthorizationError(`Missing required permission: ${permission}`);
    }

    await next();
  };
}

async function resolveUserFromCognitoPayload(
  payload: CognitoAccessTokenPayload,
): Promise<AuthUser | null> {
  const cognitoSub = payload.sub;
  const username = typeof payload.username === 'string' ? payload.username : undefined;

  const bySub = await db
    .select({ id: users.id })
    .from(users)
    .where(and(eq(users.cognitoSub, cognitoSub), eq(users.isActive, true)))
    .limit(1);

  if (bySub.length > 0) {
    return loadUserContext(bySub[0].id);
  }

  if (!username) return null;

  const identityFilter = username.includes('@')
    ? eq(users.email, username.toLowerCase())
    : eq(users.phone, username);

  const byIdentity = await db
    .select({ id: users.id })
    .from(users)
    .where(and(identityFilter, eq(users.isActive, true)))
    .limit(1);

  if (byIdentity.length === 0) return null;

  await db
    .update(users)
    .set({ cognitoSub, updatedAt: new Date() })
    .where(eq(users.id, byIdentity[0].id));

  return loadUserContext(byIdentity[0].id);
}

/**
 * Load full user context including roles, permissions, and linked patients.
 */
async function loadUserContext(userId: string): Promise<AuthUser | null> {
  const [userRows, roleRows, linkRows] = await Promise.all([
    db
      .select({
        id: users.id,
        phone: users.phone,
        fullName: users.fullName,
        isActive: users.isActive,
      })
      .from(users)
      .where(and(eq(users.id, userId), eq(users.isActive, true)))
      .limit(1),
    db
      .select({
        roleName: roles.name,
        permissions: roles.permissions,
      })
      .from(userRoles)
      .innerJoin(roles, eq(userRoles.roleId, roles.id))
      .where(eq(userRoles.userId, userId)),
    db
      .select({ patientId: caregiverLinks.patientId })
      .from(caregiverLinks)
      .where(
        and(
          eq(caregiverLinks.userId, userId),
          isNull(caregiverLinks.revokedAt)
        )
      ),
  ]);

  if (userRows.length === 0) return null;
  const userRow = userRows[0];

  const userRoleNames = roleRows.map((r) => r.roleName);
  const allPermissions = [...new Set(roleRows.flatMap((r) => r.permissions || []))];

  return {
    userId: userRow.id,
    phone: userRow.phone,
    fullName: userRow.fullName,
    roles: userRoleNames,
    permissions: allPermissions,
    linkedPatientIds: linkRows.map((l) => l.patientId),
  };
}
