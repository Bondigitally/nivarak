import type { ReactNode } from "react";
import {
  Circle,
  Document,
  Image,
  Link,
  Page,
  Path,
  StyleSheet,
  Svg,
  Text,
  View,
} from "@react-pdf/renderer";
import { IASP_DOMAIN_REPORT_ICONS } from "../data/iasp-domain-report-icons.js";
import { NIVARAK_WHATSAPP_CTA_LABEL } from "../data/iasp-report-content.js";
import type { IaspReportPdfModel } from "../iasp-report-pdf-model.js";
import type { IaspRedFlagId } from "../data/iasp-red-flags-data.js";
import type { IconSvgElement } from "@hugeicons/react";
import {
  PDF_GUIDANCE_ICONS,
  PDF_RED_FLAG_ICONS,
  PdfIcon,
  PdfIconBadge,
  PdfReportIcons,
  PdfWhatsappIcon,
} from "./iasp-report-pdf-icons.js";
import { InsightAccentCard } from "./iasp-report-insight-card.js";
import {
  FIGMA_REPORT as T,
  FONT_INTER,
  FONT_LOGO,
  FONT_SERIF,
  layout,
  PDF_HEADING,
  PDF_SUPPORT,
  typeSize,
} from "./iasp-report-pdf-theme.js";

/**
 * Compact PDF letterhead — BrandLogo default proportions (mark h-10 / text-2xl).
 * Mark : wordmark size = 40 : 24; tracking 0.08em; leading 32/24.
 */
const LOGO_MARK_H = 24;
const LOGO_MARK_W = (LOGO_MARK_H * 1380) / 803;
const LOGO_WORD_SIZE = LOGO_MARK_H * (24 / 40);
const LOGO_WORD_LINE = LOGO_MARK_H * (32 / 40);
const LOGO_WORD_TRACKING = LOGO_WORD_SIZE * 0.08;

const PAD_X = layout(38);
const PAD_Y = layout(36);
const PAD_BOTTOM = layout(26);
/** Fixed header band — logo + meta + bottom rule. */
const HEADER_ZONE = LOGO_MARK_H + LOGO_WORD_LINE + layout(12);
const FOOTER_ZONE = layout(55);

type DomainLevel = "strong" | "fair" | "high_risk";

const DOMAIN_STATUS: Record<
  DomainLevel,
  { label: string; bar: string; pillBg: string; pillInk: string }
> = {
  strong: {
    label: "Strong",
    bar: T.strong,
    pillBg: T.strongBg,
    pillInk: T.strongInk,
  },
  fair: { label: "Fair", bar: T.fair, pillBg: T.fairBg, pillInk: T.fairInk },
  high_risk: {
    label: "High risk",
    bar: T.risk,
    pillBg: T.riskBg,
    pillInk: T.riskInk,
  },
};

