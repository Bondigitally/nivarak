/** Public route that shows the unlocked IASP PDF report. */
export function getIaspDetailedReportPath(sessionId: string): string {
  return `/iasp-assessment/report/${encodeURIComponent(sessionId)}`;
}
