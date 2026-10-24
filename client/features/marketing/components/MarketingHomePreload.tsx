"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Spinner } from "@/components/ui/spinner";
import { marketingEase } from "@/features/marketing/lib/motion";

type MarketingHomePreloadValue = {
  ready: boolean;
  /** Call when the hero app preview has fully painted. */
  markHeroReady: () => void;
};

const MarketingHomePreloadContext =
  createContext<MarketingHomePreloadValue | null>(null);

export function useMarketingHomePreload() {
  return useContext(MarketingHomePreloadContext);
}

const FAILSAFE_MS = 10_000;
const LOADER_EXIT_MS = 0.4;

/**
 * Full-site loader for the marketing home page.
 * Stays up until the hero screen preview reports ready, then fades out
 * while the site chrome + main fade in together.
 */
export function MarketingHomePreload({ children }: { children: ReactNode }) {
  const [heroReady, setHeroReady] = useState(false);
  const satisfied = useRef(false);
  const reduceMotion = useReducedMotion();

  const markHeroReady = useCallback(() => {
    if (satisfied.current) return;
    satisfied.current = true;
    setHeroReady(true);
  }, []);

  // Failsafe — never block the site if the preview never reports.
  useEffect(() => {
    const timer = window.setTimeout(markHeroReady, FAILSAFE_MS);
    return () => window.clearTimeout(timer);
  }, [markHeroReady]);

  // Drive CSS reveal on the marketing shell (header / main / footer).
  useEffect(() => {
    const site = document.querySelector(".marketing-site");
    if (!(site instanceof HTMLElement)) return;
    site.dataset.homeReveal = heroReady ? "ready" : "pending";
    return () => {
      delete site.dataset.homeReveal;
    };
  }, [heroReady]);

  // Lock scroll while the overlay is up.
  useEffect(() => {
    if (heroReady) return;
    const prev = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";
    return () => {
      document.documentElement.style.overflow = prev;
    };
  }, [heroReady]);

  const value = useMemo(
    () => ({ ready: heroReady, markHeroReady }),
    [heroReady, markHeroReady],
  );

  return (
    <MarketingHomePreloadContext.Provider value={value}>
      {children}
      <AnimatePresence>
        {!heroReady ? (
          <motion.div
            key="marketing-home-preload"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{
              duration: reduceMotion ? 0 : LOADER_EXIT_MS,
              ease: marketingEase,
            }}
            className="fixed inset-0 z-100 flex items-center justify-center bg-background"
            aria-busy
            aria-live="polite"
            aria-label="Loading Nivarak"
          >
            <Spinner
              className="size-8 border-muted-foreground/25 border-t-primary"
              label="Loading site"
            />
          </motion.div>
        ) : null}
      </AnimatePresence>
    </MarketingHomePreloadContext.Provider>
  );
}
