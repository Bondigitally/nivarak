"use client";

import Image from "next/image";
import { useRef } from "react";
import { BRAND_LOGO } from "@/lib/brand";
import { roundedElegance } from "@/lib/fonts";
import { typo } from "@/lib/tokens/typography";
import { cn } from "@/lib/utils";

export { BRAND_LOGO };

export type BrandLogoSize = "default" | "compact";

const BRAND_LOGO_MARK: Record<
  BrandLogoSize,
  { className: string; sizes: string }
> = {
  default: {
    className: "h-10 w-auto",
    sizes: "5.5rem",
  },
  compact: {
    className: "h-8 w-[4.375rem]",
    sizes: "4.375rem",
  },
};

const BRAND_LOGO_WORDMARK: Record<BrandLogoSize, string> = {
  default: "text-2xl leading-8",
  compact: "text-xl leading-7",
};

/**
 * Nivarak mark + wordmark. Optional `onReady` for auth preload gating;
 * assessments and other surfaces omit it.
 */
export function BrandLogo({
  onReady,
  className,
  size = "default",
}: {
  onReady?: () => void;
  className?: string;
  size?: BrandLogoSize;
}) {
  const marked = useRef(false);
  const mark = BRAND_LOGO_MARK[size];

  function markReady() {
    if (marked.current) return;
    marked.current = true;
    onReady?.();
  }

  return (
    <div
      className={cn(
        "brand-logo flex shrink-0 flex-col items-start gap-0",
        className,
      )}
      role="img"
      aria-label={BRAND_LOGO.alt}
    >
      <div
        className={cn(
          "brand-logo__mark relative shrink-0 aspect-1380/803",
          mark.className,
        )}
      >
        <Image
          src={BRAND_LOGO.src}
          alt=""
          width={BRAND_LOGO.width}
          height={BRAND_LOGO.height}
          sizes={mark.sizes}
          quality={BRAND_LOGO.quality}
          preload
          className="brand-logo__img size-full max-w-none object-contain object-left"
          onLoad={markReady}
          onError={markReady}
        />
      </div>
      <span
        className={cn(
          "brand-logo__wordmark",
          roundedElegance.className,
          typo.logo,
          "tracking-[0.08em]",
          BRAND_LOGO_WORDMARK[size],
        )}
        aria-hidden
      >
        nivarak
      </span>
    </div>
  );
}
