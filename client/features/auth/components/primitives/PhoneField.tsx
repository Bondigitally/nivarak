'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ChevronIcon } from '@/components/shared/ChevronIcon';
import { cn } from '@/lib/utils';
import { typo } from '@/lib/tokens/typography';
import {
  COUNTRY_DIAL_CODES,
  COUNTRY_DIAL_CODES_ORDERED,
  getCountryByIso,
  getDefaultCountry,
  getNationalLength,
  type CountryDialCode,
} from '@/features/auth/lib/country-codes';
import { AuthFieldError } from '@/features/auth/components/primitives/AuthField';
import { fieldInputAutofillClassName } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

/**
 * Parses the initial country from an E.164-formatted value.
 *
 * Sorts by `dialCode` length descending before matching so that longer
 * prefixes (e.g. +91) are tested before shorter ones (e.g. +1), preventing
 * false matches when multiple dial codes share a common prefix.
 */
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

/** Composite shell — box-shadow halo (not ring) so focus stays rounded on flex containers. */
const phoneFieldShellClassName = cn(
  'h-11 w-full rounded-md border border-border bg-card',
  typo.input,
  'transition-[border-color,box-shadow] duration-150 ease-in-out',
  'focus-within:border-border-focus focus-within:outline-none focus-within:ring-0',
  'focus-within:shadow-[0_0_0_2px_color-mix(in_oklab,var(--ring)_40%,transparent)]',
);

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
  /** When false, omit the built-in label (e.g. modal supplies its own). */
  showLabel?: boolean;
  /** When false, omit the built-in error slot (e.g. parent field wrapper shows errors). */
  showError?: boolean;
  /**
   * Nested dialog: non-modal menu, portal + z-index, and wheel scroll under scroll lock.
   */
  countryMenuInDialog?: {
    portalContainer: HTMLElement | null;
    contentClassName?: string;
  };
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
  showLabel = true,
  showError = true,
  countryMenuInDialog,
}: PhoneFieldProps) {
  const menuPortalContainer = countryMenuInDialog?.portalContainer ?? null;
  const menuContentClassName = countryMenuInDialog?.contentClassName;
  const [countryIso, setCountryIso] = useState(
    () => parseInitialCountry(value).iso,
  );
  const inputShellRef = useRef<HTMLDivElement>(null);
  const countryListWheelCleanupRef = useRef<(() => void) | null>(null);
  const [menuWidth, setMenuWidth] = useState<number>();

  const countryListRef = useCallback(
    (node: HTMLDivElement | null) => {
      countryListWheelCleanupRef.current?.();
      countryListWheelCleanupRef.current = null;

      if (!node || !menuPortalContainer) return;

      const onWheel = (event: WheelEvent) => {
        event.stopPropagation();
        const maxScroll = node.scrollHeight - node.clientHeight;
        if (maxScroll <= 0) return;

        node.scrollTop = Math.min(
          maxScroll,
          Math.max(0, node.scrollTop + event.deltaY),
        );
        event.preventDefault();
      };

      node.addEventListener('wheel', onWheel, { passive: false });
      countryListWheelCleanupRef.current = () => {
        node.removeEventListener('wheel', onWheel);
      };
    },
    [menuPortalContainer],
  );

  useEffect(
    () => () => {
      countryListWheelCleanupRef.current?.();
    },
    [],
  );

  // Track the input shell width so the country dropdown aligns to the full
  // field width, not just the trigger button — per auth layout spec.
  useEffect(() => {
    const el = inputShellRef.current;
    if (!el) return;

    const syncWidth = () => setMenuWidth(el.getBoundingClientRect().width);
    syncWidth();

    const observer = new ResizeObserver(syncWidth);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const country =
    getCountryByIso(countryIso) ?? parseInitialCountry(value);
  const { max: maxNationalLength } = getNationalLength(country);

  // Strip the dial code prefix so only the national segment is shown/edited.
  // `onChange` always emits the full E.164 value.
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
    <div className={cn('phone-field flex w-full flex-col gap-auth-field', className)}>
      {showLabel ? (
        <label htmlFor={id} className={typo.label}>
          {label}
        </label>
      ) : null}

      <div
        ref={inputShellRef}
        className={cn(
          'phone-field__shell',
          phoneFieldShellClassName,
          'flex items-center gap-3 px-3',
          error &&
            'border-destructive focus-within:border-destructive focus-within:shadow-[0_0_0_2px_color-mix(in_oklab,var(--destructive)_30%,transparent)]',
          disabled && 'cursor-not-allowed opacity-50',
        )}
      >
          {/*
            Non-modal: modal menus lock body scroll and remove the scrollbar,
            which shifts the page (and form) when the country list opens.
          */}
          <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild disabled={disabled}>
              <button
                type="button"
                className={cn(
                  'inline-flex h-full shrink-0 items-center gap-1 rounded-sm px-1.5',
                  typo.input,
                  'outline-none transition-colors hover:bg-background',
                  'focus:outline-none focus-visible:bg-background focus-visible:outline-none focus-visible:ring-0',
                  'disabled:pointer-events-none',
                )}
                aria-label="Select country code"
              >
                <span className="tabular-nums">{country.dialCode}</span>
                <ChevronIcon
                  direction="down"
                  className="text-muted-foreground"
                />
              </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent
              side="bottom"
              align="start"
              alignOffset={-12}
              sideOffset={8}
              avoidCollisions={false}
              container={menuPortalContainer ?? undefined}
              style={menuWidth ? { width: menuWidth } : undefined}
              className={cn(
                'group/thin-scroll max-w-[calc(100vw-2rem)] overflow-hidden rounded-md border-border bg-card p-0 shadow-md',
                !menuWidth && 'w-[min(20rem,calc(100vw-2.5rem))]',
                typo.input,
                menuContentClassName,
              )}
            >
              <div
                ref={countryListRef}
                className="thin-hover-scroll max-h-64 overflow-y-auto overscroll-contain p-1.5"
                onWheel={(event) => event.stopPropagation()}
              >
                {COUNTRY_DIAL_CODES_ORDERED.map((item) => {
                  const selected = item.iso === country.iso;

                  return (
                    <DropdownMenuItem
                      key={item.iso}
                      onSelect={() => handleCountrySelect(item)}
                      className={cn(
                        'cursor-pointer gap-3 rounded-sm px-3 py-2.5',
                        typo.input,
                        selected && 'bg-background text-foreground',
                      )}
                    >
                      <span className="min-w-0 flex-1 truncate">{item.name}</span>
                      <span className="shrink-0 tabular-nums text-muted-foreground">
                        {item.dialCode}
                      </span>
                    </DropdownMenuItem>
                  );
                })}
              </div>
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
              'phone-field__input h-full min-w-0 flex-1 border-0 bg-transparent p-0 shadow-none',
              typo.input,
              fieldInputAutofillClassName,
              'outline-none focus:outline-none focus-visible:outline-none focus-visible:ring-0',
              'placeholder:text-placeholder',
              'disabled:cursor-not-allowed',
            )}
          />
      </div>
      {showError ? <AuthFieldError error={error} /> : null}
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
