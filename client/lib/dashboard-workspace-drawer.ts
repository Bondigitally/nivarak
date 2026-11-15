import { useLayoutEffect, useSyncExternalStore } from "react";
import {
  DASHBOARD_SHELL_DRAWER_OVERLAY_ROOT_ID,
  DASHBOARD_WORKSPACE_DRAWER_PANEL_ROOT_ID,
} from "@/components/layout/shell-chrome";

export type SheetDock = "viewport" | "workspace";

export function getDashboardShellDrawerOverlayContainer(): HTMLElement | null {
  if (typeof document === "undefined") return null;
  return document.getElementById(DASHBOARD_SHELL_DRAWER_OVERLAY_ROOT_ID);
}

export function getDashboardWorkspaceDrawerPanelContainer(): HTMLElement | null {
  if (typeof document === "undefined") return null;
  return document.getElementById(DASHBOARD_WORKSPACE_DRAWER_PANEL_ROOT_ID);
}

function subscribeDashboardDrawerRoots(onStoreChange: () => void) {
  // Roots are mounted with the protected shell; notify once after hydration.
  queueMicrotask(onStoreChange);
  return () => {};
}

function useDashboardDrawerRoot(
  read: () => HTMLElement | null,
): HTMLElement | null {
  return useSyncExternalStore(subscribeDashboardDrawerRoots, read, () => null);
}

export function useDashboardWorkspaceDrawerLayers(enabled: boolean): {
  overlayContainer: HTMLElement | null;
  panelContainer: HTMLElement | null;
  ready: boolean;
} {
  const overlayRoot = useDashboardDrawerRoot(
    getDashboardShellDrawerOverlayContainer,
  );
  const panelRoot = useDashboardDrawerRoot(
    getDashboardWorkspaceDrawerPanelContainer,
  );
  const overlayContainer = enabled ? overlayRoot : null;
  const panelContainer = enabled ? panelRoot : null;

  return {
    overlayContainer,
    panelContainer,
    ready: Boolean(overlayContainer && panelContainer),
  };
}

/** Locks the dashboard page scrollport while an inset workspace drawer is open. */
export function useLockDashboardPageScroll(lock: boolean) {
  useLayoutEffect(() => {
    if (!lock) return;
    const scrollRoot = document.querySelector<HTMLElement>(
      "[data-dashboard-scroll]",
    );
    if (!scrollRoot) return;
    const previous = scrollRoot.style.overflow;
    scrollRoot.style.overflow = "hidden";
    return () => {
      if (previous) {
        scrollRoot.style.overflow = previous;
      } else {
        scrollRoot.style.removeProperty("overflow");
      }
    };
  }, [lock]);
}
