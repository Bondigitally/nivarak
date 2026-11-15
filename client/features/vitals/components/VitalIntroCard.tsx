"use client";

import { useState } from "react";
import Image from "next/image";
import { ArrowRight02Icon } from "@hugeicons/core-free-icons";
import { AppIcon } from "@/components/shared/AppIcon";
import { Button } from "@/components/ui/button";
import {
  cardTitleClass,
  dashboardCardClass,
} from "@/features/dashboard/data/dashboard-styles";
import type { VitalMetricId } from "@/features/vitals/components/VitalsSummaryCards";
import { getVitalIntro } from "@/features/vitals/data/vitals-intro-data";
import { BADGE_ICON_SIZE } from "@/lib/icons";
import { typo } from "@/lib/tokens/typography";
import { cn } from "@/lib/utils";

type VitalIntroCardProps = {
  vitalId: VitalMetricId;
  /** Optional Next control for carousel hosts (e.g. overview). Omitted on trend pages. */
  onNext?: () => void;
  className?: string;
  /** When true, omit the outer card chrome (embed inside another card). */
  bare?: boolean;
};

/** Soft crossfade — previous stays visible until the next image is ready. */
const ANATOMY_FADE_CLASS =
  "object-contain object-center transition-opacity duration-[600ms] ease-in-out";

/**
 * Anatomy PNGs are ~1353×1163. Column is ~22rem / up to ~40vw; sizes must
 * not undershoot so retina srcset can pick 828–1080+. quality 90 is in the
 * next.config allowlist (default 75 softens line art).
 */
const ANATOMY_IMAGE_SIZES = "(max-width: 1023px) 90vw, (max-width: 1280px) 40vw, 480px";
const ANATOMY_IMAGE_QUALITY = 90;

function VitalAnatomyImage({
  src,
  priority = false,
}: {
  src: string;
  priority?: boolean;
}) {
  const [baseSrc, setBaseSrc] = useState(src);
  const [baseVisible, setBaseVisible] = useState(false);
  const [overlaySrc, setOverlaySrc] = useState<string | null>(null);
  const [overlayVisible, setOverlayVisible] = useState(false);
  const [pendingSrc, setPendingSrc] = useState(src);

  if (src !== pendingSrc) {
    setPendingSrc(src);
    if (src === baseSrc) {
      setOverlaySrc(null);
      setOverlayVisible(false);
    } else if (src !== overlaySrc) {
      setOverlaySrc(src);
      setOverlayVisible(false);
    }
  }

  const reveal = (show: () => void) => {
    // Paint opacity-0 first so the 600ms transition always runs.
    requestAnimationFrame(() => {
      requestAnimationFrame(show);
    });
  };

  return (
    <>
      <Image
        src={baseSrc}
        alt=""
        fill
        sizes={ANATOMY_IMAGE_SIZES}
        quality={ANATOMY_IMAGE_QUALITY}
        priority={priority}
        onLoad={() => reveal(() => setBaseVisible(true))}
        className={cn(ANATOMY_FADE_CLASS, baseVisible ? "opacity-100" : "opacity-0")}
      />
      {overlaySrc ? (
        <Image
          key={overlaySrc}
          src={overlaySrc}
          alt=""
          fill
          sizes={ANATOMY_IMAGE_SIZES}
          quality={ANATOMY_IMAGE_QUALITY}
          onLoad={() => reveal(() => setOverlayVisible(true))}
          onTransitionEnd={(event) => {
            if (event.propertyName !== "opacity" || !overlayVisible) return;
            setBaseSrc(overlaySrc);
            setBaseVisible(true);
            setOverlaySrc(null);
            setOverlayVisible(false);
          }}
          className={cn(
            ANATOMY_FADE_CLASS,
            overlayVisible ? "opacity-100" : "opacity-0",
          )}
        />
      ) : null}
    </>
  );
}

/**
 * Vitals intro spotlight — title + subtitle, then the anatomical illustration.
 * Matches Figma Doctor Module intro cards (`2455:2442` … `2455:2508`).
 *
 * Header height is reserved so subtitle line-count changes do not shift the image.
 */
export function VitalIntroCard({
  vitalId,
  onNext,
  className,
  bare = false,
}: VitalIntroCardProps) {
  const intro = getVitalIntro(vitalId);

  const body = (
    <>
      {/*
        Fixed header band: card title + up to 3 subtitle lines + gaps.
        Keeps the illustration slot anchored when the active vital changes.
      */}
      <div
        className={cn(
          "relative flex w-full shrink-0 items-start gap-3",
          onNext && "pr-[6.5rem]",
        )}
      >
        <div className="flex min-h-[6.75rem] min-w-0 flex-1 flex-col gap-0.5">
          <h2 className={cardTitleClass}>{intro.title}</h2>
          <p
            className={cn(
              typo.bodyM,
              "text-pretty leading-[22.75px] text-muted-foreground",
            )}
          >
            {intro.subtitle}
          </p>
        </div>

        {onNext ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="absolute top-1 right-0 h-[34px] shrink-0 gap-2 rounded-full border-border bg-card px-[17px] shadow-xs"
            onClick={onNext}
            aria-label={`Next vital, currently ${intro.title}`}
          >
            Next
            <AppIcon icon={ArrowRight02Icon} size={BADGE_ICON_SIZE} />
          </Button>
        ) : null}
      </div>

      <div className="relative min-h-[14rem] w-full flex-1 overflow-hidden">
        <VitalAnatomyImage
          src={intro.imageSrc}
          priority={vitalId === "bp" || vitalId === "hr"}
        />
      </div>
    </>
  );

  if (bare) {
    return (
      <div className={cn("flex h-full w-full flex-col gap-2.5", className)}>
        {body}
      </div>
    );
  }

  return (
    <section
      className={cn(
        dashboardCardClass,
        "flex h-full w-full min-w-[20rem] flex-col gap-2.5 overflow-hidden p-6",
        className,
      )}
      aria-label={intro.title}
    >
      {body}
    </section>
  );
}
