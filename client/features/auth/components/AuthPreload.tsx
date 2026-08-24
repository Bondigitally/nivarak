'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Spinner } from '@/components/ui/spinner';

type AuthPreloadContextValue = {
  ready: boolean;
  markHeroReady: () => void;
  markCardReady: () => void;
};

const AuthPreloadContext = createContext<AuthPreloadContextValue | null>(null);

export function useAuthPreload() {
  return useContext(AuthPreloadContext);
}

export function AuthPreloadProvider({
  waitForHero,
  bootstrapped = true,
  children,
}: {
  /** When true, first hero slide must load before reveal */
  waitForHero: boolean;
  /** False until layout knows viewport (split) — avoids a ready flash */
  bootstrapped?: boolean;
  children: React.ReactNode;
}) {
  const [heroReady, setHeroReady] = useState(!waitForHero);
  const [cardReady, setCardReady] = useState(false);
  const heroSatisfied = useRef(false);
  const cardSatisfied = useRef(false);

  // When waitForHero toggles on, reset the gate. When it toggles off the
  // initial value already covers the ready state, so no synchronous setState
  // is needed and we avoid the cascading-render lint warning.
  useEffect(() => {
    if (waitForHero && !heroSatisfied.current) {
      setHeroReady(false);
    }
  }, [waitForHero]);

  const markHeroReady = useCallback(() => {
    heroSatisfied.current = true;
    setHeroReady(true);
  }, []);

  const markCardReady = useCallback(() => {
    if (cardSatisfied.current) return;
    cardSatisfied.current = true;
    setCardReady(true);
  }, []);

  const ready = bootstrapped && heroReady && cardReady;

  const value = useMemo(
    () => ({ ready, markHeroReady, markCardReady }),
    [ready, markHeroReady, markCardReady],
  );

  return (
    <AuthPreloadContext.Provider value={value}>
      {children}
      <AnimatePresence>
        {!ready && (
          <motion.div
            key="auth-preload"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-background"
            aria-busy
            aria-live="polite"
          >
            <Spinner className="size-9" label="Loading sign-in" />
          </motion.div>
        )}
      </AnimatePresence>
    </AuthPreloadContext.Provider>
  );
}
