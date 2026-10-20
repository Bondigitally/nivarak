"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence, useMotionValue, useSpring } from "framer-motion";
import { ChartTooltipPanel, ChartTooltipRow } from "@/components/ui/chart";

export interface DonutChartSegment {
  value: number;
  /** Valid CSS color (e.g. hsl(var(--primary)) or #hex) */
  color: string;
  label: string;
  /** Optional max for score display (e.g. 4/6) */
  max?: number;
}

interface DonutChartProps extends React.HTMLAttributes<HTMLDivElement> {
  data: DonutChartSegment[];
  totalValue?: number;
  size?: number;
  strokeWidth?: number;
  animationDuration?: number;
  animationDelayPerSegment?: number;
  highlightOnHover?: boolean;
  centerContent?: React.ReactNode;
  /** Show ChartTooltipPanel on segment hover (no legend needed). */
  showTooltip?: boolean;
  /**
   * Element that bounds the tooltip (e.g. IAS-P card).
   * Tooltip keeps natural size and is only repositioned to stay inside.
   */
  tooltipConstraintRef?: React.RefObject<HTMLElement | null>;
  /** Callback when a segment is hovered */
  onSegmentHover?: (segment: DonutChartSegment | null) => void;
}

const TOOLTIP_OFFSET = 12;
const TOOLTIP_EDGE_PAD = 8;
/** Brief delay so moving between adjacent segments does not flicker (Recharts-like). */
const TOOLTIP_LEAVE_DELAY_MS = 60;
/** Responsive follow — smooth without trailing far behind the cursor. */
const TOOLTIP_SPRING = { stiffness: 520, damping: 38, mass: 0.45 };

const TOOLTIP_MOTION = {
  initial: { opacity: 0, scale: 0.96 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.96 },
  transition: {
    opacity: { duration: 0.12, ease: "easeOut" },
    scale: { duration: 0.12, ease: "easeOut" },
  },
} as const;

function clamp(value: number, min: number, max: number) {
  if (max < min) return min;
  return Math.min(Math.max(value, min), max);
}

function computeTooltipOrigin(
  clientX: number,
  clientY: number,
  bounds: DOMRect,
  size: { w: number; h: number },
) {
  const w = size.w || 160;
  const h = size.h || 72;
  const px = clientX - bounds.left;
  const py = clientY - bounds.top;
  const maxLeft = Math.max(TOOLTIP_EDGE_PAD, bounds.width - w - TOOLTIP_EDGE_PAD);
  const maxTop = Math.max(TOOLTIP_EDGE_PAD, bounds.height - h - TOOLTIP_EDGE_PAD);

  let left =
    px + TOOLTIP_OFFSET + w <= bounds.width - TOOLTIP_EDGE_PAD
      ? px + TOOLTIP_OFFSET
      : px - w - TOOLTIP_OFFSET;
  let top =
    py + TOOLTIP_OFFSET + h <= bounds.height - TOOLTIP_EDGE_PAD
      ? py + TOOLTIP_OFFSET
      : py - h - TOOLTIP_OFFSET;

  left = clamp(left, TOOLTIP_EDGE_PAD, maxLeft);
  top = clamp(top, TOOLTIP_EDGE_PAD, maxTop);
  return { left, top };
}

function mergeRefs<T>(
  ...refs: Array<React.Ref<T> | undefined>
): React.RefCallback<T> {
  return (node) => {
    for (const ref of refs) {
      if (!ref) continue;
      if (typeof ref === "function") ref(node);
      else (ref as React.MutableRefObject<T | null>).current = node;
    }
  };
}

