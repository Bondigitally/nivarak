"use client";

import { Calendar03Icon } from "@hugeicons/core-free-icons";
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
import { BADGE_ICON_SIZE, ICON_SIZE } from "@/lib/icons";
import { typo } from "@/lib/tokens/typography";

const DatePicker = AriaDatePicker;
const DateRangePicker = AriaDateRangePicker;

/** Match {@link fieldInputClassName} chrome when the label is rendered externally. */
const jollyDatePickerFieldGroupClassName = cn(
  "relative flex h-11 w-full min-w-0 items-center overflow-hidden rounded-md border border-border bg-card p-0",
  "transition-[border-color,box-shadow] duration-150 ease-in-out",
  "hover:border-border",
  "data-[focus-within]:border-border-focus data-[focus-within]:outline-none data-[focus-within]:ring-2 data-[focus-within]:ring-ring/40",
  "data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50",
);

const jollyDatePickerInputClassName = cn(
  typo.input,
  "min-w-0 flex-1 border-0 bg-transparent px-4 shadow-none ring-0",
  "[&_[data-placeholder]]:text-placeholder",
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
  ...props
}: JollyDatePickerProps<T>) {
  return (
    <DatePicker
      className={composeRenderProps(className, (className) =>
        cn(
          "group flex w-full flex-col",
          showLabel ? "gap-2" : "gap-0",
          className,
        ),
      )}
      {...props}
    >
      {showLabel && label ? (
        <Label className={cn(typo.label, labelClassName)}>{label}</Label>
      ) : null}
      <FieldGroup
        variant="ghost"
        className={cn(jollyDatePickerFieldGroupClassName, fieldGroupClassName)}
      >
        <DateInput
          className={cn(jollyDatePickerInputClassName, dateInputClassName)}
          variant="ghost"
        />
        <AriaIconButton
          variant="ghost"
          size="icon"
          className="mr-3 size-9 shrink-0 text-muted-foreground hover:text-foreground data-[focus-visible]:ring-offset-0"
        >
          <AppIcon icon={Calendar03Icon} size={ICON_SIZE} aria-hidden />
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
  );
}

interface JollyDateRangePickerProps<T extends AriaDateValue>
  extends AriaDateRangePickerProps<T> {
  label?: string;
  description?: string;
  errorMessage?: string | ((validation: AriaValidationResult) => string);
}

function JollyDateRangePicker<T extends AriaDateValue>({
  label,
  description,
  errorMessage,
  className,
  ...props
}: JollyDateRangePickerProps<T>) {
  return (
    <DateRangePicker
      className={composeRenderProps(className, (className) =>
        cn("group flex flex-col gap-2", className),
      )}
      {...props}
    >
      {label ? <Label>{label}</Label> : null}
      <FieldGroup className="min-w-0">
        <DateInput variant="ghost" slot="start" />
        <span aria-hidden className="px-2 text-sm text-muted-foreground">
          -
        </span>
        <DateInput className="flex-1" variant="ghost" slot="end" />
        <AriaIconButton
          variant="ghost"
          size="icon"
          className="mr-1 size-6 data-[focus-visible]:ring-offset-0"
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
      <DatePickerContent>
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
