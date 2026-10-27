/** Figma Make `@import` fonts (Inter + DM Serif Display). */
export const FONT_INTER = "Inter";
export const FONT_SERIF = "DM Serif Display";
/** Landing / auth wordmark (Rounded Elegance). */
export const FONT_LOGO = "Rounded Elegance";

/** Tokens from Figma Make `index.css` (print / `.page` layout). */
export const FIGMA_REPORT = {
  ink: "#111635",
  inkSoft: "#11142c",
  muted: "#4f566c",
  faint: "#5c6478",
  meta: "#48516b",
  metaFaint: "#8b93a7",
  line: "#e7e8ed",
  lineSoft: "#ebecf1",
  eyebrow: "#342168",
  primary: "#7437ca",
  primaryMid: "#a65ce3",
  primaryDeep: "#4d17a9",
  primaryBtn: "#7b2cc5",
  primaryBtnEnd: "#813acb",
  insightBar: "#6C318E",
  insightBarEnd: "#9B5DE5",
  avatarBg: "#f2effc",
  avatarInk: "#32315b",
  labelBg: "#f6f1ff",
  ringTrack: "#ececf1",
  infoBg: "#f9f7ff",
  infoIconBg: "#eee8ff",
  infoIcon: "#3f23a7",
  insightBg: "#faf8ff",
  ctaBg: "#faf8ff",
  attention: "#e92a47",
  attentionBg: "#fff0f2",
  riskNumBg: "#fff2f3",
  riskNum: "#ee304f",
  recNumBg: "#f7f2ff",
  recNum: "#5520b7",
  softIconBg: "#f6f2ff",
  softIcon: "#3c229b",
  legendStrong: "#23b98d",
  legendFair: "#ffac4b",
  legendRisk: "#ff5e79",
  strong: "#20b488",
  strongBg: "#eaf9f4",
  strongInk: "#129b72",
  fair: "#ffad4d",
  fairBg: "#fff7eb",
  fairInk: "#d88115",
  risk: "#ff5d77",
  riskBg: "#fff0f2",
  riskInk: "#fa3156",
  barTrack: "#eff0f4",
  footer: "#8e96a8",
  domainName: "#343c55",
  points: "#566079",
  scoreSmall: "#5f6380",
  scorePts: "#777f94",
  miniFact: "#5a6278",
  bodySerif: "#4e566c",
  insightBody: "#4e566c",
  divider: "#dedbe8",
  ctaDivider: "#d9d5e7",
  personFact: "#191b58",
  personMuted: "#5c6478",
  domainIconBg: "#f3eff6",
  domainIconInk: "#6C318E",
} as const;

/** Make column ~686px → A4 content ~519pt */
const SCALE = 0.75;

/** CSS px from Make `index.css` → PDF pt (layout + type). */
export function layout(n: number): number {
  return Math.round(n * SCALE * 10) / 10;
}

export function typeSize(n: number): number {
  const scaled = Math.round(n * SCALE * 10) / 10;
  return n >= 9 ? Math.max(7.5, scaled) : scaled;
}

/**
 * Shared PDF heading metrics — serif display, wrap at word boundaries only
 * (hyphenation disabled via Font.registerHyphenationCallback).
 */
export const PDF_HEADING = {
  display: {
    fontFamily: FONT_SERIF,
    fontSize: typeSize(40),
    lineHeight: 1.2,
    letterSpacing: -0.35,
  },
  section: {
    fontFamily: FONT_SERIF,
    fontSize: typeSize(30),
    lineHeight: 1.22,
    letterSpacing: -0.2,
  },
  insight: {
    fontFamily: FONT_SERIF,
    fontSize: typeSize(20),
    lineHeight: 1.28,
    letterSpacing: -0.15,
  },
  subsection: {
    fontFamily: FONT_SERIF,
    fontSize: typeSize(26),
    lineHeight: 1.22,
    letterSpacing: -0.15,
  },
} as const;

/**
 * Supporting / body copy — Inter for readability (not display serif).
 */
export const PDF_SUPPORT = {
  lead: {
    fontFamily: FONT_INTER,
    fontSize: typeSize(12),
    fontWeight: 400 as const,
    lineHeight: 1.55,
    letterSpacing: 0.1,
  },
  body: {
    fontFamily: FONT_INTER,
    fontSize: typeSize(10.5),
    fontWeight: 400 as const,
    lineHeight: 1.55,
    letterSpacing: 0.05,
  },
  small: {
    fontFamily: FONT_INTER,
    fontSize: typeSize(9.5),
    fontWeight: 400 as const,
    lineHeight: 1.45,
    letterSpacing: 0.05,
  },
} as const;
