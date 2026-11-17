"use client";

import { Calendar03Icon, CalendarRangeIcon } from "@hugeicons/core-free-icons";
import type { IconSvgElement } from "@hugeicons/react";
import {
  DatePicker as AriaDatePicker,
  type DatePickerProps as AriaDatePickerProps,
  DateRangePicker as AriaDateRangePicker,
  type DateRangePickerProps as AriaDateRangePickerProps,
  type DateValue as AriaDateValue,
  Dialog as AriaDialog,
  type DialogProps as AriaDialogProps,
  type PopoverProps as AriaPopoverProps,
  type ValidationResult as AriaValidationResult,
  composeRenderProps,
  Text,
} from "react-aria-components";

import { I18nProvider } from "react-aria/I18nProvider";

import { AppIcon } from "@/components/shared/AppIcon";
import { cn } from "@/lib/utils";
import { AriaIconButton } from "@/components/ui/aria-button";
import {
  Calendar,
  CalendarCell,
  CalendarGrid,
  CalendarGridBody,
  CalendarGridHeader,
  CalendarHeaderCell,
  CalendarHeading,
  RangeCalendar,
} from "@/components/ui/calendar";
import { DateInput } from "@/components/ui/datefield";
import { FieldError, FieldGroup, Label } from "@/components/ui/field";
import { Popover } from "@/components/ui/popover";
import { BADGE_ICON_SIZE } from "@/lib/icons";
import { typo } from "@/lib/tokens/typography";

const DatePicker = AriaDatePicker;
const DateRangePicker = AriaDateRangePicker;

/** Day-first order (dd / mm / yyyy) with locale-appropriate separators. */
const JOLLY_DATE_PICKER_LOCALE = "en-GB";

/**
 * Fixed slot for dd/mm/yyyy (leading zeros) so empty vs filled never shifts width.
 * Calendar button is sized separately; total field = this + icon + padding.
 */
const JOLLY_DATE_SEGMENT_SLOT_CLASS = "h-11 w-[7.5rem]";

/** Compact field chrome: fixed date slot + calendar control (no stretch). */
const jollyDatePickerFieldGroupClassName = cn(
  "relative inline-flex h-11 w-fit max-w-full shrink-0 flex-nowrap items-center overflow-hidden rounded-md border border-border bg-card p-0",
  "transition-[border-color,box-shadow] duration-150 ease-in-out",
  "hover:border-border",
  "data-[focus-within]:border-border-focus data-[focus-within]:outline-none data-[focus-within]:ring-2 data-[focus-within]:ring-ring/40",
  "data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50",
);

const jollyDatePickerInputClassName = cn(
  typo.input,
  JOLLY_DATE_SEGMENT_SLOT_CLASS,
  "box-border flex shrink-0 items-center overflow-hidden whitespace-nowrap border-0 bg-transparent py-0 pl-2.5 pr-1 shadow-none ring-0 tabular-nums",
  "[&_[data-placeholder]]:text-placeholder",
);

const jollyDatePickerCalendarButtonClassName = cn(
  "mr-1 size-8 shrink-0 text-muted-foreground hover:text-foreground",
  "data-[focus-visible]:ring-offset-0",
);

const jollyDateRangePickerFieldGroupClassName = cn(
  jollyDatePickerFieldGroupClassName,
  "w-full flex-row flex-nowrap items-center",
);

const jollyDateRangeDateInputClassName = cn(
  jollyDatePickerInputClassName,
  "inline-flex min-w-0 shrink basis-0 flex-1 flex-nowrap items-center px-1 text-xs leading-4",
);

function DatePickerContent({
  className,
  popoverClassName,
  portalContainer,
  ...props
}: AriaDialogProps & {
  popoverClassName?: AriaPopoverProps["className"];
  /** Portal into a dialog node so the calendar receives clicks under Radix modal. */
  portalContainer?: Element | null;
}) {
  return (
    <Popover
      UNSTABLE_portalContainer={portalContainer ?? undefined}
      className={composeRenderProps(popoverClassName, (className) =>
        cn("pointer-events-auto w-auto p-3", className),
      )}
    >
      <AriaDialog
        className={cn(
          "flex w-full flex-col space-y-4 outline-none sm:flex-row sm:space-x-4 sm:space-y-0",
          className,
        )}
        {...props}
      />
    </Popover>
  );
}

