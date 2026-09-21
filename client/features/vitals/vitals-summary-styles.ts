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

export const vitalsCardSurfaceClass =
  `group @container flex h-full w-full min-w-0 flex-col rounded-lg border border-border/60 bg-card p-5 shadow-[0_2px_10px_rgba(17,24,39,0.05)] outline-none transition-[box-shadow,border-color] duration-100 ease-out hover:shadow-[0_6px_20px_rgba(17,24,39,0.08)] focus-visible:ring-2 focus-visible:ring-primary/25`;

export const vitalsSparklineActiveDotClass =
  "pointer-events-none absolute z-[1] size-[10px] rounded-full border-2 border-card shadow-[0_0_0_1px_rgba(17,24,39,0.08)]";
