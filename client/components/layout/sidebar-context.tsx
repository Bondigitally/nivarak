"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

/** Expanded sidebar content width (px). Inner chrome is always this wide and clipped. */
export const SIDEBAR_WIDTH_EXPANDED = 256;
/** Collapsed icon-rail width (px). */
export const SIDEBAR_WIDTH_COLLAPSED = 56;
/** Width transition duration (ms) — keep in sync with aside `transitionDuration`. Motion/Slow. */
export const SIDEBAR_TRANSITION_MS = 320;
/**
 * Persistent sidebar from `lg` up — same split as AuthLayout.
 * Density below full size uses viewport `--ui-scale` (not inch checks).
 */
export const SIDEBAR_DESKTOP_MEDIA = "(min-width: 1024px)";

type SidebarContextValue = {
  collapsed: boolean;
  setCollapsed: (next: boolean | ((prev: boolean) => boolean)) => void;
  /** Desktop: collapse rail. Drawer: open/close sheet. */
  toggle: () => void;
  /** True when viewport is below the desktop sidebar breakpoint. */
  isDrawer: boolean;
  /** Drawer open state (ignored on desktop). */
  open: boolean;
  setOpen: (next: boolean | ((prev: boolean) => boolean)) => void;
  /** Sign-out confirmation dialog. */
  signOutOpen: boolean;
  setSignOutOpen: (next: boolean | ((prev: boolean) => boolean)) => void;
  openSignOut: () => void;
  /** Book visit modal from the top bar. */
  bookVisitOpen: boolean;
  setBookVisitOpen: (next: boolean | ((prev: boolean) => boolean)) => void;
  openBookVisit: () => void;
  /** Invite caregiver modal from care team. */
  inviteCaregiverOpen: boolean;
  setInviteCaregiverOpen: (next: boolean | ((prev: boolean) => boolean)) => void;
  openInviteCaregiver: () => void;
};

const SidebarContext = createContext<SidebarContextValue | null>(null);

export function SidebarProvider({ children }: { children: ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [open, setOpen] = useState(false);
  const [signOutOpen, setSignOutOpen] = useState(false);
  const [bookVisitOpen, setBookVisitOpen] = useState(false);
  const [inviteCaregiverOpen, setInviteCaregiverOpen] = useState(false);
  const [isDrawer, setIsDrawer] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia(SIDEBAR_DESKTOP_MEDIA);
    const sync = (matchesDesktop: boolean) => {
      setIsDrawer(!matchesDesktop);
      if (matchesDesktop) setOpen(false);
    };
    sync(mq.matches);
    const handler = (e: MediaQueryListEvent) => sync(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  const toggle = useCallback(() => {
    if (isDrawer) {
      setOpen((prev) => !prev);
      return;
    }
    setCollapsed((prev) => !prev);
  }, [isDrawer]);

  const openSignOut = useCallback(() => {
    setSignOutOpen(true);
  }, []);

  const openBookVisit = useCallback(() => {
    setBookVisitOpen(true);
  }, []);

  const openInviteCaregiver = useCallback(() => {
    setInviteCaregiverOpen(true);
  }, []);

  const value = useMemo(
    () => ({
      collapsed,
      setCollapsed,
      toggle,
      isDrawer,
      open,
      setOpen,
      signOutOpen,
      setSignOutOpen,
      openSignOut,
      bookVisitOpen,
      setBookVisitOpen,
      openBookVisit,
      inviteCaregiverOpen,
      setInviteCaregiverOpen,
      openInviteCaregiver,
    }),
    [collapsed, toggle, isDrawer, open, signOutOpen, openSignOut, bookVisitOpen, openBookVisit, inviteCaregiverOpen, openInviteCaregiver],
  );

  return (
    <SidebarContext.Provider value={value}>{children}</SidebarContext.Provider>
  );
}

export function useSidebar() {
  const ctx = useContext(SidebarContext);
  if (!ctx) {
    throw new Error("useSidebar must be used within SidebarProvider");
  }
  return ctx;
}
