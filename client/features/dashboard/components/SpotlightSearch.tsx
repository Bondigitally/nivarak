"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react";
import {
  CalendarAdd01Icon,
  Cancel01Icon,
  CommandIcon,
  File01Icon,
  HealthIcon,
  Add01Icon,
  Search01Icon,
  UserMultiple02Icon,
} from "@hugeicons/core-free-icons";
import { typo } from "@/lib/tokens/typography";
import { cn } from "@/lib/utils";
import { dashboardSearchBarClass, dashboardSearchBarIconClass, searchShortcutKeyClass } from "../data/dashboard-styles";
import { ICON_SIZE, ICON_STROKE } from "@/lib/icons";

export function SearchShortcutHint() {
  return (
    <span
      className={cn(
        typo.label,
        "hidden h-9 w-fit shrink-0 items-center gap-0.5 rounded-full px-2.5 sm:flex",
        searchShortcutKeyClass,
      )}
      aria-hidden
    >
      <HugeiconsIcon icon={CommandIcon} size={12} strokeWidth={1.75} color="currentColor" />
      <HugeiconsIcon icon={Add01Icon} size={12} strokeWidth={1.75} color="currentColor" />
      K
    </span>
  );
}

const SPRING = { type: "spring", stiffness: 520, damping: 36, mass: 0.75 } as const;
const FADE = { duration: 0.18, ease: [0.22, 1, 0.36, 1] as const };

type SpotlightItem = {
  id: string;
  label: string;
  hint: string;
  href: string;
  icon: IconSvgElement;
};

const SPOTLIGHT_ITEMS: SpotlightItem[] = [
  {
    id: "patients",
    label: "Patients",
    hint: "Care team and residents",
    href: "/care-team",
    icon: UserMultiple02Icon,
  },
  {
    id: "vitals",
    label: "Vitals",
    hint: "Blood pressure and heart rate",
    href: "/health/vitals",
    icon: HealthIcon,
  },
  {
    id: "reports",
    label: "Reports",
    hint: "Health records and documents",
    href: "/health/records",
    icon: File01Icon,
  },
  {
    id: "appointments",
    label: "Book appointment",
    hint: "Schedule a visit",
    href: "/dashboard",
    icon: CalendarAdd01Icon,
  },
];