const DonutChart = React.forwardRef<HTMLDivElement, DonutChartProps>(
  (
    {
      data,
      totalValue: propTotalValue,
      size = 200,
      strokeWidth = 20,
      animationDuration = 1,
      animationDelayPerSegment = 0.05,
      highlightOnHover = true,
      centerContent,
      showTooltip = true,
      tooltipConstraintRef,
      onSegmentHover,
      className,
      ...props
    },
    ref,
  ) => {
    const [hoveredSegment, setHoveredSegment] =
      React.useState<DonutChartSegment | null>(null);
    const [tooltipVisible, setTooltipVisible] = React.useState(false);
    const [mounted, setMounted] = React.useState(false);
    const chartRef = React.useRef<HTMLDivElement>(null);
    const tooltipRef = React.useRef<HTMLDivElement>(null);
    const leaveTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(
      null,
    );
    const tooltipSizeRef = React.useRef({ w: 160, h: 72 });
    const hasAnchoredRef = React.useRef(false);

    const tooltipX = useMotionValue(0);
    const tooltipY = useMotionValue(0);
    const smoothX = useSpring(tooltipX, TOOLTIP_SPRING);
    const smoothY = useSpring(tooltipY, TOOLTIP_SPRING);

    const internalTotalValue = React.useMemo(
      () =>
        propTotalValue || data.reduce((sum, segment) => sum + segment.value, 0),
      [data, propTotalValue],
    );

    const radius = size / 2 - strokeWidth / 2;
    const circumference = 2 * Math.PI * radius;
    let cumulativePercentage = 0;

    const moveTooltipTo = React.useCallback(
      (clientX: number, clientY: number, instant = false) => {
        const constraint = tooltipConstraintRef?.current;
        if (!constraint) return;
        const bounds = constraint.getBoundingClientRect();
        const { left, top } = computeTooltipOrigin(
          clientX,
          clientY,
          bounds,
          tooltipSizeRef.current,
        );

        if (instant || !hasAnchoredRef.current) {
          tooltipX.jump(left);
          tooltipY.jump(top);
          hasAnchoredRef.current = true;
        } else {
          tooltipX.set(left);
          tooltipY.set(top);
        }
      },
      [tooltipConstraintRef, tooltipX, tooltipY],
    );

    React.useEffect(() => {
      setMounted(true);
    }, []);

    React.useEffect(() => {
      onSegmentHover?.(hoveredSegment);
    }, [hoveredSegment, onSegmentHover]);

    React.useEffect(() => {
      return () => {
        if (leaveTimerRef.current) clearTimeout(leaveTimerRef.current);
      };
    }, []);

    React.useLayoutEffect(() => {
      if (!tooltipVisible || !tooltipRef.current) return;
      const el = tooltipRef.current;
      const measure = () => {
        const rect = el.getBoundingClientRect();
        // Prefer layout size over transformed (spring) size
        tooltipSizeRef.current = {
          w: el.offsetWidth || rect.width,
          h: el.offsetHeight || rect.height,
        };
      };
      measure();
      const ro = new ResizeObserver(measure);
      ro.observe(el);
      return () => ro.disconnect();
    }, [tooltipVisible, hoveredSegment]);

    const clearHover = React.useCallback(() => {
      setHoveredSegment(null);
      setTooltipVisible(false);
      hasAnchoredRef.current = false;
    }, []);

    const scheduleClearHover = () => {
      if (leaveTimerRef.current) clearTimeout(leaveTimerRef.current);
      leaveTimerRef.current = setTimeout(clearHover, TOOLTIP_LEAVE_DELAY_MS);
    };

    const handleSegmentEnter = (
      segment: DonutChartSegment,
      event: React.MouseEvent,
    ) => {
      if (leaveTimerRef.current) {
        clearTimeout(leaveTimerRef.current);
        leaveTimerRef.current = null;
      }
      const firstShow = !hasAnchoredRef.current;
      setHoveredSegment(segment);
      setTooltipVisible(true);
      moveTooltipTo(event.clientX, event.clientY, firstShow);
    };

    const handleSegmentMove = (event: React.MouseEvent) => {
      moveTooltipTo(event.clientX, event.clientY);
    };

    const hoveredPct =
      hoveredSegment &&
      (hoveredSegment.max != null && hoveredSegment.max > 0
        ? Math.round((hoveredSegment.value / hoveredSegment.max) * 100)
        : internalTotalValue > 0
          ? Math.round((hoveredSegment.value / internalTotalValue) * 100)
          : null);

    const constraintEl = tooltipConstraintRef?.current;

    const tooltip =
      mounted &&
      showTooltip &&
      constraintEl &&
      createPortal(
        <AnimatePresence>
          {tooltipVisible && hoveredSegment ? (
            <motion.div
              key="donut-tooltip"
              ref={tooltipRef}
              role="tooltip"
              className="pointer-events-none absolute left-0 top-0 z-50 will-change-transform"
              style={{ x: smoothX, y: smoothY }}
              initial={TOOLTIP_MOTION.initial}
              animate={TOOLTIP_MOTION.animate}
              exit={TOOLTIP_MOTION.exit}
              transition={TOOLTIP_MOTION.transition}
            >
              <ChartTooltipPanel title={hoveredSegment.label}>
                <ChartTooltipRow
                  label="Score"
                  value={
                    hoveredSegment.max != null
                      ? `${hoveredSegment.value}/${hoveredSegment.max}`
                      : String(hoveredSegment.value)
                  }
                  color={hoveredSegment.color}
                />
                {hoveredPct != null ? (
                  <ChartTooltipRow label="Progress" value={`${hoveredPct}%`} />
                ) : null}
              </ChartTooltipPanel>
            </motion.div>
          ) : null}
        </AnimatePresence>,
        constraintEl,
      );

    return (
      <div
        ref={mergeRefs(ref, chartRef)}
        className={cn(
          "relative flex items-center justify-center overflow-visible",
          className,
        )}
        style={{ width: size, height: size }}
        onMouseLeave={scheduleClearHover}
        {...props}
      >
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="-rotate-90 overflow-visible"
          aria-hidden
        >
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="transparent"
            stroke="hsl(var(--border) / 0.5)"
            strokeWidth={strokeWidth}
            pointerEvents="none"
          />

          <AnimatePresence>
            {data.map((segment, index) => {
              if (segment.value === 0) return null;

              const percentage =
                internalTotalValue === 0
                  ? 0
                  : (segment.value / internalTotalValue) * 100;

              const strokeDasharray = `${(percentage / 100) * circumference} ${circumference}`;
              const strokeDashoffset =
                (cumulativePercentage / 100) * circumference;

              const isActive = hoveredSegment?.label === segment.label;

              cumulativePercentage += percentage;

              return (
                <motion.circle
                  key={segment.label || index}
                  cx={size / 2}
                  cy={size / 2}
                  r={radius}
                  fill="none"
                  stroke={segment.color}
                  strokeWidth={strokeWidth}
                  strokeDasharray={strokeDasharray}
                  strokeDashoffset={-strokeDashoffset}
                  strokeLinecap="butt"
                  pointerEvents="stroke"
                  initial={{ opacity: 0, strokeDashoffset: circumference }}
                  animate={{
                    opacity: 1,
                    strokeDashoffset: -strokeDashoffset,
                  }}
                  transition={{
                    opacity: {
                      duration: 0.3,
                      delay: index * animationDelayPerSegment,
                    },
                    strokeDashoffset: {
                      duration: animationDuration,
                      delay: index * animationDelayPerSegment,
                      ease: "easeOut",
                    },
                  }}
                  className={cn(
                    "origin-center transition-transform duration-200",
                    highlightOnHover && "cursor-pointer",
                  )}
                  style={{
                    filter: isActive
                      ? `drop-shadow(0px 0px 6px ${segment.color}) brightness(1.1)`
                      : "none",
                    transform: isActive ? "scale(1.03)" : "scale(1)",
                    transition:
                      "filter 0.2s ease-out, transform 0.2s ease-out",
                  }}
                  onMouseEnter={(event) => handleSegmentEnter(segment, event)}
                  onMouseMove={handleSegmentMove}
                  onMouseLeave={scheduleClearHover}
                />
              );
            })}
          </AnimatePresence>
        </svg>

        {centerContent ? (
          <div
            className="pointer-events-none absolute z-10 flex flex-col items-center justify-center overflow-visible px-1"
            style={{
              // Match the geometric hole (stroke is centered on the arc path)
              width: size - strokeWidth * 2,
              height: size - strokeWidth * 2,
            }}
          >
            {centerContent}
          </div>
        ) : null}

        {tooltip}
      </div>
    );
  },
);

DonutChart.displayName = "DonutChart";

export { DonutChart };
