import { jsPDF } from "jspdf";
import type { IaspAboutYouValues } from "../data/iasp-about-you-data";
import type { IaspAnswersMap } from "../data/iasp-assessment-draft";
import type { IaspRedFlagId } from "../data/iasp-red-flags-data";
import {
  IASP_CARE_PATHWAYS,
  IASP_DOMAIN_BAR_COLORS,
  IASP_DOMAIN_REPORT_LABELS,
  IASP_RED_FLAG_GUIDANCE,
  buildAssessorGuidance,
  formatReportAssessorLine,
  formatReportLivingContext,
  getDomainBarLevel,
} from "../data/iasp-report-content";
import {
  IASP_MAX_SCORE,
  calculateIaspPercentage,
  calculateIaspRawScore,
  formatIaspAssessmentDate,
  getIaspBand,
  getIaspSectionBreakdown,
  getSelectedRedFlagOptions,
} from "../data/iasp-scoring";

/** Tokens from Figma `pdf-assessment-report v3` (node 1403:1051). */
const COLORS = {
  primary: "#6C318E",
  text: "#1A1A1A",
  muted: "#8A8F98",
  body: "#5F6368",
  faint: "#B3B7BF",
  divider: "#EDE8F0",
  track: "#EDE9E4",
  white: "#FFFFFF",
  red: "#FF6356",
} as const;

const PAGE = {
  width: 595.28, // A4 pt
  height: 841.89,
  marginX: 48,
  marginTop: 40,
  marginBottom: 40,
  sectionGap: 28,
  colGap: 48,
} as const;

const LOGO = { width: 48, height: 28 } as const;

export type IaspReportPdfInput = {
  answers: IaspAnswersMap;
  redFlags: readonly IaspRedFlagId[];
  aboutYou: IaspAboutYouValues;
  completedAt?: string | null;
  rawScore?: number | null;
  maxScore?: number | null;
  iasPercentage?: number | null;
};

