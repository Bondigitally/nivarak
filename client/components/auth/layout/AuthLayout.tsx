'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import type { AuthLayoutVariant } from '@/lib/auth/portals';
import {
  AuthPreloadProvider,
  useAuthPreload,
} from '@/components/auth/AuthPreload';
import { HeroSlideshow } from '../primitives/HeroSlideshow';

const LG_MEDIA = '(min-width: 1024px)';

interface AuthLayoutProps {
  variant: AuthLayoutVariant;
  children: React.ReactNode;
}

function AuthShell({
  variant,
  showHero,
  children,
}: {
  variant: AuthLayoutVariant;
  showHero: boolean;
  children: React.ReactNode;
}) {
  const preload = useAuthPreload();
  const ready = preload?.ready ?? true;

  if (variant === 'split') {
    return (
      <div className="relative min-h-screen bg-background lg:bg-transparent">
        <div className="fixed inset-0 z-0 hidden h-svh w-screen lg:block">
          {showHero && <HeroSlideshow />}
        </div>

        <motion.div
          initial={false}
          animate={{ opacity: ready ? 1 : 0 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          className="relative z-10 flex min-h-screen flex-col items-center justify-center px-6 py-6 pointer-events-none lg:items-end lg:justify-center lg:px-16"
        >
          <div className="pointer-events-auto w-full max-w-180">{children}</div>
        </motion.div>
      </div>
    );
  }

  return (
    <motion.div
      initial={false}
      animate={{ opacity: ready ? 1 : 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="flex min-h-screen items-center justify-center bg-background px-6 py-10"
    >
      {children}
    </motion.div>
  );
}

export function AuthLayout({ variant, children }: AuthLayoutProps) {
  const isSplit = variant === 'split';
  const [{ showHero, bootstrapped }, setLayout] = useState(() => ({
    showHero: false,
    bootstrapped: !isSplit,
  }));

  useEffect(() => {
    if (!isSplit) return;

    const mq = window.matchMedia(LG_MEDIA);
    // Batch both updates into one setState to avoid cascading renders
    const sync = (matches: boolean) =>
      setLayout({ showHero: matches, bootstrapped: true });
    sync(mq.matches);
    const handler = (e: MediaQueryListEvent) => sync(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [isSplit]);

  const waitForHero = isSplit && showHero;

  return (
    <AuthPreloadProvider waitForHero={waitForHero} bootstrapped={bootstrapped}>
      <AuthShell variant={variant} showHero={showHero}>
        {children}
      </AuthShell>
    </AuthPreloadProvider>
  );
}
