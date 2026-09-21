"use client";

import { BloodPressureIcon, Cardiogram02Icon, Medicine02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
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
import { useOnceAnimation } from "@/components/ui/use-once-animation";
import { typo } from "@/lib/tokens/typography";
import { cn } from "@/lib/utils";
import {
  dashboardCardClass,
  dashboardCardHeaderClass,
} from "../data/dashboard-styles";
import { EmptyState, SectionTitle, ViewAllLink } from "./EmptyState";
import type { HeartRateSeries, VitalsSnapshot } from "../data/home-data";
import { ICON_SIZE, ICON_STROKE } from "@/lib/icons";

const SYSTOLIC_COLOR = "var(--chart-2)";
const DIASTOLIC_COLOR = "var(--chart-3)";
const HEART_RATE_COLOR = "var(--chart-4)";
const STATUS_COLOR = "var(--success)";
const GRID_STROKE = "var(--divider)";

const systolicActiveDot = createChartActiveDot(SYSTOLIC_COLOR);
const diastolicActiveDot = createChartActiveDot(DIASTOLIC_COLOR);
const heartRateActiveDot = createChartActiveDot(HEART_RATE_COLOR);
const AXIS_TICK = {
  fill: "var(--tertiary-foreground)",
  fontSize: 12,
  fontWeight: 400,
} as const;

/** Clinical normal bands used to keep the BP Y-axis in a useful range. */
const BP_NORMAL = {
  diastolic: { low: 60, high: 80 },
  systolic: { low: 90, high: 120 },
} as const;

const bpChartConfig = {
  systolic: {
    label: "Systolic",
    color: SYSTOLIC_COLOR,
  },
  diastolic: {
    label: "Diastolic",
    color: DIASTOLIC_COLOR,
  },
} satisfies ChartConfig;

const hrChartConfig = {
  heartRate: {
    label: "Heart Rate",
    color: HEART_RATE_COLOR,
  },
} satisfies ChartConfig;

/** Fit Y domain tightly around readings with evenly spaced ticks (no crowded labels).
 *  The `niceSteps` cap of ~6 ticks prevents label overlap on the small inline chart. */
function getVitalYAxis(values: number[], floorValues: number[] = []) {
  const rawMin = Math.min(...values, ...floorValues);
  const rawMax = Math.max(...values, ...floorValues);
  const niceSteps = [5, 10, 15, 20, 25, 30, 40, 50];
  const idealSpan = Math.max(rawMax - rawMin + 10, 20);
  const step =
    niceSteps.find((candidate) => idealSpan / candidate <= 6) ?? 50;

  const yMin = Math.floor(rawMin / step) * step;
  const yMax = Math.ceil((rawMax + step * 0.25) / step) * step;

  const ticks: number[] = [];
  for (let t = yMin; t <= yMax; t += step) {
    ticks.push(t);
  }

  return { domain: [yMin, yMax] as [number, number], ticks };
}

/** Demo week dates aligned with Figma tooltip (Thu → July 17, 2026). */
const BP_DATES: Record<string, string> = {
  Sun: "July 13, 2026",
  Mon: "July 14, 2026",
  Tue: "July 15, 2026",
  Wed: "July 16, 2026",
  Thu: "July 17, 2026",
  Fri: "July 18, 2026",
  Sat: "July 19, 2026",
};

const HR_DATES: Record<string, string> = {
  Sun: "July 13, 2026",
  Mon: "July 14, 2026",
  Tue: "July 15, 2026",
  Wed: "July 16, 2026",
  Thu: "July 17, 2026",
  Fri: "July 18, 2026",
  Sat: "July 19, 2026",
};

const tooltipCursor = {
  stroke: "var(--tertiary-foreground)",
  strokeWidth: 1,
  strokeDasharray: "4 4",
};

type BpChartPoint = {
  label: string;
  date: string;
  systolic: number;
  diastolic: number;
  statusLabel: string;
  unit: string;
};

type HrChartPoint = {
  label: string;
  date: string;
  heartRate: number;
  unit: string;
  statusLabel: string;
};

function BloodPressureTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: ReadonlyArray<{ payload?: BpChartPoint }>;
}) {
  if (!active || !payload?.length) return null;

  const point = payload[0]?.payload;
  if (!point) return null;

  return (
    <ChartTooltipPanel title={point.date}>
      <ChartTooltipRow
        label="Systolic"
        value={`${point.systolic} ${point.unit}`}
        color={SYSTOLIC_COLOR}
      />
      <ChartTooltipRow
        label="Diastolic"
        value={`${point.diastolic} ${point.unit}`}
        color={DIASTOLIC_COLOR}
      />
      <ChartTooltipRow
        label="Status"
        value={point.statusLabel}
        color={STATUS_COLOR}
        valueClassName="text-success"
      />
    </ChartTooltipPanel>
  );
}

function HeartRateTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: ReadonlyArray<{ payload?: HrChartPoint }>;
}) {
  if (!active || !payload?.length) return null;

  const point = payload[0]?.payload;
  if (!point) return null;

  return (
    <ChartTooltipPanel title={point.date}>
      <ChartTooltipRow
        label="Heart Rate"
        value={`${point.heartRate} ${point.unit.toUpperCase()}`}
        color={HEART_RATE_COLOR}
      />
      <ChartTooltipRow
        label="Status"
        value={point.statusLabel}
        color={STATUS_COLOR}
        valueClassName="text-success"
      />
    </ChartTooltipPanel>
  );
}

function BloodPressureChart({ data }: { data: VitalsSnapshot["bloodPressure"] }) {
  const { isAnimationActive, onAnimationEnd } = useOnceAnimation(
    "dashboard-vitals-bp",
  );
  const chartData: BpChartPoint[] = data.systolicSeries.map((point, index) => ({
    label: point.label,
    date: BP_DATES[point.label] ?? point.label,
    systolic: point.value,
    diastolic: data.diastolicSeries[index]?.value ?? 0,
    statusLabel: data.statusLabel,
    unit: data.unit,
  }));

  const { domain: yDomain, ticks: yTicks } = getVitalYAxis(
    chartData.flatMap((point) => [point.systolic, point.diastolic]),
    [BP_NORMAL.diastolic.low, BP_NORMAL.systolic.high],
  );

  return (
    <div className="flex shrink-0 flex-col gap-8">
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <HugeiconsIcon
              icon={BloodPressureIcon}
              size={ICON_SIZE}
              strokeWidth={ICON_STROKE}
              color="var(--destructive)"
            absoluteStrokeWidth />
            <span className={cn(typo.label, "text-muted-foreground")}>{data.label}</span>
          </div>
          <p className={cn(typo.bodyS, "shrink-0")}>{data.updatedAgo}</p>
        </div>

        <div className="flex w-full flex-wrap items-baseline justify-between gap-x-4 gap-y-1.5">
          <p className="flex items-baseline gap-1.5">
            <span className="flex items-baseline gap-0.5 tabular-nums">
              <span
                className={cn(typo.headingXxl, "leading-none")}
                style={{ color: SYSTOLIC_COLOR }}
              >
                {data.systolic}
              </span>
              <span className={cn(typo.headingXxl, "leading-none text-placeholder")}>
                /
              </span>
              <span
                className={cn(typo.headingXxl, "leading-none")}
                style={{ color: DIASTOLIC_COLOR }}
              >
                {data.diastolic}
              </span>
            </span>
            <span className={cn(typo.caption, "text-muted-foreground")}>{data.unit}</span>
          </p>
          <div className="ml-auto flex items-center gap-4">
            <span className="flex items-center gap-2">
              <span
                className={chartLegendSwatchClass}
                style={{ backgroundColor: SYSTOLIC_COLOR }}
              />
              <span className={cn(typo.bodyM, "font-medium text-foreground")}>
                Systolic
              </span>
            </span>
            <span className="flex items-center gap-2">
              <span
                className={chartLegendSwatchClass}
                style={{ backgroundColor: DIASTOLIC_COLOR }}
              />
              <span className={cn(typo.bodyM, "font-medium text-foreground")}>
                Diastolic
              </span>
            </span>
          </div>
        </div>
      </div>

      <ChartContainer
        config={bpChartConfig}
        className="aspect-auto h-52 w-full"
        initialDimension={{ width: 420, height: 208 }}
      >
        <LineChart
          accessibilityLayer
          data={chartData}
          margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
        >
          <CartesianGrid
            vertical={false}
            stroke={GRID_STROKE}
            strokeDasharray="3 4"
          />
          <XAxis
            dataKey="label"
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            padding={{ left: 24, right: 24 }}
            tick={AXIS_TICK}
          />
          <YAxis
            domain={yDomain}
            ticks={yTicks}
            tickLine={false}
            axisLine={false}
            width={36}
            tickMargin={8}
            textAnchor="end"
            tick={AXIS_TICK}
          />
          <ChartTooltip cursor={tooltipCursor} content={<BloodPressureTooltip />} />
          <Line
            dataKey="systolic"
            type="monotone"
            stroke="var(--color-systolic)"
            strokeWidth={2}
            dot={false}
            activeDot={systolicActiveDot}
            isAnimationActive={isAnimationActive}
            onAnimationEnd={onAnimationEnd}
          />
          <Line
            dataKey="diastolic"
            type="monotone"
            stroke="var(--color-diastolic)"
            strokeWidth={2}
            dot={false}
            activeDot={diastolicActiveDot}
            isAnimationActive={isAnimationActive}
            onAnimationEnd={onAnimationEnd}
          />
        </LineChart>
      </ChartContainer>
    </div>
  );
}

