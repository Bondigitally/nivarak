/** Shared Motion timing for marketing entrance animations. */

export const marketingEase = [0.22, 1, 0.36, 1] as const;

export const marketingReveal = {
  duration: 0.45,
  offset: 20,
  blur: "6px",
  inViewMargin: "-10% 0px -8% 0px" as const,
};

export const marketingStagger = {
  staggerChildren: 0.08,
  delayChildren: 0.04,
  itemDuration: 0.4,
  itemOffset: 16,
};

/** Hero-only: opacity + translate, no blur (blur is expensive with images). */
export const marketingHero = {
  staggerChildren: 0.05,
  delayChildren: 0.02,
  itemDuration: 0.32,
  itemOffset: 12,
  visualDelay: 0.12,
  visualDuration: 0.4,
  visualOffset: 20,
};
