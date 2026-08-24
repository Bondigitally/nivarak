'use client';

import { forwardRef, useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { HugeiconsIcon } from '@hugeicons/react';
import { CheckIcon } from '@hugeicons/core-free-icons';
import { typo } from '@/lib/tokens/typography';
import { cn } from '@/lib/utils';

const CHECK_EASE = [0.22, 1, 0.36, 1] as const;

interface AuthCheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: React.ReactNode;
}

export const AuthCheckbox = forwardRef<HTMLInputElement, AuthCheckboxProps>(
  function AuthCheckbox(
    { id, label, className, checked, defaultChecked, onChange, ...props },
    ref,
  ) {
    const [isChecked, setIsChecked] = useState(Boolean(checked ?? defaultChecked));

    useEffect(() => {
      if (checked !== undefined) setIsChecked(checked);
    }, [checked]);

    return (
      <label
        htmlFor={id}
        className={cn('group flex cursor-pointer items-center gap-3', typo.control, className)}
      >
        <input
          ref={ref}
          id={id}
          type="checkbox"
          className="sr-only"
          checked={checked}
          defaultChecked={defaultChecked}
          onChange={(event) => {
            setIsChecked(event.target.checked);
            onChange?.(event);
          }}
          {...props}
        />
        <motion.span
          aria-hidden
          animate={{
            backgroundColor: isChecked ? 'var(--primary)' : 'var(--card)',
            borderColor: isChecked ? 'var(--primary)' : 'var(--border)',
          }}
          whileTap={{ scale: 0.92 }}
          transition={{ duration: 0.18, ease: CHECK_EASE }}
          className="mt-0.5 flex size-4.75 shrink-0 items-center justify-center overflow-hidden rounded border group-has-focus-visible:ring-2 group-has-focus-visible:ring-[#A66BCF] group-has-focus-visible:ring-offset-1"
        >
          <AnimatePresence initial={false} mode="wait">
            {isChecked && (
              <motion.span
                key="check"
                initial={{ opacity: 0, scale: 0.4 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.4 }}
                transition={{ duration: 0.18, ease: CHECK_EASE }}
                className="flex items-center justify-center"
              >
                <HugeiconsIcon
                  icon={CheckIcon}
                  size={19}
                  color="#FFFFFF"
                  strokeWidth={2}
                />
              </motion.span>
            )}
          </AnimatePresence>
        </motion.span>
        <span>{label}</span>
      </label>
    );
  },
);
