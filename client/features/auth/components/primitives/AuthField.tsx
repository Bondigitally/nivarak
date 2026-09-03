'use client';

import { forwardRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Eye, EyeOff } from 'lucide-react';
import { cn } from '@/lib/utils';
import { typo } from '@/lib/tokens/typography';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

export const authInputClassName = cn(
  'h-11 w-full rounded-md border border-border bg-card px-4',
  typo.input,
  'placeholder:text-placeholder placeholder:font-sans', // Text/Placeholder
  'transition-[border-color,box-shadow] duration-150 ease-in-out',
  'hover:border-border',
  'focus-visible:border-border-focus focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40',
  'disabled:cursor-not-allowed disabled:opacity-50',
);

/** Reserved one-line slot so errors never shift the card or crowd the next label */
export function AuthFieldError({
  error,
  className,
}: {
  error?: string | null;
  className?: string;
}) {
  return (
    <p
      className={cn(typo.error, 'min-h-auth-error truncate', className)}
      role={error ? 'alert' : undefined}
      aria-hidden={!error}
    >
      {error?.split('\n')[0] ?? ''}
    </p>
  );
}

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
                    {showPassword ? (
                      <Eye className="size-5" strokeWidth={1.5} />
                    ) : (
                      <EyeOff className="size-5" strokeWidth={1.5} />
                    )}
                  </motion.button>
                </TooltipTrigger>
                <TooltipContent side="top" align="center">
                  {visibilityLabel}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
        <AuthFieldError error={error} />
      </div>
    );
  },
);
