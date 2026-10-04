"use client";

/**
 * Renders the vitals summary grid — one interactive sparkline card per vital.
 *
 * Status badge colours (Normal / Low / Elevated / Critical) are driven by
 * `vitalStatusConfig` in `lib/tokens/status-badges.ts`, which maps each
 * string status to its badge/dot/icon token classes.
 *
 * All data comes from `VITALS_SUMMARY` in `vitals-summary-data.ts`.
 * When the API is connected, replace that mock with a real data hook.
 */

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
import { statusBadgeClass } from "@/features/dashboard/data/dashboard-styles";
import {
  VITALS_SUMMARY,
  type VitalCardData,
} from "@/features/vitals/data/vitals-summary-data";
import {
  vitalsCardMetricsRowClass,
  vitalsCardMetricsStatusClass,
  vitalsCardMetricsValueClass,
  vitalsCardSurfaceClass,
  vitalsCardSurfaceHoverOverlayClass,
  vitalsCardValueTextClass,
  vitalsSparklineActiveDotClass,
  vitalsSummaryGridClass,
} from "@/features/vitals/vitals-summary-styles";
import { ICON_SIZE } from "@/lib/icons";
import type { VitalIconGradient } from "@/lib/tokens/colors";
import { vitalStatusConfig } from "@/lib/tokens/status-badges";
import { typo } from "@/lib/tokens/typography";
import { cn } from "@/lib/utils";

const SPARKLINE_WIDTH = 100;
const SPARKLINE_HEIGHT = 36;

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
  size = ICON_SIZE,
}: {
  id: string;
  icon: IconSvgElement;
  gradient: Pick<VitalIconGradient, "from" | "to">;
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
  gradient: VitalIconGradient;
}) {
  return (
    <div
      className={cn(
        "relative flex size-12 shrink-0 items-center justify-center",
        "motion-safe:transition-transform motion-safe:duration-220 motion-safe:ease-[cubic-bezier(0.22,1,0.36,1)]",
        "motion-safe:group-hover:scale-[1.04]",
      )}
    >
      <div
        aria-hidden
        className="absolute -inset-0.5 rounded-full blur-[6px] opacity-[0.16]"
        style={{
          background: `linear-gradient(135deg, ${gradient.glowFrom}, ${gradient.glowTo})`,
        }}
      />
      <div className="relative flex size-11 items-center justify-center rounded-full border border-border/50 bg-card">
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
  gradient: Pick<VitalIconGradient, "from" | "to">;
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
    activeIndex !== null &&
    activePoint !== null &&
    activeValue !== null &&
    activeTime !== null;
  const tooltipAnchorPct =
    activePoint !== null ? (activePoint.x / SPARKLINE_WIDTH) * 100 : 0;

  return (
    <div className={cn("touch-none", className)}>
      {/* Reserved lane keeps the tooltip fully inside the KPI card. */}
      <div className="relative mb-1 h-5 w-full">
        {showTooltip && (
          <>
            <div
              role="tooltip"
              className={cn(
                "pointer-events-none absolute top-0 z-10 max-w-full truncate whitespace-nowrap rounded-md border border-border/80 bg-card px-2 py-0.5 shadow-[0_2px_8px_rgba(17,24,39,0.08)]",
                typo.caption,
                "font-medium text-foreground",
              )}
              style={{
                left: `${tooltipAnchorPct}%`,
                // Edge-aware: 0% → flush left, 50% → centered, 100% → flush right.
                transform: `translateX(-${tooltipAnchorPct}%)`,
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
      </div>

      <div className="relative">
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
    </div>
  );
}

function VitalCard({ vital }: { vital: VitalCardData }) {
  const status = vitalStatusConfig(vital.status);
  const [chartIndex, setChartIndex] = useState<number | null>(null);

  return (
    <article
      tabIndex={0}
      aria-label={`${vital.label}: ${vital.value} ${vital.unit}, ${vital.status}. Arrow keys explore trend.`}
      onKeyDown={(event) =>
        handleSparklineKeyDown(event, vital.sparkline.length, setChartIndex)
      }
      onMouseLeave={() => setChartIndex(null)}
      className={vitalsCardSurfaceClass}
    >
      <span aria-hidden className={vitalsCardSurfaceHoverOverlayClass} />
      <div className="relative z-1 flex min-h-0 w-full flex-1 flex-col">
        <div className="flex min-h-12 items-start justify-between gap-3">
          <p
            className={cn(
              typo.sidebarItem,
              "min-w-0 flex-1 truncate pr-1 pt-1.5 transition-colors duration-200 group-hover:text-foreground",
            )}
          >
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
            <span className={cn(typo.label, "shrink-0 leading-none")}>
              {vital.unit}
            </span>
          </div>
          <div className={vitalsCardMetricsStatusClass}>
            <span
              className={cn(
                statusBadgeClass,
                "max-w-full gap-1.5 font-semibold",
                status.badgeBg,
                status.badgeText,
              )}
            >
              <span
                className={cn("size-1.5 shrink-0 rounded-full", status.dot)}
                aria-hidden
              />
              <span className="truncate">{vital.status}</span>
            </span>
          </div>
        </div>

        <p className={cn(typo.caption, "mt-1.5")}>{vital.updatedAgo}</p>

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
          <div
            className={cn(
              typo.caption,
              "flex w-full items-center justify-between text-tertiary-foreground/80",
            )}
          >
            <span>{vital.chartStart}</span>
            <span>{vital.chartEnd}</span>
          </div>
        </div>
      </div>
    </article>
  );
}

export function VitalsSummaryCards() {
  return (
    <section aria-label="Latest vitals summary">
      <div className={vitalsSummaryGridClass}>
        {VITALS_SUMMARY.map((vital) => (
          <VitalCard key={vital.id} vital={vital} />
        ))}
      </div>
    </section>
  );
}
