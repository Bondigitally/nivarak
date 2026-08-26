export const dashboardCardClass =
  "min-w-0 rounded-xl border border-border bg-card shadow-[0_2px_8px_rgba(17,24,39,0.05)]";

/** Title row → body: 24px. Pair with `first:pt-0` on the first list/body row. */
export const dashboardCardHeaderClass =
  "flex min-w-0 w-full shrink-0 items-start justify-between gap-2 pb-6 sm:gap-3";

export const dashboardListItemClass =
  "-mx-1.5 cursor-pointer rounded-[10px] px-1.5 transition-colors duration-150 hover:bg-accent";

/**
 * Divided list rows (Appointments, Care Team):
 * - Divider is a separate absolute layer between items (straight 1px rule).
 * - Hover surface is a 14px rounded ::before that extends 1px past top/bottom
 *   so it covers adjacent dividers without cutting into the corners.
 */
export const dashboardDividedRowClass =
  "relative z-[1] cursor-pointer rounded-none bg-transparent " +
  "before:pointer-events-none before:absolute before:inset-x-0 before:-inset-y-px before:-z-10 " +
  "before:rounded-[14px] before:bg-accent before:opacity-0 " +
  "before:transition-opacity before:duration-150 hover:before:opacity-100";

export const dashboardRowDividerClass =
  "pointer-events-none absolute inset-x-0 top-0 z-0 h-px bg-divider";

/** Pill/status badge size — matches Confirmed/Scheduled on appointments */
export const statusBadgeClass =
  "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium leading-4";

/** Search field — width tracks --ui-scale / max-w-dash-search */
export const dashboardSearchBarClass =
  "box-border flex h-dash-control min-h-dash-control w-full max-w-dash-search min-w-0 flex-1 items-center gap-2 overflow-hidden rounded-full border border-border bg-card py-1 pr-1 pl-4 shadow-[0px_1px_2px_rgba(17,24,39,0.04)]";

/**
 * Standard page shell under HomeTopBar.
 * Pad-x 24px · section gap 16px · fluid full width (no max-width).
 * Do not nest another horizontal page pad inside this shell.
 */
export const dashboardPageShellClass =
  "flex w-full min-w-0 flex-col gap-dash-gap px-dash-pad-x pt-dash-pad-y pb-5";

/**
 * Standard fluid 4 / 8 / 12 column grid.
 * Flat 16px gutters (`gap-dash-gutter`) at all breakpoints. No max-width.
 */
export const dashboardGridClass =
  "grid w-full min-w-0 grid-cols-4 items-stretch gap-dash-gutter md:grid-cols-8 xl:grid-cols-12";

/** Half width: full on mobile, 4/8 tablet, 6/12 desktop. */
export const dashboardGridHalfClass =
  "col-span-4 min-w-0 md:col-span-4 xl:col-span-6";

/** Full width across the shared grid. */
export const dashboardGridFullClass =
  "col-span-4 min-w-0 md:col-span-8 xl:col-span-12";

/** Vertical stack inside a grid column — 16px, matches grid gutters. */
export const dashboardGridStackClass =
  "flex h-full min-h-0 min-w-0 flex-col gap-dash-gutter";

/**
 * Standard two-up form / card grid (settings, caregivers).
 * Fluid, 16px gutters, no max-width.
 */
export const dashboardTwoColGridClass =
  "grid w-full min-w-0 grid-cols-1 gap-dash-gutter md:grid-cols-2";

/** Span both columns in `dashboardTwoColGridClass`. */
export const dashboardTwoColSpanFullClass = "md:col-span-2";
