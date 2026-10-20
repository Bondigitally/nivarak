import type { IaspAnswersMap } from "../data/iasp-assessment-draft";
import type { IaspRedFlagId } from "../data/iasp-red-flags-data";
import { buildIaspAssessmentReportPdf } from "./build-iasp-report-pdf";
import {
  fetchIaspSession,
  type IaspGuestSession,
} from "./iasp-session-api";

function isIaspRedFlagId(value: string): value is IaspRedFlagId {
  return (
    value === "two_or_more_falls" ||
    value === "missed_incorrect_medicines" ||
    value === "unsafe_decisions" ||
    value === "significant_weight_loss" ||
    value === "social_isolation" ||
    value === "recurrent_hospital_admissions" ||
    value === "caregiver_struggling" ||
    value === "no_emergency_response"
  );
}

export async function buildIaspReportPdfFromSession(
  session: IaspGuestSession,
): Promise<Blob> {
  return buildIaspAssessmentReportPdf({
    answers: session.answers as IaspAnswersMap,
    redFlags: session.redFlags.filter(isIaspRedFlagId),
    aboutYou: session.aboutYou,
    completedAt: session.completedAt,
    rawScore: session.rawScore,
    maxScore: session.maxScore,
    iasPercentage: session.iasPercentage,
  });
}

/**
 * Fetches an unlocked session and returns an object URL for the PDF blob.
 * Caller must revoke the URL when done.
 */
export async function loadIaspReportPdfObjectUrl(
  sessionId: string,
): Promise<
  | { status: "ready"; url: string }
  | { status: "locked" }
  | { status: "error"; message: string }
> {
  try {
    const session = await fetchIaspSession(sessionId);
    if (!session.unlocked) return { status: "locked" };
    const blob = await buildIaspReportPdfFromSession(session);
    return { status: "ready", url: URL.createObjectURL(blob) };
  } catch (error: unknown) {
    const message =
      error instanceof Error
        ? error.message
        : "Could not prepare the PDF report.";
    return { status: "error", message };
  }
}
