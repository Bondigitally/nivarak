'use client';

import { forwardRef, useState } from 'react';
import { motion } from 'framer-motion';
import { EyeClosedIcon, EyeIcon } from '@hugeicons/core-free-icons';
import { AppIcon } from '@/components/shared/AppIcon';
import { FieldErrorMessage } from '@/components/ui/field-error-message';
import { fieldInputClassName } from '@/components/ui/input';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { ICON_SIZE } from '@/lib/icons';
import { typo } from '@/lib/tokens/typography';
import { cn } from '@/lib/utils';

/** @deprecated Prefer `fieldInputClassName` from `@/components/ui/input` outside auth. */
export const authInputClassName = fieldInputClassName;

/** @deprecated Prefer `FieldErrorMessage` from `@/components/ui/field-error-message`. */
export const AuthFieldError = FieldErrorMessage;

interface AuthFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export const AuthField = forwardRef<HTMLInputElement, AuthFieldProps>(
  function AuthField(
    {
      id,
      label,
      type = 'text',
      placeholder,
      value,
      onChange,
      onBlur,
      name,
      disabled,
      error,
      className,
      ...props
    },
    ref,
  ) {
    const [showPassword, setShowPassword] = useState(false);
    const isPassword = type === 'password';
    const inputType = isPassword && showPassword ? 'text' : type;
    const visibilityLabel = showPassword ? 'Hide password' : 'Show password';

    return (
      <div className={cn('flex w-full flex-col gap-auth-field', className)}>
        <label htmlFor={id} className={typo.label}>
          {label}
        </label>
        <div className="relative">
          <input
            ref={ref}
            id={id}
            name={name}
            type={inputType}
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            onBlur={onBlur}
            disabled={disabled}
            aria-invalid={!!error}
            className={cn(
              authInputClassName,
              isPassword && 'pr-12',
              /* Custom fonts often mask as □ — use a stack with disc bullets */
              isPassword &&
                !showPassword &&
                'font-[Verdana,Geneva,Tahoma,sans-serif]',
              error && 'border-destructive focus-visible:ring-destructive/30',
            )}
            {...props}
          />
          {isPassword && (
            <TooltipProvider delayDuration={200}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <motion.button
                    type="button"
                    onClick={() => setShowPassword((current) => !current)}
                    whileTap={{ scale: 0.88 }}
                    transition={{ duration: 0.15, ease: [0.22, 1, 0.36, 1] }}
                    className="absolute top-1/2 right-3 z-10 -translate-y-1/2 rounded-full p-2 text-muted-foreground transition-colors duration-150 hover:bg-background hover:text-foreground"
                    aria-label={visibilityLabel}
                  >
                    <AppIcon
                      icon={showPassword ? EyeIcon : EyeClosedIcon}
                      size={ICON_SIZE}
                    />
                  </motion.button>
                </TooltipTrigger>
                <TooltipContent side="top" align="center">
                  {visibilityLabel}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
        <FieldErrorMessage error={error} />
      </div>
    );
  },
);