export function SpotlightSearch({
  open,
  onOpenChange,
  query,
  onQueryChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  query: string;
  onQueryChange: (query: string) => void;
}) {
  const router = useRouter();
  const reducedMotion = useReducedMotion();
  const inputRef = useRef<HTMLInputElement>(null);
  const [mounted, setMounted] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const hasQuery = Boolean(query.trim());

  const results = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return SPOTLIGHT_ITEMS;
    return SPOTLIGHT_ITEMS.filter(
      (item) =>
        item.label.toLowerCase().includes(needle) || item.hint.toLowerCase().includes(needle),
    );
  }, [query]);

  useEffect(() => {
    const id = window.setTimeout(() => setMounted(true), 0);
    return () => window.clearTimeout(id);
  }, []);

  useEffect(() => {
    const id = window.setTimeout(() => setActiveIndex(0), 0);
    return () => window.clearTimeout(id);
  }, [query, open]);

  useEffect(() => {
    if (!open) return;
    const id = window.requestAnimationFrame(() => inputRef.current?.focus());
    return () => window.cancelAnimationFrame(id);
  }, [open]);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onOpenChange(false);
        return;
      }

      if (event.key === "ArrowDown") {
        event.preventDefault();
        setActiveIndex((index) => (results.length === 0 ? 0 : (index + 1) % results.length));
        return;
      }

      if (event.key === "ArrowUp") {
        event.preventDefault();
        setActiveIndex((index) =>
          results.length === 0 ? 0 : (index - 1 + results.length) % results.length,
        );
        return;
      }

      if (event.key === "Enter" && results[activeIndex]) {
        event.preventDefault();
        router.push(results[activeIndex].href);
        onOpenChange(false);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, results, activeIndex, onOpenChange, router]);

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {open ? (
        <motion.div key="spotlight" className="fixed inset-0 z-50" initial={false} exit={{ opacity: 1 }}>
          <motion.button
            type="button"
            aria-label="Close search"
            className="absolute inset-0 bg-black/40 backdrop-blur-[1px]"
            initial={reducedMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={FADE}
            onClick={() => onOpenChange(false)}
          />

          <div className="pointer-events-none absolute inset-0 flex items-start justify-center px-4 pt-[18vh]">
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-label="Search"
              initial={reducedMotion ? false : { opacity: 0, scale: 0.96, y: -8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98, y: -6 }}
              transition={reducedMotion ? { duration: 0 } : SPRING}
              className="pointer-events-auto flex h-fit w-120 max-w-full origin-top flex-col items-stretch gap-2"
            >
              <div className={cn(dashboardSearchBarClass, "h-dash-control w-full max-w-full flex-none")}>
                <HugeiconsIcon
                  icon={Search01Icon}
                  size={ICON_SIZE}
                  strokeWidth={ICON_STROKE}
                  color="currentColor"
                  className={dashboardSearchBarIconClass}
                absoluteStrokeWidth />
                <input
                  ref={inputRef}
                  type="search"
                  value={query}
                  onChange={(event) => onQueryChange(event.target.value)}
                  placeholder="Search patients, vitals, reports…"
                  className={cn(
                    typo.input,
                    "h-full min-w-0 flex-1 bg-transparent outline-none placeholder:text-placeholder [&::-webkit-search-cancel-button]:hidden",
                  )}
                />
                {hasQuery ? (
                  <button
                    type="button"
                    aria-label="Clear search"
                    onClick={() => onQueryChange("")}
                    className="flex size-9 shrink-0 items-center justify-center rounded-full text-muted-foreground hover:bg-accent"
                  >
                    <HugeiconsIcon icon={Cancel01Icon} size={ICON_SIZE} strokeWidth={ICON_STROKE} color="currentColor" absoluteStrokeWidth />
                  </button>
                ) : (
                  <SearchShortcutHint />
                )}
              </div>

              <motion.div
                initial={reducedMotion ? false : { opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={FADE}
                className="overflow-hidden rounded-md border border-border bg-card shadow-[0_8px_32px_rgba(17,24,39,0.12)]"
              >
                <p className={cn(typo.overline, "px-4 pt-3 pb-1")}>
                  {hasQuery ? "Results" : "Suggested"}
                </p>
                {results.length === 0 ? (
                  <p className={cn(typo.bodyM, "px-5 py-3 text-center")}>No matching results</p>
                ) : (
                  <ul className="p-1.5 pt-0" role="listbox">
                    {results.map((item, index) => {
                      const active = index === activeIndex;
                      return (
                        <li key={item.id} role="option" aria-selected={active}>
                          <button
                            type="button"
                            onMouseEnter={() => setActiveIndex(index)}
                            onClick={() => {
                              router.push(item.href);
                              onOpenChange(false);
                            }}
                            className={cn(
                              "flex w-full items-center gap-3 rounded-sm px-3 py-2 text-left transition-colors",
                              active
                                ? "bg-muted"
                                : "hover:bg-accent",
                            )}
                          >
                            <span className="flex size-9 shrink-0 items-center justify-center rounded-full border border-border bg-background text-muted-foreground">
                              <HugeiconsIcon
                                icon={item.icon}
                                size={ICON_SIZE}
                                strokeWidth={ICON_STROKE}
                                color="currentColor"
                              absoluteStrokeWidth />
                            </span>
                            <span className="min-w-0 flex-1">
                              <span className={cn(typo.button, "block truncate text-foreground")}>
                                {item.label}
                              </span>
                              <span className={cn(typo.caption, "block truncate")}>{item.hint}</span>
                            </span>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </motion.div>
            </motion.div>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>,
    document.body,
  );
}