const styles = StyleSheet.create({
  page: {
    paddingTop: PAD_Y + HEADER_ZONE,
    paddingHorizontal: PAD_X,
    paddingBottom: PAD_BOTTOM + FOOTER_ZONE,
    backgroundColor: "#FFFFFF",
    fontFamily: FONT_INTER,
    fontSize: typeSize(10),
    color: T.ink,
  },
  block: { marginBottom: 0 },
  reportHeader: {
    position: "absolute",
    top: PAD_Y,
    left: PAD_X,
    right: PAD_X,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    borderBottomWidth: 1,
    borderBottomColor: T.line,
    minHeight: HEADER_ZONE - layout(6),
    paddingBottom: layout(6),
  },
  logoBrand: {
    flexDirection: "column",
    alignItems: "flex-start",
  },
  logoMark: {
    width: LOGO_MARK_W,
    height: LOGO_MARK_H,
    objectFit: "contain",
  },
  logoWordmark: {
    fontFamily: FONT_LOGO,
    fontSize: LOGO_WORD_SIZE,
    letterSpacing: LOGO_WORD_TRACKING,
    lineHeight: LOGO_WORD_LINE / LOGO_WORD_SIZE,
    color: T.inkSoft,
    marginTop: 0,
  },
  headerMeta: {
    flex: 1,
    alignItems: "flex-end",
    justifyContent: "flex-start",
  },
  metaTitle: {
    fontSize: typeSize(12),
    fontWeight: 500,
    textAlign: "right",
    color: T.meta,
  },
  metaSub: {
    fontSize: typeSize(10),
    color: T.metaFaint,
    textAlign: "right",
    marginTop: layout(8),
  },
  personStrip: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: T.lineSoft,
    minHeight: layout(103),
  },
  person: {
    flexDirection: "row",
    alignItems: "center",
    paddingRight: layout(24),
    borderRightWidth: 1,
    borderRightColor: "#e3e4eb",
  },
  avatar: {
    width: layout(56),
    height: layout(56),
    borderRadius: layout(28),
    backgroundColor: T.avatarBg,
    alignItems: "center",
    justifyContent: "center",
    marginRight: layout(14),
  },
  avatarText: {
    fontFamily: FONT_SERIF,
    fontSize: typeSize(19),
    color: T.avatarInk,
  },
  personName: { fontSize: typeSize(12), fontWeight: 600 },
  personSmall: {
    ...PDF_SUPPORT.small,
    color: T.personMuted,
    marginTop: 2,
  },
  facts: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-around",
  },
  factItem: { flexDirection: "row", alignItems: "flex-start" },
  factIcon: { marginRight: layout(9), marginTop: 1 },
  factStrong: { fontSize: typeSize(12), fontWeight: 600, color: T.personFact },
  factSmall: { fontSize: typeSize(9), color: T.personMuted, marginTop: layout(2) },
  overview: {
    paddingTop: layout(54),
    paddingBottom: layout(35),
  },
  eyebrow: {
    fontSize: typeSize(9),
    fontWeight: 600,
    color: T.eyebrow,
    textTransform: "uppercase",
    letterSpacing: 2,
  },
  overviewGrid: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginTop: layout(27),
  },
  assessmentCopy: {
    width: "60%",
    maxWidth: "60%",
    paddingRight: layout(20),
  },
  headline: {
    ...PDF_HEADING.display,
    color: T.inkSoft,
  },
  subhead: {
    ...PDF_SUPPORT.lead,
    color: T.muted,
    marginTop: layout(22),
  },
  scoreWrap: {
    flex: 1,
    flexShrink: 0,
    alignItems: "center",
  },
  scoreRingFrame: {
    width: layout(168),
    height: layout(168),
    alignItems: "center",
    justifyContent: "center",
  },
  scoreRingCenter: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: layout(18),
  },
  scoreLabelPill: {
    marginTop: layout(14),
    fontSize: typeSize(11),
    fontWeight: 600,
    color: T.primaryDeep,
    backgroundColor: T.labelBg,
    borderRadius: layout(16),
    paddingHorizontal: layout(13),
    paddingVertical: layout(8),
    flexShrink: 0,
  },
  miniFacts: {
    marginTop: layout(12),
    alignSelf: "center",
  },
  miniFactRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: layout(6),
  },
  miniFactIcon: {
    width: layout(20),
    alignItems: "center",
    justifyContent: "center",
  },
  miniFactText: {
    ...PDF_SUPPORT.small,
    color: T.miniFact,
    marginLeft: layout(8),
  },
  infoCard: {
    flexDirection: "row",
    backgroundColor: T.infoBg,
    borderRadius: layout(12),
    paddingVertical: layout(24),
    paddingHorizontal: layout(25),
  },
  infoIcon: {
    width: layout(38),
    height: layout(38),
    borderRadius: layout(19),
    backgroundColor: T.infoIconBg,
    alignItems: "center",
    justifyContent: "center",
    marginRight: layout(15),
  },
  infoIconText: {
    fontFamily: FONT_SERIF,
    fontSize: typeSize(20),
    color: T.infoIcon,
  },
  infoTitle: { fontSize: typeSize(13), fontWeight: 600, marginBottom: layout(6) },
  infoBody: {
    ...PDF_SUPPORT.body,
    color: T.bodySerif,
  },
  domainSection: {
    marginTop: layout(28),
  },
  sectionHeading: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: "#e6e7ec",
    minHeight: layout(67),
  },
  domainTitle: {
    ...PDF_HEADING.subsection,
    color: T.inkSoft,
  },
  legend: { flexDirection: "row" },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: layout(20),
  },
  legendDot: { width: layout(10), height: layout(10), borderRadius: layout(5), marginRight: layout(7) },
  legendText: { fontSize: typeSize(9), color: "#858c9c" },
  domainRow: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#e8e9ed",
    minHeight: layout(54),
  },
  domainIcon: { width: layout(32), marginRight: layout(2) },
  domainName: { width: layout(83), fontSize: typeSize(10), color: T.domainName },
  domainBarWrap: { flex: 1, marginHorizontal: layout(8) },
  barTrack: {
    height: layout(6),
    borderRadius: layout(5),
    backgroundColor: T.barTrack,
  },
  barFill: { height: layout(6), borderRadius: layout(5) },
  domainPoints: {
    width: layout(48),
    fontSize: typeSize(10),
    color: T.points,
    textAlign: "center",
  },
  statusPill: {
    flexShrink: 0,
    width: layout(86),
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: layout(7),
    paddingHorizontal: layout(10),
    borderRadius: layout(14),
  },
  statusPillText: {
    fontSize: typeSize(10),
    fontWeight: 600,
    textAlign: "center",
  },
  insightLeft: {
    flex: 1.25,
    paddingRight: layout(22),
    justifyContent: "center",
  },
  insightHeadline: {
    ...PDF_HEADING.insight,
    color: T.inkSoft,
    marginTop: layout(13),
  },
  insightBody: {
    flex: 1,
    borderLeftWidth: 1,
    borderLeftColor: T.divider,
    paddingLeft: layout(25),
    justifyContent: "center",
  },
  insightBodyText: {
    ...PDF_SUPPORT.body,
    color: T.insightBody,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: layout(30),
    marginBottom: layout(10),
  },
  page2H1: {
    ...PDF_HEADING.section,
    color: T.inkSoft,
    marginTop: layout(10),
  },
  attention: {
    fontSize: typeSize(10),
    color: T.attention,
    backgroundColor: T.attentionBg,
    borderRadius: layout(18),
    paddingHorizontal: layout(14),
    paddingVertical: layout(9),
  },
  flagRow: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#e8e9ed",
    minHeight: layout(76),
    paddingVertical: layout(6),
  },
  riskNum: {
    width: layout(36),
    height: layout(36),
    borderRadius: layout(18),
    backgroundColor: T.riskNumBg,
    alignItems: "center",
    justifyContent: "center",
    marginRight: layout(10),
  },
  riskNumText: { fontSize: typeSize(12), fontWeight: 600, color: T.riskNum },
  flagIcon: { width: layout(38), marginRight: layout(10) },
  flagTitle: { fontSize: typeSize(13), fontWeight: 600, marginBottom: layout(5) },
  flagBody: {
    ...PDF_SUPPORT.body,
    color: T.faint,
  },
  guidance: {
    marginTop: layout(36),
    paddingBottom: layout(25),
  },
  guidanceH2: {
    ...PDF_HEADING.section,
    color: T.inkSoft,
    marginTop: layout(10),
    marginBottom: layout(17),
  },
  guidanceGrid: { flexDirection: "row", flexWrap: "wrap" },
  guidanceCard: {
    width: "50%",
    flexDirection: "row",
    minHeight: layout(100),
    paddingTop: layout(13),
    paddingBottom: layout(13),
    borderBottomWidth: 1,
    borderBottomColor: "#ececf0",
  },
  guidanceOdd: {
    paddingRight: layout(14),
    borderRightWidth: 1,
    borderRightColor: "#ececf0",
  },
  guidanceEven: { paddingLeft: layout(18) },
  softIcon: {
    width: layout(38),
    height: layout(38),
    borderRadius: layout(19),
    backgroundColor: T.softIconBg,
    alignItems: "center",
    justifyContent: "center",
    marginRight: layout(10),
  },
  guidanceTitle: {
    fontSize: typeSize(12),
    fontWeight: 600,
    lineHeight: 1.35,
    color: T.inkSoft,
  },
  guidanceBody: {
    ...PDF_SUPPORT.body,
    color: T.faint,
    marginTop: layout(5),
  },
  recommendations: { paddingTop: layout(28) },
  recH2: {
    ...PDF_HEADING.section,
    fontSize: typeSize(28),
    color: T.inkSoft,
    marginBottom: layout(10),
  },
  recRow: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#e9e9ee",
    minHeight: layout(57),
    paddingVertical: layout(4),
  },
  recRowLast: {
    borderBottomWidth: 0,
  },
  recNum: {
    width: layout(38),
    height: layout(38),
    borderRadius: layout(19),
    backgroundColor: T.recNumBg,
    alignItems: "center",
    justifyContent: "center",
    marginRight: layout(8),
  },
  recNumText: { fontSize: typeSize(12), fontWeight: 600, color: T.recNum },
  recTitle: { fontSize: typeSize(13), fontWeight: 600 },
  recSub: {
    ...PDF_SUPPORT.body,
    color: T.faint,
    marginTop: layout(5),
  },
  ctaCard: {
    flexDirection: "row",
    backgroundColor: T.ctaBg,
    borderRadius: layout(12),
    paddingVertical: layout(26),
    paddingHorizontal: layout(24),
    marginTop: layout(28),
  },
  ctaLeft: { flex: 1.1, paddingRight: layout(24) },
  ctaHeadline: {
    ...PDF_HEADING.insight,
    color: T.inkSoft,
    marginTop: layout(11),
  },
  ctaRight: {
    flex: 0.9,
    borderLeftWidth: 1,
    borderLeftColor: T.ctaDivider,
    paddingLeft: layout(20),
  },
  ctaBody: {
    ...PDF_SUPPORT.body,
    color: T.faint,
  },
  waLink: {
    marginTop: layout(18),
    textDecoration: "none",
  },
  waBtn: {
    height: layout(44),
    borderRadius: layout(22),
    backgroundColor: T.primaryBtn,
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: layout(10),
    paddingHorizontal: layout(16),
    overflow: "hidden",
  },
  waIconWrap: {
    width: layout(16),
    height: layout(16),
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  waBtnLabel: {
    color: "#FFFFFF",
    fontSize: typeSize(10),
    fontWeight: 600,
    flexGrow: 1,
    marginLeft: layout(8),
    marginRight: layout(8),
  },
  waBtnArrow: {
    color: "#FFFFFF",
    fontSize: typeSize(14),
    fontWeight: 600,
    lineHeight: 1,
  },
  footer: {
    position: "absolute",
    bottom: layout(14),
    left: PAD_X,
    right: PAD_X,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    fontSize: typeSize(9),
    color: T.footer,
    borderTopWidth: 1,
    borderTopColor: "#e3e4e9",
    paddingTop: layout(8),
    minHeight: layout(55),
  },
  scoreRingLabel: {
    fontSize: typeSize(9),
    fontWeight: 600,
    letterSpacing: 1.2,
    color: T.primaryDeep,
    marginBottom: layout(4),
  },
  scoreRingValue: {
    fontFamily: FONT_SERIF,
    fontSize: typeSize(44),
    color: T.primary,
    lineHeight: 1,
  },
  scoreRingPct: {
    fontFamily: FONT_INTER,
    fontSize: typeSize(16),
    color: T.scorePts,
    marginBottom: layout(5),
  },
  scoreRingPts: {
    fontSize: typeSize(10),
    color: T.scorePts,
    marginTop: layout(4),
  },
});

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0] ?? ""}${parts[1][0] ?? ""}`.toUpperCase();
}

function visitFrequencyLine(visitLine: string | null): string | null {
  if (!visitLine) return null;
  const lower = visitLine.toLowerCase();
  if (lower.startsWith("visit frequency:")) return visitLine;
  const stripped = lower.replace(/^visits?\s+/i, "").trim();
  return stripped ? `Visit frequency: ${stripped}` : visitLine;
}

/**
 * Overview headline line breaks:
 * - Short tails stay inline ("Significant support needed, act now")
 * - Longer tails wrap after the leading clause ("High dependence," / rest)
 */
function pdfOverviewHeadline(headline: string): string {
  const match = headline.match(/^(.+?),[\u00A0\s]+(.+)$/);
  if (!match) return headline;
  const lead = match[1].trim();
  const rest = match[2].trim();
  if (!lead || !rest) return headline;
  const restWords = rest.split(/\s+/).filter(Boolean).length;
  if (restWords <= 3) return `${lead}, ${rest}`;
  return `${lead},\n${rest}`;
}

function splitRecommend(item: string): { title: string; sub: string | null } {
  const dash = item.split(/\s[-–—]\s/);
  if (dash.length >= 2) {
    return { title: dash[0].trim(), sub: dash.slice(1).join(" - ").trim() };
  }
  const dot = item.match(/^(.+?[.!])\s+(.+)$/);
  if (dot) return { title: dot[1].trim(), sub: dot[2].trim() };
  return { title: item, sub: null };
}

/**
 * Guidance cards: short title + supporting subtext.
 * Splits on em/en dash (or cleaned ",\u00A0" from report copy).
 */
function guidanceCardCopy(item: string): { title: string; body: string } {
  const trimmed = item.trim();
  const trailing = trimmed.match(/[.!?]+$/)?.[0] ?? "";

  const fromDash = trimmed.split(/\s+[—–]\s+/);
  if (fromDash.length >= 2) {
    return {
      title: fromDash[0].trim(),
      body: fromDash.slice(1).join(" - ").trim(),
    };
  }

  // cleanReportCopy turns " — " into ",\u00A0"
  const fromNbspComma = trimmed.split(",\u00A0");
  if (fromNbspComma.length >= 2) {
    return {
      title: fromNbspComma[0].trim(),
      body: fromNbspComma.slice(1).join(", ").trim(),
    };
  }

  const sentences = splitInsightSentences(trimmed);
  if (sentences.length >= 2) {
    return {
      title: sentences[0].replace(/[.!?]+$/, "").trim(),
      body: sentences.slice(1).join(" ").trim(),
    };
  }

  const bare = trimmed.replace(/[.!?]+$/, "").trim();
  const words = bare.split(/\s+/).filter(Boolean);
  if (words.length > 5) {
    return {
      title: words.slice(0, 5).join(" "),
      body: `${words.slice(5).join(" ")}${trailing}`,
    };
  }

  // Short item: keep full line as body with a compact lead title.
  if (words.length > 2) {
    return {
      title: words.slice(0, 2).join(" "),
      body: `${words.slice(2).join(" ")}${trailing}`,
    };
  }

  return { title: bare, body: trimmed };
}

const KEY_INSIGHT_QUOTE_MAX = 110;

function splitInsightSentences(insight: string): string[] {
  const parts = insight.match(/[^.!?]+[.!?]+|[^.!?]+$/g);
  if (!parts) return [insight.trim()].filter(Boolean);
  return parts.map((p) => p.trim()).filter(Boolean);
}

/**
 * Key insight from "What the score tells us" — never reuse WhatsApp CTA copy.
 * Prefer a short punchy sentence as the quote when the lead sentence is too long
 * (e.g. independent-but-vulnerable band).
 */
function keyInsightParts(model: IaspReportPdfModel): {
  quote: string;
  detail: string;
} {
  const fallbackDetail =
    model.subheadline ||
    "Independence is still largely intact, and a targeted review can keep it that way. Early, focused action helps maintain safety, wellbeing and quality of life.";

  if (!model.insight?.trim()) {
    return { quote: model.headline, detail: fallbackDetail };
  }

  const sentences = splitInsightSentences(model.insight);
  if (sentences.length === 0) {
    return { quote: model.headline, detail: fallbackDetail };
  }

  let quoteIndex = 0;
  if (sentences[0].length > KEY_INSIGHT_QUOTE_MAX && sentences.length > 1) {
    const shortIndex = sentences.findIndex(
      (s) => s.length <= KEY_INSIGHT_QUOTE_MAX,
    );
    if (shortIndex >= 0) quoteIndex = shortIndex;
  }

  const quote = sentences[quoteIndex].replace(/[.!?]+$/, "").trim();
  const detail = sentences
    .filter((_, i) => i !== quoteIndex)
    .join(" ")
    .trim();

  return {
    quote: quote || model.headline,
    detail: detail || fallbackDetail,
  };
}

function lerpHex(from: string, to: string, t: number): string {
  const clamped = Math.min(1, Math.max(0, t));
  const parse = (hex: string) =>
    [
      parseInt(hex.slice(1, 3), 16),
      parseInt(hex.slice(3, 5), 16),
      parseInt(hex.slice(5, 7), 16),
    ] as const;
  const [r1, g1, b1] = parse(from);
  const [r2, g2, b2] = parse(to);
  const channel = (a: number, b: number) =>
    Math.round(a + (b - a) * clamped)
      .toString(16)
      .padStart(2, "0");
  return `#${channel(r1, r2)}${channel(g1, g2)}${channel(b1, b2)}`;
}

