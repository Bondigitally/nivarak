import { statusBadgeClass } from "@/features/dashboard/data/dashboard-styles";
import { radius } from "@/lib/tokens/radius";
import { typo } from "@/lib/tokens/typography";
import { cn } from "@/lib/utils";

/** Shared max-width for every IAS-P assessment modal step. */
export const iaspModalShellWidthClass = "max-w-2xl";

/** Shared motion easing curve for IAS-P page and modal animations. */
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
  "flex w-full cursor-pointer border border-border bg-card outline-none transition-colors hover:bg-background",
);

/** Intro stat tiles (card tier inside dialog). */
export const iaspStatCardClass = cn(
  radius.lg,
  "flex flex-col items-center gap-2 border border-border bg-card p-4 text-center",
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
export const iaspPanelCardClass = cn(radius.lg, "border border-border bg-card");

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

/** Risk band pill on results. */
export const iaspBandBadgeClass = cn(
  typo.badge,
  radius.full,
  "inline-flex items-center gap-1.5 px-4 py-1.5",
);

/** Dropdown menu surface inside the assessment modal. */
export const iaspDropdownContentClass = cn(
  radius.md,
  "z-110 w-(--radix-dropdown-menu-trigger-width) border-border bg-card p-1.5 shadow-md",
);

/** Consistent spacing for the IAS-P questionnaire step. */
export const iaspQuestionStepGapClass = "gap-3";

/** Consistent horizontal + vertical padding for questionnaire regions. */
export const iaspQuestionStepPaddingClass = "px-5 py-3 sm:px-6";

/** Keyboard shortcut pill on answer options and footer hints. */
export const iaspKeyHintClass = cn(
  radius.full,
  typo.caption,
  "inline-flex shrink-0 items-center border border-border bg-background px-2 py-0.5 font-medium text-foreground",
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
