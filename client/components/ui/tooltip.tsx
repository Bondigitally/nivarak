"use client";

import * as React from "react";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";

const TooltipProvider = TooltipPrimitive.Provider;

const Tooltip = TooltipPrimitive.Root;

const TooltipTrigger = TooltipPrimitive.Trigger;

const tooltipTransition = {
  duration: 0.15,
  ease: [0.22, 1, 0.36, 1] as const,
};

type TooltipContentProps = React.ComponentPropsWithoutRef<
  typeof TooltipPrimitive.Content
> & {
  /** Required for Framer exit animation — pass the same open state as Tooltip */
  open?: boolean;
};

const TooltipContent = React.forwardRef<
  React.ComponentRef<typeof TooltipPrimitive.Content>,
  TooltipContentProps
>(({ className, sideOffset = 8, children, open = true, ...props }, ref) => (
  <TooltipPrimitive.Portal forceMount>
    <AnimatePresence>
      {open ? (
        <TooltipPrimitive.Content
          key="tooltip-content"
          ref={ref}
          forceMount
          sideOffset={sideOffset}
          asChild
          {...props}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: 2 }}
            transition={tooltipTransition}
            className={cn(
              "z-70 rounded-full bg-[#1A1A1A] px-3 py-1.5 text-xs font-medium text-white shadow-sm",
              className,
            )}
          >
            {children}
            <TooltipPrimitive.Arrow
              className="fill-[#1A1A1A]"
              width={10}
              height={5}
            />
          </motion.div>
        </TooltipPrimitive.Content>
      ) : null}
    </AnimatePresence>
  </TooltipPrimitive.Portal>
));
TooltipContent.displayName = TooltipPrimitive.Content.displayName;

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider };
