"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight02Icon } from "@hugeicons/core-free-icons";

import { AppIcon } from "@/components/shared/AppIcon";
import { Button } from "@/components/ui/button";
import { BlurFade } from "@/components/ui/blur-fade";
import { GlowWrapper } from "@/components/ui/glow";
import { AuthLogo } from "@/features/auth/components/primitives/AuthLogo";
import { iaspMotionEase } from "@/features/assessments/data/iasp-assessment-styles";
import { radius } from "@/lib/tokens/radius";
import { typo } from "@/lib/tokens/typography";
import { cn } from "@/lib/utils";

const LANDING_IMAGES = {
  back: {
    src: "/images/landing-1.jpg",
    alt: "Calm modern living room with soft light",
  },
  front: {
    src: "/images/landing-2.jpg",
    alt: "Family members sharing a moment together at home",
  },
} as const;

const IMAGE_SHADOW =
  "shadow-[0_18px_40px_-10px_rgba(17,24,39,0.2),0_8px_16px_-8px_rgba(17,24,39,0.1)]";

/** Same timing curve as health-records CategoryCard (hover on a non-motion child). */
const IMAGE_SURFACE_HOVER = cn(
  "transform-gpu will-change-transform",
  "motion-safe:transition-[transform_0.35s_cubic-bezier(0.2,0.8,0.2,1),box-shadow_0.35s_ease]",
  "motion-safe:hover:-translate-y-0.5 motion-safe:hover:shadow-[0_24px_48px_-12px_rgba(17,24,39,0.28),0_12px_24px_-8px_rgba(17,24,39,0.14)]",
  "motion-safe:active:-translate-y-px motion-safe:active:shadow-[0_16px_32px_-10px_rgba(17,24,39,0.22),0_8px_16px_-8px_rgba(17,24,39,0.12)]",
);

const landingContainerVariants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.09,
      delayChildren: 0.04,
    },
  },
};

const landingItemVariants = {
  hidden: {
    opacity: 0,
    y: 18,
  },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: iaspMotionEase,
    },
  },
};

type LandingPhotoProps = {
  className: string;
  delay: number;
  duration: number;
  blurDuration: number;
  offset: number;
  blur: string;
  image: { src: string; alt: string; sizes: string };
};

function LandingPhoto({
  className,
  delay,
  duration,
  blurDuration,
  offset,
  blur,
  image,
}: LandingPhotoProps) {
  return (
    <BlurFade
      className={className}
      delay={delay}
      duration={duration}
      blurDuration={blurDuration}
      offset={offset}
      blur={blur}
    >
      <div
        className={cn(
          "absolute inset-0 overflow-hidden",
          radius.xl,
          IMAGE_SHADOW,
          IMAGE_SURFACE_HOVER,
        )}
      >
        <Image
          src={image.src}
          alt={image.alt}
          fill
          priority
          sizes={image.sizes}
          className="object-cover object-center"
        />
      </div>
    </BlurFade>
  );
}

/** Landing — brand-led split with stacked lifestyle photos. */
export function IaspAssessmentLanding() {
  const router = useRouter();
  const reducedMotion = useReducedMotion();

  function handleTakeAssessment() {
    router.push("/iasp-assessment/start");
  }

  const itemVariants = reducedMotion
    ? { hidden: { opacity: 1, y: 0 }, show: { opacity: 1, y: 0 } }
    : landingItemVariants;

  const imageBlur = reducedMotion ? "0px" : "6px";
  const imageDuration = reducedMotion ? 0 : 0.62;
  const imageBlurDuration = reducedMotion ? 0 : 0.45;

  return (
    <main className="relative min-h-svh overflow-hidden bg-background">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_85%_45%,color-mix(in_oklab,var(--primary)_8%,transparent),transparent_70%),radial-gradient(ellipse_55%_45%_at_10%_80%,color-mix(in_oklab,var(--primary)_5%,transparent),transparent_65%)]"
      />

      <div className="relative grid min-h-svh w-full grid-cols-1 lg:grid-cols-2">
        <motion.section
          className="relative flex flex-col px-6 py-8 sm:px-10 lg:min-h-svh lg:px-16 lg:py-10"
          initial="hidden"
          animate="show"
          variants={landingContainerVariants}
        >
          <motion.div variants={itemVariants}>
            <AuthLogo />
          </motion.div>

          <div className="flex flex-1 flex-col justify-center gap-5 py-12 sm:gap-6 sm:py-16 lg:py-0 lg:-translate-y-18">
            <motion.h1
              variants={itemVariants}
              className={cn(
                typo.displayL,
                "max-w-xl text-balance text-foreground lg:text-[56px] lg:leading-17 lg:tracking-[-0.02em]",
              )}
            >
              Start your quick IAS-P Assessment
            </motion.h1>

            <motion.p
              variants={itemVariants}
              className={cn(typo.bodyL, "max-w-lg text-pretty")}
            >
              Just a few warm, easy questions about your loved one. In about
              3 minutes, you’ll see how they’re doing and where a little help
              could go a long way.
            </motion.p>

            <motion.div variants={itemVariants} className="pt-1">
              <GlowWrapper mode="rotate" blur="softest" duration={8} glowOpacity={0.55}>
                <Button
                  type="button"
                  size="cta"
                  className={cn("min-w-50 shadow-lg")}
                  onClick={handleTakeAssessment}
                >
                  Take Free Assessment
                  <AppIcon icon={ArrowRight02Icon} />
                </Button>
              </GlowWrapper>
            </motion.div>
          </div>
        </motion.section>

        <section
          className="relative flex items-center justify-center px-5 pb-12 pt-2 sm:px-8 sm:pb-16 lg:min-h-svh lg:px-10 lg:py-12"
          aria-label="Lifestyle photos"
        >
          <div className="relative w-full max-w-156 sm:max-w-180 lg:max-w-200">
            <div className="relative ml-auto w-[88%] sm:w-[86%]">
              <LandingPhoto
                className="relative aspect-video w-full"
                delay={reducedMotion ? 0 : 0.1}
                duration={imageDuration}
                blurDuration={imageBlurDuration}
                offset={reducedMotion ? 0 : 16}
                blur={imageBlur}
                image={{
                  src: LANDING_IMAGES.back.src,
                  alt: LANDING_IMAGES.back.alt,
                  sizes: "(min-width: 1024px) 45vw, 90vw",
                }}
              />

              <LandingPhoto
                className="absolute top-1/2 left-[-22%] z-10 aspect-3/4 w-[72%] sm:left-[-24%] sm:w-[74%]"
                delay={reducedMotion ? 0 : 0.22}
                duration={imageDuration}
                blurDuration={imageBlurDuration}
                offset={reducedMotion ? 0 : 22}
                blur={imageBlur}
                image={{
                  src: LANDING_IMAGES.front.src,
                  alt: LANDING_IMAGES.front.alt,
                  sizes: "(min-width: 1024px) 30vw, 62vw",
                }}
              />
            </div>

            <div
              aria-hidden
              className="pointer-events-none ml-auto w-[88%] pt-[calc(72%*4/3-50%*9/16)] sm:w-[86%] sm:pt-[calc(74%*4/3-50%*9/16)]"
            />
          </div>
        </section>
      </div>
    </main>
  );
}
