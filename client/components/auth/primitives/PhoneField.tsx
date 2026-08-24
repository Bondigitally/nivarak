'use client';

import { useMemo, useState } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { ArrowDown01Icon } from '@hugeicons/core-free-icons';
import { cn } from '@/lib/utils';
import { typo } from '@/lib/tokens/typography';
import {
  COUNTRY_DIAL_CODES,
  COUNTRY_DIAL_CODES_ORDERED,
  getCountryByIso,
  getDefaultCountry,
  getNationalLength,
  type CountryDialCode,
} from '@/lib/auth/country-codes';
import {
  AuthFieldError,
  authInputClassName,
} from '@/components/auth/primitives/AuthField';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

function parseInitialCountry(value: string): CountryDialCode {
  const fallback = getDefaultCountry();
  if (!value) return fallback;

  const match = [...COUNTRY_DIAL_CODES]
    .sort((a, b) => b.dialCode.length - a.dialCode.length)
    .find((country) => value.startsWith(country.dialCode));

  return match ?? fallback;
}

function clampNational(digits: string, country: CountryDialCode): string {
  const { max } = getNationalLength(country);
  return digits.replace(/\D/g, '').slice(0, max);
}

interface PhoneFieldProps {
  id?: string;
  label?: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  error?: string;
  /** National-number placeholder only — no country name */
  placeholder?: string;
  className?: string;
}

export function PhoneField({
  id = 'phone',
  label = 'Mobile number',
  value,
  onChange,
  disabled = false,
  error,
  placeholder = '9876543210',
  className,
}: PhoneFieldProps) {
  const [countryIso, setCountryIso] = useState(
    () => parseInitialCountry(value).iso,
  );

  const country =
    getCountryByIso(countryIso) ?? parseInitialCountry(value);
  const { max: maxNationalLength } = getNationalLength(country);

  const national = useMemo(() => {
    const raw = value.startsWith(country.dialCode)
      ? value.slice(country.dialCode.length)
      : value.replace(/^\+\d*/, '');
    return clampNational(raw, country);
  }, [value, country]);

  function handleCountrySelect(next: CountryDialCode) {
    setCountryIso(next.iso);
    const nextNational = clampNational(national, next);
    onChange(`${next.dialCode}${nextNational}`);
  }

  function handleNationalChange(raw: string) {
    const digits = clampNational(raw, country);
    onChange(`${country.dialCode}${digits}`);
  }

  return (
    <div className={cn('flex w-full flex-col gap-auth-field', className)}>
      <label htmlFor={id} className={typo.label}>
        {label}
      </label>

      <div
        className={cn(
          authInputClassName,
          'flex items-center gap-3 px-3',
          'focus-within:border-[#B98BD0] focus-within:ring-2 focus-within:ring-[#A66BCF]/40',
          error && 'border-destructive focus-within:ring-destructive/30',
          disabled && 'cursor-not-allowed opacity-50',
        )}
      >
          <DropdownMenu>
            <DropdownMenuTrigger asChild disabled={disabled}>
              <button
                type="button"
                className={cn(
                  'inline-flex h-full shrink-0 items-center gap-1 rounded-[10px] px-1.5',
                  typo.input,
                  'outline-none transition-colors hover:bg-[#F8F5FA]',
                  'focus-visible:bg-[#F8F5FA] disabled:pointer-events-none',
                )}
                aria-label="Select country code"
              >
                <span className="tabular-nums">{country.dialCode}</span>
                <HugeiconsIcon
                  icon={ArrowDown01Icon}
                  size={16}
                  strokeWidth={1.5}
                  className="text-muted-foreground"
                />
              </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent
              align="start"
              sideOffset={8}
              className={cn(
                'max-h-64 w-[min(22rem,calc(100vw-2rem))] overflow-y-auto rounded-[14px] border-border bg-card p-1.5 shadow-md',
                typo.input,
              )}
            >
              {COUNTRY_DIAL_CODES_ORDERED.map((item) => {
                const selected = item.iso === country.iso;

                return (
                  <DropdownMenuItem
                    key={item.iso}
                    onSelect={() => handleCountrySelect(item)}
                    className={cn(
                      'cursor-pointer gap-3 rounded-[10px] px-3 py-2.5',
                      typo.input,
                      selected && 'bg-[#F8F5FA] text-foreground',
                    )}
                  >
                    <span className="min-w-0 flex-1 truncate">{item.name}</span>
                    <span className="shrink-0 tabular-nums text-muted-foreground">
                      {item.dialCode}
                    </span>
                  </DropdownMenuItem>
                );
              })}
            </DropdownMenuContent>
          </DropdownMenu>

          <span aria-hidden className="h-6 w-px shrink-0 bg-border" />

          <input
            id={id}
            type="tel"
            inputMode="numeric"
            autoComplete="tel-national"
            disabled={disabled}
            value={national}
            maxLength={maxNationalLength}
            onChange={(event) => handleNationalChange(event.target.value)}
            placeholder={placeholder}
            aria-invalid={!!error}
            className={cn(
              'h-full min-w-0 flex-1 bg-transparent outline-none',
              typo.input,
              'placeholder:text-[#9CA3AF]',
              'disabled:cursor-not-allowed',
            )}
          />
      </div>
      <AuthFieldError error={error} />
    </div>
  );
}

export function isValidPhoneNumber(value: string): boolean {
  const country = parseInitialCountry(value);
  if (!value.startsWith(country.dialCode)) return false;

  const national = value.slice(country.dialCode.length);
  if (!/^\d+$/.test(national)) return false;

  const { min, max } = getNationalLength(country);
  if (national.length < min || national.length > max) return false;

  // India mobile: must start with 6–9
  if (country.iso === 'IN') {
    return /^[6-9]\d{9}$/.test(national);
  }

  return true;
}
