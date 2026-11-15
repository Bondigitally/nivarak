export const SIDEBAR_THEME_STORAGE_KEY = "nivarak-sidebar-theme";

/** Resolved chrome applied via `data-sidebar-theme`. */
export type SidebarTheme = "light" | "dark";

/** Stored user preference (includes system). */
export type SidebarThemePreference = "system" | "light" | "dark";

export const SIDEBAR_THEME_PREFERENCE_DEFAULT: SidebarThemePreference = "system";

export function isSidebarTheme(
  value: string | null | undefined,
): value is SidebarTheme {
  return value === "light" || value === "dark";
}

export function isSidebarThemePreference(
  value: string | null | undefined,
): value is SidebarThemePreference {
  return value === "system" || value === "light" || value === "dark";
}

export function getSystemSidebarTheme(): SidebarTheme {
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

export function resolveSidebarTheme(
  preference: SidebarThemePreference,
): SidebarTheme {
  if (preference === "light" || preference === "dark") return preference;
  return getSystemSidebarTheme();
}

export function readStoredSidebarThemePreference(): SidebarThemePreference {
  if (typeof window === "undefined") return SIDEBAR_THEME_PREFERENCE_DEFAULT;
  try {
    const stored = localStorage.getItem(SIDEBAR_THEME_STORAGE_KEY);
    if (isSidebarThemePreference(stored)) return stored;
    if (isSidebarTheme(stored)) return stored;
    return SIDEBAR_THEME_PREFERENCE_DEFAULT;
  } catch {
    return SIDEBAR_THEME_PREFERENCE_DEFAULT;
  }
}

/** Resolved sidebar chrome for the current preference + OS (client-only). */
export function resolveStoredSidebarTheme(): SidebarTheme {
  return resolveSidebarTheme(readStoredSidebarThemePreference());
}

export function applySidebarThemeToDocument(theme: SidebarTheme) {
  if (typeof document === "undefined") return;
  document.documentElement.setAttribute("data-sidebar-theme", theme);
}

/**
 * Runs before React so System preference respects OS on first paint.
 * Keep logic aligned with `readStoredSidebarThemePreference` + `resolveSidebarTheme`.
 */
export const SIDEBAR_THEME_BOOTSTRAP_SCRIPT = `(function(){try{var k=${JSON.stringify(SIDEBAR_THEME_STORAGE_KEY)};var p=localStorage.getItem(k);if(p!=="light"&&p!=="dark"&&p!=="system")p="system";var t=p==="light"||p==="dark"?p:(matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light");document.documentElement.setAttribute("data-sidebar-theme",t);}catch(e){}})();`;
