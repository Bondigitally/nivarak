import { cn } from "@/lib/utils";

/** Hero card wash — subtle neutral lift on white card */
export const heroPlumWashSurfaceClass =
  "bg-[linear-gradient(225deg,var(--background)_0%,var(--card)_55%)]";

/** Shell canvas — paint on the non-scrolling frame so the fill stays viewport-fixed */
export const shellCanvasClass = "bg-background";

/**
 * Sidebar + main workspace share one row inside `.protected-shell`’s outer gutter.
 * Height comes from the shell flex column (`100dvh` minus padding).
 */
export const shellInnerFrameClass =
  "relative flex min-h-0 w-full flex-1 flex-row items-stretch overflow-hidden";

/** @deprecated Use `shellInnerFrameClass` — workspace sits in the flex row without absolute inset. */
export const shellMainWorkspaceInsetClass = shellInnerFrameClass;

/**
 * Outermost main content shell — 24px radius on lg+, clips page chrome to the curve.
 * Mobile: flush to viewport (drawer sidebar).
 */
/** Matches `shellMainWorkspaceClass` outer radius on lg — pair with inset right drawers. */
export const shellWorkspaceRadiusClass = "lg:rounded-[1.5rem]";

export const shellMainWorkspaceClass = cn(
  "shell-main-workspace relative flex h-full min-h-0 w-full flex-1 flex-col overflow-hidden bg-card",
  "border-0 outline-none ring-0 shadow-none",
  shellWorkspaceRadiusClass,
);

/** Unified shell backdrop (sidebar + workspace) for inset drawers. */
export const DASHBOARD_SHELL_DRAWER_OVERLAY_ROOT_ID =
  "dashboard-shell-drawer-overlay-root";

export const dashboardShellDrawerOverlayHostClass =
  "pointer-events-none absolute inset-0 z-[100]";

/**
 * Inset panel host — sibling of `.shell-main-workspace` so `overflow-hidden`
 * on the workspace card does not clip the floating drawer.
 */
export const DASHBOARD_WORKSPACE_DRAWER_PANEL_ROOT_ID =
  "dashboard-workspace-drawer-panel-root";

export const dashboardWorkspaceDrawerPanelHostClass =
  "pointer-events-none absolute inset-0 z-[110] overflow-visible";

/** 12px inset · 16px panel radius · light floating elevation */
export const dashboardWorkspaceDrawerPanelClass = cn(
  "pointer-events-auto absolute top-3 right-3 bottom-3 flex w-[min(100%,24rem)] max-w-xl flex-col gap-0",
  "overflow-hidden rounded-2xl border-0 bg-card p-0",
  "shadow-[0_8px_30px_rgba(17,24,39,0.12),0_2px_8px_rgba(17,24,39,0.06)]",
  "data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right",
);

export const dashboardShellDrawerOverlayClass =
  "pointer-events-auto absolute inset-0 bg-[rgba(17,24,39,0.28)] backdrop-blur-[3px]";

/** Flex host for route chrome (header + scroll body). */
export const shellMainContentHostClass =
  "flex min-h-0 flex-1 flex-col overflow-hidden";

/** Single primary scrollport for dashboard page body (below AppTopBar). */
export const shellPageChromeClass =
  "flex min-h-0 flex-1 flex-col overflow-hidden bg-card font-sans";

export const shellPageScrollClass =
  "flex min-h-0 flex-1 flex-col overflow-x-hidden overflow-y-auto overscroll-y-contain";

export const sidebarNavActiveSurfaceClass =
  "border border-sidebar-active-border bg-sidebar-active-bg shadow-[var(--sidebar-active-shadow,none)] hover:bg-sidebar-active-bg active:bg-sidebar-active-bg";

/** Shared row — sidebar header/footer + AppTopBar (`--shell-chrome-header-height`) */
export const shellChromeRowClass = "shell-chrome-header-row";

/** Top bar — sits inside rounded main workspace */
export const shellHeaderChromeClass = cn(
  "shell-header-chrome",
  shellChromeRowClass,
  "box-border bg-transparent",
);

export const shellHeaderScrolledClass = "shell-header-chrome--scrolled";

/** Brand row — suppress focus rings on logo/close; nav items keep theirs */
export const sidebarHeaderClass = cn(
  shellChromeRowClass,
  "relative box-border",
  "[&_a]:outline-none [&_a]:focus:outline-none [&_a]:focus-visible:outline-none [&_a]:focus-visible:ring-0",
  "[&_button]:outline-none [&_button]:focus:outline-none [&_button]:focus-visible:outline-none [&_button]:focus-visible:ring-0",
);

export const sidebarFooterClass = shellChromeRowClass;

/** Collapsed-rail control — 40×40px, matches expanded nav row radius */
export const sidebarRailHitClass =
  "box-border flex size-10 shrink-0 items-center justify-center rounded-lg";
