'use client';

import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { typo } from '@/lib/tokens/typography';

/** Underline on hover — opacity fade */
export const linkUnderlineClassName = cn(
  'relative inline-block',
  'after:pointer-events-none after:absolute after:right-0 after:bottom-0 after:left-0 after:h-px after:bg-current after:opacity-0',
  'after:transition-opacity after:duration-200 after:ease-out',
  'hover:after:opacity-100 focus-visible:after:opacity-100',
);

const buttonVariants = cva(
  cn(
    'inline-flex items-center justify-center gap-2 whitespace-nowrap',
    typo.button,
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none [&_svg]:pointer-events-none [&_svg]:size-[19px] [&_svg]:shrink-0 [&_svg]:stroke-[1.5] [&_svg_*]:stroke-[1.5]',
  ),
  {
    variants: {
      variant: {
        default:
          'bg-primary text-primary-foreground hover:bg-[var(--primary-hover)] active:bg-[var(--primary-active)] disabled:bg-[var(--primary-disabled)] disabled:text-primary-foreground/70',
        secondary:
          'border border-border bg-card text-muted-foreground hover:text-foreground hover:bg-accent disabled:border-[var(--border-disabled)] disabled:text-[var(--text-disabled)]',
        /** @deprecated Use `secondary` — kept for existing call sites */
        outline:
          'border border-border bg-card text-muted-foreground hover:bg-accent disabled:border-[var(--border-disabled)] disabled:text-[var(--text-disabled)]',
        ghost:
          'bg-transparent text-muted-foreground hover:bg-accent hover:text-foreground disabled:text-[var(--text-disabled)]',
        link: cn(
          'h-auto gap-1 bg-transparent p-0 text-primary',
          linkUnderlineClassName,
          'disabled:text-[var(--text-disabled)] disabled:after:hidden',
        ),
        destructive:
          'bg-destructive text-white hover:bg-destructive/90 disabled:opacity-50',
        'destructive-outline':
          'border border-destructive bg-card text-destructive hover:bg-destructive/5 disabled:opacity-50',
        'primary-outline':
          'border border-primary bg-card text-primary hover:bg-primary/5 disabled:opacity-50',
        'info-outline':
          'border border-info/40 bg-card text-info hover:border-info/60 hover:bg-info-muted disabled:opacity-50',
      },
      size: {
        default: 'h-11 rounded-full px-5 py-3',
        cta: 'h-12 rounded-full px-5 py-3',
        /** @deprecated Use `cta` — kept for existing call sites */
        lg: 'h-12 rounded-full px-5 py-3',
        icon: 'size-11 rounded-full p-[14px]',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);

export interface ButtonProps
  extends Omit<
      React.ButtonHTMLAttributes<HTMLButtonElement>,
      'onDrag' | 'onDragStart' | 'onDragEnd' | 'onAnimationStart'
    >,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
}

const tapTransition = {
  duration: 0.15,
  ease: [0.22, 1, 0.36, 1] as const,
};

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      asChild = false,
      loading = false,
      disabled,
      children,
      ...props
    },
    ref,
  ) => {
    const isDisabled = disabled || loading;
    const classes = cn(buttonVariants({ variant, size, className }));
    const allowTapScale = !isDisabled && variant !== 'link';

    if (asChild) {
      return (
        <Slot
          className={cn(classes, allowTapScale && 'transition-transform duration-150 active:scale-[0.97]')}
          ref={ref}
          {...props}
        >
          {children}
        </Slot>
      );
    }

    return (
      <motion.button
        className={classes}
        ref={ref}
        disabled={isDisabled}
        aria-busy={loading || undefined}
        whileTap={allowTapScale ? { scale: 0.97 } : undefined}
        transition={tapTransition}
        {...props}
      >
        {loading ? (
          <>
            <Loader2 className="size-[19px] shrink-0" strokeWidth={1.5} aria-hidden />
            {children}
          </>
        ) : (
          children
        )}
      </motion.button>
    );
  },
);
Button.displayName = 'Button';

export { Button, buttonVariants };