function ringArcPath(
  cx: number,
  cy: number,
  r: number,
  startRatio: number,
  endRatio: number,
): string {
  const a0 = -Math.PI / 2 + startRatio * Math.PI * 2;
  const a1 = -Math.PI / 2 + endRatio * Math.PI * 2;
  const x0 = cx + Math.cos(a0) * r;
  const y0 = cy + Math.sin(a0) * r;
  const x1 = cx + Math.cos(a1) * r;
  const y1 = cy + Math.sin(a1) * r;
  const largeArc = a1 - a0 > Math.PI ? 1 : 0;
  return `M ${x0} ${y0} A ${r} ${r} 0 ${largeArc} 1 ${x1} ${y1}`;
}

/** Brand progress gradient along the arc (light → deep purple). */
const RING_GRAD_START = T.primaryMid;
const RING_GRAD_END = T.primaryDeep;
const RING_ARC_SEGMENTS = 64;

function buildRingGradientSegments(
  ratio: number,
  cx: number,
  cy: number,
  r: number,
): Array<{ key: string; d: string; color: string }> {
  if (ratio <= 0) return [];
  const count = Math.max(1, Math.round(RING_ARC_SEGMENTS * ratio));
  const overlap = ratio / count / 4;
  return Array.from({ length: count }, (_, index) => {
    const startRatio = (index / count) * ratio;
    const endRatio = Math.min(
      ratio,
      ((index + 1) / count) * ratio + overlap,
    );
    return {
      key: `seg-${index}`,
      d: ringArcPath(cx, cy, r, startRatio, endRatio),
      color: lerpHex(RING_GRAD_START, RING_GRAD_END, (index + 0.5) / count),
    };
  });
}

