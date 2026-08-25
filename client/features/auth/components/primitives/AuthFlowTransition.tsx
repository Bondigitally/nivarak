'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { cn } from '@/lib/utils';

/** Fade + scale — content swap for auth flow switches (Motion/Fast) */
export const AUTH_FLOW_TRANSITION = {
  duration: 0.2,
  ease: [0.22, 1, 0.36, 1] as const,
};

export const AUTH_FLOW_VARIANTS = {
  initial: { opacity: 0, scale: 0.985 },
  animate: { opacity: 1, scale: 1 },
  exit: {
    opacity: 0,
    scale: 0.995,
    transition: { duration: 0.12, ease: [0.22, 1, 0.36, 1] as const },
  },
};

interface AuthFlowTransitionProps {
  flowKey: string;
  children: React.ReactNode;
  className?: string;
  /** When true, plays enter animation on first mount (logo reveal) */
  playInitial?: boolean;
}

export function AuthFlowTransition({
  flowKey,
  children,
  className,
  playInitial = false,
}: AuthFlowTransitionProps) {
  return (
    <AnimatePresence mode="wait" initial={playInitial}>
      <motion.div
        key={flowKey}
        variants={AUTH_FLOW_VARIANTS}
        initial="initial"
        animate="animate"
        exit="exit"
        transition={AUTH_FLOW_TRANSITION}
        className={cn('w-full will-change-[opacity,transform]', className)}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
