"use client";

import { useEffect, useState } from "react";
import { useSidebarTheme } from "@/components/layout/sidebar-theme-context";
import type { SidebarThemePreference } from "@/lib/sidebar-theme";
import { ColorsIcon } from "@hugeicons/core-free-icons";
import { ChevronIcon } from "@/components/shared/ChevronIcon";
import { fieldSelectTriggerClassName } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { dashboardCardClass } from "@/features/dashboard/data/dashboard-styles";
import { typo } from "@/lib/tokens/typography";
import { cn } from "@/lib/utils";
import { SettingsSectionHeader } from "./SettingsSectionHeader";

const THEME_OPTIONS = [
  { value: "system", label: "System" },
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
] as const satisfies ReadonlyArray<{
  value: SidebarThemePreference;
  label: string;
}>;

function isSidebarThemePreference(
  value: string | undefined,
): value is SidebarThemePreference {
  return value === "system" || value === "light" || value === "dark";
}

export function AppearanceSettingsCard() {
  const { sidebarThemePreference, setSidebarThemePreference } =
    useSidebarTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const id = window.setTimeout(() => setMounted(true), 0);
    return () => window.clearTimeout(id);
  }, []);

  const selectedPreference: SidebarThemePreference = isSidebarThemePreference(
    sidebarThemePreference,
  )
    ? sidebarThemePreference
    : "system";
  const themeLabel =
    THEME_OPTIONS.find((option) => option.value === selectedPreference)?.label ??
    "System";

  return (
    <section className={cn(dashboardCardClass, "flex flex-col gap-5 p-6")}>
      <SettingsSectionHeader icon={ColorsIcon} title="Appearance" />

      <div className="flex max-w-md flex-col gap-2.5 pt-0.5">
        <label
          htmlFor="settings-appearance-theme"
          className="text-sm font-medium leading-5 text-muted-foreground"
        >
          Theme
        </label>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              id="settings-appearance-theme"
              type="button"
              disabled={!mounted}
              className={fieldSelectTriggerClassName}
            >
              <span className={cn(typo.input, "truncate")}>
                {mounted ? themeLabel : "System"}
              </span>
              <ChevronIcon direction="down" className="text-muted-foreground" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="start"
            className="min-w-(--radix-dropdown-menu-trigger-width)"
          >
            {THEME_OPTIONS.map((option) => (
              <DropdownMenuItem
                key={option.value}
                onSelect={() => setSidebarThemePreference(option.value)}
                className={cn(
                  option.value === selectedPreference &&
                    "bg-muted text-primary focus:bg-muted",
                )}
              >
                {option.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </section>
  );
}
