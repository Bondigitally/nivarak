'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useAuthPreload } from '@/features/auth/components/AuthPreload';
import {
  AUTH_HERO_QUALITY,
  AUTH_HERO_SIZES,
  AUTH_HERO_SLIDES,
} from '@/features/auth/lib/assets';

/** Auto-advance interval for the hero slideshow. */
const INTERVAL_MS = 4200;
const SLIDE_FADE = { duration: 1.15, ease: 'easeInOut' as const };
const PILL_WIDTH_PX = 72;
const DOT_SIZE_PX = 8;

function PageIndicator({
  total,
  active,
  onSelect,
  durationMs,
}: {
  total: number;
  active: number;
  onSelect: (index: number) => void;
  durationMs: number;
}) {
  return (
    <div className="absolute bottom-14.75 left-25.5 z-20 flex items-center gap-1">
      {Array.from({ length: total }).map((_, index) => {
        const isActive = index === active;
        return (
          <button
            key={index}
            type="button"
            aria-label={`Go to slide ${index + 1}`}
            aria-current={isActive ? 'true' : undefined}
            onClick={() => onSelect(index)}
            className="relative flex h-8 items-center justify-center"
          >
            <span
              aria-hidden
              className={cn(
                'relative block h-2 overflow-hidden rounded-xs',
                'motion-safe:transition-[width,background-color] motion-safe:duration-400 motion-safe:ease-in-out',
                isActive ? 'bg-white/35' : 'bg-white/70 hover:bg-white',
              )}
              style={{ width: isActive ? PILL_WIDTH_PX : DOT_SIZE_PX }}
            >
              {isActive && (
                <span
                  key={active}
                  className="hero-indicator-fill absolute inset-y-0 left-0 h-full bg-white"
                  style={{
                    width: PILL_WIDTH_PX,
                    animationDuration: `${durationMs}ms`,
                    animationTimingFunction: 'linear',
                    animationFillMode: 'forwards',
                    animationName: 'hero-indicator-fill',
                  }}
                />
              )}
            </span>
          </button>
        );
      })}
    </div>
  );
}

function nextIndex(index: number) {
  return (index + 1) % AUTH_HERO_SLIDES.length;
}

export function HeroSlideshow() {
  const preload = useAuthPreload();
  const ready = preload?.ready ?? true;
  const heroMarked = useRef(false);
  const [active, setActive] = useState(0);
  /** Mount first slide immediately; warm the next after LCP / on advance */
  const [mounted, setMounted] = useState(() => new Set([0]));

  function markHeroReady() {
    if (heroMarked.current) return;
    heroMarked.current = true;
    preload?.markHeroReady();
    setMounted((current) => new Set(current).add(1));
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted((current) => {
      const next = new Set(current);
      next.add(active);
      next.add(nextIndex(active));
      return next;
    });
  }, [active]);

  // Auto-advance only starts after `preload.markHeroReady()` fires —
  // the first slide image must be loaded before the interval begins so
  // that the initial LCP is never delayed by animation.
  useEffect(() => {
    if (!ready) return;

    const timer = window.setInterval(() => {
      setActive((current) => nextIndex(current));
    }, INTERVAL_MS);

    return () => window.clearInterval(timer);
  }, [active, ready]);

  function handleSelect(index: number) {
    if (index === active || !ready) return;
    setMounted((current) => new Set(current).add(index));
    setActive(index);
  }

  return (
    <div className="relative size-full min-h-svh overflow-hidden bg-neutral-950">
      {AUTH_HERO_SLIDES.map((slide, index) => {
        const isActive = index === active;
        const isNext = index === nextIndex(active);
        const shouldRender = mounted.has(index);

        return (
          <motion.div
            key={slide.src}
            initial={false}
            animate={{ opacity: isActive && ready ? 1 : 0 }}
            transition={SLIDE_FADE}
            className="absolute inset-0 size-full"
            aria-hidden={!isActive}
          >
            {shouldRender && (
              <Image
                src={slide.src}
                alt=""
                fill
                sizes={AUTH_HERO_SIZES}
                quality={AUTH_HERO_QUALITY}
                draggable={false}
                className="pointer-events-none object-cover object-center"
                preload={index === 0}
                loading={index === 0 ? 'eager' : 'lazy'}
                fetchPriority={isActive ? 'high' : isNext ? 'low' : 'auto'}
                onLoad={index === 0 ? markHeroReady : undefined}
                onError={index === 0 ? markHeroReady : undefined}
              />
            )}
          </motion.div>
        );
      })}

      {ready && (
        <PageIndicator
          total={AUTH_HERO_SLIDES.length}
          active={active}
          onSelect={handleSelect}
          durationMs={INTERVAL_MS}
        />
      )}
    </div>
  );
}
