import { cn } from "@/lib/utils";
import { radius } from "@/lib/tokens/radius";
import { typo } from "@/lib/tokens/typography";
import {
  cardShadowClass,
  cardShadowHoverClass,
} from "@/lib/tokens/elevation";

/** Soft elevation — no border; hairline + ambient lift on cool-gray canvas */
export const dashboardCardClass = `min-w-0 ${radius.lg} bg-card ${cardShadowClass} transition-shadow duration-200 ease-out ${cardShadowHoverClass}`;

/** Card / section title — 18px Semibold / 24px across dashboard cards */
export const cardTitleClass = `${typo.headingS} text-[18px] leading-6`;

/**
 * Centered content column shared by page shells and the top bar.
 * From `lg` up, capped at `--max-width-dash-page` (1440px) and centered in
 * `main` — sidebar collapse returns space until that cap is reached.
 */
export const dashboardContentWidthClass =
  "mx-auto w-full min-w-0 px-dash-pad-x lg:max-w-dash-page";

/**
 * Standard page shell under AppPageFrame.
 * Pad-x 24px · section gap via `--spacing-dash-gap`.
 * Do not nest another horizontal page pad inside this shell.
 */
export const dashboardPageShellClass = cn(
  dashboardContentWidthClass,
  "flex flex-col gap-dash-gap pt-dash-pad-y pb-5",
);

/**
 * Standard fluid 4 / 8 / 12 column grid.
 * Flat gutters (`gap-dash-gutter` → `--spacing-dash-gutter`) at all breakpoints. No max-width.
 */
export const dashboardGridClass =
  "grid w-full min-w-0 grid-cols-4 items-stretch gap-dash-gutter md:grid-cols-8 xl:grid-cols-12";

/** Half width: full on mobile, 4/8 tablet, 6/12 desktop. */
export const dashboardGridHalfClass =
  "col-span-4 min-w-0 md:col-span-4 xl:col-span-6";

/**
 * Third width: full on mobile, half on tablet (2-up), third on desktop (3-up).
 * 4→1 / 8→2 / 12→3 across.
 */
export const dashboardGridThirdClass = "col-span-4 min-w-0";

/** Full width across the shared grid. */
export const dashboardGridFullClass =
  "col-span-4 min-w-0 md:col-span-8 xl:col-span-12";

/** Vertical stack inside a grid column — matches `--spacing-dash-gutter`. */
export const dashboardGridStackClass =
  "flex h-full min-h-0 min-w-0 flex-col gap-dash-gutter";

/** Stacked dashboard cards (appointments, medications, etc.). */
export const dashboardCardStackClass = "flex flex-col gap-dash-gutter";

/**
 * Portrait member card shell — Care Team MedicalStaffCard / Clinical Notes.
 * Fixed width (w-61.5 / 246px) · rounded-lg · tight outer pad · media + body stack.
 * Pair with `memberPortraitCardMediaClass` + `memberPortraitCardBodyClass`.
 * Shadow: use motion boxShadow (staff) or `cardShadowClass` (static cards).
 */
export const memberPortraitCardClass =
  `flex w-61.5 shrink-0 flex-col gap-4 ${radius.lg} bg-card p-0.75`;

/** Top media tile inside a member portrait card (photo / icon field). */
export const memberPortraitCardMediaClass =
  `relative h-48 w-full overflow-hidden ${radius.md}`;

/** Text block under the media tile. */
export const memberPortraitCardBodyClass = "flex flex-col gap-2 p-4";

/** Wrap density for member portrait cards (Care Team staff / clinical notes). */
export const memberPortraitCardGridClass =
  "flex flex-wrap justify-center gap-dash-gutter lg:justify-start";

/**
 * Standard two-up form / card grid (settings, caregivers).
 * Fluid gutters (`gap-dash-gutter`), no max-width.
 */
export const dashboardTwoColGridClass =
  "grid w-full min-w-0 grid-cols-1 gap-dash-gutter md:grid-cols-2";

/** Span both columns in `dashboardTwoColGridClass`. */
export const dashboardTwoColSpanFullClass = "md:col-span-2";

/** Soft border + shadow — shared by global search and header icon controls */
export const dashboardChromeControlClass =
  "border border-border bg-card shadow-[0px_1px_2px_rgba(17,24,39,0.04)] transition-[border-color,box-shadow] duration-200 ease-out hover:border-foreground/12 hover:shadow-[0_0_0_1px_rgba(17,24,39,0.08),0px_1px_2px_rgba(17,24,39,0.04)]";

export const dashboardChromeControlFocusWithinClass =
  "focus-within:border-border-focus/80 focus-within:shadow-[0_0_0_1px_rgba(185,139,208,0.35),0px_1px_2px_rgba(17,24,39,0.04)]";

export const dashboardChromeControlFocusVisibleClass =
  "focus-visible:border-border-focus/80 focus-visible:shadow-[0_0_0_1px_rgba(185,139,208,0.35),0px_1px_2px_rgba(17,24,39,0.04)]";

/** Header icon button — matches global search chrome on a circular control */
export const dashboardHeaderIconButtonClass = cn(
  dashboardChromeControlClass,
  dashboardChromeControlFocusVisibleClass,
  radius.full,
  "bg-card text-muted-foreground hover:bg-card hover:text-foreground active:bg-card",
);

/** Search field — width tracks --ui-scale / max-w-dash-search */
export const dashboardSearchBarClass = cn(
  "group box-border flex h-dash-control min-h-dash-control w-full max-w-dash-search min-w-0 flex-1 items-center gap-2 overflow-hidden py-1 pr-1 pl-4",
  radius.full,
  dashboardChromeControlClass,
  dashboardChromeControlFocusWithinClass,
);

export const dashboardSearchBarIconClass =
  "shrink-0 text-muted-foreground transition-[color,transform] duration-200 ease-out group-hover:scale-[1.03] group-hover:text-foreground";

/** Placeholder / hint copy in the global search trigger — stays on placeholder token on bar hover */
export const dashboardSearchBarPlaceholderClass = "text-placeholder";

/** Vitals summary card grid — shared by VitalsSummaryCards and VitalsPageSkeleton */
export const vitalsSummaryGridClass =
  "grid w-full min-w-0 grid-cols-1 gap-4 md:grid-cols-2 xl:gap-4";

export const vitalsCardMetricsRowClass =
  "flex min-w-0 w-full flex-col items-start gap-0";
