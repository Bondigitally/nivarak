import { statusBadgeClass } from "@/features/dashboard/data/dashboard-styles";
import { cardShadowClass, cardShadowHoverClass } from "@/lib/tokens/elevation";
import {
  dialogBodyShellClass,
  dialogFooterShellClass,
  dialogHeaderShellClass,
} from "@/components/ui/dialog";
import { radius } from "@/lib/tokens/radius";
import { typo } from "@/lib/tokens/typography";
import { cn } from "@/lib/utils";

/** Shared max-width for every IAS assessment modal step. */
export const iaspModalShellWidthClass = "max-w-2xl";

/** Desktop modal shell — matches previous PR (max-height only, content-sized). */
export const iaspModalShellLayoutClass =
  "flex w-full max-h-[min(92vh,880px)] flex-col items-stretch";

/**
 * Mobile drawer shell — near full-bleed with a 20px top radius
 * (small top inset so the curve reads against the overlay).
 */
export const iaspDrawerShellLayoutClass = cn(
  "inset-x-0 top-auto bottom-0 flex h-[calc(100dvh-0.75rem)] max-h-[calc(100dvh-0.75rem)] w-full max-w-none flex-col items-stretch gap-0",
  "overflow-hidden rounded-t-[20px] rounded-b-none border-0 bg-card p-0 shadow-none",
);

/**
 * Scrollable step body — extends dialog body shell; below `sm` adds drawer
 * scroll bounds (`h-0` + touch scroll) without changing desktop PR behavior.
 */
export const iaspModalScrollBodyClass = cn(
  dialogBodyShellClass,
  "iasp-modal-scroll max-sm:h-0 max-sm:overflow-y-scroll max-sm:touch-pan-y",
);

/** Standard stacked header for questionnaire / review steps. */
export const iaspStepHeaderClass = cn(
  dialogHeaderShellClass,
  "flex-col items-stretch gap-3",
);

/** Back + primary action footer row (red flags, review, etc.). */
export const iaspStepNavFooterClass = cn(
  dialogFooterShellClass,
  "flex-row items-center justify-between gap-3 bg-background py-4",
);

/** Centered results step header. */
export const iaspResultsHeaderClass = cn(
  dialogHeaderShellClass,
  "flex-col items-center gap-2 border-b-0 pb-0 text-center sm:pb-0",
);

/** Shared motion easing curve for IAS page and modal animations. */
export const iaspMotionEase = [0.22, 1, 0.36, 1] as const;

/** Progress track inside modal headers. */
export const iaspProgressTrackClass = cn(
  radius.full,
  "h-2 w-full overflow-hidden bg-muted",
);

/** Progress fill inside modal headers. */
export const iaspProgressFillClass = cn(
  radius.full,
  "h-full bg-primary transition-[width] duration-300 ease-out",
);

/** Selectable option row — answers and red flags (control tier inside dialog). */
export const iaspOptionCardClass = cn(
  radius.md,
  "flex w-full cursor-pointer border border-transparent bg-card outline-none transition-[border-color,box-shadow] duration-150",
  cardShadowClass,
  "hover:border-foreground/15",
  cardShadowHoverClass,
);

/** Intro stat tiles (card tier inside dialog). */
export const iaspStatCardClass = cn(
  radius.lg,
  "flex flex-col items-center gap-2 bg-card p-4 text-center",
  cardShadowClass,
);

/** Intro header badge — clinically validated protocol. */
export const iaspValidatedProtocolBadgeClass = cn(
  radius.full,
  "inline-flex items-center gap-1.5 border border-primary/20 bg-primary/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-primary",
);

/** Info / helper callout panel. */
export const iaspCalloutClass = cn(
  radius.md,
  "flex items-start gap-3 border border-info/20 bg-info-muted p-4",
);

/** Results / review section surfaces (card tier inside dialog). */
export const iaspPanelCardClass = cn(
  radius.lg,
  "bg-card",
  cardShadowClass,
);

/** Red-flag summary container on review. */
export const iaspAlertPanelClass = cn(
  radius.lg,
  "flex flex-col gap-3 border border-destructive/20 bg-destructive-muted p-4",
);

/** Answer review status chip — matches dashboard status badges. */
export const iaspAnswerBadgeClass = cn(
  statusBadgeClass,
  "shrink-0 gap-1.5 border px-2.5 py-0.5",
);

/** Red-flag chip on review. */
export const iaspRedFlagChipClass = cn(
  typo.badge,
  radius.full,
  "border border-destructive/15 bg-destructive/15 px-3 py-1 text-destructive",
);

/** Assessment results — solid filled band pill (`IaspBandBadge`). */
export const iaspBandBadgeClass = cn(
  typo.badge,
  radius.full,
  "inline-flex items-center gap-1.5 px-4 py-1.5",
);

/** Dashboard hero — muted ping badge shell (`IaspBandPingBadge`). */
export const iaspBandPingBadgeClass =
  "inline-flex h-7 items-center gap-1.75 overflow-visible rounded-md px-2.5 text-[13px] font-semibold leading-none";

/** Dashboard hero — score not yet available. */
export const iaspBandPendingBadgeClass = cn(
  statusBadgeClass,
  "gap-1.5 bg-muted text-muted-foreground",
);

/** Dropdown menu surface inside the assessment modal. */
export const iaspDropdownContentClass = cn(
  radius.md,
  "z-110 w-(--radix-dropdown-menu-trigger-width) border-border bg-card p-1.5 shadow-md",
);

/** Consistent spacing for the IAS questionnaire step. */
export const iaspQuestionStepGapClass = "gap-3";

/** Consistent horizontal + vertical padding for questionnaire regions. */
export const iaspQuestionStepPaddingClass = "px-5 py-3 sm:px-6";

/** Keyboard shortcut pill on answer options and footer hints. Hidden on mobile. */
export const iaspKeyHintClass = cn(
  radius.full,
  typo.caption,
  "hidden shrink-0 items-center border border-border bg-background px-2 py-0.5 font-medium text-foreground sm:inline-flex",
);

/** Auto-saved status badge in questionnaire footer. */
export const iaspAutoSavedBadgeClass = cn(
  radius.full,
  typo.caption,
  "inline-flex items-center gap-1.5 bg-success-muted px-2.5 py-1 font-medium text-success",
);

/** Dropdown item — nested row tier. */
export const iaspDropdownItemClass = cn(
  radius.sm,
  "cursor-pointer px-3 py-2.5",
  typo.input,
);
