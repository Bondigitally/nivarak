"use client";

import Image from "next/image";
import { useRef } from "react";
import { BRAND_LOGO } from "@/lib/brand";
import { roundedElegance } from "@/lib/fonts";
import { typo } from "@/lib/tokens/typography";
import { cn } from "@/lib/utils";

export { BRAND_LOGO };

/**
 * Nivarak mark + wordmark. Optional `onReady` for auth preload gating;
 * assessments and other surfaces omit it.
 */
export function BrandLogo({
  onReady,
  className,
}: {
  onReady?: () => void;
  className?: string;
}) {
  const marked = useRef(false);

  function markReady() {
    if (marked.current) return;
    marked.current = true;
    onReady?.();
  }

  return (
    <div
      className={cn("flex shrink-0 flex-col items-start gap-0", className)}
      role="img"
      aria-label={BRAND_LOGO.alt}
    >
      <div className="relative h-10 w-auto shrink-0 aspect-1380/803">
        <Image
          src={BRAND_LOGO.src}
          alt=""
          width={BRAND_LOGO.width}
          height={BRAND_LOGO.height}
          sizes="(max-width: 1024px) 28vw, 5.5rem"
          quality={BRAND_LOGO.quality}
          preload
          className="size-full object-contain object-left"
          onLoad={markReady}
          onError={markReady}
        />
      </div>
      <span
        className={cn(
          roundedElegance.className,
          typo.logo,
          "text-2xl leading-8 tracking-[0.08em] text-primary",
        )}
        aria-hidden
      >
        nivarak
      </span>
    </div>
  );
}