function ScoreRing({
  percentage,
  raw,
  max,
}: {
  percentage: number;
  raw: number;
  max: number;
}) {
  const size = layout(168);
  const stroke = layout(11);
  const radius = (size - stroke) / 2;
  const center = size / 2;
  const ratio = Math.min(1, Math.max(0, percentage / 100));
  const arcSegments = buildRingGradientSegments(ratio, center, center, radius);

  return (
    <View style={styles.scoreRingFrame}>
      <Svg
        width={size}
        height={size}
        style={{ position: "absolute", top: 0, left: 0 }}
      >
        <Circle
          cx={center}
          cy={center}
          r={radius}
          stroke={T.ringTrack}
          strokeWidth={stroke}
          fill="none"
        />
        {arcSegments.map((segment, index) => (
          <Path
            key={segment.key}
            d={segment.d}
            stroke={segment.color}
            strokeWidth={stroke}
            fill="none"
            strokeLinecap={
              index === 0 || index === arcSegments.length - 1
                ? "round"
                : "butt"
            }
          />
        ))}
      </Svg>
      <View style={styles.scoreRingCenter}>
        <Text style={styles.scoreRingLabel}>IASP SCORE</Text>
        <View style={{ flexDirection: "row", alignItems: "flex-end" }}>
          <Text style={styles.scoreRingValue}>{percentage}</Text>
          <Text style={styles.scoreRingPct}>%</Text>
        </View>
        <Text style={styles.scoreRingPts}>
          {raw} of {max} points
        </Text>
      </View>
    </View>
  );
}

