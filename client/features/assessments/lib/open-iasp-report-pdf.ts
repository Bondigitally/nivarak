import { API_BASE } from "@/lib/api";
import {
  forgetLegacyIaspAccessToken,
  iaspAccessHeaders,
} from "./iasp-session-api";

/**
 * Downloads the detailed report PDF from the server. Unlock and generation
 * happen only after a verified payment — this module never builds a PDF locally.
 * Auth is the HttpOnly session cookie (credentials: include).
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
    const response = await fetch(
      `${API_BASE}/iasp/sessions/${encodeURIComponent(sessionId)}/report`,
      {
        credentials: "include",
        headers: iaspAccessHeaders(sessionId),
      },
    );

    if (response.status === 403) return { status: "locked" };
    if (response.status === 404) {
      return {
        status: "error",
        message: "Assessment session not found. Open the report from your results again.",
      };
    }
    if (!response.ok) {
      return { status: "error", message: "Could not prepare the PDF report." };
    }

    forgetLegacyIaspAccessToken(sessionId);
    const blob = await response.blob();
    return { status: "ready", url: URL.createObjectURL(blob) };
  } catch (error: unknown) {
    const message =
      error instanceof Error
        ? error.message
        : "Could not prepare the PDF report.";
    return { status: "error", message };
  }
}
