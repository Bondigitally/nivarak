import { createHash, timingSafeEqual } from 'node:crypto';
import { and, eq } from 'drizzle-orm';

import { db } from '../../db/connection.js';
import { isUniqueViolation } from '../../db/postgres-errors.js';
import { iaspGuestSessions } from '../../db/schema/iasp_guest_sessions.js';
import type { IaspGuestAboutYou } from '../../db/schema/iasp_guest_sessions.js';
import { iaspReportPayments } from '../../db/schema/iasp_report_payments.js';
import {
  AssessmentReplacedError,
  AuthorizationError,
  BusinessRuleError,
  NotFoundError,
} from '../../shared/errors.js';
import {
  assertValidAnswers,
  assertValidRedFlags,
  scoreIaspAnswers,
} from '../iasp-report/iasp-answers.js';
import {
  calculateIASBand,
  evaluateRedFlagUrgency,
} from '../scoring/ias-calculator.js';
import {
  assertAssessmentTransition,
  isAssessmentStatus,
  type AssessmentStatus,
} from './iasp-assessment-state.js';
import type {
  CompleteIaspSessionInput,
  CreateIaspSessionInput,
  PatchIaspSessionInput,
} from './iasp-session.schema.js';

/**
 * In-progress sessions are marked expired lazily on access after this TTL.
 * Completed sessions stay readable so a purchased report and a payment retry
 * still work. Nothing is deleted: payment rows are financial records, and a
 * retention window for health answers plus name, phone, and email needs an
 * owner decision before any cleanup job exists.
 */
const SESSION_TTL_MS = 90 * 24 * 60 * 60 * 1000;

type SessionRow = typeof iaspGuestSessions.$inferSelect;

export function hashIaspAccessToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

function accessTokenMatches(token: string, hash: string): boolean {
  const actual = Buffer.from(hashIaspAccessToken(token), 'utf8');
  const expected = Buffer.from(hash, 'utf8');
  if (actual.length !== expected.length) return false;
  return timingSafeEqual(actual, expected);
}

export type SessionAccessMode = 'read' | 'write';

/**
 * Rows created after the lifecycle migration carry an access-token hash. A
 * missing or wrong token answers exactly like an unknown id (404), so probing
 * ids reveals nothing.
 *
 * Pre-migration rows have no hash, so their UUID is the only secret. They stay
 * readable (an existing purchase must keep working) and become read-only:
 * nobody can edit, complete, discard, replace, or pay for them by UUID alone.
 */
export function assertSessionAccess(
  row: SessionRow,
  accessToken: string | undefined,
  mode: SessionAccessMode = 'write',
): void {
  if (!row.accessTokenHash) {
    if (mode === 'write') {
      throw new AuthorizationError(
        'This assessment was created before secure sessions and is read-only. Start a new assessment to continue.',
      );
    }
    return;
  }
  if (!accessToken || !accessTokenMatches(accessToken, row.accessTokenHash)) {
    throw new NotFoundError('IASP session', row.id);
  }
}

function requireAssessmentStatus(status: string): AssessmentStatus {
  if (!isAssessmentStatus(status)) {
    throw new BusinessRuleError('Assessment is in an unknown state');
  }
  return status;
}

/**
 * Report access follows a paid, verified payment for this session.
 * A pre-migration row with an unlock timestamp and no payment rows keeps
 * access unchanged so it can be reviewed manually. The timestamp alone does
 * not unlock a session that has payment rows.
 */
export async function sessionReportUnlocked(row: SessionRow): Promise<boolean> {
  const [paid] = await db
    .select({
      id: iaspReportPayments.id,
      verifiedAt: iaspReportPayments.verifiedAt,
      amountPaise: iaspReportPayments.amountPaise,
      currency: iaspReportPayments.currency,
      sessionId: iaspReportPayments.sessionId,
    })
    .from(iaspReportPayments)
    .where(
      and(
        eq(iaspReportPayments.sessionId, row.id),
        eq(iaspReportPayments.status, 'paid'),
      ),
    )
    .limit(1);

  if (
    paid &&
    paid.verifiedAt &&
    paid.sessionId === row.id &&
    paid.currency === 'INR' &&
    paid.amountPaise > 0
  ) {
    return true;
  }

  if (!row.detailedReportUnlockedAt) return false;

  const [anyPayment] = await db
    .select({ id: iaspReportPayments.id })
    .from(iaspReportPayments)
    .where(eq(iaspReportPayments.sessionId, row.id))
    .limit(1);

  return !anyPayment;
}

