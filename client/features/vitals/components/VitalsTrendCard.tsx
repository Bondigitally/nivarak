"use client";

import { useState } from "react";
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
  type ChartConfig,
} from "@/components/ui/chart";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { SectionTitle } from "@/features/dashboard/components/EmptyState";

// ─── Colors and styling from VitalsCard.tsx ──────────────────────────────────
const SYSTOLIC_COLOR = "#FF5372";
const DIASTOLIC_COLOR = "#4A3AFF";
const HEART_RATE_COLOR = "#7086FD";
const SPO2_COLOR = "#0EA5B1";
const GLUCOSE_COLOR = "#5B8DEF";
const TEMP_COLOR = "#F97316";

const STATUS_COLOR = "#22C55E";
const GRID_STROKE = "#E8E4EC";

const AXIS_TICK = {
  fill: "#8A8F98",
  fontSize: 12,
  fontWeight: 400,
} as const;

const BP_TICKS = [60, 90, 120, 150, 180];
const HR_TICKS = [45, 55, 65, 75];
const SPO2_TICKS = [95, 96, 97, 98, 99, 100];
const GLUCOSE_TICKS = [110, 115, 120, 125, 130, 135, 140];
const TEMP_TICKS = [36.0, 36.3, 36.6, 36.9, 37.2];

const tooltipCursor = {
  stroke: "#C4C0C9",
  strokeWidth: 1,
  strokeDasharray: "4 4",
};

function lineActiveDot(color: string) {
  return {
    r: 5,
    fill: color,
    stroke: "#fff",
    strokeWidth: 2,
  };
}

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
  { label: "Jul 3", date: "July 3, 2026", heartRate: 60 },
  { label: "Jul 7", date: "July 7, 2026", heartRate: 58 },
  { label: "Jul 11", date: "July 11, 2026", heartRate: 55 },
  { label: "Jul 15", date: "July 15, 2026", heartRate: 57 },
  { label: "Jul 19", date: "July 19, 2026", heartRate: 54 },
  { label: "Jul 23", date: "July 23, 2026", heartRate: 59 },
  { label: "Jul 27", date: "July 27, 2026", heartRate: 57 },
  { label: "Jul 31", date: "July 31, 2026", heartRate: 58 },
];

const SPO2_DATA = [
  { label: "Jul 3", date: "July 3, 2026", spo2: 97 },
  { label: "Jul 7", date: "July 7, 2026", spo2: 98 },
  { label: "Jul 11", date: "July 11, 2026", spo2: 98 },
  { label: "Jul 15", date: "July 15, 2026", spo2: 98 },
  { label: "Jul 19", date: "July 19, 2026", spo2: 99 },
  { label: "Jul 23", date: "July 23, 2026", spo2: 98 },
  { label: "Jul 27", date: "July 27, 2026", spo2: 98 },
  { label: "Jul 31", date: "July 31, 2026", spo2: 98 },
];

const GLUCOSE_DATA = [
  { label: "Jul 3", date: "July 3, 2026", glucose: 118 },
  { label: "Jul 7", date: "July 7, 2026", glucose: 124 },
  { label: "Jul 11", date: "July 11, 2026", glucose: 130 },
  { label: "Jul 15", date: "July 15, 2026", glucose: 126 },
  { label: "Jul 19", date: "July 19, 2026", glucose: 128 },
  { label: "Jul 23", date: "July 23, 2026", glucose: 131 },
  { label: "Jul 27", date: "July 27, 2026", glucose: 126 },
  { label: "Jul 31", date: "July 31, 2026", glucose: 125 },
];

