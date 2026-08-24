'use client';

import { useRef } from 'react';
import { cn } from '@/lib/utils';
import { typo } from '@/lib/tokens/typography';
import {
  AuthFieldError,
  authInputClassName,
} from '@/components/auth/primitives/AuthField';

interface OtpInputProps {
  value: string;
  onChange: (value: string) => void;
  length?: number;
  disabled?: boolean;
  className?: string;
  error?: string;
}

export function OtpInput({
  value,
  onChange,
  length = 6,
  disabled = false,
  className,
  error,
}: OtpInputProps) {
  const inputsRef = useRef<Array<HTMLInputElement | null>>([]);
  const digits = value.padEnd(length, ' ').slice(0, length).split('');

  function handleChange(index: number, digit: string) {
    const sanitized = digit.replace(/\D/g, '').slice(-1);
    const next = digits.map((d, i) => (i === index ? sanitized : d.trim())).join('');
    onChange(next.replace(/\s/g, ''));

    if (sanitized && index < length - 1) {
      inputsRef.current[index + 1]?.focus();
    }
  }

  function handleKeyDown(
    index: number,
    event: React.KeyboardEvent<HTMLInputElement>,
  ) {
    if (event.key === 'Backspace' && !digits[index]?.trim() && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  }

  function handlePaste(event: React.ClipboardEvent<HTMLInputElement>) {
    event.preventDefault();
    const pasted = event.clipboardData.getData('text').replace(/\D/g, '').slice(0, length);
    onChange(pasted);
    inputsRef.current[Math.min(pasted.length, length - 1)]?.focus();
  }

  return (
    <div className={cn('flex flex-col gap-2', className)}>
      <div className="flex w-full items-center justify-between gap-2">
        {Array.from({ length }).map((_, index) => (
          <input
            key={index}
            ref={(element) => {
              inputsRef.current[index] = element;
            }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            disabled={disabled}
            value={digits[index]?.trim() ?? ''}
            onChange={(event) => handleChange(index, event.target.value)}
            onKeyDown={(event) => handleKeyDown(index, event)}
            onPaste={handlePaste}
            className={cn(
              authInputClassName,
              typo.bodyL,
              'size-12 min-w-0 shrink px-0 text-center text-foreground shadow-[0_1px_2px_rgba(228,229,231,0.24)]',
            )}
            aria-label={`Digit ${index + 1}`}
          />
        ))}
      </div>
      <AuthFieldError error={error} className="text-center" />
    </div>
  );
}
