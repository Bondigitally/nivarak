"use client";

import { useState, type ReactNode } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  XAxis,
  YAxis,
} from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipPanel,
  ChartTooltipRow,
  createChartActiveDot,
  chartLegendSwatchClass,
  type ChartConfig,
} from "@/components/ui/chart";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useOnceAnimation } from "@/components/ui/use-once-animation";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { SectionTitle } from "@/features/dashboard/components/EmptyState";
import { dashboardCardClass } from "@/features/dashboard/data/dashboard-styles";
import { vitalStatusConfig, type VitalStatus } from "@/lib/tokens/status-badges";
import { cn } from "@/lib/utils";

// ─── Colors and styling from VitalsCard.tsx ──────────────────────────────────
const SYSTOLIC_COLOR = "var(--chart-2)";
const DIASTOLIC_COLOR = "var(--chart-3)";
const HEART_RATE_COLOR = "var(--chart-4)";
const SPO2_COLOR = "var(--chart-5)";
const GLUCOSE_COLOR = "var(--chart-6)";
const TEMP_COLOR = "var(--chart-7)";

const GRID_STROKE = "var(--divider)";

function statusTooltipColor(status: VitalStatus) {
  switch (status) {
    case "Normal":
      return "var(--success)";
    case "Low":
      return "var(--warning)";
    case "Elevated":
      return "var(--destructive)";
  }
}

function VitalStatusTooltipRow({ status }: { status: VitalStatus }) {
  const config = vitalStatusConfig(status);
  return (
    <ChartTooltipRow
      label="Status"
      value={status}
      color={statusTooltipColor(status)}
      valueClassName={config.badgeText}
    />
  );
}

const AXIS_TICK = {
  fill: "var(--tertiary-foreground)",
  fontSize: 12,
  fontWeight: 400,
} as const;

const BP_TICKS = [60, 90, 120, 150, 180];
const HR_TICKS = [45, 55, 65, 75];
const SPO2_TICKS = [95, 96, 97, 98, 99, 100];
const GLUCOSE_TICKS = [110, 115, 120, 125, 130, 135, 140];
const TEMP_TICKS = [36.0, 36.3, 36.6, 36.9, 37.2];

const tooltipCursor = {
  stroke: "var(--tertiary-foreground)",
  strokeWidth: 1,
  strokeDasharray: "4 4",
};

// ─── Data ─────────────────────────────────────────────────────────────────────
const BP_DATA = [
  { label: "Jul 3", date: "July 3, 2026", systolic: 115, diastolic: 75, status: "Normal" },
  { label: "Jul 7", date: "July 7, 2026", systolic: 120, diastolic: 78, status: "Normal" },
  { label: "Jul 11", date: "July 11, 2026", systolic: 122, diastolic: 80, status: "Normal" },
  { label: "Jul 15", date: "July 15, 2026", systolic: 128, diastolic: 88, status: "Normal" },
  { label: "Jul 19", date: "July 19, 2026", systolic: 119, diastolic: 79, status: "Normal" },
  { label: "Jul 23", date: "July 23, 2026", systolic: 121, diastolic: 81, status: "Normal" },
  { label: "Jul 27", date: "July 27, 2026", systolic: 120, diastolic: 80, status: "Normal" },
  { label: "Jul 31", date: "July 31, 2026", systolic: 122, diastolic: 82, status: "Normal" },
];

const HR_DATA = [
  { label: "Jul 3", date: "July 3, 2026", heartRate: 60, status: "Normal" as const },
  { label: "Jul 7", date: "July 7, 2026", heartRate: 58, status: "Low" as const },
  { label: "Jul 11", date: "July 11, 2026", heartRate: 55, status: "Low" as const },
  { label: "Jul 15", date: "July 15, 2026", heartRate: 57, status: "Low" as const },
  { label: "Jul 19", date: "July 19, 2026", heartRate: 54, status: "Low" as const },
  { label: "Jul 23", date: "July 23, 2026", heartRate: 59, status: "Low" as const },
  { label: "Jul 27", date: "July 27, 2026", heartRate: 57, status: "Low" as const },
  { label: "Jul 31", date: "July 31, 2026", heartRate: 58, status: "Low" as const },
];

