"use client";

import {
  BloodPressureIcon,
  Cardiogram02Icon,
  LabsIcon,
  LungsIcon,
  TemperatureIcon,
} from "@hugeicons/core-free-icons";
import type { IconSvgElement } from "@hugeicons/react";
import {
  createElement,
  useCallback,
  useRef,
  useState,
  type Dispatch,
  type KeyboardEvent,
  type PointerEvent,
  type SetStateAction,
} from "react";
import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  vitalsCardMetricsRowClass,
  vitalsCardMetricsStatusClass,
  vitalsCardMetricsValueClass,
  vitalsCardSurfaceClass,
  vitalsCardValueTextClass,
  vitalsSparklineActiveDotClass,
  vitalsSummaryGridClass,
} from "@/features/vitals/vitals-summary-styles";

const CARD_LIFT_TRANSITION = {
  duration: 0.12,
  ease: [0.25, 0.1, 0.25, 1] as const,
};

const HOVER_LIFT_VARIANTS = {
  rest: { y: 0 },
  hover: { y: -2 },
};

const SPARKLINE_WIDTH = 100;
const SPARKLINE_HEIGHT = 36;

type VitalStatus = "Normal" | "Low" | "Elevated";

type IconGradient = {
  from: string;
  to: string;
  glowFrom: string;
  glowTo: string;
};

interface VitalCardData {
  id: string;
  icon: IconSvgElement;
  label: string;
  value: string;
  unit: string;
  status: VitalStatus;
  updatedAgo: string;
  sparkline: number[];
  chartStart: string;
  chartEnd: string;
  iconGradient: IconGradient;
}

const statusConfig: Record<
  VitalStatus,
  { badgeBg: string; badgeText: string; dot: string }
> = {
  Normal: {
    badgeBg: "bg-success-muted",
    badgeText: "text-success",
    dot: "bg-success",
  },
  Low: {
    badgeBg: "bg-warning-muted",
    badgeText: "text-warning",
    dot: "bg-warning",
  },
  Elevated: {
    badgeBg: "bg-destructive-muted",
    badgeText: "text-destructive",
    dot: "bg-destructive",
  },
};

const VITALS: VitalCardData[] = [
  {
    id: "bp",
    icon: BloodPressureIcon,
    label: "Blood Pressure",
    value: "120/80",
    unit: "mmHg",
    status: "Normal",
    updatedAgo: "3 hours ago",
    chartStart: "00.00",
    chartEnd: "24.00",
    sparkline: [115, 117, 118, 119, 120, 121, 122],
    iconGradient: {
      from: "#DC2626",
      to: "#F43F5E",
      glowFrom: "#FCA5A5",
      glowTo: "#FDA4AF",
    },
  },
  {
    id: "hr",
    icon: Cardiogram02Icon,
    label: "Heart Rate",
    value: "57",
    unit: "bpm",
    status: "Low",
    updatedAgo: "2 hours ago",
    chartStart: "00.00",
    chartEnd: "24.00",
    sparkline: [62, 60, 58, 57, 55, 54, 57],
    iconGradient: {
      from: "#4338CA",
      to: "#6366F1",
      glowFrom: "#A5B4FC",
      glowTo: "#C7D2FE",
    },
  },
  {
    id: "spo2",
    icon: LungsIcon,
    label: "SpO₂",
    value: "98",
    unit: "%",
    status: "Normal",
    updatedAgo: "1 hour ago",
    chartStart: "00.00",
    chartEnd: "24.00",
    sparkline: [97, 98, 98, 98, 99, 98, 98],
    iconGradient: {
      from: "#059669",
      to: "#14B8A6",
      glowFrom: "#6EE7B7",
      glowTo: "#5EEAD4",
    },
  },
  {
    id: "glucose",
    icon: LabsIcon,
    label: "Blood Glucose",
    value: "102",
    unit: "mg/dL",
    status: "Elevated",
    updatedAgo: "4 hours ago",
    chartStart: "Mon",
    chartEnd: "Sun",
    sparkline: [96, 98, 112, 130, 102, 100, 98],
    iconGradient: {
      from: "#0284C7",
      to: "#06B6D4",
      glowFrom: "#7DD3FC",
      glowTo: "#67E8F9",
    },
  },
  {
    id: "temp",
    icon: TemperatureIcon,
    label: "Temperature",
    value: "36.8",
    unit: "°C",
    status: "Normal",
    updatedAgo: "5 hours ago",
    chartStart: "00.00",
    chartEnd: "24.00",
    sparkline: [36.6, 36.7, 36.8, 36.8, 36.7, 36.9, 36.8],
    iconGradient: {
      from: "#EA580C",
      to: "#F59E0B",
      glowFrom: "#FDBA74",
      glowTo: "#FDE68A",
    },
  },
];

