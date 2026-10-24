/** Opens the IASP assessment modal on its own empty page. */
export const IASP_ASSESSMENT_OPEN_HREF = "/iasp-assessment";

/** Public route that shows the unlocked IASP PDF report. */
export function getIaspDetailedReportPath(sessionId: string): string {
  return `/iasp-assessment/report/${encodeURIComponent(sessionId)}`;
}

/** Consistent download filename for IASP report PDFs. */
export function getIaspReportPdfDownloadName(sessionId: string): string {
  return `iasp-assessment-report-${sessionId.slice(0, 8)}.pdf`;
}
