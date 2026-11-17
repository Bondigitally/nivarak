"use client";

import { parseDate, type DateValue } from "@internationalized/date";
import { JollyDatePicker } from "@/components/ui/date-range-picker";
import { cn } from "@/lib/utils";

/** Parse a stored YYYY-MM-DD string into a DateValue for {@link JollyDatePicker}. */
export function dateValueFromIso(iso: string): DateValue | null {
  const trimmed = iso.trim();
  if (!trimmed) return null;
  try {
    return parseDate(trimmed);
  } catch {
    return null;
  }
}

type CgaDatePickerProps = {
  id?: string;
  /** Stored as YYYY-MM-DD (empty string when unset). */
  value: string;
  onChange: (iso: string) => void;
  "aria-label": string;
  label?: string;
  /** When false, use an external label (default). */
  showLabel?: boolean;
  isDisabled?: boolean;
  className?: string;
  fieldGroupClassName?: string;
  dateInputClassName?: string;
  inputPlaceholder?: string;
  portalContainer?: Element | null;
};

/**
 * CGA date control: segment typing (dd/mm/yyyy) plus calendar button.
 * Same pattern as Active diagnoses / medical-history date fields.
 * Width hugs the date slot + calendar button (`w-fit`).
 */
export function CgaDatePicker({
  id,
  value,
  onChange,
  "aria-label": ariaLabel,
  label,
  showLabel = false,
  isDisabled = false,
  className,
  fieldGroupClassName,
  dateInputClassName,
  inputPlaceholder,
  portalContainer,
}: CgaDatePickerProps) {
  return (
    <JollyDatePicker
      id={id}
      aria-label={ariaLabel}
      label={label}
      showLabel={showLabel}
      isDisabled={isDisabled}
      className={cn("w-fit max-w-full shrink-0", className)}
      fieldGroupClassName={cn("w-fit shrink-0", fieldGroupClassName)}
      dateInputClassName={dateInputClassName}
      inputPlaceholder={inputPlaceholder}
      portalContainer={portalContainer}
      value={dateValueFromIso(value)}
      onChange={(next) => onChange(next ? next.toString() : "")}
    />
  );
}