const SPO2_DATA = [
  { label: "Jul 3", date: "July 3, 2026", spo2: 97, status: "Normal" as const },
  { label: "Jul 7", date: "July 7, 2026", spo2: 98, status: "Normal" as const },
  { label: "Jul 11", date: "July 11, 2026", spo2: 98, status: "Normal" as const },
  { label: "Jul 15", date: "July 15, 2026", spo2: 98, status: "Normal" as const },
  { label: "Jul 19", date: "July 19, 2026", spo2: 99, status: "Normal" as const },
  { label: "Jul 23", date: "July 23, 2026", spo2: 98, status: "Normal" as const },
  { label: "Jul 27", date: "July 27, 2026", spo2: 98, status: "Normal" as const },
  { label: "Jul 31", date: "July 31, 2026", spo2: 98, status: "Normal" as const },
];

const GLUCOSE_DATA = [
  { label: "Jul 3", date: "July 3, 2026", glucose: 118, status: "Normal" as const },
  { label: "Jul 7", date: "July 7, 2026", glucose: 124, status: "Normal" as const },
  { label: "Jul 11", date: "July 11, 2026", glucose: 130, status: "Elevated" as const },
  { label: "Jul 15", date: "July 15, 2026", glucose: 126, status: "Elevated" as const },
  { label: "Jul 19", date: "July 19, 2026", glucose: 128, status: "Elevated" as const },
  { label: "Jul 23", date: "July 23, 2026", glucose: 131, status: "Elevated" as const },
  { label: "Jul 27", date: "July 27, 2026", glucose: 126, status: "Elevated" as const },
  { label: "Jul 31", date: "July 31, 2026", glucose: 125, status: "Elevated" as const },
];

const TEMP_DATA = [
  { label: "Jul 3", date: "July 3, 2026", temp: 36.5, status: "Normal" as const },
  { label: "Jul 7", date: "July 7, 2026", temp: 36.7, status: "Normal" as const },
  { label: "Jul 11", date: "July 11, 2026", temp: 36.6, status: "Normal" as const },
  { label: "Jul 15", date: "July 15, 2026", temp: 36.8, status: "Normal" as const },
  { label: "Jul 19", date: "July 19, 2026", temp: 36.9, status: "Normal" as const },
  { label: "Jul 23", date: "July 23, 2026", temp: 36.8, status: "Normal" as const },
  { label: "Jul 27", date: "July 27, 2026", temp: 36.7, status: "Normal" as const },
  { label: "Jul 31", date: "July 31, 2026", temp: 36.8, status: "Normal" as const },
];

// ─── Chart config ─────────────────────────────────────────────────────────────
const bpConfig = {
  systolic: { label: "Systolic", color: SYSTOLIC_COLOR },
  diastolic: { label: "Diastolic", color: DIASTOLIC_COLOR },
} satisfies ChartConfig;

const hrConfig = {
  heartRate: { label: "Heart Rate", color: HEART_RATE_COLOR },
} satisfies ChartConfig;

const spo2Config = {
  spo2: { label: "SpO₂", color: SPO2_COLOR },
} satisfies ChartConfig;

const glucoseConfig = {
  glucose: { label: "Blood Glucose", color: GLUCOSE_COLOR },
} satisfies ChartConfig;

const tempConfig = {
  temp: { label: "Temperature", color: TEMP_COLOR },
} satisfies ChartConfig;

// ─── Tooltip Panels ───────────────────────────────────────────────────────────
function BpTooltip({ active, payload }: { active?: boolean; payload?: Array<{ payload?: typeof BP_DATA[0] }> }) {
  if (!active || !payload?.length) return null;
  const p = payload[0]?.payload;
  if (!p) return null;
  return (
    <ChartTooltipPanel title={p.date}>
      <ChartTooltipRow label="Systolic" value={`${p.systolic} mmHg`} color={SYSTOLIC_COLOR} />
      <ChartTooltipRow label="Diastolic" value={`${p.diastolic} mmHg`} color={DIASTOLIC_COLOR} />
      <VitalStatusTooltipRow status={p.status} />
    </ChartTooltipPanel>
  );
}

