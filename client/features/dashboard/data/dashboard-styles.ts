import { radius } from "@/lib/tokens/radius";
import { heroPlumWashSurfaceClass } from "@/components/layout/shell-chrome";

export {
  cardTitleClass,
  dashboardCardClass,
  dashboardChromeControlClass,
  dashboardChromeControlFocusVisibleClass,
  dashboardChromeControlFocusWithinClass,
  dashboardGridClass,
  dashboardGridFullClass,
  dashboardGridHalfClass,
  dashboardGridStackClass,
  dashboardGridThirdClass,
  dashboardHeaderIconButtonClass,
  dashboardPageShellClass,
  dashboardSearchBarClass,
  dashboardSearchBarIconClass,
  dashboardTwoColGridClass,
  dashboardTwoColSpanFullClass,
} from "@/lib/tokens/page-shell";

export { statusBadgeClass } from "@/lib/tokens/status-badges";

/** IAS dashboard hero — subtle neutral lift on white card */
export const dashboardHeroCardSurfaceClass = heroPlumWashSurfaceClass;

/** Title row → body: 24px. Pair with `dashboardCardListClass` on the list. */
export const dashboardCardHeaderClass =
  "flex min-w-0 w-full shrink-0 items-start justify-between gap-2 pb-6 sm:gap-3";

/**
 * List under a card header: pull up by the row's top padding so title→content
 * stays 24px while every row keeps the same vertical padding / height.
 * Pair with rows using `py-3.5` / `dashboardPreviewRowClass`.
 */
export const dashboardCardListClass = "-mt-3.5 flex min-w-0 flex-col";

/** Same as `dashboardCardListClass` when rows use `py-3.5 sm:py-4`. */
export const dashboardCardListLooseClass = "-mt-3.5 flex min-w-0 flex-col sm:-mt-4";

/**
 * Equal-height preview rows for Today’s tasks, Care Team, and Recent Activity.
 * min-h-16 · py-3.5 · px-2 — keep all three cards on this recipe.
 */
export const dashboardPreviewRowClass =
  "flex min-h-16 min-w-0 items-center gap-3 px-2 py-3.5";

/** Neutral Surface/Hover — inactive sidebar nav and list row hover */
export const dashboardListItemClass = `-mx-1.5 cursor-pointer ${radius.sm} px-1.5 transition-colors duration-150 hover:bg-accent`;

/**
 * List item wrapper for divided rows.
 * Pair with `dashboardRowDividerClass` so a hovered row hides its own top
 * divider and the next row's top divider (via peer), leaving a clean hover surface.
 */
export const dashboardDividedItemClass = "peer/row group/row relative";

/**
 * Divided list rows (Appointments, Care Team, Tasks):
 * - Divider is owned by the list item (`dashboardDividedItemClass`).
 * - Hover surface is a rounded ::before; dividers hide on row hover.
 * - Hover fill is neutral Surface/Hover (`bg-accent`).
 */
export const dashboardDividedRowClass =
  "relative z-[1] cursor-pointer rounded-none bg-transparent " +
  "before:pointer-events-none before:absolute before:inset-x-0 before:inset-y-0 before:-z-10 " +
  "before:rounded-md before:bg-accent before:opacity-0 " +
  "before:transition-opacity before:duration-150 hover:before:opacity-100";

/**
 * Top-edge divider for a divided list item.
 * Hides when this row is hovered, or when the previous row is hovered.
 */
export const dashboardRowDividerClass =
  "pointer-events-none absolute inset-x-0 top-0 z-0 h-px bg-divider " +
  "transition-opacity duration-150 " +
  "group-hover/row:opacity-0 peer-hover/row:opacity-0";

/** ⌘K shortcut chip — accent fill at rest; chip hover lifts secondary label to primary */
export const searchShortcutKeyClass =
  "bg-accent text-muted-foreground transition-colors duration-200 ease-out hover:text-foreground";

/** IAS hero View Report — asymmetric padding for trailing arrow chip. */
export const dashboardViewReportButtonClass = "pr-1 pl-4";

/** White circular arrow well on plum CTA (pairs with AnimatedArrowIcon + BADGE_ICON_SIZE). */
export const dashboardCtaArrowChipClass =
  "flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary-foreground text-primary";