const TEMP_DATA = [
  { label: "Jul 3", date: "July 3, 2026", temp: 36.5 },
  { label: "Jul 7", date: "July 7, 2026", temp: 36.7 },
  { label: "Jul 11", date: "July 11, 2026", temp: 36.6 },
  { label: "Jul 15", date: "July 15, 2026", temp: 36.8 },
  { label: "Jul 19", date: "July 19, 2026", temp: 36.9 },
  { label: "Jul 23", date: "July 23, 2026", temp: 36.8 },
  { label: "Jul 27", date: "July 27, 2026", temp: 36.7 },
  { label: "Jul 31", date: "July 31, 2026", temp: 36.8 },
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
      <ChartTooltipRow label="Status" value={p.status} color={STATUS_COLOR} valueClassName="text-[#22C55E]" />
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
    </ChartTooltipPanel>
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

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function VitalsTrendCard() {
  const [activeTab, setActiveTab] = useState<Tab>("bp");
  const [timeline, setTimeline] = useState("Last 30 Days");

  return (
    <div
      className="flex w-full flex-col items-stretch gap-5 rounded-[14px] bg-white p-5"
      style={{ outline: "1px #E5E2E1 solid", outlineOffset: "-1px", boxShadow: "0px 2px 8px rgba(17, 24, 39, 0.05)" }}
    >
      {/* Title */}
      <div className="flex w-full flex-col items-start">
        <SectionTitle
          info="Track how your key vitals change over time. Switch metrics and time ranges to spot patterns early."
          className="flex-none pr-0 text-[#1C1B1B]"
        >
          Vitals Trend
        </SectionTitle>
      </div>

      {/* Tabs + legend/timeline */}
      <div className="flex w-full flex-col gap-4 md:flex-row md:items-center md:justify-between md:gap-4">
        <SegmentedControl
          value={activeTab}
          onChange={setActiveTab}
          options={TABS}
          ariaLabel="Vital type"
          layoutId="vitalsTrendActiveTab"
          className="w-full min-w-0 md:w-auto md:max-w-full"
        />

        <div className="flex w-full items-center justify-between gap-3 md:w-auto md:justify-end md:gap-6">
          {/* Legend */}
          <div className="flex min-w-0 flex-wrap items-center gap-x-4 gap-y-2 select-none">
            {activeTab === "bp" && (
              <>
                <div className="flex items-center gap-1.5">
                  <div className="size-2.5 shrink-0 rounded-xs bg-[#FF5372]" />
                  <div className="text-xs font-normal leading-5 text-[#666666] font-sans">
                    Systolic
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="size-2.5 shrink-0 rounded-xs bg-[#4A3AFF]" />
                  <div className="text-xs font-normal leading-5 text-[#666666] font-sans">
                    Diastolic
                  </div>
                </div>
              </>
            )}
            {activeTab === "hr" && (
              <div className="flex items-center gap-1.5">
                <div
                  className="size-2.5 shrink-0 rounded-xs"
                  style={{ backgroundColor: HEART_RATE_COLOR }}
                />
                <div className="text-xs font-normal leading-5 text-[#666666] font-sans">
                  Heart Rate
                </div>
              </div>
            )}
            {activeTab === "spo2" && (
              <div className="flex items-center gap-1.5">
                <div
                  className="size-2.5 shrink-0 rounded-xs"
                  style={{ backgroundColor: SPO2_COLOR }}
                />
                <div className="text-xs font-normal leading-5 text-[#666666] font-sans">
                  SpO₂
                </div>
              </div>
            )}
            {activeTab === "glucose" && (
              <div className="flex items-center gap-1.5">
                <div
                  className="size-2.5 shrink-0 rounded-xs"
                  style={{ backgroundColor: GLUCOSE_COLOR }}
                />
                <div className="text-xs font-normal leading-5 text-[#666666] font-sans">
                  Blood Glucose
                </div>
              </div>
            )}
            {activeTab === "temp" && (
              <div className="flex items-center gap-1.5">
                <div
                  className="size-2.5 shrink-0 rounded-xs"
                  style={{ backgroundColor: TEMP_COLOR }}
                />
                <div className="text-xs font-normal leading-5 text-[#666666] font-sans">
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
                className="inline-flex h-10 shrink-0 cursor-pointer select-none items-center justify-center gap-2 rounded-[14px] bg-white px-3 outline-none transition-colors hover:bg-slate-50 sm:px-4"
                style={{
                  outline: "1px #E9E4ED solid",
                  outlineOffset: "-1px",
                  boxShadow: "0px 1px 2px rgba(17, 24, 39, 0.04)",
                }}
              >
                <span className="whitespace-nowrap text-sm font-medium leading-5 text-[#5F6368] font-sans">
                  {timeline}
                </span>
                <span className="flex size-3 shrink-0 items-center justify-center text-[#5F6368]">
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
              className="min-w-0 w-[var(--radix-dropdown-menu-trigger-width)] p-1"
            >
              <DropdownMenuItem
                className="cursor-pointer px-2.5 py-2"
                onClick={() => setTimeline("Last 7 Days")}
              >
                Last 7 Days
              </DropdownMenuItem>
              <DropdownMenuItem
                className="cursor-pointer px-2.5 py-2"
                onClick={() => setTimeline("Last 30 Days")}
              >
                Last 30 Days
              </DropdownMenuItem>
              <DropdownMenuItem
                className="cursor-pointer px-2.5 py-2"
                onClick={() => setTimeline("Last 3 Months")}
              >
                Last 3 Months
              </DropdownMenuItem>
              <DropdownMenuItem
                className="cursor-pointer px-2.5 py-2"
                onClick={() => setTimeline("Last 6 Months")}
              >
                Last 6 Months
              </DropdownMenuItem>
              <DropdownMenuItem
                className="cursor-pointer px-2.5 py-2"
                onClick={() => setTimeline("Last 1 Year")}
              >
                Last 1 Year
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Chart container */}
      <div className="relative h-80 w-full self-stretch">
        {activeTab === "bp" && (
          <ChartContainer config={bpConfig} className="aspect-auto h-80 w-full" initialDimension={{ width: 1044, height: 280 }}>
            <LineChart data={BP_DATA} margin={{ top: 10, right: 8, left: 0, bottom: 20 }}>
              <CartesianGrid vertical={false} stroke={GRID_STROKE} strokeDasharray="3 4" />
              <XAxis dataKey="label" tickLine={false} axisLine={false} tickMargin={8} padding={{ left: 24, right: 24 }} tick={AXIS_TICK} />
              <YAxis domain={[60, 180]} ticks={BP_TICKS} tickLine={false} axisLine={false} width={44} tickMargin={8} textAnchor="end" tick={AXIS_TICK} />
              <ChartTooltip cursor={tooltipCursor} content={<BpTooltip />} />
              <Line dataKey="systolic" type="monotone" stroke="var(--color-systolic)" strokeWidth={2} dot={false} activeDot={lineActiveDot(SYSTOLIC_COLOR)} />
              <Line dataKey="diastolic" type="monotone" stroke="var(--color-diastolic)" strokeWidth={2} dot={false} activeDot={lineActiveDot(DIASTOLIC_COLOR)} />
            </LineChart>
          </ChartContainer>
        )}

        {activeTab === "hr" && (
          <ChartContainer config={hrConfig} className="aspect-auto h-80 w-full" initialDimension={{ width: 1044, height: 280 }}>
            <LineChart data={HR_DATA} margin={{ top: 10, right: 8, left: 0, bottom: 20 }}>
              <CartesianGrid vertical={false} stroke={GRID_STROKE} strokeDasharray="3 4" />
              <XAxis dataKey="label" tickLine={false} axisLine={false} tickMargin={8} padding={{ left: 24, right: 24 }} tick={AXIS_TICK} />
              <YAxis domain={[45, 75]} ticks={HR_TICKS} tickLine={false} axisLine={false} width={44} tickMargin={8} textAnchor="end" tick={AXIS_TICK} />
              <ChartTooltip cursor={tooltipCursor} content={<HrTooltip />} />
              <Line dataKey="heartRate" type="monotone" stroke="var(--color-heartRate)" strokeWidth={2} dot={false} activeDot={lineActiveDot(HEART_RATE_COLOR)} />
            </LineChart>
          </ChartContainer>
        )}

        {activeTab === "spo2" && (
          <ChartContainer config={spo2Config} className="aspect-auto h-80 w-full" initialDimension={{ width: 1044, height: 280 }}>
            <LineChart data={SPO2_DATA} margin={{ top: 10, right: 8, left: 0, bottom: 20 }}>
              <CartesianGrid vertical={false} stroke={GRID_STROKE} strokeDasharray="3 4" />
              <XAxis dataKey="label" tickLine={false} axisLine={false} tickMargin={8} padding={{ left: 24, right: 24 }} tick={AXIS_TICK} />
              <YAxis domain={[95, 100]} ticks={SPO2_TICKS} tickLine={false} axisLine={false} width={44} tickMargin={8} textAnchor="end" tick={AXIS_TICK} />
              <ChartTooltip cursor={tooltipCursor} content={<Spo2Tooltip />} />
              <Line dataKey="spo2" type="monotone" stroke="var(--color-spo2)" strokeWidth={2} dot={false} activeDot={lineActiveDot(SPO2_COLOR)} />
            </LineChart>
          </ChartContainer>
        )}

        {activeTab === "glucose" && (
          <ChartContainer config={glucoseConfig} className="aspect-auto h-80 w-full" initialDimension={{ width: 1044, height: 280 }}>
            <LineChart data={GLUCOSE_DATA} margin={{ top: 10, right: 8, left: 0, bottom: 20 }}>
              <CartesianGrid vertical={false} stroke={GRID_STROKE} strokeDasharray="3 4" />
              <XAxis dataKey="label" tickLine={false} axisLine={false} tickMargin={8} padding={{ left: 24, right: 24 }} tick={AXIS_TICK} />
              <YAxis domain={[110, 140]} ticks={GLUCOSE_TICKS} tickLine={false} axisLine={false} width={44} tickMargin={8} textAnchor="end" tick={AXIS_TICK} />
              <ChartTooltip cursor={tooltipCursor} content={<GlucoseTooltip />} />
              <Line dataKey="glucose" type="monotone" stroke="var(--color-glucose)" strokeWidth={2} dot={false} activeDot={lineActiveDot(GLUCOSE_COLOR)} />
            </LineChart>
          </ChartContainer>
        )}

        {activeTab === "temp" && (
          <ChartContainer config={tempConfig} className="aspect-auto h-80 w-full" initialDimension={{ width: 1044, height: 280 }}>
            <LineChart data={TEMP_DATA} margin={{ top: 10, right: 8, left: 0, bottom: 20 }}>
              <CartesianGrid vertical={false} stroke={GRID_STROKE} strokeDasharray="3 4" />
              <XAxis dataKey="label" tickLine={false} axisLine={false} tickMargin={8} padding={{ left: 24, right: 24 }} tick={AXIS_TICK} />
              <YAxis domain={[36.0, 37.2]} ticks={TEMP_TICKS} tickLine={false} axisLine={false} width={44} tickMargin={8} textAnchor="end" tick={AXIS_TICK} />
              <ChartTooltip cursor={tooltipCursor} content={<TempTooltip />} />
              <Line dataKey="temp" type="monotone" stroke="var(--color-temp)" strokeWidth={2} dot={false} activeDot={lineActiveDot(TEMP_COLOR)} />
            </LineChart>
          </ChartContainer>
        )}
      </div>
    </div>
  );
}
