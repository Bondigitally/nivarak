"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowDown01Icon, ColorsIcon } from "@hugeicons/core-free-icons";
import { fieldInputClassName } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { dashboardCardClass } from "@/features/dashboard/data/dashboard-styles";
import { ICON_SIZE, ICON_STROKE } from "@/lib/icons";
import { typo } from "@/lib/tokens/typography";
import { cn } from "@/lib/utils";
import { SettingsSectionHeader } from "./SettingsSectionHeader";

const APPEARANCE_OPTIONS = [
  { value: "system", label: "System" },
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
] as const;

type AppearanceValue = (typeof APPEARANCE_OPTIONS)[number]["value"];

function isAppearanceValue(value: string | undefined): value is AppearanceValue {
  return value === "system" || value === "light" || value === "dark";
}

export function AppearanceSettingsCard() {
  const { theme, setTheme } = useTheme();
  // `next-themes` resolves the active theme client-side only; `theme` is
  // undefined during SSR. Gate the dropdown on mount to avoid a hydration
  // mismatch between the server-rendered default ("System") and the actual
  // resolved theme on the client.
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const selected: AppearanceValue = isAppearanceValue(theme) ? theme : "system";
  const selectedLabel =
    APPEARANCE_OPTIONS.find((option) => option.value === selected)?.label ??
    "System";

  return (
    <section className={cn(dashboardCardClass, "flex flex-col gap-5 p-6")}>
      <SettingsSectionHeader icon={ColorsIcon} title="Appearance" />

      <div className="flex max-w-md flex-col gap-2.5 pt-0.5">
        <label htmlFor="settings-appearance" className="text-sm font-medium leading-5 text-muted-foreground">
          Theme
        </label>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              id="settings-appearance"
              type="button"
              disabled={!mounted}
              className={cn(
                fieldInputClassName,
                "inline-flex items-center justify-between gap-2 text-left shadow-[0_2px_4px_rgba(17,24,39,0.05)]",
              )}
            >
              <span className={cn(typo.input, "truncate")}>
                {mounted ? selectedLabel : "System"}
              </span>
              <HugeiconsIcon
                icon={ArrowDown01Icon}
                size={ICON_SIZE}
                strokeWidth={ICON_STROKE}
                color="currentColor"
                className="size-5 shrink-0 text-muted-foreground"
                absoluteStrokeWidth
              />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="start"
            className="min-w-(--radix-dropdown-menu-trigger-width)"
          >
            {APPEARANCE_OPTIONS.map((option) => (
              <DropdownMenuItem
                key={option.value}
                onSelect={() => setTheme(option.value)}
                className={cn(
                  option.value === selected &&
                    "bg-muted text-primary focus:bg-muted",
                )}
              >
                {option.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
        <p className={cn(typo.caption, "text-muted-foreground")}>
          System follows your device preference.
        </p>
      </div>
    </section>
  );
}
