import { eq } from 'drizzle-orm';

import { db } from '../../db/connection.js';
import { iaspGuestSessions } from '../../db/schema/iasp_guest_sessions.js';
import type { IaspGuestAboutYou } from '../../db/schema/iasp_guest_sessions.js';
import {
  BusinessRuleError,
  NotFoundError,
} from '../../shared/errors.js';
import {
  calculateIASBand,
  evaluateRedFlagUrgency,
} from '../scoring/ias-calculator.js';
import type {
  CompleteIaspSessionInput,
  PatchIaspSessionInput,
} from './iasp-session.schema.js';

const SESSION_TTL_MS = 90 * 24 * 60 * 60 * 1000;

function toPublicSession(row: typeof iaspGuestSessions.$inferSelect) {
  return {
    sessionId: row.id,
    status: row.status,
    aboutYou: row.aboutYou,
    answers: row.answers,
    redFlags: row.redFlags,
    flowStep: row.flowStep,
    pageIndex: row.pageIndex,
    rawScore: row.rawScore,
    maxScore: row.maxScore,
    iasPercentage: row.iasPercentage != null ? Number(row.iasPercentage) : null,
    riskBand: row.riskBand,
    redFlagCount: row.redFlagCount,
    redFlagUrgency: row.redFlagUrgency,
    unlocked: row.detailedReportUnlockedAt != null,
    detailedReportUnlockedAt: row.detailedReportUnlockedAt,
    completedAt: row.completedAt,
    expiresAt: row.expiresAt,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

async function getSessionRow(sessionId: string) {
  const [row] = await db
    .select()
    .from(iaspGuestSessions)
    .where(eq(iaspGuestSessions.id, sessionId))
    .limit(1);

  if (!row) {
    throw new NotFoundError('IASP session', sessionId);
  }

  if (row.expiresAt && row.expiresAt.getTime() < Date.now()) {
    throw new BusinessRuleError('This assessment session has expired');
  }

  return row;
}

export async function createIaspSession() {
  const now = new Date();
  const [row] = await db
    .insert(iaspGuestSessions)
    .values({
      status: 'in_progress',
      expiresAt: new Date(now.getTime() + SESSION_TTL_MS),
      flowStep: 'intro',
      pageIndex: 0,
      updatedAt: now,
    })
    .returning();

  return toPublicSession(row);
}

export async function getIaspSession(sessionId: string) {
  const row = await getSessionRow(sessionId);
  return toPublicSession(row);
}

export async function patchIaspSession(
  sessionId: string,
  input: PatchIaspSessionInput,
) {
  const row = await getSessionRow(sessionId);

  if (row.status === 'completed' && row.detailedReportUnlockedAt) {
    throw new BusinessRuleError('Unlocked sessions cannot be edited');
  }

  const updates: Partial<typeof iaspGuestSessions.$inferInsert> = {
    updatedAt: new Date(),
  };

  if (input.aboutYou !== undefined) {
    updates.aboutYou = input.aboutYou as IaspGuestAboutYou;
  }
  if (input.answers !== undefined) {
    updates.answers = input.answers;
  }
  if (input.redFlags !== undefined) {
    updates.redFlags = input.redFlags;
  }
  if (input.flowStep !== undefined) {
    updates.flowStep = input.flowStep;
  }
  if (input.pageIndex !== undefined) {
    updates.pageIndex = input.pageIndex;
  }
  if (input.privacyConsentAt !== undefined) {
    updates.privacyConsentAt = new Date(input.privacyConsentAt);
  }

  // Allow draft updates even after complete (before unlock) so retakes can reset later.
  if (row.status === 'completed' && !row.detailedReportUnlockedAt) {
    // Keep completed status; only draft fields above may change until unlock.
  }

  const [updated] = await db
    .update(iaspGuestSessions)
    .set(updates)
    .where(eq(iaspGuestSessions.id, sessionId))
    .returning();

  return toPublicSession(updated);
}

export async function completeIaspSession(
  sessionId: string,
  input: CompleteIaspSessionInput,
) {
  const row = await getSessionRow(sessionId);

  if (row.detailedReportUnlockedAt) {
    return toPublicSession(row);
  }

  const { riskBand } = calculateIASBand(input.iasPercentage);
  const redFlagCount = input.redFlags.length;
  const redFlagUrgency = evaluateRedFlagUrgency(redFlagCount);
  const now = new Date();

  const [updated] = await db
    .update(iaspGuestSessions)
    .set({
      status: 'completed',
      aboutYou: input.aboutYou as IaspGuestAboutYou,
      answers: input.answers,
      redFlags: input.redFlags,
      flowStep: 'results',
      rawScore: input.rawScore,
      maxScore: input.maxScore,
      iasPercentage: input.iasPercentage.toFixed(2),
      riskBand,
      redFlagCount,
      redFlagUrgency,
      completedAt: row.completedAt ?? now,
      privacyConsentAt: input.privacyConsentAt
        ? new Date(input.privacyConsentAt)
        : row.privacyConsentAt,
      updatedAt: now,
    })
    .where(eq(iaspGuestSessions.id, sessionId))
    .returning();

  return toPublicSession(updated);
}

export async function assertSessionPayable(sessionId: string) {
  const row = await getSessionRow(sessionId);

  if (row.status !== 'completed') {
    throw new BusinessRuleError('Complete the assessment before unlocking the report');
  }

  if (row.detailedReportUnlockedAt) {
    throw new BusinessRuleError('Detailed report is already unlocked');
  }

  return row;
}

export async function attachRazorpayOrder(sessionId: string, orderId: string) {
  const now = new Date();
  const [updated] = await db
    .update(iaspGuestSessions)
    .set({
      razorpayOrderId: orderId,
      updatedAt: now,
    })
    .where(eq(iaspGuestSessions.id, sessionId))
    .returning();

  return updated;
}

export async function unlockIaspSessionByOrder(params: {
  orderId: string;
  paymentId: string;
}) {
  const [row] = await db
    .select()
    .from(iaspGuestSessions)
    .where(eq(iaspGuestSessions.razorpayOrderId, params.orderId))
    .limit(1);

  if (!row) {
    throw new NotFoundError('IASP session for order', params.orderId);
  }

  if (row.detailedReportUnlockedAt) {
    return toPublicSession(row);
  }

  const now = new Date();
  const [updated] = await db
    .update(iaspGuestSessions)
    .set({
      razorpayPaymentId: params.paymentId,
      detailedReportUnlockedAt: now,
      updatedAt: now,
    })
    .where(eq(iaspGuestSessions.id, row.id))
    .returning();

  return toPublicSession(updated);
}

export async function getIaspSessionByIdForPayment(sessionId: string) {
  return getSessionRow(sessionId);
}
