"use client";

/**
 * Doctor patient overview — vital KPI card carousel (BP / HR / SpO₂ / Glucose / Temp).
 * Layout mirrors the Figma vital KPI card; styling uses shared design-system tokens.
 */

import { useCallback, useEffect, useRef, useState, createElement } from "react";
import type { PointerEvent } from "react";
import {
  ArrowDown02Icon,
  ArrowLeft02Icon,
  ArrowRight02Icon,
  ArrowUp02Icon,
  MinusSignIcon,
} from "@hugeicons/core-free-icons";
import type { IconSvgElement } from "@hugeicons/react";
import { HugeiconsIcon } from "@hugeicons/react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { AppIcon } from "@/components/shared/AppIcon";
import { SectionInfoButton } from "@/features/dashboard/components/EmptyState";
import {
  cardTitleClass,
  dashboardCardClass,
} from "@/features/dashboard/data/dashboard-styles";
import {
  VITALS_SUMMARY,
  type VitalChangeDirection,
} from "@/features/vitals/data/vitals-summary-data";
import {
  vitalsCardFooterClass,
  vitalsCardStatCellClass,
  vitalsCardStatDividerClass,
  vitalsCardUnitTextClass,
  vitalsSparklineActiveDotClass,
  vitalsSparklineDotFieldClass,
  vitalsSparklineEndpointDotClass,
} from "@/features/vitals/vitals-summary-styles";
import { BADGE_ICON_SIZE, ICON_SIZE, ICON_STROKE } from "@/lib/icons";
import type { VitalIconGradient } from "@/lib/tokens/colors";
import { radius } from "@/lib/tokens/radius";
import { vitalStatusConfig } from "@/lib/tokens/status-badges";
import { typo } from "@/lib/tokens/typography";
import { cn } from "@/lib/utils";

const W = 400;
const H = 140;
/** Clearance so endpoint / hover markers stay fully inside the plot. */
const PAD_X = 10;
/** Tooltip copy for each vital KPI — compact chrome ⓘ next to the title. */
const VITAL_INFO: Record<string, string> = {
  bp: "Latest blood pressure reading with status, day-over-day change, and short trend.",
  hr: "Latest heart rate reading with status, day-over-day change, and short trend.",
  spo2: "Latest blood oxygen (SpO₂) reading with status, day-over-day change, and short trend.",
  glucose: "Latest blood glucose reading with status, day-over-day change, and short trend.",
  temp: "Latest body temperature reading with status, day-over-day change, and short trend.",
};

/** Reserved band above the plot so tooltips never sit on the marker. */
const TOOLTIP_BAND_CLASS = "h-7";

const SLIDE_EASE = [0.22, 1, 0.36, 1] as const;
const SPARKLINE_DRAW_DURATION = 0.75;

const slideVariants = {
  enter: (direction: number) => ({
    x: direction >= 0 ? 28 : -28,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction >= 0 ? -28 : 28,
    opacity: 0,
  }),
};

function buildPoints(data: number[]) {
  const padY = H * 0.1;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  return data.map((value, index) => ({
    x: PAD_X + (index / Math.max(data.length - 1, 1)) * (W - PAD_X * 2),
    y: padY + (H - padY * 2) * (1 - (value - min) / range),
  }));
}

function buildSmoothPath(points: Array<{ x: number; y: number }>) {
  if (points.length === 0) return "";
  let path = `M ${points[0].x} ${points[0].y}`;
  for (let i = 0; i < points.length - 1; i += 1) {
    const cur = points[i];
    const next = points[i + 1];
    const midX = (cur.x + next.x) / 2;
    path += ` C ${midX} ${cur.y}, ${midX} ${next.y}, ${next.x} ${next.y}`;
  }
  return path;
}

