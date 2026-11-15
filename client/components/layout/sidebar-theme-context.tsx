"use client";

import {
  createContext,
  useCallback,
  useContext,
  useLayoutEffect,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import {
  applySidebarThemeToDocument,
  getSystemSidebarTheme,
  readStoredSidebarThemePreference,
  resolveSidebarTheme,
  SIDEBAR_THEME_PREFERENCE_DEFAULT,
  SIDEBAR_THEME_STORAGE_KEY,
  type SidebarTheme,
  type SidebarThemePreference,
} from "@/lib/sidebar-theme";

const SIDEBAR_THEME_CHANGE_EVENT = "nivarak-sidebar-theme";

type SidebarThemeContextValue = {
  /** Resolved value for `data-sidebar-theme`. */
  sidebarTheme: SidebarTheme;
  sidebarThemePreference: SidebarThemePreference;
  setSidebarThemePreference: (theme: SidebarThemePreference) => void;
};

const SidebarThemeContext = createContext<SidebarThemeContextValue | null>(
  null,
);

function subscribeSystemSidebarTheme(onStoreChange: () => void) {
  const mq = window.matchMedia("(prefers-color-scheme: dark)");
  const sync = () => onStoreChange();
  mq.addEventListener("change", sync);
  return () => mq.removeEventListener("change", sync);
}

function getSystemSidebarThemeSnapshot(): SidebarTheme {
  return getSystemSidebarTheme();
}

function getSystemSidebarThemeServerSnapshot(): SidebarTheme {
  return "light";
}

function useSystemSidebarTheme(): SidebarTheme {
  return useSyncExternalStore(
    subscribeSystemSidebarTheme,
    getSystemSidebarThemeSnapshot,
    getSystemSidebarThemeServerSnapshot,
  );
}

function subscribeSidebarThemePreference(onStoreChange: () => void) {
  const onStorage = (event: StorageEvent) => {
    if (event.key === SIDEBAR_THEME_STORAGE_KEY || event.key === null) {
      onStoreChange();
    }
  };
  const onLocalChange = () => onStoreChange();
  window.addEventListener("storage", onStorage);
  window.addEventListener(SIDEBAR_THEME_CHANGE_EVENT, onLocalChange);
  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(SIDEBAR_THEME_CHANGE_EVENT, onLocalChange);
  };
}

function getSidebarThemePreferenceSnapshot(): SidebarThemePreference {
  return readStoredSidebarThemePreference();
}

function getSidebarThemePreferenceServerSnapshot(): SidebarThemePreference {
  return SIDEBAR_THEME_PREFERENCE_DEFAULT;
}

function useSidebarThemePreference(): SidebarThemePreference {
  return useSyncExternalStore(
    subscribeSidebarThemePreference,
    getSidebarThemePreferenceSnapshot,
    getSidebarThemePreferenceServerSnapshot,
  );
}

export function SidebarThemeProvider({ children }: { children: ReactNode }) {
  const sidebarThemePreference = useSidebarThemePreference();
  const systemTheme = useSystemSidebarTheme();

  const sidebarTheme = useMemo((): SidebarTheme => {
    if (sidebarThemePreference === "system") return systemTheme;
    return resolveSidebarTheme(sidebarThemePreference);
  }, [sidebarThemePreference, systemTheme]);

  useLayoutEffect(() => {
    applySidebarThemeToDocument(sidebarTheme);
  }, [sidebarTheme]);

  const setSidebarThemePreference = useCallback(
    (theme: SidebarThemePreference) => {
      try {
        localStorage.setItem(SIDEBAR_THEME_STORAGE_KEY, theme);
      } catch {
        /* storage unavailable */
      }
      window.dispatchEvent(new Event(SIDEBAR_THEME_CHANGE_EVENT));
      applySidebarThemeToDocument(resolveSidebarTheme(theme));
    },
    [],
  );

  const value = useMemo(
    () => ({
      sidebarTheme,
      sidebarThemePreference,
      setSidebarThemePreference,
    }),
    [sidebarTheme, sidebarThemePreference, setSidebarThemePreference],
  );

  return (
    <SidebarThemeContext.Provider value={value}>
      {children}
    </SidebarThemeContext.Provider>
  );
}

export function useSidebarTheme() {
  const ctx = useContext(SidebarThemeContext);
  if (!ctx) {
    throw new Error("useSidebarTheme must be used within SidebarThemeProvider");
  }
  return ctx;
}
