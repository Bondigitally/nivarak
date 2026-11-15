"use client";

import {
  createContext,
  useCallback,
  useContext,
  useLayoutEffect,
  useMemo,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import {
  applySidebarThemeToDocument,
  getSystemSidebarTheme,
  readStoredSidebarThemePreference,
  resolveSidebarTheme,
  resolveStoredSidebarTheme,
  SIDEBAR_THEME_PREFERENCE_DEFAULT,
  SIDEBAR_THEME_STORAGE_KEY,
  type SidebarTheme,
  type SidebarThemePreference,
} from "@/lib/sidebar-theme";

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

export function SidebarThemeProvider({ children }: { children: ReactNode }) {
  const [sidebarThemePreference, setSidebarThemePreferenceState] =
    useState<SidebarThemePreference>(SIDEBAR_THEME_PREFERENCE_DEFAULT);
  const [preferenceReady, setPreferenceReady] = useState(false);

  useLayoutEffect(() => {
    setSidebarThemePreferenceState(readStoredSidebarThemePreference());
    setPreferenceReady(true);
  }, []);

  const systemTheme = useSystemSidebarTheme();

  const sidebarTheme = useMemo((): SidebarTheme => {
    if (typeof window !== "undefined" && !preferenceReady) {
      return resolveStoredSidebarTheme();
    }
    if (sidebarThemePreference === "system") return systemTheme;
    return resolveSidebarTheme(sidebarThemePreference);
  }, [sidebarThemePreference, systemTheme, preferenceReady]);

  useLayoutEffect(() => {
    applySidebarThemeToDocument(sidebarTheme);
  }, [sidebarTheme]);

  const setSidebarThemePreference = useCallback(
    (theme: SidebarThemePreference) => {
      setSidebarThemePreferenceState(theme);
      try {
        localStorage.setItem(SIDEBAR_THEME_STORAGE_KEY, theme);
      } catch {
        /* storage unavailable */
      }
      const resolved = resolveSidebarTheme(theme);
      applySidebarThemeToDocument(resolved);
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
