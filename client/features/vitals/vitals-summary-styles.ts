/** Shared layout classes for VitalsSummaryCards and VitalsPageSkeleton. */

export const vitalsSummaryGridClass =
  "grid w-full min-w-0 grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5 xl:gap-3 2xl:gap-4";

export const vitalsCardMetricsRowClass =
  "mt-4 flex min-w-0 w-full flex-row items-center justify-between gap-2 @max-[15.5rem]:flex-col @max-[15.5rem]:items-start @max-[15.5rem]:gap-0";

export const vitalsCardMetricsValueClass =
  "flex min-w-0 items-baseline gap-1 overflow-hidden @max-[15.5rem]:min-h-[30px] @max-[15.5rem]:w-full";

export const vitalsCardMetricsStatusClass =
  "shrink-0 @max-[15.5rem]:mt-1 @max-[15.5rem]:flex @max-[15.5rem]:min-h-6 @max-[15.5rem]:w-full @max-[15.5rem]:items-center";

export const vitalsCardValueTextClass =
  "truncate text-[30px] font-semibold leading-none tracking-[-0.02em] tabular-nums text-foreground @max-[11rem]:text-[26px] @max-[9.5rem]:text-[22px]";

export const vitalsCardSurfaceHoverOverlayClass =
  "pointer-events-none absolute inset-0 z-0 opacity-0 bg-linear-to-br from-foreground/3 to-foreground/1 motion-safe:transition-opacity motion-safe:duration-350 motion-safe:ease-in-out motion-safe:group-hover:opacity-100";

export const vitalsCardSurfaceClass =
  "group relative isolate overflow-hidden @container flex h-full w-full min-w-0 flex-col rounded-lg border border-border/60 bg-card p-5 shadow-[0px_2px_8px_rgba(17,24,39,0.05)] outline-none motion-safe:transition-[transform_0.35s_cubic-bezier(0.2,0.8,0.2,1),box-shadow_0.35s_ease] motion-safe:hover:-translate-y-0.5 motion-safe:hover:shadow-[0px_12px_32px_rgba(17,24,39,0.08)] motion-safe:active:-translate-y-px motion-safe:active:shadow-[0px_4px_14px_rgba(17,24,39,0.06)] focus-visible:ring-2 focus-visible:ring-primary/25";

export const vitalsSparklineActiveDotClass =
  "pointer-events-none absolute z-[1] size-[10px] rounded-full border-2 border-card shadow-[0_0_0_1px_rgba(17,24,39,0.08)]";