function hexToRgb(hex: string): [number, number, number] {
  const clean = hex.replace("#", "");
  const n = Number.parseInt(clean, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function setFill(doc: jsPDF, hex: string) {
  const [r, g, b] = hexToRgb(hex);
  doc.setFillColor(r, g, b);
}

function setText(doc: jsPDF, hex: string) {
  const [r, g, b] = hexToRgb(hex);
  doc.setTextColor(r, g, b);
}

function drawDivider(doc: jsPDF, y: number, x?: number, width?: number) {
  const startX = x ?? PAGE.marginX;
  setFill(doc, COLORS.divider);
  doc.rect(startX, y, width ?? PAGE.width - PAGE.marginX * 2, 0.75, "F");
}

function wrapText(
  doc: jsPDF,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
): number {
  const lines = doc.splitTextToSize(text, maxWidth) as string[];
  doc.text(lines, x, y);
  return y + lines.length * lineHeight;
}

function measureWrappedHeight(
  doc: jsPDF,
  text: string,
  maxWidth: number,
  lineHeight: number,
): number {
  const lines = doc.splitTextToSize(text, maxWidth) as string[];
  return lines.length * lineHeight;
}

/** Section eyebrow — muted, slightly tracked (Figma Label). */
function drawSectionLabel(doc: jsPDF, text: string, x: number, y: number) {
  setText(doc, COLORS.muted);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(12);
  doc.setCharSpace(0.35);
  doc.text(text, x, y);
  doc.setCharSpace(0);
}

function drawBullet(
  doc: jsPDF,
  x: number,
  baselineY: number,
  color: string,
  radius = 2.5,
) {
  setFill(doc, color);
  doc.circle(x + radius, baselineY - radius * 0.35, radius, "F");
}

/**
 * Draws mixed-colour inline text that wraps across lines.
 * Spans keep their colour when wrapping.
 */
function drawRichText(
  doc: jsPDF,
  spans: ReadonlyArray<{ text: string; color: string }>,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
  fontSize: number,
): number {
  doc.setFont("helvetica", "normal");
  doc.setFontSize(fontSize);

  let cursorX = x;
  let cursorY = y;
  const lineEnd = x + maxWidth;

  for (const span of spans) {
    const words = span.text.split(/(\s+)/);
    setText(doc, span.color);
    for (const word of words) {
      if (!word) continue;
      const wordWidth = doc.getTextWidth(word);
      if (cursorX + wordWidth > lineEnd && cursorX > x) {
        cursorX = x;
        cursorY += lineHeight;
      }
      // Soft-wrap a single oversized token
      if (wordWidth > maxWidth) {
        const chunks = doc.splitTextToSize(word, maxWidth) as string[];
        for (let i = 0; i < chunks.length; i++) {
          if (i > 0) {
            cursorX = x;
            cursorY += lineHeight;
          }
          doc.text(chunks[i], cursorX, cursorY);
          cursorX += doc.getTextWidth(chunks[i]);
        }
        continue;
      }
      doc.text(word, cursorX, cursorY);
      cursorX += wordWidth;
    }
  }

  return cursorY + lineHeight;
}

function drawFooter(doc: jsPDF, pageNumber: number, pageCount: number) {
  const footerY = PAGE.height - PAGE.marginBottom + 8;
  setText(doc, COLORS.faint);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text("Confidential medical record, Nivarak Health", PAGE.marginX, footerY);
  doc.text(`Page ${pageNumber} of ${pageCount}`, PAGE.width - PAGE.marginX, footerY, {
    align: "right",
  });
}

async function loadLogoDataUrl(): Promise<string | null> {
  try {
    const response = await fetch("/images/nivarak-report-logo.png");
    if (!response.ok) return null;
    const blob = await response.blob();
    return await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}

/**
 * Builds the IASP Assessment Report PDF to match Figma
 * `pdf-assessment-report v3` (node 1403:1051).
 */
export async function buildIaspAssessmentReportPdf(
  input: IaspReportPdfInput,
): Promise<Blob> {
  const rawScore = input.rawScore ?? calculateIaspRawScore(input.answers);
  const maxScore = input.maxScore ?? IASP_MAX_SCORE;
  const percentage =
    input.iasPercentage != null
      ? Math.round(input.iasPercentage)
      : calculateIaspPercentage(rawScore);
  const band = getIaspBand(percentage);
  const pathway = IASP_CARE_PATHWAYS[band.band];
  const sections = getIaspSectionBreakdown(input.answers);
  const selectedFlags = getSelectedRedFlagOptions(input.redFlags);
  const assessedOn = formatIaspAssessmentDate(
    input.completedAt ? new Date(input.completedAt) : undefined,
  );
  const summary =
    `${band.descriptionBefore}${band.highlight}${band.descriptionAfter}`.replace(
      /\s+/g,
      " ",
    );

  const doc = new jsPDF({
    orientation: "portrait",
    unit: "pt",
    format: "a4",
  });

  const contentWidth = PAGE.width - PAGE.marginX * 2;
  const contentBottom = PAGE.height - PAGE.marginBottom - 24;
  let y: number = PAGE.marginTop;

  // —— Header ——
  const logo = await loadLogoDataUrl();
  const logoY = y;
  if (logo) {
    doc.addImage(logo, "PNG", PAGE.marginX, logoY, LOGO.width, LOGO.height);
  } else {
    setFill(doc, COLORS.primary);
    doc.roundedRect(PAGE.marginX, logoY, LOGO.width, LOGO.height, 6, 6, "F");
  }

  const brandX = PAGE.marginX + LOGO.width + 12;
  const brandMid = logoY + LOGO.height / 2;
  setText(doc, COLORS.text);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text("Nivarak", brandX, brandMid - 2);
  setText(doc, COLORS.muted);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.text("Unifying Eldercare", brandX, brandMid + 12);

  const metaX = PAGE.width - PAGE.marginX;
  setText(doc, COLORS.text);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(12);
  doc.text(formatReportAssessorLine(input.aboutYou), metaX, brandMid - 2, {
    align: "right",
  });
  setText(doc, COLORS.muted);
  doc.setFontSize(11);
  doc.text(`Assessed ${assessedOn}, IASP version 2.0`, metaX, brandMid + 12, {
    align: "right",
  });

  y = logoY + LOGO.height + 20;
  drawDivider(doc, y);
  y += PAGE.sectionGap;

  // —— Title ——
  setText(doc, COLORS.text);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(28);
  doc.text("IASP Assessment Report", PAGE.marginX, y);
  y += 22;
  setText(doc, COLORS.muted);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(13);
  doc.text("Independent Ageing Score (Proxy version)", PAGE.marginX, y);
  y += PAGE.sectionGap;

  // —— Score hero ——
  const scoreColWidth = 108;
  const scoreX = PAGE.marginX;
  const scoreBaseline = y + 46;

  setText(doc, COLORS.primary);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(64);
  doc.text(String(percentage), scoreX, scoreBaseline);
  const scoreWidth = doc.getTextWidth(String(percentage));
  setText(doc, COLORS.faint);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(24);
  doc.text("%", scoreX + scoreWidth + 2, scoreBaseline);
  setText(doc, COLORS.muted);
  doc.setFontSize(13);
  doc.text(`${rawScore} of ${maxScore} points`, scoreX, scoreBaseline + 18);

  const heroTextX = PAGE.marginX + scoreColWidth + 24;
  const heroWidth = contentWidth - scoreColWidth - 24;
  let heroY = y + 10;

  setText(doc, COLORS.text);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text(band.label, heroTextX, heroY);
  heroY += 18;

  setText(doc, COLORS.muted);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(12);
  heroY = wrapText(
    doc,
    formatReportLivingContext(input.aboutYou),
    heroTextX,
    heroY,
    heroWidth,
    15,
  );
  heroY += 6;

  setText(doc, COLORS.body);
  doc.setFontSize(13);
  heroY = wrapText(doc, summary, heroTextX, heroY, heroWidth, 17);
  heroY += 8;

  drawBullet(doc, heroTextX, heroY, COLORS.primary);
  setText(doc, COLORS.primary);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(12);
  doc.text(
    `Recommended pathway: ${pathway.recommendedLabel}`,
    heroTextX + 12,
    heroY,
  );
  heroY += 4;

  y = Math.max(scoreBaseline + 28, heroY) + 12;
  drawDivider(doc, y);
  y += PAGE.sectionGap - 4;

  // —— Two columns ——
  const colWidth = (contentWidth - PAGE.colGap) / 2;
  const leftX = PAGE.marginX;
  const rightX = PAGE.marginX + colWidth + PAGE.colGap;
  const columnsTop = y;

  // Left: domain scores
  drawSectionLabel(doc, "Domain scores", leftX, y);

  const domainRows = sections.map((section) => {
    const label = IASP_DOMAIN_REPORT_LABELS[section.id] ?? section.title;
    const level = getDomainBarLevel(section.percentage);
    return {
      label,
      score: `${section.raw} of ${section.max}`,
      percentage: section.percentage,
      color: IASP_DOMAIN_BAR_COLORS[level],
    };
  });

  // Measure right column height first so domain rows can breathe evenly
  doc.setFont("helvetica", "normal");
  doc.setFontSize(13);
  let rightEstimate = 0;
  rightEstimate += 15 + 14; // title + status
  if (selectedFlags.length === 0) {
    rightEstimate += measureWrappedHeight(
      doc,
      "No red flags were selected for this assessment.",
      colWidth,
      17,
    );
  } else {
    for (const flag of selectedFlags) {
      rightEstimate += 16; // gap between flags
      rightEstimate += measureWrappedHeight(doc, flag.label, colWidth - 12, 16);
      rightEstimate += 4;
      rightEstimate += measureWrappedHeight(
        doc,
        IASP_RED_FLAG_GUIDANCE[flag.id],
        colWidth,
        17,
      );
    }
    rightEstimate -= 16; // no leading gap before first flag
  }
  rightEstimate += 16 + 14 + 16 + 14; // divider + pathway labels
  rightEstimate += measureWrappedHeight(doc, pathway.description, colWidth, 17);
  rightEstimate += 10;
  for (const bullet of pathway.bullets) {
    rightEstimate +=
      measureWrappedHeight(doc, bullet, colWidth - 12, 16) + 10;
  }

  const domainHeaderH = 18;
  const legendH = 22;
  const domainAvailable =
    Math.max(rightEstimate, domainRows.length * 26) - domainHeaderH - legendH;
  const rowSlot = Math.max(24, domainAvailable / Math.max(domainRows.length, 1));

  let leftY = y + domainHeaderH;
  for (const row of domainRows) {
    const rowTop = leftY;
    setText(doc, COLORS.text);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(13);
    doc.text(row.label, leftX, rowTop);
    setText(doc, COLORS.muted);
    doc.setFontSize(12);
    doc.text(row.score, leftX + colWidth, rowTop, { align: "right" });

    const barY = rowTop + 8;
    setFill(doc, COLORS.track);
    doc.roundedRect(leftX, barY, colWidth, 4, 2, 2, "F");
    const fillWidth = Math.max(3, (colWidth * row.percentage) / 100);
    setFill(doc, row.color);
    doc.roundedRect(leftX, barY, fillWidth, 4, 2, 2, "F");

    leftY += rowSlot;
  }

  // Legend
  const legendY = leftY + 2;
  const legend = [
    { label: "Strong", color: IASP_DOMAIN_BAR_COLORS.strong },
    { label: "Fair", color: IASP_DOMAIN_BAR_COLORS.fair },
    { label: "High risk", color: IASP_DOMAIN_BAR_COLORS.high_risk },
  ] as const;
  let legendX = leftX;
  for (const item of legend) {
    setFill(doc, item.color);
    doc.roundedRect(legendX, legendY - 7, 10, 10, 2, 2, "F");
    setText(doc, COLORS.muted);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    doc.text(item.label, legendX + 16, legendY);
    legendX += 16 + doc.getTextWidth(item.label) + 16;
  }
  leftY = legendY + 8;

  // Right: red flags + care pathway
  let rightY = columnsTop;
  setText(doc, COLORS.text);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(15);
  doc.text("Red Flags Identified", rightX, rightY);
  rightY += 16;
  setText(doc, COLORS.muted);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(12);
  const flagStatus =
    selectedFlags.length > 0
      ? `Red flags (${selectedFlags.length})   Review needed`
      : "Red flags (0)   None selected";
  doc.text(flagStatus, rightX, rightY);
  rightY += 18;

  if (selectedFlags.length === 0) {
    setText(doc, COLORS.body);
    doc.setFontSize(13);
    rightY = wrapText(
      doc,
      "No red flags were selected for this assessment.",
      rightX,
      rightY,
      colWidth,
      17,
    );
  } else {
    for (const flag of selectedFlags) {
      drawBullet(doc, rightX, rightY, COLORS.red);
      setText(doc, COLORS.text);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(13);
      rightY = wrapText(doc, flag.label, rightX + 12, rightY, colWidth - 12, 16);
      setText(doc, COLORS.body);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(13);
      rightY = wrapText(
        doc,
        IASP_RED_FLAG_GUIDANCE[flag.id],
        rightX,
        rightY + 3,
        colWidth,
        17,
      );
      rightY += 14;
    }
  }

  rightY += 4;
  drawDivider(doc, rightY, rightX, colWidth);
  rightY += 18;

  drawSectionLabel(doc, "Care pathway", rightX, rightY);
  rightY += 16;
  setText(doc, COLORS.text);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(15);
  doc.text(pathway.title, rightX, rightY);
  rightY += 16;
  setText(doc, COLORS.body);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(13);
  rightY = wrapText(doc, pathway.description, rightX, rightY, colWidth, 17);
  rightY += 10;

  for (const bullet of pathway.bullets) {
    drawBullet(doc, rightX, rightY, COLORS.primary);
    setText(doc, COLORS.text);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(13);
    rightY = wrapText(doc, bullet, rightX + 12, rightY, colWidth - 12, 16);
    rightY += 10;
  }

  y = Math.max(leftY, rightY) + 16;

  // Overflow → new page for guidance if needed
  const guidanceReserve = 72;
  if (y + guidanceReserve > contentBottom) {
    drawFooter(doc, 1, 2);
    doc.addPage();
    y = PAGE.marginTop;
  }

  drawDivider(doc, y);
  y += 18;

  // —— Assessor guidance ——
  drawSectionLabel(doc, "Assessor guidance", PAGE.marginX, y);
  y += 16;

  const guidance = buildAssessorGuidance({
    percentage,
    bandLabel: band.label,
    redFlagIds: selectedFlags.map((flag) => flag.id),
  });
  const scoreToken = `${percentage}%`;
  const scoreIndex = guidance.indexOf(scoreToken);
  const guidanceSpans =
    scoreIndex >= 0
      ? [
          { text: guidance.slice(0, scoreIndex), color: COLORS.text },
          { text: scoreToken, color: COLORS.primary },
          {
            text: guidance.slice(scoreIndex + scoreToken.length),
            color: COLORS.text,
          },
        ]
      : [{ text: guidance, color: COLORS.text }];

  y = drawRichText(doc, guidanceSpans, PAGE.marginX, y, contentWidth, 18, 14);

  const pageCount = doc.getNumberOfPages();
  for (let page = 1; page <= pageCount; page++) {
    doc.setPage(page);
    drawFooter(doc, page, pageCount);
  }

  return doc.output("blob");
}
