"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowLeft02Icon, ArrowRight02Icon } from "@hugeicons/core-free-icons";
import { useReducedMotion } from "motion/react";
import { AppIcon } from "@/components/shared/AppIcon";
import {
  HERO_PREVIEW_SLIDE_MS,
  HeroAppPreview,
  type HeroAppScreen,
} from "@/features/marketing/components/HeroAppPreview";
import { useMarketingHomePreload } from "@/features/marketing/components/MarketingHomePreload";
import { BADGE_ICON_SIZE } from "@/lib/icons";
import { radius } from "@/lib/tokens/radius";
import { cn } from "@/lib/utils";

const SLIDES: { id: string; screen: HeroAppScreen; label: string }[] = [
  { id: "dashboard", screen: "dashboard", label: "Patient dashboard" },
  { id: "assessment", screen: "assessments", label: "Patient assessment" },
  {
    id: "appointments",
    screen: "appointments",
    label: "Patient appointments",
  },
];

const navBtn = cn(
  radius.full,
  "inline-flex size-8 shrink-0 cursor-pointer items-center justify-center border-0",
  "bg-muted text-muted-foreground transition-colors",
  "hover:enabled:bg-muted/80 hover:enabled:text-foreground",
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30",
  "disabled:cursor-default disabled:opacity-35",
);

/** Stack layers alternate insert pulses: near → far → near → … */
const STACK = [
  {
    rest: "translate(8px, 10px) rotate(1.5deg)",
    up: "translate(6px, -10px) rotate(0.6deg)",
    opacity: 0.55,
  },
  {
    rest: "translate(14px, 16px) rotate(2.8deg)",
    up: "translate(10px, -8px) rotate(1.2deg)",
    opacity: 0.32,
  },
] as const;
const STACK_HALF_MS = Math.round(HERO_PREVIEW_SLIDE_MS / 2);
const stackTransition = `transform ${STACK_HALF_MS}ms cubic-bezier(0.22, 1, 0.36, 1)`;

