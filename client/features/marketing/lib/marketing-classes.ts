import { cn } from "@/lib/utils";

/** Shared marketing Tailwind class strings — use token vars from tokens.css */

export const wrap = cn(
  "mx-auto w-[min(100%-calc(var(--gutter-mobile)*2),var(--page-max))]",
  "min-[744px]:w-[min(100%-calc(var(--gutter-tablet)*2),var(--page-max))]",
  "min-[1440px]:w-[min(100%-calc(var(--gutter-desktop)*2),var(--page-max))]",
  "min-[1920px]:w-[min(100%-calc(var(--space-80)*2),var(--page-max-wide))]",
);

export const section = cn(
  "py-[var(--section-y-sm)]",
  "min-[744px]:py-[var(--section-y)]",
);

export const sectionHead = "mx-auto mb-12 max-w-[40rem] text-center";

export const sectionHeadTitle = cn(
  "mb-4 text-[clamp(1.75rem,3.2vw,var(--type-heading-xxl-size))]",
  "font-[number:var(--type-heading-xxl-weight)] leading-[var(--type-heading-xxl-line)]",
  "tracking-[-0.02em] text-[var(--color-text-primary)]",
);

export const sectionHeadBody = cn(
  "text-[length:var(--type-body-l-size)] font-[number:var(--type-body-l-weight)]",
  "leading-[var(--type-body-l-line)] text-[var(--color-text-secondary)]",
);

export const eyebrow = cn(
  "mb-4 inline-flex items-center gap-2 uppercase",
  "text-[length:var(--type-overline-size)] font-[number:var(--type-overline-weight)]",
  "leading-[var(--type-overline-line)] tracking-[var(--type-overline-tracking)]",
  "text-[var(--color-text-brand)]",
  "before:h-0.5 before:w-6 before:rounded-full before:bg-current before:content-['']",
);

export const eyebrowCenter = "justify-center";

export const textAccent = "text-[var(--color-text-brand)]";

export const btn = cn(
  "inline-flex cursor-pointer items-center justify-center gap-2",
  "min-h-[var(--density-control-h)] rounded-full border border-transparent",
  "px-5 py-3 text-[length:var(--type-button-size)] font-[number:var(--type-button-weight)]",
  "leading-[var(--type-button-line)]",
  "transition-[background,color,border-color] duration-[var(--duration-normal)] ease-[var(--ease-out)]",
  "[&_.icon]:size-[var(--icon-s)] [&_.icon]:stroke-current [&_.icon]:text-inherit",
);

export const btnPrimary = cn(
  btn,
  "!bg-[var(--color-primary)] !text-white shadow-none",
  "hover:!bg-[var(--color-primary-hover)] hover:!text-white",
  "active:!bg-[var(--color-primary-active)] active:!text-white",
);

export const btnOutline = cn(
  btn,
  "!bg-transparent !text-[var(--color-primary)]",
  "!border-[var(--color-primary)]",
  "hover:!bg-[color-mix(in_srgb,var(--color-primary)_5%,white)] hover:!text-[var(--color-primary)] hover:!border-[var(--color-primary)]",
  "active:!bg-[color-mix(in_srgb,var(--color-primary)_8%,white)] active:!text-[var(--color-primary)]",
);

/** White outline for buttons on brand / dark surfaces. */
export const btnOutlineInverse = cn(
  btn,
  "!bg-transparent !text-white",
  "!border-white",
  "hover:!bg-white/10 hover:!text-white hover:!border-white",
  "active:!bg-white/20 active:!text-white",
);

export const card = cn(
  "rounded-[var(--radius-l)] bg-[var(--color-surface-raised)] p-6",
  "shadow-[var(--shadow-xs)]",
);

export const cardIcon = cn(
  "mb-4 flex size-14 items-center justify-center rounded-[var(--radius-m)]",
  "bg-[var(--color-primary-soft)] text-[var(--color-primary)]",
);

export const cardTitle = cn(
  "mb-2 text-[length:var(--type-heading-m-size)] font-[number:var(--type-heading-m-weight)]",
  "leading-[var(--type-heading-m-line)] text-[var(--color-text-primary)]",
);

export const cardBody = cn(
  "text-[length:var(--type-body-m-size)] leading-[var(--type-body-m-line)]",
  "text-[var(--color-text-secondary)]",
);

export const pageHero = cn(
  "relative overflow-hidden bg-[var(--color-surface)] pb-12",
  "before:pointer-events-none before:absolute before:inset-0 before:bg-[image:var(--gradient-hero)] before:content-['']",
);

export const pageHeroInner = "relative mx-auto max-w-[44rem]";

export const pageHeroTitle = cn(
  "mb-4 text-[clamp(2rem,4vw,var(--type-display-l-size))] font-[number:var(--type-display-l-weight)]",
  "leading-[1.2] tracking-[var(--type-display-l-tracking)] text-[var(--color-text-primary)]",
  "min-[744px]:leading-[var(--type-display-l-line)]",
);

export const pageHeroBody = cn(
  "text-[length:var(--type-body-l-size)] leading-[var(--type-body-l-line)]",
  "text-[var(--color-text-secondary)]",
);

export const skipLink = cn(
  "sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100]",
  "focus:rounded-full focus:bg-[var(--color-primary)] focus:px-4 focus:py-2",
  "focus:!text-white focus:shadow-[var(--shadow-m)]",
);

export const iconDefault = cn(
  "size-[var(--icon-l)] shrink-0 fill-none stroke-current",
  "[stroke-width:1.7] [stroke-linecap:round] [stroke-linejoin:round]",
);

export const visuallyHidden = "sr-only";
