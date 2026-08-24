'use client';

import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  countMetPasswordRules,
  evaluatePasswordRules,
  PASSWORD_RULES,
} from '@/lib/auth/password';
import { authType } from '@/lib/auth/typography';

interface PasswordStrengthProps {
  value: string;
  /** Keep panel visible after submit even if field is empty */
  forceVisible?: boolean;
  className?: string;
}

const STRENGTH = [
  { label: '', color: 'text-[#8A8F98]', bar: 'bg-neutral-200' },
  { label: 'Weak', color: 'text-[#DC2626]', bar: 'bg-[#DC2626]' },
  { label: 'Fair', color: 'text-[#F59E0B]', bar: 'bg-[#F59E0B]' },
  { label: 'Good', color: 'text-[#EAB308]', bar: 'bg-[#EAB308]' },
  { label: 'Strong', color: 'text-[#16A34A]', bar: 'bg-[#16A34A]' },
] as const;

export function PasswordStrength({
  value,
  forceVisible = false,
  className,
}: PasswordStrengthProps) {
  const visible = forceVisible || value.length > 0;
  if (!visible) return null;

  const results = evaluatePasswordRules(value);
  const met = countMetPasswordRules(value);
  const strength = STRENGTH[met];

  return (
    <div
      className={cn(
        'flex w-full flex-col gap-4 rounded-[14px] border border-border bg-[#F7F7F8] p-4',
        className,
      )}
      aria-live="polite"
    >
      <div className="flex flex-col gap-3">
        <p className={cn(authType.headingS, 'text-foreground')}>
          Your Password must include
        </p>

        <ul className="grid grid-cols-2 gap-x-4 gap-y-2.5">
          {results.map((rule) => {
            const ok = rule.met;

            return (
              <li key={rule.id} className="flex min-w-0 items-center gap-2">
                <Check
                  className={cn(
                    'size-4 shrink-0',
                    ok ? 'text-primary' : 'text-neutral-300',
                  )}
                  strokeWidth={2.5}
                  aria-hidden
                />
                <span
                  className={cn(
                    authType.bodyS,
                    'truncate',
                    ok ? 'text-foreground' : 'text-[#8A8F98]',
                  )}
                >
                  {rule.label}
                </span>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between gap-3">
          <span className={cn(authType.headingS, 'text-foreground')}>
            Password Strength
          </span>
          <span
            className={cn(
              authType.headingS,
              strength.color,
              !strength.label && 'invisible',
            )}
          >
            {strength.label || 'Weak'}
          </span>
        </div>

        <div className="flex gap-1.5" aria-hidden>
          {PASSWORD_RULES.map((rule, index) => (
            <span
              key={rule.id}
              className={cn(
                'h-1.5 flex-1 rounded-full transition-colors duration-200',
                index < met ? strength.bar : 'bg-neutral-200',
              )}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