/** Area under the curve: follow the line, drop to baseline at last/first x. */
function buildAreaPath(points: Array<{ x: number; y: number }>, linePath: string) {
  if (points.length === 0 || !linePath) return "";
  const first = points[0];
  const last = points[points.length - 1];
  return `${linePath} L ${last.x} ${H} L ${first.x} ${H} Z`;
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
  const gradientId = `overview-vital-icon-${id}`;
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
        ...(attrs.stroke !== undefined ? { stroke: paint, strokeWidth } : {}),
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

function OverviewSparkline({
  id,
  data,
  gradient,
  unit,
  chartStart,
  chartEnd,
}: {
  id: string;
  data: number[];
  gradient: Pick<VitalIconGradient, "from" | "to">;
  unit: string;
  chartStart: string;
  chartEnd: string;
}) {
  const points = buildPoints(data);
  const linePath = buildSmoothPath(points);
  const areaPath = buildAreaPath(points, linePath);
  const end = points[points.length - 1];
  const fillId = `overview-vital-fill-${id}`;
  const strokeId = `overview-vital-stroke-${id}`;
  const revealClipId = `overview-vital-reveal-${id}`;
  const plotClipId = `overview-vital-plot-${id}`;
  const timeLabels = getSparklineTimeLabels(chartStart, chartEnd, data.length);
  const svgRef = useRef<SVGSVGElement>(null);
  const reducedMotion = useReducedMotion();
  const shouldAnimate = !reducedMotion;
  const [endpointVisible, setEndpointVisible] = useState(!shouldAnimate);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  useEffect(() => {
    setEndpointVisible(!shouldAnimate);
    setActiveIndex(null);
  }, [id, shouldAnimate]);

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
    setActiveIndex(resolveIndex(event.clientX));
  };

  const handlePointerLeave = () => {
    setActiveIndex(null);
  };

  const activePoint =
    activeIndex !== null ? (points[activeIndex] ?? null) : null;
  const activeValue = activeIndex !== null ? data[activeIndex] : null;
  const activeTime = activeIndex !== null ? timeLabels[activeIndex] : null;
  const showTooltip =
    activeIndex !== null &&
    activePoint !== null &&
    activeValue !== null &&
    activeTime != null;
  const tooltipAnchorPct =
    activePoint !== null ? (activePoint.x / W) * 100 : 0;
  const markerPoint = activePoint ?? end;
  const plotLeft = PAD_X;
  const plotRight = W - PAD_X;
  const tooltipMotion = reducedMotion
    ? { duration: 0 }
    : { type: "spring" as const, stiffness: 420, damping: 36, mass: 0.4 };

  return (
    <div
      className="relative isolate flex h-35 w-full shrink-0 flex-col overflow-visible sm:w-100"
      onMouseLeave={handlePointerLeave}
    >
      {/* Tooltip band — kept above the plot so it never covers the active point. */}
      <div className={cn("relative z-10 w-full shrink-0", TOOLTIP_BAND_CLASS)}>
        <AnimatePresence>
          {showTooltip ? (
            <motion.div
              key="overview-sparkline-tooltip"
              role="tooltip"
              initial={reducedMotion ? false : { opacity: 0, y: 4 }}
              animate={{
                opacity: 1,
                y: 0,
                left: `${tooltipAnchorPct}%`,
                x: `${-tooltipAnchorPct}%`,
              }}
              exit={reducedMotion ? undefined : { opacity: 0, y: 4 }}
              transition={tooltipMotion}
              className={cn(
                "pointer-events-none absolute bottom-0 max-w-full truncate whitespace-nowrap rounded-md border border-border/80 bg-card px-2 py-0.5 shadow-[0_2px_8px_rgba(17,24,39,0.08)]",
                typo.caption,
                "font-medium text-foreground",
              )}
            >
              <span className="text-tertiary-foreground">{activeTime}</span>
              <span className="mx-1 text-border">·</span>
              <span className="tabular-nums">
                {formatSparklineValue(activeValue!)} {unit}
              </span>
            </motion.div>
          ) : null}
        </AnimatePresence>
        {showTooltip ? (
          <p className="sr-only" aria-live="polite">
            {activeTime}, {formatSparklineValue(activeValue!)} {unit}
          </p>
        ) : null}
      </div>

      {/* Dotted field stays behind the chart; fades at edges; underlay covers it under the line. */}
      <div className="relative min-h-0 w-full flex-1 overflow-visible">
        <div
          aria-hidden
          className={cn(
            vitalsSparklineDotFieldClass,
            "z-0 overflow-hidden opacity-70",
            "[background-size:24px_18px] [background-position:12px_12px]",
            "[background-image:radial-gradient(circle,color-mix(in_srgb,var(--muted-foreground)_40%,transparent)_1.15px,transparent_1.45px)]",
            "[mask-image:radial-gradient(ellipse_72%_68%_at_50%_45%,#000_35%,transparent_78%)]",
            "[-webkit-mask-image:radial-gradient(ellipse_72%_68%_at_50%_45%,#000_35%,transparent_78%)]",
          )}
        />

        <div className="relative z-1 h-full w-full overflow-visible">
          <svg
            ref={svgRef}
            viewBox={`0 0 ${W} ${H}`}
            className="h-full w-full touch-none"
            preserveAspectRatio="none"
            aria-hidden
            onPointerMove={handlePointerMove}
            onPointerDown={handlePointerMove}
            onPointerLeave={handlePointerLeave}
          >
            <defs>
              <linearGradient
                id={fillId}
                x1="0"
                y1="0"
                x2="0"
                y2="1"
                gradientUnits="objectBoundingBox"
              >
                <stop offset="0%" stopColor={gradient.from} stopOpacity={0.36} />
                <stop offset="50%" stopColor={gradient.to} stopOpacity={0.14} />
                <stop offset="100%" stopColor={gradient.to} stopOpacity={0} />
              </linearGradient>
              <linearGradient id={strokeId} x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor={gradient.from} />
                <stop offset="100%" stopColor={gradient.to} />
              </linearGradient>
              <clipPath id={plotClipId}>
                <rect
                  x={plotLeft}
                  y={0}
                  width={plotRight - plotLeft}
                  height={H}
                />
              </clipPath>
              <clipPath id={revealClipId}>
                <motion.rect
                  x={0}
                  y={0}
                  height={H}
                  initial={shouldAnimate ? { width: 0 } : false}
                  animate={{ width: W }}
                  transition={
                    shouldAnimate
                      ? {
                          duration: SPARKLINE_DRAW_DURATION,
                          ease: SLIDE_EASE,
                        }
                      : { duration: 0 }
                  }
                  onAnimationComplete={() => {
                    if (shouldAnimate) setEndpointVisible(true);
                  }}
                />
              </clipPath>
            </defs>
            <g clipPath={`url(#${plotClipId})`}>
              <g clipPath={`url(#${revealClipId})`}>
                {/* Opaque card underlay — hides dots under the curve only */}
                <path d={areaPath} fill="var(--card)" />
                <path d={areaPath} fill={`url(#${fillId})`} />
                <path
                  d={linePath}
                  fill="none"
                  stroke={`url(#${strokeId})`}
                  strokeWidth={2.25}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  vectorEffect="non-scaling-stroke"
                />
              </g>
              {activePoint ? (
                <line
                  x1={activePoint.x}
                  y1={0}
                  x2={activePoint.x}
                  y2={H}
                  stroke="var(--border)"
                  strokeWidth={0.75}
                  strokeDasharray="2 2"
                  vectorEffect="non-scaling-stroke"
                />
              ) : null}
            </g>
            <rect
              x={0}
              y={0}
              width={W}
              height={H}
              fill="transparent"
              pointerEvents="all"
            />
          </svg>
          {markerPoint ? (
            <motion.div
              aria-hidden
              className="pointer-events-none absolute z-1"
              initial={false}
              animate={{
                left: `${(markerPoint.x / W) * 100}%`,
                top: `${(markerPoint.y / H) * 100}%`,
              }}
              transition={tooltipMotion}
              style={{ transform: "translate(-50%, -50%)" }}
            >
              <motion.div
                className={cn(
                  activePoint
                    ? vitalsSparklineActiveDotClass
                    : vitalsSparklineEndpointDotClass,
                  "static size-3.5",
                )}
                initial={shouldAnimate ? { opacity: 0, scale: 0.6 } : false}
                animate={
                  endpointVisible || activePoint
                    ? { opacity: 1, scale: 1 }
                    : { opacity: 0, scale: 0.6 }
                }
                transition={
                  shouldAnimate
                    ? { duration: 0.22, ease: SLIDE_EASE }
                    : { duration: 0 }
                }
                style={{ backgroundColor: gradient.from }}
              />
            </motion.div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function changeTone(direction: VitalChangeDirection) {
  if (direction === "down") return "text-destructive";
  if (direction === "flat") return "text-muted-foreground";
  return "text-success";
}

function ChangeIcon({ direction }: { direction: VitalChangeDirection }) {
  const icon =
    direction === "up"
      ? ArrowUp02Icon
      : direction === "down"
        ? ArrowDown02Icon
        : MinusSignIcon;

  return (
    <HugeiconsIcon
      icon={icon}
      size={BADGE_ICON_SIZE}
      strokeWidth={ICON_STROKE}
      color="currentColor"
      absoluteStrokeWidth
    />
  );
}

/** Inner dot 8px (size-2); ring expands to ~20px — matches hero ping, sized to status pill. */
function StatusPillDot({
  className,
  pulse = true,
}: {
  className?: string;
  pulse?: boolean;
}) {
  return (
    <span
      className="relative flex size-2 shrink-0 items-center justify-center overflow-visible"
      aria-hidden
    >
      {pulse ? (
        <span
          className={cn(
            "kpi-status-dot-ping pointer-events-none absolute inset-0 rounded-full",
            className,
          )}
        />
      ) : null}
      <span className={cn("relative z-10 size-2 rounded-full", className)} />
    </span>
  );
}

export function PatientOverviewBloodPressureCard() {
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const reducedMotion = useReducedMotion();
  const vital = VITALS_SUMMARY[index] ?? VITALS_SUMMARY[0];
  const status = vitalStatusConfig(vital.status);
  const positionLabel = `${index + 1} of ${VITALS_SUMMARY.length}`;

  const goNext = () => {
    setDirection(1);
    setIndex((current) => (current + 1) % VITALS_SUMMARY.length);
  };

  const goPrev = () => {
    setDirection(-1);
    setIndex(
      (current) =>
        (current - 1 + VITALS_SUMMARY.length) % VITALS_SUMMARY.length,
    );
  };

  const goTo = (nextIndex: number) => {
    if (nextIndex === index) return;
    setDirection(nextIndex > index ? 1 : -1);
    setIndex(nextIndex);
  };

  return (
    <article
      className={cn(
        dashboardCardClass,
        "relative flex h-full w-full flex-col overflow-hidden p-6",
      )}
      aria-label={`${vital.label}: ${vital.value} ${vital.unit}, ${vital.status}`}
      aria-roledescription="carousel"
    >
      <div className="flex flex-1 flex-col gap-5">
        <div className="relative min-h-0 flex-1 overflow-hidden">
          <AnimatePresence initial={false} custom={direction} mode="wait">
            <motion.div
              key={vital.id}
              custom={direction}
              variants={slideVariants}
              initial={reducedMotion ? false : "enter"}
              animate="center"
              exit={reducedMotion ? undefined : "exit"}
              transition={
                reducedMotion
                  ? { duration: 0 }
                  : { duration: 0.32, ease: SLIDE_EASE }
              }
              className="flex w-full flex-col gap-5"
            >
              {/* Reading + chart */}
              <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between sm:gap-8">
                <div className="flex min-w-0 shrink-0 flex-col gap-6">
                  {/* Title */}
                  <div className="flex min-w-0 items-center gap-3.5">
                    <div
                      className={cn(
                        "flex size-10 shrink-0 items-center justify-center sm:size-12",
                        radius.full,
                      )}
                      style={{
                        backgroundColor: `color-mix(in srgb, ${vital.iconGradient.from} 10%, transparent)`,
                      }}
                    >
                      <VitalGradientIcon
                        id={vital.id}
                        icon={vital.icon}
                        gradient={vital.iconGradient}
                        size={ICON_SIZE}
                      />
                    </div>
                    <h3
                      className={cn(
                        cardTitleClass,
                        "flex min-w-0 items-center gap-1.5 text-foreground",
                      )}
                    >
                      <span className="min-w-0 truncate">{vital.label}</span>
                      <SectionInfoButton
                        info={
                          VITAL_INFO[vital.id] ??
                          `Latest ${vital.label.toLowerCase()} reading with status, change, and short trend.`
                        }
                      />
                    </h3>
                  </div>

                  {/* Value + status */}
                  <div className="flex flex-col gap-3">
                    <div className="flex items-baseline gap-2">
                      <span className="text-[32px] font-bold leading-10 tracking-tight tabular-nums text-foreground">
                        {vital.value}
                      </span>
                      <span className={cn(vitalsCardUnitTextClass, "pl-0.5")}>
                        {vital.unit}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={cn(
                          radius.full,
                          "inline-flex w-fit max-w-full items-center gap-1.5 overflow-visible px-2.5 py-1.5 text-xs font-semibold whitespace-nowrap",
                          status.badgeBg,
                          status.badgeText,
                        )}
                      >
                        <StatusPillDot className={status.dot} />
                        <span className="truncate">{vital.status}</span>
                      </span>
                      <span
                        className={cn(
                          typo.caption,
                          "shrink-0 whitespace-nowrap text-tertiary-foreground",
                        )}
                      >
                        {vital.updatedAgo}
                      </span>
                    </div>
                  </div>
                </div>

                <OverviewSparkline
                  id={vital.id}
                  data={vital.sparkline}
                  gradient={vital.iconGradient}
                  unit={vital.unit}
                  chartStart={vital.chartStart}
                  chartEnd={vital.chartEnd}
                />
              </div>

              {/* Change + High / Low / Avg */}
              <footer
                className={cn(
                  vitalsCardFooterClass,
                  "mt-0 flex-wrap items-center justify-between gap-x-6 gap-y-3 pt-5",
                )}
              >
                <div className="flex min-w-0 items-center gap-1.5">
                  <span
                    className={cn(
                      "inline-flex items-center gap-1",
                      changeTone(vital.change.direction),
                    )}
                  >
                    <ChangeIcon direction={vital.change.direction} />
                    <span className="text-sm font-semibold leading-5">
                      {vital.change.label}
                    </span>
                  </span>
                  <span className={cn(typo.bodyS, "text-tertiary-foreground")}>
                    {vital.change.comparison}
                  </span>
                </div>

                <div className="flex shrink-0 items-center">
                  <div className={vitalsCardStatDividerClass} aria-hidden />
                  {(
                    [
                      { label: "High", value: vital.stats.high },
                      { label: "Low", value: vital.stats.low },
                      { label: "Avg", value: vital.stats.avg },
                    ] as const
                  ).map((stat, statIndex) => (
                    <div key={stat.label} className="flex items-center">
                      {statIndex > 0 ? (
                        <div
                          className={vitalsCardStatDividerClass}
                          aria-hidden
                        />
                      ) : null}
                      <div
                        className={cn(vitalsCardStatCellClass, "px-5 sm:px-6")}
                      >
                        <span className={cn(typo.headingS, "tabular-nums")}>
                          {stat.value}
                        </span>
                        <span
                          className={cn(
                            typo.caption,
                            "font-medium text-muted-foreground",
                          )}
                        >
                          {stat.label}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </footer>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Carousel controls */}
        <div className="relative flex items-center justify-center pt-1">
          <button
            type="button"
            onClick={goPrev}
            aria-label={`Previous vital, ${positionLabel}`}
            className={cn(
              radius.full,
              "absolute left-0 inline-flex size-8 items-center justify-center bg-muted text-muted-foreground transition-colors",
              "hover:bg-muted/80 hover:text-foreground",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30",
            )}
          >
            <AppIcon icon={ArrowLeft02Icon} size={BADGE_ICON_SIZE} aria-hidden />
          </button>

          <div
            className="flex items-center gap-0"
            role="tablist"
            aria-label="Vital metrics"
          >
            {VITALS_SUMMARY.map((item, dotIndex) => {
              const active = dotIndex === index;
              return (
                <button
                  key={item.id}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  aria-label={`Show ${item.label}`}
                  onClick={() => goTo(dotIndex)}
                  className="relative flex size-3 items-center justify-center"
                >
                  <span
                    aria-hidden
                    className={cn(
                      "block rounded-full transition-colors duration-200",
                      active
                        ? "size-1 bg-foreground"
                        : "size-1 bg-foreground/25 hover:bg-foreground/50",
                    )}
                  />
                </button>
              );
            })}
          </div>

          <button
            type="button"
            onClick={goNext}
            aria-label={`Next vital, ${positionLabel}`}
            className={cn(
              radius.full,
              "absolute right-0 inline-flex size-8 items-center justify-center bg-muted text-muted-foreground transition-colors",
              "hover:bg-muted/80 hover:text-foreground",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30",
            )}
          >
            <AppIcon icon={ArrowRight02Icon} size={BADGE_ICON_SIZE} aria-hidden />
          </button>
        </div>
      </div>
      <p className="sr-only" aria-live="polite">
        Showing {vital.label}, {positionLabel}
      </p>
    </article>
  );
}
