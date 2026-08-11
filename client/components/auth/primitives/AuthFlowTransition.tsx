'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { cn } from '@/lib/utils';

/** Soft fade + scale — content swap for auth flow switches (Motion/Slow) */
export const AUTH_FLOW_TRANSITION = {
  duration: 0.34,
  ease: [0.22, 1, 0.36, 1] as const,
};

export const AUTH_FLOW_VARIANTS = {
  initial: { opacity: 0, scale: 0.98, filter: 'blur(4px)' },
  animate: { opacity: 1, scale: 1, filter: 'blur(0px)' },
  exit: { opacity: 0, scale: 0.99, filter: 'blur(2px)' },
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
        className={cn('w-full will-change-[opacity,transform,filter]', className)}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