function HeartRateChart({
  data,
  updatedAgo,
  statusLabel,
}: {
  data: HeartRateSeries;
  updatedAgo: string;
  statusLabel: string;
}) {
  const { isAnimationActive, onAnimationEnd } = useOnceAnimation(
    "dashboard-vitals-hr",
  );
  const chartData: HrChartPoint[] = data.series.map((point) => ({
    label: point.label,
    date: HR_DATES[point.label] ?? point.label,
    heartRate: point.value,
    unit: data.unit,
    statusLabel,
  }));

  const { domain: yDomain, ticks: yTicks } = getVitalYAxis(
    chartData.map((point) => point.heartRate),
    [60],
  );

  return (
    <div className="flex shrink-0 flex-col gap-8 border-t border-border pt-4">
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <HugeiconsIcon
              icon={Cardiogram02Icon}
              size={ICON_SIZE}
              strokeWidth={ICON_STROKE}
              color={HEART_RATE_COLOR}
            absoluteStrokeWidth />
            <span className={cn(typo.label, "text-muted-foreground")}>{data.label}</span>
          </div>
          <p className={cn(typo.bodyS, "shrink-0")}>{updatedAgo}</p>
        </div>

        <div className="flex w-full flex-wrap items-baseline justify-between gap-x-4 gap-y-1.5">
          <p className="flex items-baseline gap-1.5">
            <span
              className={cn(typo.headingXxl, "leading-none tabular-nums")}
              style={{ color: HEART_RATE_COLOR }}
            >
              {data.bpm}
            </span>
            <span className={cn(typo.caption, "text-muted-foreground")}>{data.unit}</span>
          </p>
          <div className="ml-auto flex items-center gap-4">
            <span className="flex items-center gap-2">
              <span
                className={chartLegendSwatchClass}
                style={{ backgroundColor: HEART_RATE_COLOR }}
              />
              <span className={cn(typo.bodyM, "font-medium text-foreground")}>
                Heart Rate
              </span>
            </span>
          </div>
        </div>
      </div>

      <ChartContainer
        config={hrChartConfig}
        className="aspect-auto h-52 w-full"
        initialDimension={{ width: 420, height: 208 }}
      >
        <LineChart
          accessibilityLayer
          data={chartData}
          margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
        >
          <CartesianGrid
            vertical={false}
            stroke={GRID_STROKE}
            strokeDasharray="3 4"
          />
          <XAxis
            dataKey="label"
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            padding={{ left: 24, right: 24 }}
            tick={AXIS_TICK}
          />
          <YAxis
            domain={yDomain}
            ticks={yTicks}
            tickLine={false}
            axisLine={false}
            width={36}
            tickMargin={8}
            textAnchor="end"
            tick={AXIS_TICK}
          />
          <ChartTooltip cursor={tooltipCursor} content={<HeartRateTooltip />} />
          <Line
            dataKey="heartRate"
            type="monotone"
            stroke="var(--color-heartRate)"
            strokeWidth={2}
            dot={false}
            activeDot={heartRateActiveDot}
            isAnimationActive={isAnimationActive}
            onAnimationEnd={onAnimationEnd}
          />
        </LineChart>
      </ChartContainer>
    </div>
  );
}

export function VitalsCard({ vitals }: { vitals: VitalsSnapshot | null }) {
  return (
    <section className={cn(dashboardCardClass, "flex h-full min-h-0 w-full flex-col p-5")}>
      <div className={dashboardCardHeaderClass}>
        <SectionTitle info="Your most recent blood pressure, heart rate, and related readings. Trends update as new values are logged.">
          Latest Vitals
        </SectionTitle>
        <ViewAllLink href="/health/vitals" />
      </div>

      {vitals ? (
        <div className="flex min-h-0 flex-1 flex-col gap-4">
          <BloodPressureChart data={vitals.bloodPressure} />
          <HeartRateChart
            data={vitals.heartRate}
            updatedAgo={vitals.bloodPressure.updatedAgo}
            statusLabel={vitals.bloodPressure.statusLabel}
          />
        </div>
      ) : (
        <EmptyState
          icon={Medicine02Icon}
          title="No vitals recorded yet"
          body="Record your first vitals reading to start tracking BP, pulse, SpO2, temperature, and more over time."
          className="min-h-80"
        />
      )}
    </section>
  );
}
