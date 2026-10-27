import type { IaspGuestAboutYou } from '../../db/schema/iasp_guest_sessions.js';
import { AppError } from '../../shared/errors.js';
import {
  loadSessionForCaller,
  sessionReportUnlocked,
} from '../iasp-sessions/iasp-session.service.js';
import { scoreIaspAnswers, toRedFlagIds } from './iasp-answers.js';
import type { IaspAnswerId } from './data/iasp-questionnaire-data.js';
import { buildIaspAssessmentReportPdf } from './render-iasp-report-pdf.js';

/**
 * The detailed report is generated only on the server, after a verified paid
 * payment for this session. The browser receives PDF bytes — never enough raw
 * report data to rebuild the paid document on its own.
 */
export async function buildPaidIaspReportPdf(
  sessionId: string,
  accessToken: string | undefined,
): Promise<Buffer> {
  const session = await loadSessionForCaller(sessionId, accessToken, 'read');

  if (session.status !== 'completed' || !(await sessionReportUnlocked(session))) {
    throw new AppError(
      403,
      'REPORT_LOCKED',
      'The detailed report is available after the payment is verified',
    );
  }

  const answers = session.answers as Record<string, string>;
  const score = scoreIaspAnswers(answers);

  return buildIaspAssessmentReportPdf({
    answers: answers as Record<string, IaspAnswerId | undefined>,
    redFlags: toRedFlagIds(session.redFlags),
    aboutYou: session.aboutYou as IaspGuestAboutYou,
    fullName: session.fullName,
    completedAt: session.completedAt ? session.completedAt.toISOString() : null,
    rawScore: score.rawScore,
    maxScore: score.maxScore,
    iasPercentage: score.iasPercentage,
  });
}