function buildSparklinePoints(data: number[], width: number, height: number) {
  const padY = height * 0.14;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  return data.map((value, index) => ({
    x: (index / Math.max(data.length - 1, 1)) * width,
    y: padY + (height - padY * 2) * (1 - (value - min) / range),
  }));
}

function buildSmoothPath(points: Array<{ x: number; y: number }>) {
  if (points.length === 0) return "";
  if (points.length === 1) return `M ${points[0].x} ${points[0].y}`;

  let path = `M ${points[0].x} ${points[0].y}`;
  for (let index = 0; index < points.length - 1; index += 1) {
    const current = points[index];
    const next = points[index + 1];
    const midX = (current.x + next.x) / 2;
    path += ` C ${midX} ${current.y}, ${midX} ${next.y}, ${next.x} ${next.y}`;
  }
  return path;
}

function getSparklineTimeLabels(
  start: string,
  end: string,
  count: number,
): string[] {
  if (count <= 1) return [start];

  if (start === "00.00" && end === "24.00") {
    return Array.from({ length: count }, (_, index) => {
      const hour = Math.round((index / (count - 1)) * 24);
      return `${String(hour).padStart(2, "0")}.00`;
    });
  }

  if (start === "Mon" && end === "Sun") {
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    return Array.from({ length: count }, (_, index) => {
      const dayIndex = Math.round((index / (count - 1)) * (days.length - 1));
      return days[dayIndex] ?? start;
    });
  }

  return Array.from({ length: count }, (_, index) => {
    if (index === 0) return start;
    if (index === count - 1) return end;
    return `${index + 1}`;
  });
}

function formatSparklineValue(value: number) {
  return Number.isInteger(value) ? String(value) : value.toFixed(1);
}

function handleSparklineKeyDown(
  event: KeyboardEvent<HTMLElement>,
  pointCount: number,
  setChartIndex: Dispatch<SetStateAction<number | null>>,
) {
  switch (event.key) {
    case "ArrowLeft":
    case "ArrowDown":
      event.preventDefault();
      setChartIndex((current) => {
        const base = current ?? 0;
        return Math.max(0, base - 1);
      });
      break;
    case "ArrowRight":
    case "ArrowUp":
      event.preventDefault();
      setChartIndex((current) => {
        const base = current ?? 0;
        return Math.min(pointCount - 1, base + 1);
      });
      break;
    case "Home":
      event.preventDefault();
      setChartIndex(0);
      break;
    case "End":
      event.preventDefault();
      setChartIndex(pointCount - 1);
      break;
    case "Escape":
      event.preventDefault();
      setChartIndex(null);
      break;
  }
}

function VitalGradientIcon({
  id,
  icon,
  gradient,
  size = 18,
}: {
  id: string;
  icon: IconSvgElement;
  gradient: Pick<IconGradient, "from" | "to">;
  size?: number;
}) {
  const gradientId = `vital-icon-stroke-${id}`;
  const strokeWidth = (1.5 * 24) / Number(size);
  const paint = `url(#${gradientId})`;

  const paths = [...icon]
    .sort(([, a], [, b]) => {
      const hasOpacityA = a.opacity !== undefined;
      const hasOpacityB = b.opacity !== undefined;
      return hasOpacityB ? 1 : hasOpacityA ? -1 : 0;
    })
    .map(([tag, attrs], index) =>
      createElement(tag, {
        ...attrs,
        key: attrs.key ?? String(index),
        ...(attrs.stroke !== undefined
          ? { stroke: paint, strokeWidth }
          : {}),
        ...(attrs.fill !== undefined && attrs.fill !== "none"
          ? { fill: paint }
          : {}),
      }),
    );

  return createElement(
    "svg",
    {
      xmlns: "http://www.w3.org/2000/svg",
      width: size,
      height: size,
      viewBox: "0 0 24 24",
      fill: "none",
      "aria-hidden": true,
    },
    createElement(
      "defs",
      null,
      createElement(
        "linearGradient",
        {
          id: gradientId,
          x1: "0%",
          y1: "0%",
          x2: "100%",
          y2: "100%",
        },
        [
          createElement("stop", {
            offset: "0%",
            stopColor: gradient.from,
            key: "from",
          }),
          createElement("stop", {
            offset: "100%",
            stopColor: gradient.to,
            key: "to",
          }),
        ],
      ),
    ),
    ...paths,
  );
}

