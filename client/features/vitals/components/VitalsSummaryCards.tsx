"use client";

/**
 * Renders the vitals summary grid — one interactive sparkline card per vital.
 *
 * Layout matches Nivarak UI Figma “Blood Pressure Card”: reading + status on
 * the left, sparkline with dotted field on the right, and a footer with
 * day-over-day change plus High / Low / Avg.
 *
 * Status badge colours (Normal / Low / Elevated / Critical) are driven by
 * `vitalStatusConfig` in `lib/tokens/status-badges.ts`.
 *
 * All data comes from `VITALS_SUMMARY` in `vitals-summary-data.ts`.
 * When the API is connected, replace that mock with a real data hook.
 */

import type { IconSvgElement } from "@hugeicons/react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowDown02Icon,
  ArrowRight01Icon,
  ArrowUp02Icon,
  MinusSignIcon,
} from "@hugeicons/core-free-icons";
import { motion, useReducedMotion } from "framer-motion";
import {
  createElement,
  useCallback,
  useEffect,
  useRef,
  useState,
  type Dispatch,
  type KeyboardEvent,
  type PointerEvent,
  type SetStateAction,
} from "react";
import { useOnceAnimation } from "@/components/ui/use-once-animation";
import { Button } from "@/components/ui/button";
import { statusBadgeClass } from "@/features/dashboard/data/dashboard-styles";
import {
  VITALS_SUMMARY,
  type VitalCardData,
  type VitalChangeDirection,
} from "@/features/vitals/data/vitals-summary-data";
import {
  vitalsCardBodyClass,
  vitalsCardFooterClass,
  vitalsCardMetricsRowClass,
  vitalsCardMetricsStatusClass,
  vitalsCardMetricsValueClass,
  vitalsCardStatCellClass,
  vitalsCardStatDividerClass,
  vitalsCardSurfaceClass,
  vitalsCardSurfaceHoverOverlayClass,
  vitalsCardUnitTextClass,
  vitalsCardValueTextClass,
  vitalsCarouselShellClass,
  vitalsSparklineActiveDotClass,
  vitalsSparklineDotFieldClass,
  vitalsSparklineEndpointDotClass,
  vitalsSparklineFrameClass,
  vitalsSummaryGridClass,
} from "@/features/vitals/vitals-summary-styles";
import { BADGE_ICON_SIZE, ICON_SIZE, ICON_STROKE } from "@/lib/icons";
import type { VitalIconGradient } from "@/lib/tokens/colors";
import { vitalStatusConfig } from "@/lib/tokens/status-badges";
import { typo } from "@/lib/tokens/typography";
import { cn } from "@/lib/utils";
import { AppIcon } from "@/components/shared/AppIcon";

const SPARKLINE_WIDTH = 200;
const SPARKLINE_HEIGHT = 64;
const SPARKLINE_EASE = [0.22, 1, 0.36, 1] as const;
const SPARKLINE_DRAW_DURATION = 0.75;
const SPARKLINE_STAGGER = 0.06;

