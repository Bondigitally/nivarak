'use client';

import { forwardRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Eye, EyeOff } from 'lucide-react';
import { cn } from '@/lib/utils';
import { authType } from '@/lib/auth/typography';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

export const authInputClassName = cn(
  'h-12 w-full rounded-[14px] border border-border bg-card px-4',
  authType.input,
  'placeholder:text-[#9CA3AF] placeholder:font-sans', // Text/Placeholder
  'transition-[border-color,box-shadow] duration-150 ease-in-out',
  'hover:border-[#D4CDDA]',
  'focus-visible:border-[#B98BD0] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#A66BCF]/40',
  'disabled:cursor-not-allowed disabled:opacity-50',
);

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
    const [tooltipOpen, setTooltipOpen] = useState(false);
    const isPassword = type === 'password';
    const inputType = isPassword && showPassword ? 'text' : type;
    const visibilityLabel = showPassword ? 'Hide password' : 'Show password';

    return (
      <div className={cn('flex w-full flex-col gap-2', className)}>
        <label htmlFor={id} className={authType.label}>
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
            <TooltipProvider delayDuration={500}>
              <Tooltip open={tooltipOpen} onOpenChange={setTooltipOpen}>
                <TooltipTrigger asChild>
                  <motion.button
                    type="button"
                    onClick={() => setShowPassword((current) => !current)}
                    whileTap={{ scale: 0.88 }}
                    transition={{ duration: 0.15, ease: [0.22, 1, 0.36, 1] }}
                    className="absolute top-1/2 right-3 z-10 -translate-y-1/2 rounded-full p-2 text-muted-foreground transition-colors duration-150 hover:bg-[#F8F5FA] hover:text-foreground"
                    aria-label={visibilityLabel}
                  >
                    {showPassword ? (
                      <EyeOff className="size-5" strokeWidth={1.5} />
                    ) : (
                      <Eye className="size-5" strokeWidth={1.5} />
                    )}
                  </motion.button>
                </TooltipTrigger>
                <TooltipContent side="top" open={tooltipOpen}>
                  {visibilityLabel}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
        {error && (
          <div className="flex flex-col gap-1" role="alert">
            {error.split('\n').map((message) => (
              <p key={message} className={authType.error}>
                {message}
              </p>
            ))}
          </div>
        )}
      </div>
    );
  },
);
