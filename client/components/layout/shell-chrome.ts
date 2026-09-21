/** Hero card wash — neutral lift, not brand purple */
export const heroPlumWashSurfaceClass =
  "bg-[linear-gradient(225deg,var(--background)_0%,var(--card)_55%)]";

/** Shell canvas — paint on the non-scrolling frame so the fill stays viewport-fixed */
export const shellCanvasClass = "bg-background";

export const sidebarNavActiveSurfaceClass =
  "border-sidebar-active-border bg-sidebar-active-bg hover:bg-sidebar-active-bg";

/** Shared 64px row — sidebar header/footer + AppTopBar */
export const shellChromeRowClass = "h-16 min-h-16 shrink-0";

/** Top bar — panel frame on lg (no right edge) */
export const shellHeaderChromeClass =
  `${shellChromeRowClass} border-b border-transparent bg-background transition-[border-color] duration-150 lg:border-l lg:border-t lg:border-l-sidebar-border lg:border-t-sidebar-border`;

export const shellHeaderScrolledClass = "border-b-divider";

/** Brand row — suppress focus rings on logo/close; nav items keep theirs */
export const sidebarHeaderClass = `${shellChromeRowClass} [&_a]:outline-none [&_a]:focus:outline-none [&_a]:focus-visible:outline-none [&_a]:focus-visible:ring-0 [&_button]:outline-none [&_button]:focus:outline-none [&_button]:focus-visible:outline-none [&_button]:focus-visible:ring-0`;

export const sidebarFooterClass = shellChromeRowClass;
