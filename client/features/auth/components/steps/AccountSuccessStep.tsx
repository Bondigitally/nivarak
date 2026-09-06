'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { AnimatePresence, motion, useReducedMotion, type Variants } from 'framer-motion';
import { HugeiconsIcon } from '@hugeicons/react';
import { ArrowRight01Icon } from '@hugeicons/core-free-icons';
import { Button } from '@/components/ui/button';
import { AUTH_FLOW_TRANSITION } from '@/features/auth/components/primitives/AuthFlowTransition';
import { AUTH_SUCCESS_LOTTIE } from '@/features/auth/lib/assets';
import { typo } from '@/lib/tokens/typography';
import { ICON_SIZE, ICON_STROKE } from "@/lib/icons";

const DotLottieReact = dynamic(
  () => import('@lottiefiles/dotlottie-react').then((mod) => mod.DotLottieReact),
  { ssr: false },
);

const stagger = (staggerChildren: number): Variants => ({
  hidden: {},
  show: { transition: { staggerChildren } },
});

const COPY_ITEM_VARIANTS: Variants = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: AUTH_FLOW_TRANSITION },
};

export function AccountSuccessStep() {
  const reducedMotion = useReducedMotion();
  const [timedPlay, setTimedPlay] = useState(false);
  const [timedShowCopy, setTimedShowCopy] = useState(false);
  // Prefer derived flags over syncing reducedMotion into state inside an effect.
  const play = Boolean(reducedMotion) || timedPlay;
  const showCopy = Boolean(reducedMotion) || timedShowCopy;

  useEffect(() => {
    if (reducedMotion) return;
    const playTimer = window.setTimeout(
      () => setTimedPlay(true),
      AUTH_FLOW_TRANSITION.duration * 1000 + 40,
    );
    const fallbackTimer = window.setTimeout(() => setTimedShowCopy(true), 4000);
    return () => {
      window.clearTimeout(playTimer);
      window.clearTimeout(fallbackTimer);
    };
  }, [reducedMotion]);

  return (
    <div className="flex w-full flex-col items-center">
      <div className="size-auth-success-lottie shrink-0" aria-hidden>
        {play ? (
          <DotLottieReact
            src={AUTH_SUCCESS_LOTTIE}
            autoplay
            useFrameInterpolation={!reducedMotion}
            className="block size-full"
            dotLottieRefCallback={(dotLottie) => {
              dotLottie?.addEventListener('complete', () => setTimedShowCopy(true));
            }}
          />
        ) : null}
      </div>

      <AnimatePresence initial={false}>
        {showCopy && (
          <motion.div
            initial={reducedMotion ? false : { height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            transition={AUTH_FLOW_TRANSITION}
            className="w-full overflow-hidden"
          >
            <motion.div
              className="flex w-full flex-col items-center gap-8 pt-8"
              variants={stagger(0.06)}
              initial={reducedMotion ? false : 'hidden'}
              animate="show"
            >
              <motion.div
                className="flex w-full max-w-88 flex-col items-center gap-2 text-center"
                role="status"
                variants={stagger(0.04)}
              >
                <motion.h1
                  variants={COPY_ITEM_VARIANTS}
                  className={`${typo.headingXxl} text-auth-title text-balance`}
                >
                  Account created
                </motion.h1>
                <motion.p variants={COPY_ITEM_VARIANTS} className={`${typo.bodyL} text-pretty`}>
                  Your account is ready. Log in to continue.
                </motion.p>
              </motion.div>

              <motion.div variants={COPY_ITEM_VARIANTS} className="w-full">
                <Button asChild size="cta" className="w-full">
                  <Link href="/login">
                    Go to Login
                    <HugeiconsIcon icon={ArrowRight01Icon} size={ICON_SIZE} strokeWidth={ICON_STROKE} absoluteStrokeWidth />
                  </Link>
                </Button>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