function buildSparklinePoints(data: number[], width: number, height: number) {
  const padY = height * 0.18;
  const padX = 4;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  return data.map((value, index) => ({
    x: padX + (index / Math.max(data.length - 1, 1)) * (width - padX * 2),
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

function VitalIconTile({
  id,
  icon,
  gradient,
}: {
  id: string;
  icon: IconSvgElement;
  gradient: Pick<VitalIconGradient, "from" | "to">;
}) {
  return (
    <div
      className={cn(
        "flex size-9 shrink-0 items-center justify-center rounded-lg",
        "motion-safe:transition-transform motion-safe:duration-220 motion-safe:ease-[cubic-bezier(0.22,1,0.36,1)]",
        "motion-safe:group-hover:scale-[1.04]",
      )}
      style={{
        backgroundColor: `color-mix(in srgb, ${gradient.from} 10%, transparent)`,
      }}
    >
      <VitalGradientIcon id={id} icon={icon} gradient={gradient} size={20} />
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
  animationDelay = 0,
}: {
  id: string;
  data: number[];
  gradient: Pick<VitalIconGradient, "from" | "to">;
  unit: string;
  chartStart: string;
  chartEnd: string;
  activeIndex: number | null;
  onActiveIndexChange: (index: number | null) => void;
  animationDelay?: number;
}) {
  const fillGradientId = `vital-sparkline-fill-${id}`;
  const strokeGradientId = `vital-sparkline-stroke-${id}`;
  const revealClipId = `vital-sparkline-reveal-${id}`;
  const points = buildSparklinePoints(data, SPARKLINE_WIDTH, SPARKLINE_HEIGHT);
  const linePath = buildSmoothPath(points);
  const areaPath = `${linePath} L ${SPARKLINE_WIDTH} ${SPARKLINE_HEIGHT} L 0 ${SPARKLINE_HEIGHT} Z`;
  const timeLabels = getSparklineTimeLabels(chartStart, chartEnd, data.length);
  const svgRef = useRef<SVGSVGElement>(null);
  const reducedMotion = useReducedMotion();
  const { isAnimationActive, onAnimationEnd } = useOnceAnimation(
    `vitals-kpi-sparkline-${id}`,
  );
  const shouldAnimate = isAnimationActive && !reducedMotion;
  const endpoint = points[points.length - 1] ?? null;

  useEffect(() => {
    if (isAnimationActive && reducedMotion) onAnimationEnd();
  }, [isAnimationActive, reducedMotion, onAnimationEnd]);

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
  const markerPoint = activePoint ?? endpoint;

  return (
    <div className={vitalsSparklineFrameClass}>
      <div className={vitalsSparklineDotFieldClass} aria-hidden />

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

      <div className="relative z-1 h-full w-full">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${SPARKLINE_WIDTH} ${SPARKLINE_HEIGHT}`}
          className="h-full w-full shrink-0"
          preserveAspectRatio="none"
          aria-hidden
          onPointerMove={handlePointerMove}
          onPointerDown={handlePointerMove}
          onPointerLeave={handlePointerLeave}
        >
          <defs>
            <linearGradient id={fillGradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={gradient.from} stopOpacity={0.28} />
              <stop offset="70%" stopColor={gradient.to} stopOpacity={0.08} />
              <stop offset="100%" stopColor={gradient.to} stopOpacity={0} />
            </linearGradient>
            <linearGradient id={strokeGradientId} x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor={gradient.from} />
              <stop offset="100%" stopColor={gradient.to} />
            </linearGradient>
            <clipPath id={revealClipId}>
              <motion.rect
                x={0}
                y={0}
                height={SPARKLINE_HEIGHT}
                initial={shouldAnimate ? { width: 0 } : false}
                animate={{ width: SPARKLINE_WIDTH }}
                transition={
                  shouldAnimate
                    ? {
                        duration: SPARKLINE_DRAW_DURATION,
                        delay: animationDelay,
                        ease: SPARKLINE_EASE,
                      }
                    : { duration: 0 }
                }
                onAnimationComplete={() => {
                  if (shouldAnimate) onAnimationEnd();
                }}
              />
            </clipPath>
          </defs>
          <g clipPath={`url(#${revealClipId})`}>
            <path d={areaPath} fill={`url(#${fillGradientId})`} />
            <path
              d={linePath}
              fill="none"
              stroke={`url(#${strokeGradientId})`}
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              vectorEffect="non-scaling-stroke"
            />
          </g>
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

        {markerPoint !== null && (
          <div
            aria-hidden
            className={
              activePoint !== null
                ? vitalsSparklineActiveDotClass
                : vitalsSparklineEndpointDotClass
            }
            style={{
              left: `${(markerPoint.x / SPARKLINE_WIDTH) * 100}%`,
              top: `${(markerPoint.y / SPARKLINE_HEIGHT) * 100}%`,
              transform: "translate(-50%, -50%)",
              backgroundColor: gradient.from,
            }}
          />
        )}
      </div>
    </div>
  );
}

function VitalChangeIcon({ direction }: { direction: VitalChangeDirection }) {
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

function vitalChangeTone(direction: VitalChangeDirection) {
  if (direction === "down") return "text-destructive";
  if (direction === "flat") return "text-muted-foreground";
  return "text-success";
}

function VitalCard({
  vital,
  animationDelay = 0,
  onNext,
  positionLabel,
}: {
  vital: VitalCardData;
  animationDelay?: number;
  onNext?: () => void;
  positionLabel?: string;
}) {
  const status = vitalStatusConfig(vital.status);
  const [chartIndex, setChartIndex] = useState<number | null>(null);
  const changeTone = vitalChangeTone(vital.change.direction);

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

      <div className="relative z-1 flex min-h-9 items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2.5">
          <VitalIconTile
            id={vital.id}
            icon={vital.icon}
            gradient={vital.iconGradient}
          />
          <p className="min-w-0 truncate text-base font-semibold leading-6 tracking-tight text-foreground">
            {vital.label}
          </p>
        </div>
        {onNext ? (
          <Button
            type="button"
            variant="secondary"
            size="sm"
            className="h-8 shrink-0 gap-1 px-2.5"
            onClick={onNext}
            aria-label={`Next vital, currently ${positionLabel ?? vital.label}`}
          >
            Next
            <AppIcon icon={ArrowRight01Icon} size={14} />
          </Button>
        ) : null}
      </div>

      <div className={vitalsCardBodyClass}>
        <div className={vitalsCardMetricsRowClass}>
          <div className={vitalsCardMetricsValueClass}>
            <span className={vitalsCardValueTextClass}>{vital.value}</span>
            <span className={vitalsCardUnitTextClass}>{vital.unit}</span>
          </div>
          <div className={vitalsCardMetricsStatusClass}>
            <span
              className={cn(
                statusBadgeClass,
                "h-6 max-w-full gap-1.5 px-2.5 py-0.5 text-[13px] font-semibold leading-4",
                status.badgeBg,
                status.badgeText,
              )}
            >
              <span
                className={cn("size-2 shrink-0 rounded-full", status.dot)}
                aria-hidden
              />
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

        <VitalSparkline
          id={vital.id}
          data={vital.sparkline}
          gradient={vital.iconGradient}
          unit={vital.unit}
          chartStart={vital.chartStart}
          chartEnd={vital.chartEnd}
          activeIndex={chartIndex}
          onActiveIndexChange={setChartIndex}
          animationDelay={animationDelay}
        />
      </div>

      <footer className={vitalsCardFooterClass}>
        <div className="flex min-w-0 flex-wrap items-center justify-between gap-x-4 gap-y-2">
          <div className="flex min-w-0 items-center gap-1.5">
            <span className={cn("inline-flex items-center gap-1", changeTone)}>
              <VitalChangeIcon direction={vital.change.direction} />
              <span className="text-sm font-semibold leading-5">
                {vital.change.label}
              </span>
            </span>
            <span className={cn(typo.caption, "text-tertiary-foreground")}>
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
            ).map((stat, index) => (
              <div key={stat.label} className="flex items-center">
                {index > 0 ? (
                  <div className={vitalsCardStatDividerClass} aria-hidden />
                ) : null}
                <div className={vitalsCardStatCellClass}>
                  <span className={cn(typo.headingS, "text-sm tabular-nums")}>
                    {stat.value}
                  </span>
                  <span
                    className={cn(
                      typo.overline,
                      "normal-case tracking-normal text-muted-foreground",
                    )}
                  >
                    {stat.label}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </footer>
    </article>
  );
}

export type VitalMetricId = "bp" | "hr" | "spo2" | "glucose" | "temp";

export function VitalsSummaryCards({
  variant = "grid",
  activeId: controlledId,
  onActiveIdChange,
}: {
  variant?: "grid" | "carousel";
  activeId?: VitalMetricId;
  onActiveIdChange?: (id: VitalMetricId) => void;
} = {}) {
  const [uncontrolledIndex, setUncontrolledIndex] = useState(0);

  if (variant === "carousel") {
    const controlledIndex = controlledId
      ? Math.max(
          0,
          VITALS_SUMMARY.findIndex((vital) => vital.id === controlledId),
        )
      : -1;
    const activeIndex =
      controlledIndex >= 0 ? controlledIndex : uncontrolledIndex;
    const vital = VITALS_SUMMARY[activeIndex] ?? VITALS_SUMMARY[0];
    const positionLabel = `${activeIndex + 1} of ${VITALS_SUMMARY.length}`;

    const goNext = () => {
      const nextIndex = (activeIndex + 1) % VITALS_SUMMARY.length;
      const nextId = VITALS_SUMMARY[nextIndex].id as VitalMetricId;
      onActiveIdChange?.(nextId);
      if (controlledId === undefined) setUncontrolledIndex(nextIndex);
    };

    return (
      <section
        aria-label="Latest vitals summary"
        aria-roledescription="carousel"
        className={vitalsCarouselShellClass}
      >
        <VitalCard
          key={vital.id}
          vital={vital}
          animationDelay={0}
          onNext={goNext}
          positionLabel={positionLabel}
        />
        <p className="sr-only" aria-live="polite">
          Showing {vital.label}, {positionLabel}
        </p>
      </section>
    );
  }

  return (
    <section aria-label="Latest vitals summary">
      <div className={vitalsSummaryGridClass}>
        {VITALS_SUMMARY.map((vital, index) => (
          <VitalCard
            key={vital.id}
            vital={vital}
            animationDelay={index * SPARKLINE_STAGGER}
          />
        ))}
      </div>
    </section>
  );
}
