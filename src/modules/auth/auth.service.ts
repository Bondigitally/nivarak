/**
 * AuthModule — Service Layer
 *
 * Handles OTP generation/verification, JWT issuance, password login,
 * user registration, session management, and invite flows.
 */

import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { eq, and, gt, isNull } from 'drizzle-orm';
import { config } from '../../config/index.js';
import { db, queryClient } from '../../db/connection.js';
import { users, roles, userRoles, sessions, otpStore } from '../../db/schema/index.js';
import { logger } from '../../shared/logger.js';
import { eventBus } from '../../shared/event-bus.js';
import {
  AuthenticationError,
  ConflictError,
  NotFoundError,
  BusinessRuleError,
} from '../../shared/errors.js';

const SALT_ROUNDS = 12;
const MAX_SESSIONS = 3;

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
   * Request OTP — generates and stores OTP for the given phone number.
   * In dev mode, the OTP is returned directly (not sent via SMS).
   */
  async requestOtp(phone: string): Promise<{ message: string; otp?: string }> {
    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpHash = await bcrypt.hash(otp, SALT_ROUNDS);

    const expiresAt = new Date(Date.now() + config.otp.expiryMinutes * 60 * 1000);

    // Invalidate previous OTPs for this phone
    await queryClient`
      UPDATE otp_store SET used_at = NOW()
      WHERE phone = ${phone} AND used_at IS NULL
    `;

    // Store new OTP
    await db.insert(otpStore).values({
      phone,
      otpHash,
      purpose: 'login',
      expiresAt,
    });

    logger.info({ phone }, 'OTP requested');

    if (config.otp.devMode) {
      logger.info({ phone, otp }, '🔑 DEV MODE OTP (not sent via SMS)');
      return { message: 'OTP sent successfully', otp }; // Only in dev!
    }

    // TODO: Phase 1 — integrate MSG91 SMS gateway here
    return { message: 'OTP sent successfully' };
  }

  /**
   * Verify OTP and return JWT tokens.
   * If user doesn't exist yet, returns a registration token instead.
   */
  async verifyOtp(
    phone: string,
    otp: string,
    ip?: string,
    userAgent?: string
  ): Promise<{
    accessToken?: string;
    refreshToken?: string;
    registrationRequired?: boolean;
    user?: { id: string; fullName: string; roles: string[] };
  }> {
    // Find valid OTP
    const otpRows = await db
      .select()
      .from(otpStore)
      .where(
        and(
          eq(otpStore.phone, phone),
          isNull(otpStore.usedAt),
          gt(otpStore.expiresAt, new Date())
        )
      )
      .orderBy(otpStore.createdAt)
      .limit(1);

    if (otpRows.length === 0) {
      eventBus.emit('user.login_failed', { phone, ip: ip || '', reason: 'Invalid or expired OTP' });
      throw new AuthenticationError('Invalid or expired OTP');
    }

    const otpRecord = otpRows[0];

    // Check brute force
    if (otpRecord.attempts >= 5) {
      throw new AuthenticationError('Too many attempts. Request a new OTP.');
    }

    // Verify OTP hash
    const isValid = await bcrypt.compare(otp, otpRecord.otpHash);
    if (!isValid) {
      // Increment attempts
      await queryClient`
        UPDATE otp_store SET attempts = attempts + 1 WHERE id = ${otpRecord.id}
      `;
      eventBus.emit('user.login_failed', { phone, ip: ip || '', reason: 'Wrong OTP' });
      throw new AuthenticationError('Invalid OTP');
    }

    // Mark OTP as used
    await queryClient`
      UPDATE otp_store SET used_at = NOW() WHERE id = ${otpRecord.id}
    `;

    // Check if user exists
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.phone, phone))
      .limit(1);

    if (existingUser.length === 0) {
      return { registrationRequired: true };
    }

    const user = existingUser[0];

    if (!user.isActive) {
      throw new AuthenticationError('Account is deactivated');
    }

    // Load roles
    const roleRows = await db
      .select({ roleName: roles.name })
      .from(userRoles)
      .innerJoin(roles, eq(userRoles.roleId, roles.id))
      .where(eq(userRoles.userId, user.id));

    const userRoleNames = roleRows.map((r) => r.roleName);

    // Issue tokens
    const tokens = await this.issueTokens(user.id, phone, userRoleNames, ip, userAgent);

    // Update last login
    await queryClient`UPDATE users SET last_login_at = NOW() WHERE id = ${user.id}`;

    eventBus.emit('user.login', { userId: user.id, ip: ip || '', userAgent: userAgent || '' });

    return {
      ...tokens,
      user: { id: user.id, fullName: user.fullName, roles: userRoleNames },
    };
  }

  /**
   * Password-based login (phone + password).
   */
  async login(
    phone: string,
    password: string,
    ip?: string,
    userAgent?: string
  ): Promise<{
    accessToken: string;
    refreshToken: string;
    user: { id: string; fullName: string; roles: string[] };
  }> {
    const userRows = await db
      .select()
      .from(users)
      .where(eq(users.phone, phone))
      .limit(1);

    if (userRows.length === 0) {
      eventBus.emit('user.login_failed', { phone, ip: ip || '', reason: 'User not found' });
      throw new AuthenticationError('Invalid credentials');
    }

    const user = userRows[0];

    if (!user.isActive) throw new AuthenticationError('Account is deactivated');
    if (!user.passwordHash) throw new AuthenticationError('Password not set. Use OTP login.');

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      eventBus.emit('user.login_failed', { phone, ip: ip || '', reason: 'Wrong password' });
      throw new AuthenticationError('Invalid credentials');
    }

    // Load roles
    const roleRows = await db
      .select({ roleName: roles.name })
      .from(userRoles)
      .innerJoin(roles, eq(userRoles.roleId, roles.id))
      .where(eq(userRoles.userId, user.id));

    const userRoleNames = roleRows.map((r) => r.roleName);

    const tokens = await this.issueTokens(user.id, phone, userRoleNames, ip, userAgent);

    await queryClient`UPDATE users SET last_login_at = NOW() WHERE id = ${user.id}`;

    eventBus.emit('user.login', { userId: user.id, ip: ip || '', userAgent: userAgent || '' });

    return {
      ...tokens,
      user: { id: user.id, fullName: user.fullName, roles: userRoleNames },
    };
  }

  /**
   * Register a new user (after OTP verification).
   */
  async register(data: {
    phone: string;
    fullName: string;
    password: string;
    email?: string;
    preferredLanguage?: string;
  }): Promise<{ id: string; fullName: string }> {
    // Check if already exists
    const existing = await db.select().from(users).where(eq(users.phone, data.phone)).limit(1);
    if (existing.length > 0) {
      throw new ConflictError('User with this phone number already exists');
    }

    const passwordHash = await bcrypt.hash(data.password, SALT_ROUNDS);

    const [newUser] = await db
      .insert(users)
      .values({
        phone: data.phone,
        fullName: data.fullName,
        passwordHash,
        email: data.email,
        preferredLanguage: data.preferredLanguage || 'en',
      })
      .returning({ id: users.id, fullName: users.fullName });

    logger.info({ userId: newUser.id, phone: data.phone }, 'New user registered');

    return newUser;
  }

  /**
   * Refresh access token using a valid refresh token.
   * Uses tokenFamilyId for O(1) lookup instead of scanning all sessions.
   * Format: refreshToken = `${tokenFamilyId}:${randomSecret}`
   */
  async refreshToken(
    refreshToken: string,
    ip?: string,
    userAgent?: string
  ): Promise<{ accessToken: string; refreshToken: string }> {
    // Parse token family ID from the refresh token
    const colonIndex = refreshToken.indexOf(':');
    if (colonIndex === -1) {
      throw new AuthenticationError('Invalid refresh token format');
    }
    const tokenFamilyId = refreshToken.substring(0, colonIndex);
    const tokenSecret = refreshToken.substring(colonIndex + 1);

    // O(1) lookup by tokenFamilyId (indexed)
    const sessionRows = await db
      .select()
      .from(sessions)
      .where(eq(sessions.tokenFamilyId, tokenFamilyId))
      .limit(1);

    if (sessionRows.length === 0) {
      throw new AuthenticationError('Invalid or expired refresh token');
    }

    const session = sessionRows[0];

    // Check if session is revoked (potential token reuse / theft)
    if (session.isRevoked) {
      // Revoke ALL sessions for this user — possible token theft
      await queryClient`UPDATE sessions SET is_revoked = true WHERE user_id = ${session.userId}`;
      logger.warn({ userId: session.userId, tokenFamilyId }, 'Refresh token reuse detected — all sessions revoked');
      throw new AuthenticationError('Refresh token has been revoked. All sessions invalidated for security.');
    }

    // Check expiry
    if (session.expiresAt < new Date()) {
      throw new AuthenticationError('Refresh token expired');
    }

    // Verify the token secret
    const isValid = await bcrypt.compare(tokenSecret, session.refreshTokenHash);
    if (!isValid) {
      throw new AuthenticationError('Invalid refresh token');
    }

    // Revoke old session (rotating refresh tokens)
    await queryClient`UPDATE sessions SET is_revoked = true WHERE id = ${session.id}`;

    // Load user and roles
    const userRows = await db.select().from(users).where(eq(users.id, session.userId)).limit(1);
    if (userRows.length === 0) throw new AuthenticationError('User not found');

    const user = userRows[0];
    const roleRows = await db
      .select({ roleName: roles.name })
      .from(userRoles)
      .innerJoin(roles, eq(userRoles.roleId, roles.id))
      .where(eq(userRoles.userId, user.id));

    return this.issueTokens(user.id, user.phone, roleRows.map((r) => r.roleName), ip, userAgent);
  }

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

  // ─── Private helpers ──────────────────────────────────

  private async issueTokens(
    userId: string,
    phone: string,
    roleNames: string[],
    ip?: string,
    userAgent?: string
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const accessToken = jwt.sign(
      { sub: userId, phone, roles: roleNames },
      config.jwt.accessSecret,
      { expiresIn: config.jwt.accessExpiry }
    );

    // Generate refresh token with family ID for O(1) lookup
    const tokenFamilyId = uuidv4();
    const tokenSecret = uuidv4();
    const refreshTokenRaw = `${tokenFamilyId}:${tokenSecret}`;
    const refreshTokenHash = await bcrypt.hash(tokenSecret, SALT_ROUNDS);

    // Enforce max sessions
    const activeSessions = await db
      .select()
      .from(sessions)
      .where(and(eq(sessions.userId, userId), eq(sessions.isRevoked, false)));

    if (activeSessions.length >= MAX_SESSIONS) {
      // Revoke oldest session
      const oldest = activeSessions.sort(
        (a, b) => a.createdAt.getTime() - b.createdAt.getTime()
      )[0];
      await queryClient`UPDATE sessions SET is_revoked = true WHERE id = ${oldest.id}`;
    }

    // Create session
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
    await db.insert(sessions).values({
      userId,
      tokenFamilyId,
      refreshTokenHash,
      ipAddress: ip,
      userAgent,
      expiresAt,
    });

    return { accessToken, refreshToken: refreshTokenRaw };
  }
}

export const authService = new AuthService();