function VitalIconGlow({
  id,
  icon,
  gradient,
}: {
  id: string;
  icon: IconSvgElement;
  gradient: IconGradient;
}) {
  return (
    <div className="relative flex size-12 shrink-0 items-center justify-center">
      <div
        aria-hidden
        className="absolute -inset-0.5 rounded-full blur-[6px] opacity-[0.16] transition-opacity duration-150 group-hover:opacity-[0.22]"
        style={{
          background: `linear-gradient(135deg, ${gradient.glowFrom}, ${gradient.glowTo})`,
        }}
      />
      <div className="relative flex size-11 items-center justify-center rounded-full border border-border/50 bg-card transition-shadow duration-150 ease-out group-hover:shadow-[0_2px_10px_rgba(17,24,39,0.06)]">
        <VitalGradientIcon id={id} icon={icon} gradient={gradient} />
      </div>
    </div>
  );
}

function VitalSparkline({
  id,
  data,
  gradient,
  unit,
  chartStart,
  chartEnd,
  activeIndex,
  onActiveIndexChange,
  className,
}: {
  id: string;
  data: number[];
  gradient: Pick<IconGradient, "from" | "to">;
  unit: string;
  chartStart: string;
  chartEnd: string;
  activeIndex: number | null;
  onActiveIndexChange: (index: number | null) => void;
  className?: string;
}) {
  const fillGradientId = `vital-sparkline-fill-${id}`;
  const strokeGradientId = `vital-sparkline-stroke-${id}`;
  const points = buildSparklinePoints(data, SPARKLINE_WIDTH, SPARKLINE_HEIGHT);
  const linePath = buildSmoothPath(points);
  const areaPath = `${linePath} L ${SPARKLINE_WIDTH} ${SPARKLINE_HEIGHT} L 0 ${SPARKLINE_HEIGHT} Z`;
  const timeLabels = getSparklineTimeLabels(chartStart, chartEnd, data.length);
  const svgRef = useRef<SVGSVGElement>(null);

  const resolveIndex = useCallback(
    (clientX: number) => {
      const svg = svgRef.current;
      if (!svg || data.length === 0) return null;

      const rect = svg.getBoundingClientRect();
      if (rect.width === 0) return null;

      const ratio = Math.max(
        0,
        Math.min(1, (clientX - rect.left) / rect.width),
      );
      return Math.round(ratio * (data.length - 1));
    },
    [data.length],
  );

  const handlePointerMove = (event: PointerEvent<SVGSVGElement>) => {
    onActiveIndexChange(resolveIndex(event.clientX));
  };

  const handlePointerLeave = () => {
    onActiveIndexChange(null);
  };

  const activePoint =
    activeIndex !== null ? (points[activeIndex] ?? null) : null;
  const activeValue = activeIndex !== null ? data[activeIndex] : null;
  const activeTime = activeIndex !== null ? timeLabels[activeIndex] : null;
  const showTooltip =
    activeIndex !== null && activePoint !== null && activeValue !== null && activeTime !== null;

  return (
    <div className={cn("relative touch-none", className)}>
      {showTooltip && (
        <>
          <div
            role="tooltip"
            className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-full whitespace-nowrap rounded-md border border-border/80 bg-card px-2 py-1 text-[10px] font-medium leading-4 text-foreground shadow-[0_2px_8px_rgba(17,24,39,0.08)]"
            style={{
              left: `${(activePoint.x / SPARKLINE_WIDTH) * 100}%`,
              top: -6,
            }}
          >
            <span className="text-tertiary-foreground">{activeTime}</span>
            <span className="mx-1 text-border">·</span>
            <span className="tabular-nums">
              {formatSparklineValue(activeValue)} {unit}
            </span>
          </div>
          <p className="sr-only" aria-live="polite">
            {activeTime}, {formatSparklineValue(activeValue)} {unit}
          </p>
        </>
      )}

      <svg
        ref={svgRef}
        viewBox={`0 0 ${SPARKLINE_WIDTH} ${SPARKLINE_HEIGHT}`}
        className="h-9 w-full shrink-0"
        preserveAspectRatio="none"
        aria-hidden
        onPointerMove={handlePointerMove}
        onPointerDown={handlePointerMove}
        onPointerLeave={handlePointerLeave}
      >
        <defs>
          <linearGradient id={fillGradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={gradient.from} stopOpacity={0.26} />
            <stop offset="65%" stopColor={gradient.to} stopOpacity={0.1} />
            <stop offset="100%" stopColor={gradient.to} stopOpacity={0.02} />
          </linearGradient>
          <linearGradient id={strokeGradientId} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor={gradient.from} />
            <stop offset="100%" stopColor={gradient.to} />
          </linearGradient>
        </defs>
        <path d={areaPath} fill={`url(#${fillGradientId})`} />
        <path
          d={linePath}
          fill="none"
          stroke={`url(#${strokeGradientId})`}
          strokeWidth={1.75}
          strokeLinecap="round"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
        />
        {activePoint !== null && (
          <line
            x1={activePoint.x}
            y1={0}
            x2={activePoint.x}
            y2={SPARKLINE_HEIGHT}
            stroke="var(--border)"
            strokeWidth={0.75}
            strokeDasharray="2 2"
            vectorEffect="non-scaling-stroke"
          />
        )}
        <rect
          x={0}
          y={0}
          width={SPARKLINE_WIDTH}
          height={SPARKLINE_HEIGHT}
          fill="transparent"
          pointerEvents="all"
        />
      </svg>

      {activePoint !== null && (
        <div
          aria-hidden
          className={vitalsSparklineActiveDotClass}
          style={{
            left: `${(activePoint.x / SPARKLINE_WIDTH) * 100}%`,
            top: `${(activePoint.y / SPARKLINE_HEIGHT) * 100}%`,
            transform: "translate(-50%, -50%)",
            backgroundColor: gradient.from,
          }}
        />
      )}
    </div>
  );
}

function VitalCard({ vital }: { vital: VitalCardData }) {
  const reduceMotion = useReducedMotion();
  const status = statusConfig[vital.status];
  const [chartIndex, setChartIndex] = useState<number | null>(null);

  return (
    <motion.article
      initial="rest"
      whileHover={reduceMotion ? undefined : "hover"}
      variants={HOVER_LIFT_VARIANTS}
      transition={CARD_LIFT_TRANSITION}
      tabIndex={0}
      aria-label={`${vital.label}: ${vital.value} ${vital.unit}, ${vital.status}. Arrow keys explore trend.`}
      onKeyDown={(event) =>
        handleSparklineKeyDown(event, vital.sparkline.length, setChartIndex)
      }
      onMouseLeave={() => setChartIndex(null)}
      className={vitalsCardSurfaceClass}
    >
      <div className="flex min-h-12 items-start justify-between gap-3">
        <p className="min-w-0 flex-1 truncate pr-1 pt-1.5 text-sm font-medium leading-5 text-muted-foreground transition-colors duration-200 group-hover:text-foreground">
          {vital.label}
        </p>
        <VitalIconGlow
          id={vital.id}
          icon={vital.icon}
          gradient={vital.iconGradient}
        />
      </div>

      <div className={vitalsCardMetricsRowClass}>
        <div className={vitalsCardMetricsValueClass}>
          <span className={vitalsCardValueTextClass}>{vital.value}</span>
          <span className="shrink-0 text-[13px] font-medium leading-none text-muted-foreground">
            {vital.unit}
          </span>
        </div>
        <div className={vitalsCardMetricsStatusClass}>
          <span
            className={cn(
              "inline-flex max-w-full items-center gap-1.5 rounded-full px-2.5 py-1",
              status.badgeBg,
            )}
          >
            <span
              className={cn("size-1.5 shrink-0 rounded-full", status.dot)}
              aria-hidden
            />
            <span
              className={cn(
                "truncate text-xs font-semibold leading-4",
                status.badgeText,
              )}
            >
              {vital.status}
            </span>
          </span>
        </div>
      </div>

      <p className="mt-1.5 text-[11px] font-normal leading-4 text-tertiary-foreground">
        {vital.updatedAgo}
      </p>

      <div className="mt-auto flex flex-col gap-1 pt-5">
        <VitalSparkline
          id={vital.id}
          data={vital.sparkline}
          gradient={vital.iconGradient}
          unit={vital.unit}
          chartStart={vital.chartStart}
          chartEnd={vital.chartEnd}
          activeIndex={chartIndex}
          onActiveIndexChange={setChartIndex}
          className="opacity-90 transition-opacity duration-200 group-hover:opacity-100"
        />
        <div className="flex w-full items-center justify-between text-[10px] font-normal leading-4 text-tertiary-foreground/80">
          <span>{vital.chartStart}</span>
          <span>{vital.chartEnd}</span>
        </div>
      </div>
    </motion.article>
  );
}

export function VitalsSummaryCards() {
  return (
    <section aria-label="Latest vitals summary">
      <div className={vitalsSummaryGridClass}>
        {VITALS.map((vital) => (
          <VitalCard key={vital.id} vital={vital} />
        ))}
      </div>
    </section>
  );
}