async function toPublicSession(row: SessionRow) {
  const unlocked = await sessionReportUnlocked(row);
  // A pre-migration row is readable by UUID alone, so it never returns the
  // purchaser's contact details.
  const showContact = Boolean(row.accessTokenHash);
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
    unlocked,
    detailedReportUnlockedAt: row.detailedReportUnlockedAt,
    fullName: showContact ? row.fullName : null,
    phoneNumber: showContact ? row.phoneNumber : null,
    email: showContact ? row.email : null,
    completedAt: row.completedAt,
    expiresAt: row.expiresAt,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

async function expireIfNeeded(row: SessionRow): Promise<SessionRow> {
  if (row.status !== 'in_progress') return row;
  // A pre-migration draft can no longer be edited by anyone, so it expires
  // on first access instead of waiting out the retention window.
  const orphanedDraft = !row.accessTokenHash;
  if (!orphanedDraft) {
    if (!row.expiresAt) return row;
    if (row.expiresAt.getTime() >= Date.now()) return row;
  }

  assertAssessmentTransition('in_progress', 'expired');
  const now = new Date();
  const [updated] = await db
    .update(iaspGuestSessions)
    .set({ status: 'expired', updatedAt: now })
    .where(
      and(eq(iaspGuestSessions.id, row.id), eq(iaspGuestSessions.status, 'in_progress')),
    )
    .returning();

  return updated ?? { ...row, status: 'expired' };
}

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

async function getSessionRow(sessionId: string): Promise<SessionRow> {
  if (!UUID_PATTERN.test(sessionId)) {
    throw new NotFoundError('IASP session', sessionId);
  }
  const [row] = await db
    .select()
    .from(iaspGuestSessions)
    .where(eq(iaspGuestSessions.id, sessionId))
    .limit(1);

  if (!row) {
    throw new NotFoundError('IASP session', sessionId);
  }

  return expireIfNeeded(row);
}

function rejectUnlessInProgress(row: SessionRow): void {
  if (row.status === 'in_progress') return;
  if (row.status === 'superseded') throw new AssessmentReplacedError();
  throw new BusinessRuleError('This assessment can no longer be edited');
}

export async function loadSessionForCaller(
  sessionId: string,
  accessToken: string | undefined,
  mode: SessionAccessMode = 'write',
): Promise<SessionRow> {
  const row = await getSessionRow(sessionId);
  assertSessionAccess(row, accessToken, mode);
  return row;
}

async function findByIdempotencyKey(idempotencyKey: string): Promise<SessionRow | undefined> {
  const [row] = await db
    .select()
    .from(iaspGuestSessions)
    .where(eq(iaspGuestSessions.idempotencyKey, idempotencyKey))
    .limit(1);
  return row;
}

function assertReplayToken(row: SessionRow, accessToken: string): void {
  if (!row.accessTokenHash || !accessTokenMatches(accessToken, row.accessTokenHash)) {
    throw new NotFoundError('IASP session', row.id);
  }
}

export async function createIaspSession(input: CreateIaspSessionInput) {
  const existing = await findByIdempotencyKey(input.idempotencyKey);
  if (existing) {
    assertReplayToken(existing, input.accessToken);
    const current = await expireIfNeeded(existing);
    return toPublicSession(current);
  }

  const now = new Date();
  try {
    const row = await db.transaction(async (tx) => {
      if (input.supersedeSessionId) {
        const [previous] = await tx
          .select()
          .from(iaspGuestSessions)
          .where(eq(iaspGuestSessions.id, input.supersedeSessionId))
          .limit(1);

        // Only the holder of the previous session's token may replace it. A
        // pre-migration row has no token, and a wrong token is ignored
        // without an error, so naming a UUID reveals nothing and changes nothing.
        const ownsPrevious =
          previous?.accessTokenHash &&
          input.supersedeAccessToken &&
          accessTokenMatches(input.supersedeAccessToken, previous.accessTokenHash);
        if (previous && ownsPrevious) {
          if (previous.status === 'in_progress') {
            assertAssessmentTransition('in_progress', 'superseded');
            await tx
              .update(iaspGuestSessions)
              .set({ status: 'superseded', updatedAt: now })
              .where(
                and(
                  eq(iaspGuestSessions.id, previous.id),
                  eq(iaspGuestSessions.status, 'in_progress'),
                ),
              );
          }
        }
      }

      const [created] = await tx
        .insert(iaspGuestSessions)
        .values({
          status: 'in_progress',
          expiresAt: new Date(now.getTime() + SESSION_TTL_MS),
          flowStep: 'intro',
          pageIndex: 0,
          idempotencyKey: input.idempotencyKey,
          accessTokenHash: hashIaspAccessToken(input.accessToken),
          updatedAt: now,
        })
        .returning();

      return created;
    });

    return toPublicSession(row);
  } catch (error) {
    if (!isUniqueViolation(error)) throw error;
    const raced = await findByIdempotencyKey(input.idempotencyKey);
    if (!raced) throw error;
    assertReplayToken(raced, input.accessToken);
    return toPublicSession(raced);
  }
}

export async function getIaspSession(sessionId: string, accessToken: string | undefined) {
  const row = await loadSessionForCaller(sessionId, accessToken, 'read');
  return toPublicSession(row);
}

export async function patchIaspSession(
  sessionId: string,
  input: PatchIaspSessionInput,
  accessToken: string | undefined,
) {
  const row = await loadSessionForCaller(sessionId, accessToken);
  rejectUnlessInProgress(row);

  const updates: Partial<typeof iaspGuestSessions.$inferInsert> = {
    updatedAt: new Date(),
  };

  if (input.aboutYou !== undefined) {
    updates.aboutYou = input.aboutYou as IaspGuestAboutYou;
  }
  if (input.answers !== undefined) {
    assertValidAnswers(input.answers);
    updates.answers = input.answers;
  }
  if (input.redFlags !== undefined) {
    assertValidRedFlags(input.redFlags);
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

  const [updated] = await db
    .update(iaspGuestSessions)
    .set(updates)
    .where(
      and(eq(iaspGuestSessions.id, sessionId), eq(iaspGuestSessions.status, 'in_progress')),
    )
    .returning();

  if (!updated) {
    const current = await getSessionRow(sessionId);
    rejectUnlessInProgress(current);
    throw new BusinessRuleError('This assessment can no longer be edited');
  }

  return toPublicSession(updated);
}

export async function completeIaspSession(
  sessionId: string,
  input: CompleteIaspSessionInput,
  accessToken: string | undefined,
) {
  const row = await loadSessionForCaller(sessionId, accessToken);

  if (row.status === 'completed') {
    return toPublicSession(row);
  }

  rejectUnlessInProgress(row);
  const from = requireAssessmentStatus(row.status);
  assertAssessmentTransition(from, 'completed');

  // Scores come from the stored answers. Numbers sent by the browser are not stored.
  assertValidAnswers(input.answers);
  assertValidRedFlags(input.redFlags);
  const score = scoreIaspAnswers(input.answers);
  const { riskBand } = calculateIASBand(score.iasPercentage);
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
      rawScore: score.rawScore,
      maxScore: score.maxScore,
      iasPercentage: score.iasPercentage.toFixed(2),
      riskBand,
      redFlagCount,
      redFlagUrgency,
      completedAt: row.completedAt ?? now,
      privacyConsentAt: input.privacyConsentAt
        ? new Date(input.privacyConsentAt)
        : row.privacyConsentAt,
      updatedAt: now,
    })
    .where(
      and(eq(iaspGuestSessions.id, sessionId), eq(iaspGuestSessions.status, 'in_progress')),
    )
    .returning();

  if (!updated) {
    const current = await getSessionRow(sessionId);
    if (current.status === 'completed') return toPublicSession(current);
    rejectUnlessInProgress(current);
    throw new BusinessRuleError('This assessment can no longer be edited');
  }

  return toPublicSession(updated);
}

export async function abandonIaspSession(
  sessionId: string,
  accessToken: string | undefined,
) {
  const row = await loadSessionForCaller(sessionId, accessToken);
  if (row.status === 'abandoned') return toPublicSession(row);
  rejectUnlessInProgress(row);
  assertAssessmentTransition('in_progress', 'abandoned');

  const now = new Date();
  const [updated] = await db
    .update(iaspGuestSessions)
    .set({ status: 'abandoned', updatedAt: now })
    .where(
      and(eq(iaspGuestSessions.id, sessionId), eq(iaspGuestSessions.status, 'in_progress')),
    )
    .returning();

  if (!updated) {
    const current = await getSessionRow(sessionId);
    if (current.status === 'abandoned') return toPublicSession(current);
    rejectUnlessInProgress(current);
    throw new BusinessRuleError('This assessment can no longer be discarded');
  }

  return toPublicSession(updated);
}