interface JollyDatePickerProps<T extends AriaDateValue>
  extends AriaDatePickerProps<T> {
  label?: string;
  description?: string;
  errorMessage?: string | ((validation: AriaValidationResult) => string);
  /**
   * Portal target for the calendar popover (e.g. dialog content node).
   * Required when the picker is used inside a Radix modal Dialog.
   */
  portalContainer?: Element | null;
  /** Extra classes for the calendar popover (e.g. z-110 above dialog). */
  popoverClassName?: AriaPopoverProps["className"];
  /** When false, omit the built-in label (use an external `FieldLabel` instead). */
  showLabel?: boolean;
  labelClassName?: string;
  fieldGroupClassName?: string;
  dateInputClassName?: string;
  /** Shown inside the field when {@link value} is empty (e.g. "From"). */
  inputPlaceholder?: string;
  /** BCP 47 locale for segment order and separators (default {@link JOLLY_DATE_PICKER_LOCALE}). */
  locale?: string;
  /** Pad day and month with leading zeros (default `true`). */
  shouldForceLeadingZeros?: boolean;
}

function JollyDatePicker<T extends AriaDateValue>({
  label,
  description,
  errorMessage,
  className,
  portalContainer,
  popoverClassName,
  showLabel = true,
  labelClassName,
  fieldGroupClassName,
  dateInputClassName,
  inputPlaceholder,
  locale = JOLLY_DATE_PICKER_LOCALE,
  shouldForceLeadingZeros = true,
  value,
  ...props
}: JollyDatePickerProps<T>) {
  const showInputPlaceholder =
    inputPlaceholder != null && (value === null || value === undefined);
  return (
    <I18nProvider locale={locale}>
      <DatePicker
        className={composeRenderProps(className, (className) =>
          cn(
            "group flex w-fit max-w-full min-w-0 flex-col",
            showLabel ? "gap-2" : "gap-0",
            className,
          ),
        )}
        shouldForceLeadingZeros={shouldForceLeadingZeros}
        value={value}
        {...props}
      >
      {showLabel && label ? (
        <Label className={cn(typo.label, labelClassName)}>{label}</Label>
      ) : null}
      <FieldGroup
        variant="ghost"
        className={cn(
          jollyDatePickerFieldGroupClassName,
          "relative",
          fieldGroupClassName,
        )}
      >
        {showInputPlaceholder ? (
          <span
            aria-hidden
            className={cn(
              typo.input,
              JOLLY_DATE_SEGMENT_SLOT_CLASS,
              "pointer-events-none absolute inset-y-0 left-0 z-10 box-border flex items-center pl-2.5 pr-1 text-placeholder tabular-nums",
            )}
          >
            {inputPlaceholder}
          </span>
        ) : null}
        <DateInput
          className={cn(
            jollyDatePickerInputClassName,
            dateInputClassName,
            /* Keep the same 7.5rem slot while empty; hide dd/mm/yyyy under From / To. */
            showInputPlaceholder && "opacity-0",
          )}
          variant="ghost"
        />
        <AriaIconButton
          variant="ghost"
          size="icon"
          data-slot="calendar-button"
          className={jollyDatePickerCalendarButtonClassName}
        >
          <AppIcon icon={Calendar03Icon} size={BADGE_ICON_SIZE} aria-hidden />
        </AriaIconButton>
      </FieldGroup>
      {description ? (
        <Text className="text-sm text-muted-foreground" slot="description">
          {description}
        </Text>
      ) : null}
      <FieldError>{errorMessage}</FieldError>
      <DatePickerContent
        portalContainer={portalContainer}
        popoverClassName={popoverClassName}
      >
        <Calendar>
          <CalendarHeading />
          <CalendarGrid>
            <CalendarGridHeader>
              {(day) => <CalendarHeaderCell>{day}</CalendarHeaderCell>}
            </CalendarGridHeader>
            <CalendarGridBody>
              {(date) => <CalendarCell date={date} />}
            </CalendarGridBody>
          </CalendarGrid>
        </Calendar>
      </DatePickerContent>
      </DatePicker>
    </I18nProvider>
  );
}

