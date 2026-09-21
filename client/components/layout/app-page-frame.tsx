"use client";

import type { ReactNode } from "react";
import { AppTopBar } from "@/components/layout/app-top-bar";
import { useSidebar } from "@/components/layout/sidebar-context";
import { useUserRole } from "@/components/layout/user-role-context";
import { SearchShortcutHint } from "@/features/dashboard/components/SpotlightSearch";
import { useEffect, useState } from "react";
import { SpotlightSearch } from "@/features/dashboard/components/SpotlightSearch";
import { getPageFrameConfig } from "@/lib/auth/page-frame-config";

export function AppPageFrame({
  children,
  onAddPatient,
}: {
  children: ReactNode;
  onAddPatient?: () => void;
}) {
  const { role } = useUserRole();
  const frameConfig = getPageFrameConfig(role);
  const { openBookVisit } = useSidebar();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (!frameConfig.enableSpotlight) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (!(event.metaKey || event.ctrlKey) || event.key.toLowerCase() !== "k") return;
      if (event.repeat) return;
      event.preventDefault();
      setOpen((current) => !current);
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [frameConfig.enableSpotlight]);

  useEffect(() => {
    if (open) return;
    const id = window.setTimeout(() => setQuery(""), 0);
    return () => window.clearTimeout(id);
  }, [open]);

  const primaryAction =
    frameConfig.primaryAction.action === "addPatient"
      ? {
          label: frameConfig.primaryAction.label,
          icon: frameConfig.primaryAction.icon,
          onClick: onAddPatient,
        }
      : {
          label: frameConfig.primaryAction.label,
          icon: frameConfig.primaryAction.icon,
          onClick: openBookVisit,
        };

  return (
    <div className="font-sans">
      <AppTopBar
        searchPlaceholder={frameConfig.searchPlaceholder}
        searchAriaLabel={frameConfig.searchAriaLabel}
        onSearchClick={frameConfig.enableSpotlight ? () => setOpen(true) : undefined}
        searchAriaProps={
          frameConfig.enableSpotlight
            ? {
                "aria-haspopup": "dialog",
                "aria-expanded": open,
                "aria-keyshortcuts": "Meta+K Control+K",
              }
            : undefined
        }
        searchHint={
          frameConfig.enableSpotlight ? (
            <SearchShortcutHint />
          ) : (
            <span className="hidden shrink-0 items-center gap-1 rounded-full border border-border bg-background px-2 py-0.5 text-[11px] font-medium leading-4 text-muted-foreground sm:flex">
              <span>⌘</span>
              <span>K</span>
            </span>
          )
        }
        primaryAction={primaryAction}
      >
        {frameConfig.enableSpotlight ? (
          <SpotlightSearch
            open={open}
            onOpenChange={setOpen}
            query={query}
            onQueryChange={setQuery}
          />
        ) : null}
      </AppTopBar>
      {children}
    </div>
  );
}
