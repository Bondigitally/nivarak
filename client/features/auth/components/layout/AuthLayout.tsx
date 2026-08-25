'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  AuthPreloadProvider,
  useAuthPreload,
} from '@/features/auth/components/AuthPreload';
import { HeroSlideshow } from '../primitives/HeroSlideshow';

const LG_MEDIA = '(min-width: 1024px)';

interface AuthLayoutProps {
  children: React.ReactNode;
}

function AuthShell({
  showHero,
  children,
}: {
  showHero: boolean;
  children: React.ReactNode;
}) {
  const preload = useAuthPreload();
  const ready = preload?.ready ?? true;

  return (
    <div className="relative min-h-screen bg-background lg:bg-transparent">
      <div className="fixed inset-0 z-0 hidden h-svh w-screen lg:block">
        {showHero && <HeroSlideshow />}
      </div>

      <motion.div
        initial={false}
        animate={{ opacity: ready ? 1 : 0 }}
        transition={{ duration: 0.18, ease: 'easeOut' }}
        className="relative z-10 flex min-h-screen flex-col items-center justify-center px-auth-shell-x py-auth-shell-y pointer-events-none lg:items-end lg:justify-center"
      >
        <div className="pointer-events-auto w-full lg:max-w-auth-card">{children}</div>
      </motion.div>
    </div>
  );
}

export function AuthLayout({ children }: AuthLayoutProps) {
  const [{ showHero, bootstrapped }, setLayout] = useState(() => ({
    showHero: false,
    bootstrapped: false,
  }));

  useEffect(() => {
    const mq = window.matchMedia(LG_MEDIA);
    const sync = (matches: boolean) =>
      setLayout({ showHero: matches, bootstrapped: true });
    sync(mq.matches);
    const handler = (e: MediaQueryListEvent) => sync(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  return (
    <AuthPreloadProvider waitForHero={showHero} bootstrapped={bootstrapped}>
      <AuthShell showHero={showHero}>{children}</AuthShell>
    </AuthPreloadProvider>
  );
}
