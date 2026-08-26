"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { Award01Icon, ArrowUpRight01Icon } from "@hugeicons/core-free-icons";
import {
  animate,
  motion,
  useMotionValue,
  useReducedMotion,
  useTransform,
} from "framer-motion";
import { Button } from "@/components/ui/button";
import { typo } from "@/lib/tokens/typography";
import { cn } from "@/lib/utils";
import { AnimatedArrowIcon } from "./AnimatedArrowIcon";
import { statusBadgeClass } from "../data/dashboard-styles";
import type { IasAssessment } from "../data/home-data";

/** Overall donut size with a thick ring and large center opening. */
const RING_SIZE = 192;
const RING_STROKE = 32;
const RING_CENTER = RING_SIZE / 2;
const RING_RADIUS = (RING_SIZE - RING_STROKE) / 2;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

/** Tick marks span the same radial band as the thick arc stroke. */
const TICK_INNER = RING_RADIUS - RING_STROKE / 2 + 0.5;
const TICK_OUTER = RING_RADIUS + RING_STROKE / 2 - 0.5;

/** Small clear gap on each side of the progress arc (~4°). */
const GAP_RATIO = 0.011;

/**
 * Static full-ring sticks: identical length, width, color, and spacing.
 * ~180 around the circle ≈ 35–40 sticks in the remaining ~21% (matches reference density).
 */
const TICK_COUNT = 180;
const TICK_COLOR = "var(--primary)";
const FULL_TICKS = Array.from({ length: TICK_COUNT }, (_, index) => {
  const angle = ((index + 0.5) / TICK_COUNT) * Math.PI * 2 - Math.PI / 2;
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  return {
    x1: RING_CENTER + cos * TICK_INNER,
    y1: RING_CENTER + sin * TICK_INNER,
    x2: RING_CENTER + cos * TICK_OUTER,
    y2: RING_CENTER + sin * TICK_OUTER,
  };
});

const RING_EASE = [0.22, 1, 0.36, 1] as const;
const RING_DURATION = 2;
/**
 * DashboardReveal shows the IAS card after the greeting (0.07s stagger + 0.28s fade).
 * Hold the fill until that reveal + this ring’s own enter finish, otherwise the sweep
 * is already mid-arc by the time the hero is visible.
 */
const RING_ENTER_DELAY = 0.12;
const RING_ENTER_DURATION = 0.45;
const RING_FILL_DELAY = RING_ENTER_DELAY + RING_ENTER_DURATION;

/** Matches --primary / --chart-8 — literal hex required for lerpHex. */
const GRADIENT_START = "#6C318E";
const GRADIENT_END = "#1E0E28";
/** Dense segments so the color appears to travel along the circular path. */
const ARC_SEGMENT_COUNT = 96;

function lerpHex(from: string, to: string, t: number) {
  const clamped = Math.min(1, Math.max(0, t));
  const parse = (hex: string) => [
    parseInt(hex.slice(1, 3), 16),
    parseInt(hex.slice(3, 5), 16),
    parseInt(hex.slice(5, 7), 16),
  ] as const;
  const [r1, g1, b1] = parse(from);
  const [r2, g2, b2] = parse(to);
  const channel = (a: number, b: number) => Math.round(a + (b - a) * clamped);
  return `rgb(${channel(r1, r2)} ${channel(g1, g2)} ${channel(b1, b2)})`;
}

function arcSegmentPath(startRatio: number, endRatio: number) {
  const a0 = -Math.PI / 2 + startRatio * Math.PI * 2;
  const a1 = -Math.PI / 2 + endRatio * Math.PI * 2;
  const x0 = RING_CENTER + Math.cos(a0) * RING_RADIUS;
  const y0 = RING_CENTER + Math.sin(a0) * RING_RADIUS;
  const x1 = RING_CENTER + Math.cos(a1) * RING_RADIUS;
  const y1 = RING_CENTER + Math.sin(a1) * RING_RADIUS;
  const largeArc = a1 - a0 > Math.PI ? 1 : 0;
  return `M ${x0} ${y0} A ${RING_RADIUS} ${RING_RADIUS} 0 ${largeArc} 1 ${x1} ${y1}`;
}

/** Path-following gradient: light at 12 o'clock → dark at the arc end. */
function buildArcGradientSegments(arcRatio: number): Array<{
  key: string;
  d: string;
  color: string;
}> {
  if (arcRatio <= 0) return [];

  const count = Math.max(1, Math.round(ARC_SEGMENT_COUNT * arcRatio));
  const overlap = arcRatio / count / 4;

  return Array.from({ length: count }, (_, index) => {
    const startRatio = (index / count) * arcRatio;
    const endRatio = Math.min(arcRatio, ((index + 1) / count) * arcRatio + overlap);
    const colorT = (index + 0.5) / count;
    return {
      key: `seg-${index}`,
      d: arcSegmentPath(startRatio, endRatio),
      color: lerpHex(GRADIENT_START, GRADIENT_END, colorT),
    };
  });
}

