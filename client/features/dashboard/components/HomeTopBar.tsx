"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Search01Icon,
  CalendarAdd01Icon,
  Notification01Icon,
  PanelRightCloseIcon,
  PanelRightOpenIcon,
  Menu01Icon,
} from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { BookVisitModal } from "@/features/appointments/components/BookVisitModal";
import { useSidebar } from "@/components/layout/sidebar-context";
import { typo } from "@/lib/tokens/typography";
import { DashboardIconButton } from "./DashboardIconButton";
import { dashboardSearchBarClass } from "../data/dashboard-styles";
import { cn } from "@/lib/utils";
import { SpotlightSearch, SearchShortcutHint } from "./SpotlightSearch";

/**
 * Page chrome: sticky header inside scrolling `main` + page body.
 */
export function DashboardPageFrame({
  notificationCount,
  children,
}: {
  notificationCount: number;
  children: ReactNode;
}) {
  return (
    <div className="font-sans">
      <HomeTopBar notificationCount={notificationCount} />
      {children}
    </div>
  );
}

function findScrollParent(node: HTMLElement | null): HTMLElement | null {
  let current = node?.parentElement ?? null;
  while (current) {
    const { overflowY } = getComputedStyle(current);
    if (overflowY === "auto" || overflowY === "scroll" || overflowY === "overlay") {
      return current;
    }
    current = current.parentElement;
  }
  return document.querySelector("[data-dashboard-scroll]");
}

export function HomeTopBar({ notificationCount }: { notificationCount: number }) {
  const { collapsed, toggle, isDrawer, open: drawerOpen } = useSidebar();
  const headerRef = useRef<HTMLElement>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [bookOpen, setBookOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (!(event.metaKey || event.ctrlKey) || event.key.toLowerCase() !== "k") return;
      if (event.repeat) return;
      event.preventDefault();
      setOpen((current) => !current);
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    if (!open) setQuery("");
  }, [open]);

  useEffect(() => {
    const root = findScrollParent(headerRef.current);
    if (!root) return;

    const sync = () => {
      const next = root.scrollTop > 4;
      setScrolled((prev) => (prev === next ? prev : next));
    };

    sync();
    root.addEventListener("scroll", sync, { passive: true });
    return () => root.removeEventListener("scroll", sync);
  }, []);

  const menuExpanded = isDrawer ? drawerOpen : !collapsed;
  const menuLabel = isDrawer
    ? drawerOpen
      ? "Close navigation"
      : "Open navigation"
    : collapsed
      ? "Open sidebar"
      : "Close sidebar";

  return (
    <TooltipProvider delayDuration={200}>
      <header
        ref={headerRef}
        className={cn(
          "relative sticky top-0 z-20 grid h-14 min-h-14 w-full grid-cols-[1fr_minmax(0,var(--max-width-dash-search))_1fr] items-center gap-dash-topbar-gap bg-[#F8F5FA] px-dash-pad-x transition-shadow duration-200 ease-out",
          scrolled && "shadow-[0_12px_24px_-10px_rgba(26,26,26,0.16)]",
        )}
      >
        <div className="justify-self-start">
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                aria-label={menuLabel}
                aria-expanded={menuExpanded}
                onClick={toggle}
                className="inline-flex size-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground"
              >
                <HugeiconsIcon
                  icon={
                    isDrawer
                      ? Menu01Icon
                      : collapsed
                        ? PanelRightOpenIcon
                        : PanelRightCloseIcon
                  }
                  size={19}
                  strokeWidth={1.75}
                  color="currentColor"
                />
              </button>
            </TooltipTrigger>
            <TooltipContent side="bottom">{menuLabel}</TooltipContent>
          </Tooltip>
        </div>

        <button
          type="button"
          aria-haspopup="dialog"
          aria-expanded={open}
          aria-keyshortcuts="Meta+K Control+K"
          aria-label="Search patients, vitals, reports"
          onClick={() => setOpen(true)}
          className={cn(dashboardSearchBarClass, "w-full min-w-0 flex-none text-left")}
        >
          <HugeiconsIcon
            icon={Search01Icon}
            size={19}
            strokeWidth={1.75}
            color="currentColor"
            className="shrink-0 text-muted-foreground"
          />
          <span className={cn(typo.bodyM, "min-w-0 flex-1 truncate text-[#9CA3AF]")}>
            Search patients, vitals, reports…
          </span>
          <SearchShortcutHint />
        </button>

        <div className="flex shrink-0 items-center justify-self-end gap-dash-topbar-gap">
          <Button
            type="button"
            className={cn(typo.button, "max-sm:px-3")}
            onClick={() => setBookOpen(true)}
          >
            <HugeiconsIcon icon={CalendarAdd01Icon} size={19} strokeWidth={1.75} color="currentColor" />
            <span className="max-sm:sr-only">Book Appointment</span>
          </Button>
          <Tooltip>
            <TooltipTrigger asChild>
              <DashboardIconButton type="button" aria-label="Notifications" className="relative">
                <HugeiconsIcon
                  icon={Notification01Icon}
                  size={19}
                  strokeWidth={1.75}
                  color="currentColor"
                />
                {notificationCount > 0 ? (
                  <span className="absolute -top-0.5 -right-0.5 flex size-4 items-center justify-center rounded-full bg-destructive text-[12px] leading-4 text-white">
                    {notificationCount}
                  </span>
                ) : null}
              </DashboardIconButton>
            </TooltipTrigger>
            <TooltipContent side="bottom">Notifications</TooltipContent>
          </Tooltip>
        </div>

        {/* Soft edge under header — visible only after content scrolls beneath */}
        <div
          aria-hidden
          className={cn(
            "pointer-events-none absolute inset-x-0 top-full h-2 transition-opacity duration-200 ease-out",
            scrolled ? "opacity-100" : "opacity-0",
          )}
          style={{
            background:
              "linear-gradient(to bottom, rgba(248, 245, 250, 0.30) 0%, rgba(248, 245, 250, 0.12) 55%, rgba(248, 245, 250, 0) 100%)",
          }}
        />
      </header>

      <SpotlightSearch open={open} onOpenChange={setOpen} query={query} onQueryChange={setQuery} />
      <BookVisitModal open={bookOpen} onOpenChange={setBookOpen} />
    </TooltipProvider>
  );
}
