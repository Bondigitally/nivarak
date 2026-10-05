"use client";

import { Alert02Icon } from "@hugeicons/core-free-icons";
import {
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
} from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipPanel,
  ChartTooltipRow,
  type ChartConfig,
} from "@/components/ui/chart";
import { useOnceAnimation } from "@/components/ui/use-once-animation";
import { cn } from "@/lib/utils";
import { dashboardCardClass, dashboardCardHeaderClass } from "../data/dashboard-styles";
import { EmptyState, SectionTitle } from "./EmptyState";
import type { RiskAxis, RiskStatus } from "../data/home-data";
import { cssVar } from "@/lib/tokens/colors";

const RADAR_FILL = "#9DD5CD";

const chartConfig = {
  score: {
    label: "Score",
    color: RADAR_FILL,
  },
} satisfies ChartConfig;

const RISK_COLOR: Record<RiskAxis["risk"], string> = {
  Low: "var(--success)",
  Moderate: "var(--warning)",
  High: "var(--destructive)",
};

const RISK_TEXT_CLASS: Record<RiskAxis["risk"], string> = {
  Low: "text-success",
  Moderate: "text-warning",
  High: "text-destructive",
};

type RiskChartPoint = {
  axis: string;
  score: number;
  risk: RiskAxis["risk"];
};

type RadarPoint = { x: number; y: number };

/** Soften radar polygon corners */
function roundedPolygonPath(points: RadarPoint[], cornerRadius: number) {
  const n = points.length;
  if (n < 3) return "";

  let d = "";
  for (let i = 0; i < n; i++) {
    const prev = points[(i - 1 + n) % n]!;
    const curr = points[i]!;
    const next = points[(i + 1) % n]!;

    const inX = curr.x - prev.x;
    const inY = curr.y - prev.y;
    const outX = next.x - curr.x;
    const outY = next.y - curr.y;
    const inLen = Math.hypot(inX, inY) || 1;
    const outLen = Math.hypot(outX, outY) || 1;
    const r = Math.min(cornerRadius, inLen / 2, outLen / 2);

    const startX = curr.x - (inX / inLen) * r;
    const startY = curr.y - (inY / inLen) * r;
    const endX = curr.x + (outX / outLen) * r;
    const endY = curr.y + (outY / outLen) * r;

    if (i === 0) d += `M${startX} ${startY}`;
    else d += `L${startX} ${startY}`;
    d += `Q${curr.x} ${curr.y} ${endX} ${endY}`;
  }

  return `${d}Z`;
}

function RoundedRadarShape({
  points,
  fill,
  fillOpacity,
  stroke,
  strokeWidth,
  strokeOpacity,
  className,
}: {
  points?: ReadonlyArray<RadarPoint>;
  fill?: string;
  fillOpacity?: number;
  stroke?: string;
  strokeWidth?: number;
  strokeOpacity?: number;
  className?: string;
}) {
  if (!points || points.length < 3) {
    return <path d="" />;
  }

  return (
    <path
      d={roundedPolygonPath([...points], 6)}
      fill={fill}
      fillOpacity={fillOpacity}
      stroke={stroke}
      strokeWidth={strokeWidth}
      strokeOpacity={strokeOpacity}
      className={className}
      strokeLinejoin="round"
      strokeLinecap="round"
    />
  );
}

/** Labels outside the ring; textAnchor by side so long names aren't clipped */
function RadarAxisTick({
  x,
  y,
  cx,
  cy,
  payload,
}: {
  x?: number;
  y?: number;
  cx?: number;
  cy?: number;
  payload?: { value?: string };
}) {
  if (x == null || y == null || cx == null || cy == null) return null;

  const dx = x - cx;
  const dy = y - cy;
  const len = Math.hypot(dx, dy) || 1;
  const pad = 12;
  const tx = x + (dx / len) * pad;
  const ty = y + (dy / len) * pad;

  let textAnchor: "start" | "middle" | "end" = "middle";
  if (dx > 12) textAnchor = "start";
  else if (dx < -12) textAnchor = "end";

  return (
    <text
      x={tx}
      y={ty}
      textAnchor={textAnchor}
      dominantBaseline="central"
      fill="var(--foreground)"
      fontSize={12}
      fontWeight={500}
      focusable={false}
    >
      {payload?.value}
    </text>
  );
}

function RiskChartTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: ReadonlyArray<{ payload?: RiskChartPoint }>;
}) {
  if (!active || !payload?.length) return null;

  const point = payload[0]?.payload;
  if (!point) return null;

  return (
    <ChartTooltipPanel title={point.axis}>
      <ChartTooltipRow
        label="Score"
        value={`${point.score}%`}
        color={cssVar.primary}
      />
      <ChartTooltipRow
        label="Risk"
        value={point.risk}
        color={RISK_COLOR[point.risk]}
        valueClassName={RISK_TEXT_CLASS[point.risk]}
      />
    </ChartTooltipPanel>
  );
}

function RiskRadarChart({ risk }: { risk: RiskStatus }) {
  const { isAnimationActive, onAnimationEnd } = useOnceAnimation(
    "dashboard-risk-radar",
  );
  const chartData: RiskChartPoint[] = risk.axes.map((axis) => ({
    axis: axis.label,
    score: axis.scorePct,
    risk: axis.risk,
  }));

  return (
    <div className="mx-auto flex w-full max-w-64 shrink-0 items-center justify-center overflow-visible sm:max-w-72 lg:max-w-80">
      <ChartContainer
        config={chartConfig}
        className={cn(
          "aspect-square w-full overflow-visible [&_.recharts-surface]:overflow-visible [&_svg]:overflow-visible",
          "[&_.recharts-polar-grid-concentric-circle]:stroke-[#D4DAF0]! [&_.recharts-polar-grid-concentric-circle]:stroke-[0.8]! [&_.recharts-polar-grid-concentric-circle]:opacity-70",
          "dark:[&_.recharts-polar-grid-concentric-circle]:stroke-[#5A5470]! dark:[&_.recharts-polar-grid-concentric-circle]:opacity-80",
        )}
        initialDimension={{ width: 280, height: 280 }}
      >
        <RadarChart
          data={chartData}
          cx="50%"
          cy="50%"
          outerRadius="86%"
          margin={{ top: 8, right: 8, bottom: 8, left: 8 }}
        >
          <ChartTooltip cursor={false} content={<RiskChartTooltip />} />
          <PolarGrid
            gridType="circle"
            radialLines={false}
            className="fill-[#A8C4F5]/22 dark:fill-[#3A3550]/20"
          />
          <PolarAngleAxis
            dataKey="axis"
            tick={<RadarAxisTick />}
            tickLine={false}
          />
          <PolarRadiusAxis
            domain={[0, 100]}
            tickCount={6}
            tick={false}
            axisLine={false}
          />
          <Radar
            dataKey="score"
            fill={RADAR_FILL}
            fillOpacity={0.55}
            stroke="none"
            shape={RoundedRadarShape}
            dot={false}
            activeDot={{
              r: 4,
              fill: RADAR_FILL,
              stroke: "none",
            }}
            isAnimationActive={isAnimationActive}
            onAnimationEnd={onAnimationEnd}
          />
        </RadarChart>
      </ChartContainer>
    </div>
  );
}

export function RiskStatusCard({ risk }: { risk: RiskStatus | null }) {
  return (
    <section
      className={cn(
        dashboardCardClass,
        "flex min-h-0 flex-1 flex-col overflow-visible p-5",
      )}
    >
      <div className={dashboardCardHeaderClass}>
        <SectionTitle info="A summary of health risk across key areas based on your latest vitals and assessments.">
          Risk Status
        </SectionTitle>
      </div>
      {risk ? (
        <div className="flex min-h-0 flex-1 flex-col items-center justify-center">
          <RiskRadarChart risk={risk} />
        </div>
      ) : (
        <EmptyState
          icon={Alert02Icon}
          title="No risk data available"
          body="Once vitals and health metrics are recorded, your risk assessment summary will appear here."
          className="min-h-40"
        />
      )}
    </section>
  );
}
