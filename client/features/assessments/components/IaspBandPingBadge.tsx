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

function StatusBadgeDot({
  className,
  pulse = false,
  deferPulse = false,
}: {
  className?: string;
  pulse?: boolean;
  /** Wait for heavy hero animations (IAS score ring) before starting the ping loop. */
  deferPulse?: boolean;
}) {
  return (
    <span
      className="relative isolate flex size-1.75 shrink-0 items-center justify-center overflow-visible"
      aria-hidden
    >
      {pulse ? (
        <span
          className={cn(
            "iasp-status-dot-ping pointer-events-none absolute inset-0 rounded-full",
            deferPulse && "iasp-status-dot-ping--deferred",
            className,
          )}
        />
      ) : null}
      <span className={cn("relative z-1 size-1.75 rounded-full", className)} />
    </span>
  );
}

/** Dashboard hero — muted ping badge with pulsing status dot per IASP band. */
export function IaspBandPingBadge({
  percentage,
  band: bandProp,
  className,
  deferPulse = false,
}: {
  percentage?: number;
  band?: IaspBandResult;
  className?: string;
  deferPulse?: boolean;
}) {
  const band = bandProp ?? getIaspBand(percentage ?? 0);
  const style = IASP_BAND_PING_STYLES[band.band];

  return (
    <span className={cn(iaspBandPingBadgeClass, style.shell, className)}>
      <StatusBadgeDot
        className={style.dot}
        pulse={style.pulse}
        deferPulse={deferPulse}
      />
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
