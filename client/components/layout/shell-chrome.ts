/** IAS dashboard hero — subtle neutral lift on white card (no brand wash) */
export const heroPlumWashSurfaceClass =
  "bg-[linear-gradient(225deg,var(--background)_0%,var(--card)_55%)]";

/**
 * Protected shell canvas — cool neutral gray.
 * Paint on the non-scrolling frame so the fill stays viewport-fixed.
 */
export const shellCanvasClass = "bg-background";

/** Sidebar active nav — neutral fill + thin edge (icon carries brand color) */
export const sidebarNavActiveSurfaceClass =
  "border-border bg-muted hover:bg-muted";

/** Shared chrome row height — sidebar header/footer + main AppTopBar (64px / Space-64) */
export const shellChromeRowClass = "h-16 min-h-16 shrink-0";

/** Main top bar — matches shell canvas start; panel frame on lg (no right edge) */
export const shellHeaderChromeClass =
  `${shellChromeRowClass} border-b border-transparent bg-background transition-[border-color] duration-150 lg:border-l lg:border-t lg:border-l-sidebar-border lg:border-t-sidebar-border`;

/** Bottom hairline when the dashboard main has scrolled */
export const shellHeaderScrolledClass = "border-b-divider";

/** Sidebar brand row */
export const sidebarHeaderClass = shellChromeRowClass;

/** Sidebar profile footer — matches header + main top bar height */
export const sidebarFooterClass = shellChromeRowClass;