function ScoreRing({
  score,
  maxScore,
}: {
  score: number | null;
  maxScore: number;
}) {
  const maskId = `ias-arc-mask-${useId().replace(/:/g, "")}`;
  const scoreRef = useRef<HTMLSpanElement>(null);
  const reducedMotion = useReducedMotion();
  const isEmpty = score == null;
  const targetRatio = isEmpty ? 0 : Math.min(score / maxScore, 1);
  // Small gap only at the end of the arc (before sticks); start is always 12 o'clock.
  const finalArcRatio = Math.max(0, targetRatio - GAP_RATIO);

  const progress = useMotionValue(reducedMotion || isEmpty ? finalArcRatio : 0);
  const strokeDasharray = useTransform(progress, (value) => {
    const completed = RING_CIRCUMFERENCE * value;
    return `${completed} ${RING_CIRCUMFERENCE - completed}`;
  });

  const arcSegments = useMemo(
    () => buildArcGradientSegments(finalArcRatio),
    [finalArcRatio],
  );

  useEffect(() => {
    if (isEmpty) {
      progress.set(0);
      return;
    }

    if (reducedMotion) {
      progress.set(finalArcRatio);
      if (scoreRef.current) scoreRef.current.textContent = String(score);
      return;
    }

    const scoreNum = score as number;
    progress.set(0);
    if (scoreRef.current) scoreRef.current.textContent = "0";

    let lastShown = 0;

    // One shared eased animation drives ring + counter so both finish together.
    const controls = animate(progress, finalArcRatio, {
      duration: RING_DURATION,
      delay: RING_FILL_DELAY,
      ease: RING_EASE,
      onUpdate: (value) => {
        const t = finalArcRatio > 0 ? value / finalArcRatio : 1;
        // Counter tracks the same eased progress as the ring.
        const shown = Math.min(scoreNum, Math.max(0, Math.round(t * scoreNum)));
        if (shown !== lastShown && scoreRef.current) {
          scoreRef.current.textContent = String(shown);
          lastShown = shown;
        }
      },
      onComplete: () => {
        // Final frame: ring + text land on the exact end values together.
        progress.set(finalArcRatio);
        if (scoreRef.current) scoreRef.current.textContent = String(scoreNum);
      },
    });

    return () => controls.stop();
  }, [finalArcRatio, isEmpty, progress, reducedMotion, score]);

  return (
    <motion.div
      className="relative flex size-50 items-center justify-center"
      initial={reducedMotion ? false : { opacity: 0, scale: 0.94 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{
        duration: RING_ENTER_DURATION,
        delay: RING_ENTER_DELAY,
        ease: RING_EASE,
      }}
    >
      <svg
        width={RING_SIZE}
        height={RING_SIZE}
        viewBox={`0 0 ${RING_SIZE} ${RING_SIZE}`}
        className="relative"
        aria-hidden
      >
        <defs>
          {/* Animated reveal mask — same sweep as before; paints path-following colors underneath */}
          <mask id={maskId} maskUnits="userSpaceOnUse">
            <rect width={RING_SIZE} height={RING_SIZE} fill="black" />
            <motion.circle
              cx={RING_CENTER}
              cy={RING_CENTER}
              r={RING_RADIUS}
              fill="none"
              stroke="white"
              strokeWidth={RING_STROKE}
              strokeLinecap="butt"
              transform={`rotate(-90 ${RING_CENTER} ${RING_CENTER})`}
              style={{ strokeDasharray }}
              strokeDashoffset={0}
            />
          </mask>
        </defs>

        {/* Static uniform sticks — progress arc draws over them */}
        {FULL_TICKS.map((tick, index) => (
          <line
            key={index}
            x1={tick.x1}
            y1={tick.y1}
            x2={tick.x2}
            y2={tick.y2}
            stroke={TICK_COLOR}
            strokeWidth={1}
            strokeLinecap="butt"
          />
        ))}

        {/* Progress arc: color travels along the circular path (light → dark) */}
        {!isEmpty ? (
          <g mask={`url(#${maskId})`}>
            {arcSegments.map((segment) => (
              <path
                key={segment.key}
                d={segment.d}
                fill="none"
                stroke={segment.color}
                strokeWidth={RING_STROKE}
                strokeLinecap="butt"
              />
            ))}
          </g>
        ) : null}
      </svg>

      <div className="absolute inset-0 flex items-center justify-center">
        {isEmpty ? (
          <p className="flex items-baseline text-placeholder">
            <span className="text-[28px] leading-none font-medium">–</span>
            <span className={cn(typo.headingS, "text-placeholder")}>/ {maxScore}</span>
          </p>
        ) : (
          <p className="flex items-baseline">
            <span
              ref={scoreRef}
              className="text-[42px] leading-13 font-bold tracking-[-0.02em] tabular-nums text-foreground"
            >
              {reducedMotion ? score : 0}
            </span>
            <span className="text-base leading-4 font-semibold text-muted-foreground">
              / {maxScore}
            </span>
          </p>
        )}
      </div>
    </motion.div>
  );
}

function ViewReportButton() {
  const [hovered, setHovered] = useState(false);

  return (
    <Button
      type="button"
      size="cta"
      className="pr-1 pl-4"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => setHovered(true)}
      onBlur={() => setHovered(false)}
    >
      View Report
      <span className="flex size-9 items-center justify-center overflow-hidden rounded-full bg-card text-primary">
        <AnimatedArrowIcon icon={ArrowUpRight01Icon} size={14} className="size-3.5" hovered={hovered} />
      </span>
    </Button>
  );
}

