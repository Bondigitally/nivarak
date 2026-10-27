"use client";

import { useEffect, useState } from "react";
import { ArrowUp01Icon } from "@hugeicons/core-free-icons";
import { AppIcon } from "@/components/shared/AppIcon";
import { ICON_SIZE } from "@/lib/icons";
import { cn } from "@/lib/utils";
import "@/features/marketing/components/ScrollToTopButton.css";

const SHOW_AFTER_PX = 480;

export function ScrollToTopButton() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setVisible(window.scrollY > SHOW_AFTER_PX);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  function scrollToTop() {
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
  }

  return (
    <button
      type="button"
      onClick={scrollToTop}
      aria-label="Back to top"
      className={cn(
        "scroll-to-top fixed right-4 bottom-4 z-40",
        "min-[744px]:right-6 min-[744px]:bottom-6",
        "grid size-11 place-items-center overflow-hidden rounded-full",
        "text-[var(--color-primary)]",
        "transition-[opacity,transform,color,box-shadow] duration-[var(--duration-normal)] ease-[var(--ease-out)]",
        "hover:text-[var(--color-primary-hover)]",
        "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-border-focus)]",
        visible
          ? "pointer-events-auto translate-y-0 opacity-100"
          : "pointer-events-none translate-y-2 opacity-0",
      )}
    >
      <span className="scroll-to-top-frost" aria-hidden>
        <span className="scroll-to-top-frost-blur" />
        <span className="scroll-to-top-frost-tint" />
      </span>
      <AppIcon
        icon={ArrowUp01Icon}
        size={ICON_SIZE}
        className="relative z-10"
      />
    </button>
  );
}
