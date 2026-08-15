/**
 * AuthModule — Service Layer
 *
 * Handles OTP generation/verification, JWT issuance, password login,
 * user registration, session management, and invite flows.
 */

import { eq } from 'drizzle-orm';
import { db, queryClient } from '../../db/connection.js';
import { users, roles } from '../../db/schema/index.js';
import { logger } from '../../shared/logger.js';
import {
  NotFoundError,
  BusinessRuleError,
} from '../../shared/errors.js';


// Role hierarchy (higher index = higher privilege)
const ROLE_HIERARCHY: Record<string, number> = {
  patient: 0,
  caregiver: 1,
  nurse: 2,
  doctor: 3,
  coordinator: 4,
  admin: 5,
};

export class AuthService {


  /**
   * Logout — revoke current session.
   */
  async logout(userId: string): Promise<void> {
    await queryClient`
      UPDATE sessions SET is_revoked = true
      WHERE user_id = ${userId} AND is_revoked = false
    `;
    logger.info({ userId }, 'User logged out (all sessions revoked)');
  }

  /**
   * Invite a new user — Admin/Coordinator flow.
   * Enforces role hierarchy: inviter cannot assign roles above their own.
   */
  async inviteUser(
    phone: string,
    fullName: string,
    roleName: string,
    invitedBy: string,
    inviterRoles: string[] = []
  ): Promise<{ userId: string }> {
    // Enforce role hierarchy
    const inviterMaxLevel = Math.max(...inviterRoles.map(r => ROLE_HIERARCHY[r] ?? 0));
    const targetLevel = ROLE_HIERARCHY[roleName] ?? 0;
    if (targetLevel > inviterMaxLevel) {
      throw new BusinessRuleError(
        `Cannot assign role '${roleName}'. You can only assign roles at or below your own level.`
      );
    }

    // Check if user already exists
    let userRow = await db.select().from(users).where(eq(users.phone, phone)).limit(1);

    let userId: string;
    if (userRow.length === 0) {
      // Create user without password (they'll set it on first login)
      const [newUser] = await db
        .insert(users)
        .values({ phone, fullName })
        .returning({ id: users.id });
      userId = newUser.id;
    } else {
      userId = userRow[0].id;
    }

    // Find role
    const roleRow = await db.select().from(roles).where(eq(roles.name, roleName)).limit(1);
    if (roleRow.length === 0) throw new NotFoundError('Role', roleName);

    // Assign role (upsert)
    await queryClient`
      INSERT INTO user_roles (user_id, role_id, assigned_by)
      VALUES (${userId}, ${roleRow[0].id}, ${invitedBy})
      ON CONFLICT (user_id, role_id) DO NOTHING
    `;

    logger.info({ userId, roleName, invitedBy }, 'User invited and role assigned');
    return { userId };
  }
}

export const authService = new AuthService();
