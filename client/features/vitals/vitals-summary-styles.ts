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
  "flex min-w-0 items-baseline gap-1 overflow-hidden @max-[15.5rem]:min-h-[30px] @max-[15.5rem]:w-full";

export const vitalsCardMetricsStatusClass =
  "shrink-0 @max-[15.5rem]:mt-1 @max-[15.5rem]:flex @max-[15.5rem]:min-h-6 @max-[15.5rem]:w-full @max-[15.5rem]:items-center";

export const vitalsCardValueTextClass =
  "truncate text-[30px] font-semibold leading-none tracking-[-0.02em] tabular-nums text-foreground @max-[11rem]:text-[26px] @max-[9.5rem]:text-[22px]";

export const vitalsCardSurfaceHoverOverlayClass = cardLiftHoverWashClass;

export const vitalsCardSurfaceClass = cn(
  "group relative isolate overflow-hidden @container flex h-full w-full min-w-0 flex-col bg-card p-5 outline-none",
  radius.lg,
  cardShadowClass,
  cardLiftTransitionClass,
  cardLiftHoverClass,
  cardLiftActiveClass,
  "focus-visible:ring-2 focus-visible:ring-primary/30",
);

export const vitalsSparklineActiveDotClass =
  "pointer-events-none absolute z-[1] size-[10px] rounded-full border-2 border-card shadow-[0_0_0_1px_rgba(17,24,39,0.08)] dark:shadow-[0_0_0_1px_rgba(255,255,255,0.1)]";