function ReportHeader({
  logoSrc,
  model,
}: {
  logoSrc: string | null;
  model: IaspReportPdfModel;
}) {
  return (
    <View style={styles.reportHeader} fixed>
      <View style={styles.logoBrand}>
        {logoSrc ? <Image src={logoSrc} style={styles.logoMark} /> : null}
        <Text style={styles.logoWordmark}>nivarak</Text>
      </View>
      <View style={styles.headerMeta}>
        <Text style={styles.metaTitle}>IASP Report v2.0</Text>
        <Text style={styles.metaSub}>
          Assessed on {model.assessedOn} • {model.location}
        </Text>
      </View>
    </View>
  );
}

function PageFooter() {
  return (
    <View style={styles.footer} fixed>
      <Text>Confidential medical record, Nivarak Health</Text>
      <Text
        render={({ pageNumber, totalPages }) =>
          `Page ${pageNumber} of ${totalPages}`
        }
      />
    </View>
  );
}

function Block({
  children,
  unbreakable = true,
}: {
  children: ReactNode;
  unbreakable?: boolean;
}) {
  return (
    <View wrap={unbreakable ? false : undefined} style={styles.block}>
      {children}
    </View>
  );
}

function ReportPage({
  logoSrc,
  model,
  children,
}: {
  logoSrc: string | null;
  model: IaspReportPdfModel;
  children: ReactNode;
}) {
  return (
    <Page size="A4" style={styles.page} wrap>
      <ReportHeader logoSrc={logoSrc} model={model} />
      {children}
      <PageFooter />
    </Page>
  );
}