/** Compact status dot with a restrained expanding pulse ring (Independent only). */
function StatusBadgeDot({
  className,
  pulse = false,
}: {
  className?: string;
  pulse?: boolean;
}) {
  const reducedMotion = useReducedMotion();
  const shouldPulse = pulse && !reducedMotion;
  /** Inner dot ~7px; ring expands to ~16px. */
  const dotPx = 7;
  const ringEndPx = 16;
  const scaleEnd = ringEndPx / dotPx;

  return (
    <span
      className="relative flex size-1.75 shrink-0 items-center justify-center overflow-visible"
      aria-hidden
    >
      {shouldPulse ? (
        <motion.span
          className={cn(
            "pointer-events-none absolute inset-0 rounded-full will-change-transform",
            className,
          )}
          style={{ transformOrigin: "center" }}
          animate={{ scale: [1, scaleEnd], opacity: [0.32, 0] }}
          transition={{
            duration: 1.8,
            ease: "easeOut",
            repeat: Infinity,
            repeatDelay: 0.2,
          }}
        />
      ) : null}
      <span
        className={cn("relative z-1 size-1.75 rounded-full", className)}
      />
    </span>
  );
}

export function IasScoreCard({ assessment, variant = "dashboard" }: { assessment: IasAssessment | null; variant?: "dashboard" | "plain" }) {
  const isFilled = assessment != null;

  return (
    <section className={cn(
      "flex flex-col items-stretch gap-5 overflow-hidden rounded-xl border border-border px-5 py-4 shadow-[0px_2px_8px_rgba(17,24,39,0.05)]",
      "sm:flex-row sm:items-center sm:justify-between",
      variant === "dashboard" ? "bg-[linear-gradient(225deg,rgba(239,230,247,0.6)_0%,rgba(255,255,255,1)_60%)]" : "bg-card"
    )}>
      <div className="flex min-w-0 flex-1 flex-col gap-4">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <span className="flex size-8 items-center justify-center rounded-full bg-muted text-success">
              <HugeiconsIcon icon={Award01Icon} size={19} strokeWidth={1.75} color="currentColor" />
            </span>
            <p
              className={cn(
                typo.overline,
                "tracking-[0.6px]",
                isFilled ? "text-primary" : "text-placeholder",
              )}
            >
              {isFilled ? assessment.overline : "No active assessment"}
            </p>
          </div>
          <h2 className={cn(typo.headingXl, "pt-1")}>
            {isFilled ? assessment.title : "Your Independent Ageing Score:"}
          </h2>
        </div>

        <div className="flex justify-center sm:hidden">
          <ScoreRing
            score={isFilled ? assessment.score : null}
            maxScore={isFilled ? assessment.maxScore : 48}
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {isFilled ? (
            <>
              <span className="inline-flex h-7 items-center gap-1.75 overflow-visible rounded-[14px] bg-success-muted px-2.5 text-[13px] font-semibold leading-none text-success">
                <StatusBadgeDot className="bg-success" pulse />
                {assessment.statusLabel}
              </span>
              {assessment.deltaLabel ? (
                <span className="text-xs font-medium text-success/80">
                  {assessment.deltaLabel}
                </span>
              ) : null}
            </>
          ) : (
            <>
              <span
                className={cn(
                  statusBadgeClass,
                  "gap-1.5 bg-muted text-muted-foreground",
                )}
              >
                <StatusBadgeDot className="bg-placeholder" />
                Pending
              </span>
              <span className="text-xs font-medium text-muted-foreground">
                Score will be available after your first clinical interview
              </span>
            </>
          )}
        </div>

        <p className={cn(typo.bodyL, "max-w-2xl")}>
          {isFilled
            ? assessment.description
            : "Your overall health score based on recent physical, cognitive, and nutritional assessments indicates a strong level of independence."}
        </p>

        {isFilled ? (
          <div className="flex items-center gap-3">
            <ViewReportButton />
            <div className="flex flex-wrap items-center gap-3">
              <p className={typo.bodyS}>{assessment.lastUpdated}</p>
              <p className={typo.bodyS}>{assessment.nextDue}</p>
            </div>
          </div>
        ) : null}
      </div>

      <div className="hidden shrink-0 sm:flex sm:items-center sm:justify-end">
        <ScoreRing
          score={isFilled ? assessment.score : null}
          maxScore={isFilled ? assessment.maxScore : 48}
        />
      </div>
    </section>
  );
}