function HrTooltip({ active, payload }: { active?: boolean; payload?: Array<{ payload?: typeof HR_DATA[0] }> }) {
  if (!active || !payload?.length) return null;
  const p = payload[0]?.payload;
  if (!p) return null;
  return (
    <ChartTooltipPanel title={p.date}>
      <ChartTooltipRow label="Heart Rate" value={`${p.heartRate} bpm`} color={HEART_RATE_COLOR} />
      <VitalStatusTooltipRow status={p.status} />
    </ChartTooltipPanel>
  );
}

function Spo2Tooltip({ active, payload }: { active?: boolean; payload?: Array<{ payload?: typeof SPO2_DATA[0] }> }) {
  if (!active || !payload?.length) return null;
  const p = payload[0]?.payload;
  if (!p) return null;
  return (
    <ChartTooltipPanel title={p.date}>
      <ChartTooltipRow label="SpO₂" value={`${p.spo2}%`} color={SPO2_COLOR} />
      <VitalStatusTooltipRow status={p.status} />
    </ChartTooltipPanel>
  );
}

function GlucoseTooltip({ active, payload }: { active?: boolean; payload?: Array<{ payload?: typeof GLUCOSE_DATA[0] }> }) {
  if (!active || !payload?.length) return null;
  const p = payload[0]?.payload;
  if (!p) return null;
  return (
    <ChartTooltipPanel title={p.date}>
      <ChartTooltipRow label="Blood Glucose" value={`${p.glucose} mg/dL`} color={GLUCOSE_COLOR} />
      <VitalStatusTooltipRow status={p.status} />
    </ChartTooltipPanel>
  );
}

function TempTooltip({ active, payload }: { active?: boolean; payload?: Array<{ payload?: typeof TEMP_DATA[0] }> }) {
  if (!active || !payload?.length) return null;
  const p = payload[0]?.payload;
  if (!p) return null;
  return (
    <ChartTooltipPanel title={p.date}>
      <ChartTooltipRow label="Temperature" value={`${p.temp}°C`} color={TEMP_COLOR} />
      <VitalStatusTooltipRow status={p.status} />
    </ChartTooltipPanel>
  );
}

const systolicActiveDot = createChartActiveDot(SYSTOLIC_COLOR);
const diastolicActiveDot = createChartActiveDot(DIASTOLIC_COLOR);
const heartRateActiveDot = createChartActiveDot(HEART_RATE_COLOR);
const spo2ActiveDot = createChartActiveDot(SPO2_COLOR);
const glucoseActiveDot = createChartActiveDot(GLUCOSE_COLOR);
const tempActiveDot = createChartActiveDot(TEMP_COLOR);

/**
 * Keeps chart layout size when inactive (no display:none — that makes Recharts
 * remeasure and replay line animation). Animation runs once via useOnceAnimation.
 */
function ChartPanel({
  active,
  animationId,
  children,
}: {
  active: boolean;
  animationId: string;
  children: (opts: {
    isAnimationActive: boolean;
    onAnimationEnd: () => void;
  }) => ReactNode;
}) {
  const { isAnimationActive, onAnimationEnd } = useOnceAnimation(animationId);

  return (
    <div
      className={cn(
        "absolute inset-0 h-full w-full",
        !active && "invisible pointer-events-none",
      )}
      aria-hidden={!active}
    >
      {children({
        isAnimationActive: active && isAnimationActive,
        onAnimationEnd,
      })}
    </div>
  );
}

type Tab = "bp" | "hr" | "spo2" | "glucose" | "temp";
const TABS: { id: Tab; label: string }[] = [
  { id: "bp", label: "Blood Pressure" },
  { id: "hr", label: "Heart Rate" },
  { id: "spo2", label: "SpO₂" },
  { id: "glucose", label: "Blood Glucose" },
  { id: "temp", label: "Temp" },
];

const TIMELINE_OPTIONS = [
  "7 Days",
  "30 Days",
  "3 Months",
  "6 Months",
  "1 Year",
] as const;