export function IaspReportPdfDocument({
  model,
  logoSrc,
}: {
  model: IaspReportPdfModel;
  logoSrc: string | null;
}) {
  const focusGrid = model.focusItems.slice(0, 4);
  const visitFreq = visitFrequencyLine(model.visitLine);
  const { quote: insightQuote, detail: insightDetail } = keyInsightParts(model);
  const actionBodyLines =
    model.action?.body.split("\n").map((l) => l.trim()).filter(Boolean) ?? [];
  const actionHeadingIsGeneric =
    (model.action?.heading.trim().toLowerCase() ?? "") === "suggested next step";
  /** Avoid "SUGGESTED NEXT STEP" + "Suggested next step" duplicate. */
  const ctaHeadline = actionHeadingIsGeneric
    ? (actionBodyLines[0] ?? model.action?.heading ?? "")
    : (model.action?.heading ?? "");
  const ctaLines = actionHeadingIsGeneric
    ? actionBodyLines.slice(1, 3)
    : actionBodyLines.slice(0, 2);

  return (
    <Document title="IASP Assessment Report" author="Nivarak">
      <ReportPage logoSrc={logoSrc} model={model}>
        <Block>
          <View style={styles.personStrip}>
            <View style={styles.person}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{initials(model.patientName)}</Text>
              </View>
              <View>
                <Text style={styles.personName}>{model.patientName}</Text>
                <Text style={styles.personSmall}>Age {model.age} years</Text>
                <Text style={styles.personSmall}>
                  Assessed by {model.relationship}
                </Text>
              </View>
            </View>
            <View style={styles.facts}>
              {(
                [
                  [PdfReportIcons.calendar, model.assessedOn, "Assessment date"],
                  [PdfReportIcons.location, model.location, "Location"],
                  [PdfReportIcons.file, "v2.0", "Report version"],
                ] as const
              ).map(([icon, value, label]) => (
                <View key={label} style={styles.factItem}>
                  <View style={styles.factIcon}>
                    <PdfIcon icon={icon} size={layout(22)} color={T.personFact} />
                  </View>
                  <View>
                    <Text style={styles.factStrong}>{value}</Text>
                    <Text style={styles.factSmall}>{label}</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        </Block>

        <Block>
          <View style={styles.overview}>
            <Text style={styles.eyebrow}>Overall assessment</Text>
            <View style={styles.overviewGrid}>
              <View style={styles.assessmentCopy}>
                <Text style={styles.headline}>
                  {pdfOverviewHeadline(model.headline)}
                </Text>
                <Text style={styles.subhead}>{model.subheadline}</Text>
              </View>
              <View style={styles.scoreWrap}>
                <ScoreRing
                  percentage={model.percentage}
                  raw={model.rawScore}
                  max={model.maxScore}
                />
                <Text style={styles.scoreLabelPill} wrap={false}>
                  {model.bandLabel}
                </Text>
                <View style={styles.miniFacts}>
                  {model.livingLine ? (
                    <View style={styles.miniFactRow}>
                      <View style={styles.miniFactIcon}>
                        <PdfIcon
                          icon={PdfReportIcons.home}
                          size={layout(17)}
                          color={T.miniFact}
                        />
                      </View>
                      <Text style={styles.miniFactText}>{model.livingLine}</Text>
                    </View>
                  ) : null}
                  {visitFreq ? (
                    <View style={[styles.miniFactRow, { marginBottom: 0 }]}>
                      <View style={styles.miniFactIcon}>
                        <PdfIcon
                          icon={PdfReportIcons.chart}
                          size={layout(17)}
                          color={T.miniFact}
                        />
                      </View>
                      <Text style={styles.miniFactText}>{visitFreq}</Text>
                    </View>
                  ) : null}
                </View>
              </View>
            </View>
          </View>
        </Block>

        {model.insight ? (
          <Block>
            <View style={styles.infoCard}>
              <View style={styles.infoIcon}>
                <Text style={styles.infoIconText}>i</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.infoTitle}>What this score tells us</Text>
                <Text style={styles.infoBody}>{model.insight}</Text>
              </View>
            </View>
          </Block>
        ) : null}

        <Block>
          <View style={styles.domainSection}>
            <View style={styles.sectionHeading}>
              <Text style={styles.domainTitle}>Domain scores</Text>
              <View style={styles.legend}>
                {(
                  [
                    ["Strong", T.legendStrong],
                    ["Fair", T.legendFair],
                    ["High risk", T.legendRisk],
                  ] as const
                ).map(([label, color]) => (
                  <View key={label} style={styles.legendItem}>
                    <View style={[styles.legendDot, { backgroundColor: color }]} />
                    <Text style={styles.legendText}>{label}</Text>
                  </View>
                ))}
              </View>
            </View>
            {model.domains.map((d) => {
              const status = DOMAIN_STATUS[d.level];
              const icon: IconSvgElement =
                IASP_DOMAIN_REPORT_ICONS[d.id] ?? PdfReportIcons.sparkles;
              return (
                <View key={d.id} style={styles.domainRow}>
                  <View style={styles.domainIcon}>
                    <PdfIconBadge
                      icon={icon}
                      size={layout(14)}
                      color={T.domainIconInk}
                      bg={T.domainIconBg}
                      box={layout(32)}
                      borderRadius={layout(16)}
                    />
                  </View>
                  <Text style={styles.domainName}>{d.label}</Text>
                  <View style={styles.domainBarWrap}>
                    <View style={styles.barTrack}>
                      <View
                        style={[
                          styles.barFill,
                          {
                            width: `${Math.max(4, d.percentage)}%`,
                            backgroundColor: status.bar,
                          },
                        ]}
                      />
                    </View>
                  </View>
                  <Text style={styles.domainPoints}>
                    {d.raw} / {d.max}
                  </Text>
                  <View
                    style={[
                      styles.statusPill,
                      { backgroundColor: status.pillBg },
                    ]}
                  >
                    <Text
                      style={[styles.statusPillText, { color: status.pillInk }]}
                      wrap={false}
                    >
                      {status.label}
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
        </Block>

        <Block>
          <InsightAccentCard style={{ marginTop: layout(38) }}>
            <View style={styles.insightLeft}>
              <Text style={styles.eyebrow}>Key insight</Text>
                <Text style={styles.insightHeadline}>{insightQuote}</Text>
              </View>
              <View style={styles.insightBody}>
                <Text style={styles.insightBodyText}>{insightDetail}</Text>
              </View>
          </InsightAccentCard>
        </Block>
      </ReportPage>

      <ReportPage logoSrc={logoSrc} model={model}>
        <Block>
          <View style={styles.titleRow}>
            <View>
              <Text style={styles.eyebrow}>Areas of concern</Text>
              <Text style={styles.page2H1}>Key red flags</Text>
            </View>
            {model.flags.length > 0 ? (
              <Text style={styles.attention}>
                {model.flags.length} need attention
              </Text>
            ) : null}
          </View>
          {model.flags.length === 0 ? (
            <Text style={styles.flagBody}>No red flags selected.</Text>
          ) : (
            model.flags.slice(0, 6).map((flag, index) => {
              const icon =
                PDF_RED_FLAG_ICONS[flag.id as IaspRedFlagId] ??
                PdfReportIcons.alert;
              return (
                <View key={flag.id} style={styles.flagRow}>
                  <View style={styles.riskNum}>
                    <Text style={styles.riskNumText}>{index + 1}</Text>
                  </View>
                  <View style={styles.flagIcon}>
                    <PdfIcon icon={icon} size={layout(22)} color={T.domainName} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.flagTitle}>{flag.label}</Text>
                    <Text style={styles.flagBody}>{flag.guidance}</Text>
                  </View>
                </View>
              );
            })
          )}
        </Block>

        {focusGrid.length > 0 ? (
          <Block>
            <View style={styles.guidance}>
              <Text style={styles.eyebrow}>Clinical guidance</Text>
              <Text style={styles.guidanceH2}>Areas to look at closely</Text>
              <View style={styles.guidanceGrid}>
                {focusGrid.map((item, index) => {
                  const icon =
                    PDF_GUIDANCE_ICONS[index] ?? PDF_GUIDANCE_ICONS[0];
                  const isOdd = index % 2 === 0;
                  const { title, body } = guidanceCardCopy(item);
                  return (
                    <View
                      key={item.slice(0, 40)}
                      style={[
                        styles.guidanceCard,
                        isOdd ? styles.guidanceOdd : styles.guidanceEven,
                      ]}
                    >
                      <View style={styles.softIcon}>
                        <PdfIcon icon={icon} size={layout(22)} color={T.softIcon} />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.guidanceTitle}>{title}</Text>
                        <Text style={styles.guidanceBody}>{body}</Text>
                      </View>
                    </View>
                  );
                })}
              </View>
            </View>
          </Block>
        ) : null}

        {model.recommends.length > 0 ? (
          <Block>
            <View style={styles.recommendations}>
              <Text style={styles.recH2}>What Nivarak recommends</Text>
              {model.recommends.slice(0, 4).map((item, index, arr) => {
                const { title, sub } = splitRecommend(item);
                const isLast = index === arr.length - 1;
                return (
                  <View
                    key={item.slice(0, 48)}
                    style={isLast ? [styles.recRow, styles.recRowLast] : styles.recRow}
                  >
                    <View style={styles.recNum}>
                      <Text style={styles.recNumText}>{index + 1}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.recTitle}>{title}</Text>
                      {sub ? <Text style={styles.recSub}>{sub}</Text> : null}
                    </View>
                  </View>
                );
              })}
            </View>
          </Block>
        ) : null}

        {model.action ? (
          <Block>
            <View style={styles.ctaCard}>
              <View style={styles.ctaLeft}>
                <Text style={styles.eyebrow}>Suggested next step</Text>
                {ctaHeadline ? (
                  <Text style={styles.ctaHeadline}>{ctaHeadline}</Text>
                ) : null}
              </View>
              <View style={styles.ctaRight}>
                {ctaLines.map((line) => (
                  <Text key={line.slice(0, 40)} style={styles.ctaBody}>
                    {line}
                  </Text>
                ))}
                <Link src={model.action.actionUrl} style={styles.waLink}>
                  <View style={styles.waBtn}>
                    <View style={styles.waIconWrap}>
                      <PdfWhatsappIcon size={layout(16)} />
                    </View>
                    <Text style={styles.waBtnLabel} wrap={false}>
                      {model.action.actionLabel || NIVARAK_WHATSAPP_CTA_LABEL}
                    </Text>
                    <Text style={styles.waBtnArrow} wrap={false}>
                      ›
                    </Text>
                  </View>
                </Link>
              </View>
            </View>
          </Block>
        ) : null}

      </ReportPage>
    </Document>
  );
}
