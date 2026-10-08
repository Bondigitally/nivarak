"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

const SLIDES = [
  {
    src: "/marketing/images/screenshots/figma-01-assessments.png",
    alt: "Nivarak Assessments screen with Independent Ageing Score",
    width: 1440,
    height: 1024,
  },
  {
    src: "/marketing/images/screenshots/figma-02-assessment-report-v2.png",
    alt: "Nivarak IAS-P Assessment Report with risk status and care pathway",
    width: 1440,
    height: 1051,
  },
  {
    src: "/marketing/images/screenshots/figma-04-clinician-dashboard.png",
    alt: "Nivarak clinician dashboard with reviews, alerts, and schedule",
    width: 1440,
    height: 1024,
  },
  {
    src: "/marketing/images/screenshots/figma-05-appointments.png",
    alt: "Nivarak appointments screen for caregiver care plans",
    width: 1440,
    height: 1024,
  },
] as const;

const navBtn = cn(
  "inline-flex size-7 cursor-pointer items-center justify-center rounded-full border-0 p-0",
  "bg-[var(--color-surface-raised)] text-[var(--color-primary)] shadow-[var(--shadow-s)]",
  "transition-[background,color,opacity,transform] duration-[var(--duration-fast)] ease-[var(--ease-out)]",
  "hover:enabled:bg-[var(--color-brand-50)]",
  "active:enabled:scale-96",
  "disabled:cursor-default disabled:opacity-35",
);

export function HeroCarousel() {
  const [index, setIndex] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [dragPercent, setDragPercent] = useState(0);
  const viewportRef = useRef<HTMLDivElement>(null);
  const startX = useRef(0);
  const dragOffset = useRef(0);
  const widthRef = useRef(0);
  const indexRef = useRef(0);

  useEffect(() => {
    indexRef.current = index;
  }, [index]);

  const goTo = useCallback((nextIndex: number) => {
    setIndex(Math.max(0, Math.min(SLIDES.length - 1, nextIndex)));
    setDragging(false);
    setDragPercent(0);
    dragOffset.current = 0;
  }, []);

  useEffect(() => {
    const onMove = (clientX: number) => {
      if (!widthRef.current) return;
      dragOffset.current = clientX - startX.current;
      setDragPercent((dragOffset.current / widthRef.current) * 100);
    };

    const onUp = () => {
      if (!widthRef.current) {
        setDragging(false);
        return;
      }
      const threshold = widthRef.current * 0.18;
      if (dragOffset.current <= -threshold) goTo(indexRef.current + 1);
      else if (dragOffset.current >= threshold) goTo(indexRef.current - 1);
      else goTo(indexRef.current);
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!dragging) return;
      onMove(e.clientX);
    };
    const onMouseUp = () => {
      if (!dragging) return;
      onUp();
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, [dragging, goTo]);

  const onPointerDown = (clientX: number) => {
    widthRef.current = viewportRef.current?.clientWidth ?? 0;
    startX.current = clientX;
    dragOffset.current = 0;
    setDragging(true);
    setDragPercent(0);
  };

  const transform = `translateX(${-index * 100 + (dragging ? dragPercent : 0)}%)`;

  return (
    <div className="relative w-full max-w-[34rem] pt-3" data-hero-carousel>
      <div
        className="pointer-events-none absolute inset-x-4 inset-y-6 bottom-14 z-0"
        aria-hidden
      >
        <span className="absolute inset-0 rounded-[var(--radius-xl)] bg-[var(--color-surface-raised)] opacity-55 shadow-[var(--shadow-s)] translate-x-2.5 translate-y-3 rotate-[1.5deg]" />
        <span className="absolute inset-0 rounded-[var(--radius-xl)] bg-[var(--color-surface-raised)] opacity-32 shadow-[var(--shadow-s)] translate-x-[18px] translate-y-[22px] rotate-[2.8deg]" />
      </div>
      <div
        className={cn(
          "relative z-[1] w-full overflow-hidden rounded-[calc(var(--radius-xl)+2px)] p-3",
          "border border-white/8 bg-gradient-to-b from-[#2a2433] to-[var(--color-neutral-900)]",
          "shadow-[var(--shadow-xl),0_0_0_1px_rgba(108,48,144,0.08)]",
        )}
        aria-roledescription="carousel"
        aria-label="Nivarak platform product screens"
      >
        <div className="flex items-center gap-2 px-2 pb-3 pt-1" aria-hidden>
          <span className="size-2 rounded-full bg-[#ff5f57]" />
          <span className="size-2 rounded-full bg-[#febc2e]" />
          <span className="size-2 rounded-full bg-[#28c840]" />
          <span className="ml-2 flex-1 overflow-hidden text-ellipsis whitespace-nowrap rounded-full bg-white/[0.06] px-3 py-1 text-[length:var(--type-badge-size)] text-[var(--color-neutral-400)]">
            app.nivarak.com
          </span>
        </div>
        <div
          className={cn(
            "relative aspect-[1440/1024] touch-pan-y select-none overflow-hidden rounded-[var(--radius-l)]",
            "bg-[var(--color-surface-raised)]",
            dragging ? "cursor-grabbing" : "cursor-grab",
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
            if (!dragging || !e.touches.length || !widthRef.current) return;
            dragOffset.current = e.touches[0].clientX - startX.current;
            setDragPercent((dragOffset.current / widthRef.current) * 100);
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
          <div
            className={cn(
              "flex h-full w-full will-change-transform",
              dragging
                ? "transition-none"
                : "transition-transform duration-[420ms] ease-[var(--ease-out)] motion-reduce:transition-none",
            )}
            style={{ transform }}
          >
            {SLIDES.map((slide) => (
              <figure
                key={slide.src}
                className="m-0 h-full w-full shrink-0 grow-0 basis-full"
              >
                <Image
                  src={slide.src}
                  alt={slide.alt}
                  width={slide.width}
                  height={slide.height}
                  draggable={false}
                  priority={slide === SLIDES[0]}
                  className="pointer-events-none block size-full object-cover object-top"
                />
              </figure>
            ))}
          </div>
        </div>
      </div>
      <div className="relative z-[1] mt-4 flex items-center justify-center gap-3">
        <button
          type="button"
          className={navBtn}
          aria-label="Previous screen"
          disabled={index <= 0}
          onClick={() => goTo(index - 1)}
        >
          <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden focusable="false">
            <path
              d="M10.5 3.5 6 8l4.5 4.5"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
        <div className="flex items-center justify-center gap-2" role="tablist" aria-label="Product screens">
          {SLIDES.map((_, i) => (
            <button
              key={i}
              type="button"
              className={cn(
                "relative size-2 cursor-pointer rounded-full border-0 p-0",
                "bg-[var(--color-brand-300)] transition-[transform,opacity,background] duration-[var(--duration-fast)] ease-[var(--ease-out)]",
                "before:absolute before:inset-[-0.55rem] before:content-['']",
                i === index
                  ? "scale-125 bg-[var(--color-primary)] opacity-100"
                  : "opacity-45 hover:opacity-75",
              )}
              role="tab"
              aria-selected={i === index}
              aria-label={`Show screen ${i + 1}`}
              onClick={() => goTo(i)}
            />
          ))}
        </div>
        <button
          type="button"
          className={navBtn}
          aria-label="Next screen"
          disabled={index >= SLIDES.length - 1}
          onClick={() => goTo(index + 1)}
        >
          <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden focusable="false">
            <path
              d="M5.5 3.5 10 8l-4.5 4.5"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}
