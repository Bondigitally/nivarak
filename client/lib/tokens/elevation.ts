/** Soft card elevation — neutral hairline + ambient lift on cool-gray canvas */

export const cardShadowClass =
  "shadow-[0_0_0_1px_rgba(17,24,39,0.06),0_1px_2px_rgba(17,24,39,0.04),0_2px_6px_rgba(17,24,39,0.04)]";

export const cardShadowHoverClass =
  "hover:shadow-[0_0_0_1px_rgba(17,24,39,0.08),0_1px_3px_rgba(17,24,39,0.055),0_4px_10px_rgba(17,24,39,0.055)]";

/** Framer / inline box-shadow values matching `cardShadowClass` */
export const cardShadowCss =
  "0 0 0 1px rgba(17,24,39,0.06), 0 1px 2px rgba(17,24,39,0.04), 0 2px 6px rgba(17,24,39,0.04)";

export const cardShadowHoverCss =
  "0 0 0 1px rgba(17,24,39,0.08), 0 1px 3px rgba(17,24,39,0.055), 0 4px 10px rgba(17,24,39,0.055)";

/** Elevated hover shadow without translate — list rows, appointment items, etc. */
export const cardElevatedHoverShadowClass =
  "hover:shadow-[0_0_0_1px_rgba(17,24,39,0.09),0_4px_8px_rgba(17,24,39,0.06),0_12px_24px_rgba(17,24,39,0.08)]";

/** Snappy lift — CategoryCard, vitals KPI cards, and similar interactive surfaces. */
export const cardLiftTransitionClass =
  "transform-gpu will-change-transform motion-safe:transition-[transform_0.22s_cubic-bezier(0.22,1,0.36,1),box-shadow_0.22s_ease]";

export const cardLiftHoverClass = `motion-safe:hover:-translate-y-1.5 ${cardElevatedHoverShadowClass}`;

export const cardLiftActiveClass =
  "motion-safe:active:-translate-y-0.5 motion-safe:active:shadow-[0_0_0_1px_rgba(17,24,39,0.06),0_1px_2px_rgba(17,24,39,0.04),0_2px_6px_rgba(17,24,39,0.04)]";

/**
 * Soft brand wash on hover — CategoryCard, vitals KPIs, and matching tiles.
 * Pair with `group` + `relative isolate overflow-hidden` on the surface.
 */
export const cardLiftHoverWashClass =
  "pointer-events-none absolute inset-0 z-0 opacity-0 " +
  "bg-linear-to-br from-primary/6 via-muted to-transparent " +
  "motion-safe:transition-opacity motion-safe:duration-220 motion-safe:ease-out " +
  "motion-safe:group-hover:opacity-100";
