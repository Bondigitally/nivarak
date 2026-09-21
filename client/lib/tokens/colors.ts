/**
 * Color tokens — use CSS var refs in styles; use `chartHex` only when JS needs literal hex
 * (e.g. SVG lerp, Recharts). Canonical values live in `client/app/globals.css` and
 * `design system/design.md` — keep all three in sync.
 */

/** CSS custom property references for use in inline styles and chart config. */
export const cssVar = {
  background: "var(--background)",
  foreground: "var(--foreground)",
  card: "var(--card)",
  primary: "var(--primary)",
  primaryForeground: "var(--primary-foreground)",
  primaryActive: "var(--primary-active)",
  muted: "var(--muted)",
  mutedForeground: "var(--muted-foreground)",
  accent: "var(--accent)",
  tableHeader: "var(--table-header)",
  border: "var(--border)",
  divider: "var(--divider)",
  destructive: "var(--destructive)",
  success: "var(--success)",
  warning: "var(--warning)",
  attention: "var(--attention)",
  info: "var(--info)",
  chart1: "var(--chart-1)",
  chart2: "var(--chart-2)",
  chart3: "var(--chart-3)",
  chart4: "var(--chart-4)",
  chart5: "var(--chart-5)",
  chart6: "var(--chart-6)",
  chart7: "var(--chart-7)",
  chart8: "var(--chart-8)",
} as const;

/** Chart palette hex — mirrors globals.css `--chart-*` (design.md Charts & overlays). */
export const chartHex = {
  brandStart: "#6C318E",
  brandEnd: "#1E0E28",
  bpSystolic: "#FA4B42",
  bpDiastolic: "#147AD6",
  heartRate: "#7086FD",
  spo2: "#0EA5B1",
  bloodGlucose: "#5B8DEF",
  temperature: "#F97316",
} as const;

/**
 * Vitals KPI icon stroke + glow gradients (JS/SVG only).
 * Stroke ends reuse `chartHex` where they match the chart series.
 */
export const vitalIconGradient = {
  bp: {
    from: chartHex.bpSystolic,
    to: "#F43F5E",
    glowFrom: "#FCA5A5",
    glowTo: "#FDA4AF",
  },
  heartRate: {
    from: "#5A67D8",
    to: chartHex.heartRate,
    glowFrom: "#A5B4FC",
    glowTo: "#C7D2FE",
  },
  spo2: {
    from: "#0D9488",
    to: chartHex.spo2,
    glowFrom: "#6EE7B7",
    glowTo: "#5EEAD4",
  },
  bloodGlucose: {
    from: chartHex.bpDiastolic,
    to: chartHex.bloodGlucose,
    glowFrom: "#7DD3FC",
    glowTo: "#67E8F9",
  },
  temperature: {
    from: chartHex.temperature,
    to: "#F59E0B",
    glowFrom: "#FDBA74",
    glowTo: "#FDE68A",
  },
} as const;

export type VitalIconGradient = (typeof vitalIconGradient)[keyof typeof vitalIconGradient];