interface JollyDateRangePickerProps<T extends AriaDateValue>
  extends AriaDateRangePickerProps<T> {
  label?: string;
  description?: string;
  errorMessage?: string | ((validation: AriaValidationResult) => string);
  portalContainer?: Element | null;
  popoverClassName?: AriaPopoverProps["className"];
  showLabel?: boolean;
  fieldGroupClassName?: string;
  dateInputClassName?: string;
  /** Defaults to {@link CalendarRangeIcon} (single-date pickers use {@link Calendar03Icon}). */
  calendarIcon?: IconSvgElement;
  locale?: string;
  shouldForceLeadingZeros?: boolean;
}

function JollyDateRangePicker<T extends AriaDateValue>({
  label,
  description,
  errorMessage,
  className,
  portalContainer,
  popoverClassName,
  showLabel = true,
  fieldGroupClassName,
  dateInputClassName,
  calendarIcon = CalendarRangeIcon,
  locale = JOLLY_DATE_PICKER_LOCALE,
  shouldForceLeadingZeros = true,
  ...props
}: JollyDateRangePickerProps<T>) {
  return (
    <I18nProvider locale={locale}>
      <DateRangePicker
        className={composeRenderProps(className, (className) =>
          cn(
            "group flex w-full min-w-0 flex-col",
            showLabel ? "gap-2" : "gap-0",
            className,
          ),
        )}
        shouldForceLeadingZeros={shouldForceLeadingZeros}
        {...props}
      >
      {showLabel && label ? (
        <Label className={typo.label}>{label}</Label>
      ) : null}
      <FieldGroup
        variant="ghost"
        className={cn(
          jollyDateRangePickerFieldGroupClassName,
          "min-w-0",
          fieldGroupClassName,
        )}
      >
        <DateInput
          variant="ghost"
          slot="start"
          className={cn(jollyDateRangeDateInputClassName, dateInputClassName)}
        />
        <span
          aria-hidden
          className="shrink-0 whitespace-nowrap px-0.5 text-xs text-muted-foreground"
        >
          To
        </span>
        <DateInput
          className={cn(jollyDateRangeDateInputClassName, dateInputClassName)}
          variant="ghost"
          slot="end"
        />
        <AriaIconButton
          variant="ghost"
          size="icon"
          data-slot="calendar-button"
          className={jollyDatePickerCalendarButtonClassName}
        >
          <AppIcon icon={calendarIcon} size={BADGE_ICON_SIZE} aria-hidden />
        </AriaIconButton>
      </FieldGroup>
      {description ? (
        <Text className="text-sm text-muted-foreground" slot="description">
          {description}
        </Text>
      ) : null}
      <FieldError>{errorMessage}</FieldError>
      <DatePickerContent
        portalContainer={portalContainer}
        popoverClassName={popoverClassName}
      >
        <RangeCalendar>
          <CalendarHeading />
          <CalendarGrid>
            <CalendarGridHeader>
              {(day) => <CalendarHeaderCell>{day}</CalendarHeaderCell>}
            </CalendarGridHeader>
            <CalendarGridBody>
              {(date) => <CalendarCell date={date} />}
            </CalendarGridBody>
          </CalendarGrid>
        </RangeCalendar>
      </DatePickerContent>
      </DateRangePicker>
    </I18nProvider>
  );
}

export {
  DatePicker,
  DatePickerContent,
  DateRangePicker,
  JollyDatePicker,
  JollyDateRangePicker,
};
export type { JollyDatePickerProps, JollyDateRangePickerProps };