export function HeroCarousel() {
  const preload = useMarketingHomePreload();
  const reduceMotion = useReducedMotion();
  const [index, setIndex] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [previewReady, setPreviewReady] = useState(false);
  /** Which stack layer is mid-pulse (`null` = all at rest). */
  const [pulseLayer, setPulseLayer] = useState<0 | 1 | null>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const startX = useRef(0);
  const dragOffset = useRef(0);
  const widthRef = useRef(0);
  const indexRef = useRef(0);
  const transitioningRef = useRef(false);
  const stackTimerRef = useRef<number | null>(null);
  const nextPulseLayerRef = useRef<0 | 1>(0);

  const markHeroReady = preload?.markHeroReady;
  const handlePreviewReady = useCallback(() => {
    setPreviewReady(true);
    markHeroReady?.();
  }, [markHeroReady]);

  useEffect(() => {
    indexRef.current = index;
  }, [index]);

  const goTo = useCallback((nextIndex: number) => {
    const clamped = Math.max(0, Math.min(SLIDES.length - 1, nextIndex));
    if (clamped === indexRef.current) {
      setDragging(false);
      dragOffset.current = 0;
      return;
    }
    // Ignore input while a slide is in progress — prevents stacked janky jumps.
    if (transitioningRef.current) return;
    transitioningRef.current = true;
    setIndex(clamped);
    setDragging(false);
    dragOffset.current = 0;

    // Alternate insert pulse: layer 0, then 1, then 0, …
    if (stackTimerRef.current != null) window.clearTimeout(stackTimerRef.current);
    const layer = nextPulseLayerRef.current;
    nextPulseLayerRef.current = layer === 0 ? 1 : 0;
    setPulseLayer(layer);
    stackTimerRef.current = window.setTimeout(() => {
      setPulseLayer(null);
      stackTimerRef.current = null;
    }, STACK_HALF_MS);

    window.setTimeout(() => {
      transitioningRef.current = false;
    }, HERO_PREVIEW_SLIDE_MS);
  }, []);

  useEffect(() => {
    return () => {
      if (stackTimerRef.current != null) window.clearTimeout(stackTimerRef.current);
    };
  }, []);

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (!dragging) return;
      dragOffset.current = e.clientX - startX.current;
    };
    const onMouseUp = () => {
      if (!dragging) return;
      if (!widthRef.current) {
        setDragging(false);
        return;
      }
      const threshold = widthRef.current * 0.18;
      if (dragOffset.current <= -threshold) goTo(indexRef.current + 1);
      else if (dragOffset.current >= threshold) goTo(indexRef.current - 1);
      else goTo(indexRef.current);
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, [dragging, goTo]);

  const onPointerDown = (clientX: number) => {
    if (!previewReady) return;
    widthRef.current = viewportRef.current?.clientWidth ?? 0;
    startX.current = clientX;
    dragOffset.current = 0;
    setDragging(true);
  };

  const screen = SLIDES[index].screen;

  return (
    <div className="relative w-full pt-2 sm:pt-3" data-hero-carousel>
      <div
        className="pointer-events-none absolute inset-x-3 inset-y-5 bottom-12 z-0 sm:inset-x-4 sm:inset-y-6 sm:bottom-14"
        aria-hidden
      >
        {/* Far layer first so the near layer paints on top. */}
        {[1, 0].map((layerIndex) => {
          const layer = STACK[layerIndex];
          const up = pulseLayer === layerIndex;
          return (
            <span
              key={layerIndex}
              className="absolute inset-0 rounded-[var(--radius-xl)] bg-[var(--color-surface-raised)] shadow-[var(--shadow-s)]"
              style={{
                opacity: layer.opacity,
                transform: up ? layer.up : layer.rest,
                transition: reduceMotion ? undefined : stackTransition,
              }}
            />
          );
        })}
      </div>
      <div
        className={cn(
          "relative z-[1] w-full overflow-hidden rounded-[calc(var(--radius-xl)+1px)] p-1 sm:p-1.5",
          "border border-white/8 bg-gradient-to-b from-[#2a2433] to-[var(--color-neutral-900)]",
          "shadow-[var(--shadow-xl),0_0_0_1px_rgba(108,48,144,0.08)]",
        )}
        aria-roledescription="carousel"
        aria-label="Nivarak platform product screens"
        aria-busy={!previewReady}
      >
        <div className="flex items-center gap-2 px-1.5 pb-1.5 pt-0.5" aria-hidden>
          <span className="size-2 shrink-0 rounded-full bg-[#ff5f57]" />
          <span className="size-2 shrink-0 rounded-full bg-[#febc2e]" />
          <span className="size-2 shrink-0 rounded-full bg-[#28c840]" />
          <span className="ml-2 min-w-0 flex-1 overflow-hidden text-ellipsis whitespace-nowrap rounded-full bg-white/[0.06] px-3 py-1 text-[length:var(--type-badge-size)] text-[var(--color-neutral-400)]">
            app.nivarak.com
          </span>
        </div>
        <div
          className={cn(
            "relative aspect-[1440/1024] touch-manipulation select-none overflow-hidden rounded-[var(--radius-l)]",
            "bg-background",
            previewReady
              ? dragging
                ? "cursor-grabbing"
                : "cursor-grab"
              : "cursor-default",
          )}
          ref={viewportRef}
          onMouseDown={(e) => {
            e.preventDefault();
            onPointerDown(e.clientX);
          }}
          onTouchStart={(e) => {
            if (!e.touches.length) return;
            onPointerDown(e.touches[0].clientX);
          }}
          onTouchMove={(e) => {
            if (!dragging || !e.touches.length) return;
            dragOffset.current = e.touches[0].clientX - startX.current;
          }}
          onTouchEnd={() => {
            if (!dragging) return;
            const threshold = widthRef.current * 0.18;
            if (dragOffset.current <= -threshold) goTo(index + 1);
            else if (dragOffset.current >= threshold) goTo(index - 1);
            else goTo(index);
          }}
          onTouchCancel={() => goTo(index)}
        >
          {/* Site loader covers until ready; keep preview mounted at full opacity behind it. */}
          <div className="absolute inset-0">
            <HeroAppPreview
              screen={screen}
              onReady={handlePreviewReady}
            />
          </div>
        </div>
      </div>
      <div
        className={cn(
          "relative z-[1] mt-4 flex items-center justify-center gap-2 pt-1 transition-opacity duration-300",
          previewReady ? "opacity-100" : "opacity-40",
        )}
      >
        <button
          type="button"
          className={navBtn}
          aria-label="Previous screen"
          disabled={!previewReady || index <= 0}
          onClick={() => goTo(index - 1)}
        >
          <AppIcon icon={ArrowLeft02Icon} size={BADGE_ICON_SIZE} aria-hidden />
        </button>
        <div
          className="flex items-center gap-0"
          role="tablist"
          aria-label="Product screens"
        >
          {SLIDES.map((slide, i) => {
            const active = i === index;
            return (
              <button
                key={slide.id}
                type="button"
                role="tab"
                aria-selected={active}
                aria-label={`Show ${slide.label}`}
                disabled={!previewReady}
                onClick={() => goTo(i)}
                className="relative flex size-3 cursor-pointer items-center justify-center border-0 bg-transparent p-0 disabled:cursor-default"
              >
                <span
                  aria-hidden
                  className={cn(
                    "block rounded-full transition-colors duration-200",
                    active
                      ? "size-1 bg-foreground"
                      : "size-1 bg-foreground/25 hover:bg-foreground/50",
                  )}
                />
              </button>
            );
          })}
        </div>
        <button
          type="button"
          className={navBtn}
          aria-label="Next screen"
          disabled={!previewReady || index >= SLIDES.length - 1}
          onClick={() => goTo(index + 1)}
        >
          <AppIcon icon={ArrowRight02Icon} size={BADGE_ICON_SIZE} aria-hidden />
        </button>
      </div>
    </div>
  );
}
