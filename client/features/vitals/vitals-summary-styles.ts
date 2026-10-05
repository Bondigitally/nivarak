/** Shared layout classes for VitalsSummaryCards and VitalsPageSkeleton. */

import { radius } from "@/lib/tokens/radius";
import {
  cardLiftActiveClass,
  cardLiftHoverClass,
  cardLiftHoverWashClass,
  cardLiftTransitionClass,
  cardShadowClass,
} from "@/lib/tokens/elevation";
import {
  vitalsCardMetricsRowClass,
  vitalsSummaryGridClass,
} from "@/lib/tokens/page-shell";
import { cn } from "@/lib/utils";

export { vitalsCardMetricsRowClass, vitalsSummaryGridClass };

export const vitalsCardMetricsValueClass =
  "flex min-w-0 items-center gap-1.5 overflow-hidden";

export const vitalsCardMetricsStatusClass =
  "mt-2.5 flex min-h-6 w-full shrink-0 flex-wrap items-center gap-2";

export const vitalsCardValueTextClass =
  "truncate text-[24px] font-bold leading-8 tracking-[-0.02em] tabular-nums text-foreground";

export const vitalsCardUnitTextClass =
  "shrink-0 text-sm font-medium leading-5 text-muted-foreground";

export const vitalsCardSurfaceHoverOverlayClass = cardLiftHoverWashClass;

export const vitalsCardSurfaceClass = cn(
  "group relative isolate overflow-hidden @container flex h-full w-full min-w-0 flex-col gap-4 bg-card p-4 outline-none",
  radius.lg,
  cardShadowClass,
  cardLiftTransitionClass,
  cardLiftHoverClass,
  cardLiftActiveClass,
  "focus-visible:ring-2 focus-visible:ring-primary/30",
);

export const vitalsCardBodyClass =
  "relative z-1 flex min-w-0 flex-col gap-3";

export const vitalsCardFooterClass =
  "relative z-1 mt-auto flex w-full border-t border-divider pt-3";

export const vitalsCardStatDividerClass =
  "h-9 w-px shrink-0 self-center bg-divider";

export const vitalsCardStatCellClass =
  "flex shrink-0 flex-col items-start justify-center px-3";

export const vitalsSparklineActiveDotClass =
  "pointer-events-none absolute z-[1] size-[10px] rounded-full border-2 border-card shadow-[0_0_0_1px_rgba(17,24,39,0.08)] dark:shadow-[0_0_0_1px_rgba(255,255,255,0.1)]";

export const vitalsSparklineEndpointDotClass =
  "pointer-events-none absolute z-[1] size-2.5 rounded-full border-2 border-card shadow-[0_0_0_1px_rgba(17,24,39,0.08)] dark:shadow-[0_0_0_1px_rgba(255,255,255,0.1)]";

/** Soft dot field behind the KPI sparkline only (not the metrics row). */
export const vitalsSparklineDotFieldClass =
  "pointer-events-none absolute inset-0 z-0 opacity-[0.65] [background-image:radial-gradient(circle,color-mix(in_srgb,var(--divider)_95%,transparent)_1.1px,transparent_1.4px)] [background-size:20px_16px] [background-position:10px_8px]";

export const vitalsSparklineFrameClass =
  "relative isolate h-16 w-full min-w-0 overflow-hidden";

export const vitalsCarouselShellClass =
  "relative flex h-full min-h-0 w-full min-w-0 flex-col";
