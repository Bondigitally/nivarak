"use client";

import { motion, useReducedMotion } from "framer-motion";
import {
  getIaspBand,
  IASP_BAND_PING_STYLES,
  type IaspBandResult,
} from "@/features/assessments/data/iasp-scoring";
import {
  iaspBandPendingBadgeClass,
  iaspBandPingBadgeClass,
} from "@/features/assessments/data/iasp-assessment-styles";
import { cn } from "@/lib/utils";

/** Inner dot ~7px; ring expands to ~20px. */
const PULSE_SCALE_END = 20 / 7;

function StatusBadgeDot({
  className,
  pulse = false,
}: {
  className?: string;
  pulse?: boolean;
}) {
  const reducedMotion = useReducedMotion();
  const shouldPulse = pulse && !reducedMotion;

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
          animate={{ scale: [1, PULSE_SCALE_END], opacity: [0.55, 0] }}
          transition={{
            duration: 1.25,
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

/** Dashboard hero — muted ping badge with pulsing status dot per IASP band. */
export function IaspBandPingBadge({
  percentage,
  band: bandProp,
  className,
}: {
  percentage?: number;
  band?: IaspBandResult;
  className?: string;
}) {
  const band = bandProp ?? getIaspBand(percentage ?? 0);
  const style = IASP_BAND_PING_STYLES[band.band];

  return (
    <span className={cn(iaspBandPingBadgeClass, style.shell, className)}>
      <StatusBadgeDot className={style.dot} pulse={style.pulse} />
      {band.label}
    </span>
  );
}

/** Dashboard hero — score not yet available. */
export function IaspBandPendingBadge({ className }: { className?: string }) {
  return (
    <span className={cn(iaspBandPendingBadgeClass, className)}>
      <StatusBadgeDot className="bg-placeholder" />
      Pending
    </span>
  );
}
