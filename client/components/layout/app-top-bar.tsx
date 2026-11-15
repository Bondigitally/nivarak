"use client";

import { type ReactNode, useEffect, useState } from "react";
import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react";
import { Search01Icon, Menu01Icon } from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useSidebar } from "@/components/layout/sidebar-context";
import { typo } from "@/lib/tokens/typography";
import {
  dashboardSearchBarClass,
  dashboardSearchBarIconClass,
  dashboardSearchBarPlaceholderClass,
} from "@/lib/tokens/page-shell";
import { cn } from "@/lib/utils";
import { ICON_SIZE, ICON_STROKE } from "@/lib/icons";
import {
  shellHeaderChromeClass,
  shellHeaderScrolledClass,
} from "@/components/layout/shell-chrome";

export type AppTopBarProps = {
  searchPlaceholder: string;
  searchAriaLabel: string;
  onSearchClick?: () => void;
  searchAriaProps?: {
    "aria-haspopup"?: "dialog" | "false" | true;
    "aria-expanded"?: boolean;
    "aria-keyshortcuts"?: string;
  };
  searchHint?: ReactNode;
  primaryAction: {
    label: string;
    icon: IconSvgElement;
    onClick?: () => void;
  };
  /** Notifications / trailing chrome — owned by the feature that composes the page frame */
  endSlot?: ReactNode;
  children?: ReactNode;
};

export function AppTopBar({
  searchPlaceholder,
  searchAriaLabel,
  onSearchClick,
  searchAriaProps,
  searchHint,
  primaryAction,
  endSlot,
  children,
}: AppTopBarProps) {
  const { toggle, isDrawer, open: drawerOpen } = useSidebar();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const scrollRoot = document.querySelector<HTMLElement>(
      "[data-dashboard-scroll]",
    );
    if (!scrollRoot) return;

    const syncScrolled = () => {
      setScrolled(scrollRoot.scrollTop > 0);
    };

    syncScrolled();
    scrollRoot.addEventListener("scroll", syncScrolled, { passive: true });
    return () => scrollRoot.removeEventListener("scroll", syncScrolled);
  }, []);

  const menuLabel = drawerOpen ? "Close navigation" : "Open navigation";

  return (
    <TooltipProvider delayDuration={200}>
      <header
        className={cn(
          shellHeaderChromeClass,
          scrolled && shellHeaderScrolledClass,
          "relative z-20 flex w-full shrink-0 items-center gap-2 px-dash-pad-x md:gap-dash-topbar-gap",
        )}
      >
        {/* Below lg (drawer / tablet): chrome is content-sized so search takes
            remaining width. lg+: equal flex rails center the search. */}
        <div className="flex shrink-0 items-center justify-start lg:flex-1">
          {isDrawer ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  aria-label={menuLabel}
                  aria-expanded={drawerOpen}
                  onClick={toggle}
                  className="inline-flex size-8 shrink-0 items-center justify-center rounded-md text-muted-foreground outline-none transition-colors duration-150 hover:bg-accent hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <HugeiconsIcon
                    icon={Menu01Icon}
                    size={ICON_SIZE}
                    strokeWidth={ICON_STROKE}
                    color="currentColor"
                    absoluteStrokeWidth
                  />
                </button>
              </TooltipTrigger>
              <TooltipContent side="bottom">{menuLabel}</TooltipContent>
            </Tooltip>
          ) : null}
        </div>

        <button
          type="button"
          aria-label={searchAriaLabel}
          onClick={onSearchClick}
          className={cn(
            dashboardSearchBarClass,
            "min-w-0 w-full max-w-dash-search flex-1 text-left",
          )}
          {...searchAriaProps}
        >
          <HugeiconsIcon
            icon={Search01Icon}
            size={ICON_SIZE}
            strokeWidth={ICON_STROKE}
            color="currentColor"
            className={dashboardSearchBarIconClass}
            absoluteStrokeWidth
          />
          <span
            className={cn(
              typo.bodyM,
              dashboardSearchBarPlaceholderClass,
              "min-w-0 flex-1 truncate",
            )}
          >
            {searchPlaceholder}
          </span>
          {searchHint}
        </button>

        <div className="flex shrink-0 items-center justify-end gap-2 md:gap-dash-topbar-gap lg:flex-1">
          <Button
            type="button"
            className={cn(typo.button, "max-sm:px-3")}
            onClick={primaryAction.onClick}
          >
            <HugeiconsIcon
              icon={primaryAction.icon}
              size={ICON_SIZE}
              strokeWidth={ICON_STROKE}
              color="currentColor"
              absoluteStrokeWidth
            />
            <span className="max-sm:sr-only">{primaryAction.label}</span>
          </Button>
          {endSlot}
        </div>
      </header>

      {children}
    </TooltipProvider>
  );
}