type TimelineOption = (typeof TIMELINE_OPTIONS)[number];

export function VitalsTrendCard() {
  const [activeTab, setActiveTab] = useState<Tab>("bp");
  /** Mount each chart once on first visit; keep mounted so tab switches don't remount Recharts. */
  const [mountedTabs, setMountedTabs] = useState<ReadonlySet<Tab>>(
    () => new Set<Tab>(["bp"]),
  );
  const [timeline, setTimeline] = useState<TimelineOption>("30 Days");

  const onTabChange = (tab: Tab) => {
    setActiveTab(tab);
    setMountedTabs((prev) => {
      if (prev.has(tab)) return prev;
      const next = new Set(prev);
      next.add(tab);
      return next;
    });
  };

  return (
    <div className={cn(dashboardCardClass, "flex w-full flex-col items-stretch gap-5 p-5")}>
      {/* Title */}
      <div className="flex w-full flex-col items-start">
        <SectionTitle
          info="Track how your key vitals change over time. Switch metrics and time ranges to spot patterns early."
          className="flex-none pr-0 text-foreground"
        >
          Vitals Trend
        </SectionTitle>
      </div>

      {/* Tabs + legend/timeline */}
      <div className="flex w-full flex-col gap-4 md:flex-row md:items-center md:justify-between md:gap-4">
        <SegmentedControl
          value={activeTab}
          onChange={onTabChange}
          options={TABS}
          ariaLabel="Vital type"
          layoutId="vitalsTrendActiveTab"
          surface="card"
          className="w-full min-w-0 md:w-auto md:max-w-full"
        />

        <div className="flex w-full items-center justify-between gap-3 md:w-auto md:justify-end md:gap-6">
          {/* Legend */}
          <div className="flex min-w-0 flex-wrap items-center gap-x-4 gap-y-2 select-none">
            {activeTab === "bp" && (
              <>
                <div className="flex items-center gap-1.5">
                  <div className={cn(chartLegendSwatchClass, "bg-chart-2")} />
                  <div className="text-xs font-normal leading-5 text-muted-foreground font-sans">
                    Systolic
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className={cn(chartLegendSwatchClass, "bg-chart-3")} />
                  <div className="text-xs font-normal leading-5 text-muted-foreground font-sans">
                    Diastolic
                  </div>
                </div>
              </>
            )}
            {activeTab === "hr" && (
              <div className="flex items-center gap-1.5">
                <div
                  className={chartLegendSwatchClass}
                  style={{ backgroundColor: HEART_RATE_COLOR }}
                />
                <div className="text-xs font-normal leading-5 text-muted-foreground font-sans">
                  Heart Rate
                </div>
              </div>
            )}
            {activeTab === "spo2" && (
              <div className="flex items-center gap-1.5">
                <div
                  className={chartLegendSwatchClass}
                  style={{ backgroundColor: SPO2_COLOR }}
                />
                <div className="text-xs font-normal leading-5 text-muted-foreground font-sans">
                  SpO₂
                </div>
              </div>
            )}
            {activeTab === "glucose" && (
              <div className="flex items-center gap-1.5">
                <div
                  className={chartLegendSwatchClass}
                  style={{ backgroundColor: GLUCOSE_COLOR }}
                />
                <div className="text-xs font-normal leading-5 text-muted-foreground font-sans">
                  Blood Glucose
                </div>
              </div>
            )}
            {activeTab === "temp" && (
              <div className="flex items-center gap-1.5">
                <div
                  className={chartLegendSwatchClass}
                  style={{ backgroundColor: TEMP_COLOR }}
                />
                <div className="text-xs font-normal leading-5 text-muted-foreground font-sans">
                  Temperature
                </div>
              </div>
            )}
          </div>

          {/* Timeline dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="group inline-flex h-dash-control min-h-dash-control shrink-0 cursor-pointer select-none items-center justify-center gap-2 rounded-full bg-muted px-3 outline-none transition-colors hover:bg-accent sm:px-4"
              >
                <span className="inline-grid shrink-0 text-sm font-medium leading-5 font-sans [&>*]:col-start-1 [&>*]:row-start-1">
                  {TIMELINE_OPTIONS.map((option) => (
                    <span
                      key={option}
                      className="invisible whitespace-nowrap"
                      aria-hidden
                    >
                      {option}
                    </span>
                  ))}
                  <span className="whitespace-nowrap text-muted-foreground transition-colors group-hover:text-foreground">
                    {timeline}
                  </span>
                </span>
                <span className="flex size-3 shrink-0 items-center justify-center text-muted-foreground transition-colors group-hover:text-primary">
                  <svg
                    width="8"
                    height="5"
                    viewBox="0 0 8 5"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-hidden
                  >
                    <path
                      d="M1 1L4 4L7 1"
                      stroke="currentColor"
                      strokeWidth="1.75"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="min-w-0 w-(--radix-dropdown-menu-trigger-width) p-1"
            >
              {TIMELINE_OPTIONS.map((option) => (
                <DropdownMenuItem
                  key={option}
                  className="cursor-pointer px-2.5 py-2"
                  onClick={() => setTimeline(option)}
                >
                  {option}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Chart container — stack keep-alive panels; animate only on first mount */}
      <div className="relative h-80 w-full self-stretch">
        {mountedTabs.has("bp") && (
          <ChartPanel active={activeTab === "bp"} animationId="vitals-trend-bp">
            {({ isAnimationActive, onAnimationEnd }) => (
              <ChartContainer config={bpConfig} className="aspect-auto h-80 w-full" initialDimension={{ width: 1044, height: 280 }}>
                <LineChart data={BP_DATA} margin={{ top: 10, right: 8, left: 0, bottom: 20 }}>
                  <CartesianGrid vertical={false} stroke={GRID_STROKE} strokeDasharray="3 4" />
                  <XAxis dataKey="label" tickLine={false} axisLine={false} tickMargin={8} padding={{ left: 24, right: 24 }} tick={AXIS_TICK} />
                  <YAxis domain={[60, 180]} ticks={BP_TICKS} tickLine={false} axisLine={false} width={44} tickMargin={8} textAnchor="end" tick={AXIS_TICK} />
                  <ChartTooltip cursor={tooltipCursor} content={<BpTooltip />} />
                  <Line dataKey="systolic" type="monotone" stroke="var(--color-systolic)" strokeWidth={2} dot={false} activeDot={systolicActiveDot} isAnimationActive={isAnimationActive} onAnimationEnd={onAnimationEnd} />
                  <Line dataKey="diastolic" type="monotone" stroke="var(--color-diastolic)" strokeWidth={2} dot={false} activeDot={diastolicActiveDot} isAnimationActive={isAnimationActive} onAnimationEnd={onAnimationEnd} />
                </LineChart>
              </ChartContainer>
            )}
          </ChartPanel>
        )}

        {mountedTabs.has("hr") && (
          <ChartPanel active={activeTab === "hr"} animationId="vitals-trend-hr">
            {({ isAnimationActive, onAnimationEnd }) => (
              <ChartContainer config={hrConfig} className="aspect-auto h-80 w-full" initialDimension={{ width: 1044, height: 280 }}>
                <LineChart data={HR_DATA} margin={{ top: 10, right: 8, left: 0, bottom: 20 }}>
                  <CartesianGrid vertical={false} stroke={GRID_STROKE} strokeDasharray="3 4" />
                  <XAxis dataKey="label" tickLine={false} axisLine={false} tickMargin={8} padding={{ left: 24, right: 24 }} tick={AXIS_TICK} />
                  <YAxis domain={[45, 75]} ticks={HR_TICKS} tickLine={false} axisLine={false} width={44} tickMargin={8} textAnchor="end" tick={AXIS_TICK} />
                  <ChartTooltip cursor={tooltipCursor} content={<HrTooltip />} />
                  <Line dataKey="heartRate" type="monotone" stroke="var(--color-heartRate)" strokeWidth={2} dot={false} activeDot={heartRateActiveDot} isAnimationActive={isAnimationActive} onAnimationEnd={onAnimationEnd} />
                </LineChart>
              </ChartContainer>
            )}
          </ChartPanel>
        )}

        {mountedTabs.has("spo2") && (
          <ChartPanel active={activeTab === "spo2"} animationId="vitals-trend-spo2">
            {({ isAnimationActive, onAnimationEnd }) => (
              <ChartContainer config={spo2Config} className="aspect-auto h-80 w-full" initialDimension={{ width: 1044, height: 280 }}>
                <LineChart data={SPO2_DATA} margin={{ top: 10, right: 8, left: 0, bottom: 20 }}>
                  <CartesianGrid vertical={false} stroke={GRID_STROKE} strokeDasharray="3 4" />
                  <XAxis dataKey="label" tickLine={false} axisLine={false} tickMargin={8} padding={{ left: 24, right: 24 }} tick={AXIS_TICK} />
                  <YAxis domain={[95, 100]} ticks={SPO2_TICKS} tickLine={false} axisLine={false} width={44} tickMargin={8} textAnchor="end" tick={AXIS_TICK} />
                  <ChartTooltip cursor={tooltipCursor} content={<Spo2Tooltip />} />
                  <Line dataKey="spo2" type="monotone" stroke="var(--color-spo2)" strokeWidth={2} dot={false} activeDot={spo2ActiveDot} isAnimationActive={isAnimationActive} onAnimationEnd={onAnimationEnd} />
                </LineChart>
              </ChartContainer>
            )}
          </ChartPanel>
        )}

        {mountedTabs.has("glucose") && (
          <ChartPanel active={activeTab === "glucose"} animationId="vitals-trend-glucose">
            {({ isAnimationActive, onAnimationEnd }) => (
              <ChartContainer config={glucoseConfig} className="aspect-auto h-80 w-full" initialDimension={{ width: 1044, height: 280 }}>
                <LineChart data={GLUCOSE_DATA} margin={{ top: 10, right: 8, left: 0, bottom: 20 }}>
                  <CartesianGrid vertical={false} stroke={GRID_STROKE} strokeDasharray="3 4" />
                  <XAxis dataKey="label" tickLine={false} axisLine={false} tickMargin={8} padding={{ left: 24, right: 24 }} tick={AXIS_TICK} />
                  <YAxis domain={[110, 140]} ticks={GLUCOSE_TICKS} tickLine={false} axisLine={false} width={44} tickMargin={8} textAnchor="end" tick={AXIS_TICK} />
                  <ChartTooltip cursor={tooltipCursor} content={<GlucoseTooltip />} />
                  <Line dataKey="glucose" type="monotone" stroke="var(--color-glucose)" strokeWidth={2} dot={false} activeDot={glucoseActiveDot} isAnimationActive={isAnimationActive} onAnimationEnd={onAnimationEnd} />
                </LineChart>
              </ChartContainer>
            )}
          </ChartPanel>
        )}

        {mountedTabs.has("temp") && (
          <ChartPanel active={activeTab === "temp"} animationId="vitals-trend-temp">
            {({ isAnimationActive, onAnimationEnd }) => (
              <ChartContainer config={tempConfig} className="aspect-auto h-80 w-full" initialDimension={{ width: 1044, height: 280 }}>
                <LineChart data={TEMP_DATA} margin={{ top: 10, right: 8, left: 0, bottom: 20 }}>
                  <CartesianGrid vertical={false} stroke={GRID_STROKE} strokeDasharray="3 4" />
                  <XAxis dataKey="label" tickLine={false} axisLine={false} tickMargin={8} padding={{ left: 24, right: 24 }} tick={AXIS_TICK} />
                  <YAxis domain={[36.0, 37.2]} ticks={TEMP_TICKS} tickLine={false} axisLine={false} width={44} tickMargin={8} textAnchor="end" tick={AXIS_TICK} />
                  <ChartTooltip cursor={tooltipCursor} content={<TempTooltip />} />
                  <Line dataKey="temp" type="monotone" stroke="var(--color-temp)" strokeWidth={2} dot={false} activeDot={tempActiveDot} isAnimationActive={isAnimationActive} onAnimationEnd={onAnimationEnd} />
                </LineChart>
              </ChartContainer>
            )}
          </ChartPanel>
        )}
      </div>
    </div>
  );
}
