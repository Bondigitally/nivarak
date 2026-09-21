"use client";

import { useEffect, useMemo, useState } from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react";
import {
  ArrowDown01Icon,
  ArrowLeft01Icon,
  ArrowRight01Icon,
  Cancel01Icon,
  DateTimeIcon,
  Home03Icon,
  Hospital01Icon,
  Video02Icon,
} from "@hugeicons/core-free-icons";
import {
  Dialog,
  DialogClose,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  dialogBodyShellClass,
  dialogCloseButtonClass,
  dialogFooterShellClass,
  dialogHeaderShellClass,
  dialogPrimitiveContentClass,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useSidebar } from "@/components/layout/sidebar-context";
import { typo } from "@/lib/tokens/typography";
import { cn } from "@/lib/utils";

type VisitTypeId = "home" | "teleconsult" | "clinic";

type DateOption = {
  id: string;
  weekday: string;
  day: string;
  month: string;
  disabled: boolean;
};

const VISIT_TYPES: {
  id: VisitTypeId;
  title: string;
  description: string;
  icon: IconSvgElement;
}[] = [
  {
    id: "home",
    title: "Home Visit",
    description: "A clinician will visit your home.",
    icon: Home03Icon,
  },
  {
    id: "teleconsult",
    title: "Teleconsult",
    description: "Consult a clinician online.",
    icon: Video02Icon,
  },
  {
    id: "clinic",
    title: "Clinic Visit",
    description: "Visit our clinic in person.",
    icon: Hospital01Icon,
  },
];

const VISIT_REASONS = [
  "Routine check-up",
  "Follow-up visit",
  "New symptom",
  "Medication review",
  "Care plan discussion",
] as const;

const WEEKDAY_LABELS = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"] as const;
const MONTH_LABELS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
] as const;
const DAYS_PER_PAGE = 7;

const TIME_OPTIONS = [
  { id: "11:00 AM", disabled: true },
  { id: "12:00 PM", disabled: true },
  { id: "01:00 PM", disabled: false },
  { id: "02:00 PM", disabled: false },
  { id: "03:00 PM", disabled: false },
  { id: "04:00 PM", disabled: false },
  { id: "05:00 PM", disabled: false },
  { id: "06:00 PM", disabled: false },
] as const;

function startOfLocalDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function toDateId(date: Date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function buildDateOption(date: Date, today: Date): DateOption {
  const dayOfWeek = date.getDay();
  // Busy / unavailable dates — re-enable when API provides busy slots.
  // const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
  // const isPast = date.getTime() < today.getTime();
  // const isBusy = busyDateIds.has(toDateId(date));
  void today;
  return {
    id: toDateId(date),
    weekday: WEEKDAY_LABELS[dayOfWeek],
    day: String(date.getDate()),
    month: MONTH_LABELS[date.getMonth()],
    // disabled: isWeekend || isPast || isBusy,
    disabled: false,
  };
}

function getVisibleDates(weekOffset: number): DateOption[] {
  const today = startOfLocalDay(new Date());
  const rangeStart = addDays(today, weekOffset * DAYS_PER_PAGE);
  return Array.from({ length: DAYS_PER_PAGE }, (_, index) =>
    buildDateOption(addDays(rangeStart, index), today),
  );
}

function firstAvailableDateId(dates: DateOption[]) {
  // Prefer first non-busy date when disabled logic is re-enabled:
  // return dates.find((date) => !date.disabled)?.id ?? dates[0]?.id ?? "";
  return dates[0]?.id ?? "";
}

const DATE_NAV_BTN =
  "inline-flex size-9 shrink-0 items-center justify-center rounded-full border border-border bg-card text-muted-foreground shadow-[0_1px_1px_rgba(17,24,39,0.04)] transition-colors duration-300 ease-out hover:bg-background hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-card disabled:hover:text-muted-foreground";

export function BookVisitModal() {
  const { bookVisitOpen, setBookVisitOpen } = useSidebar();
  const [visitType, setVisitType] = useState<VisitTypeId>("home");
  const [reason, setReason] = useState<string | null>(null);
  const [weekOffset, setWeekOffset] = useState(0);
  const [dateId, setDateId] = useState(() => firstAvailableDateId(getVisibleDates(0)));
  const [timeId, setTimeId] = useState<string>("01:00 PM");

  const visibleDates = useMemo(() => getVisibleDates(weekOffset), [weekOffset]);

  const selectedVisit =
    VISIT_TYPES.find((item) => item.id === visitType) ?? VISIT_TYPES[0];

  const selectedDate = useMemo(() => {
    const fromVisible = visibleDates.find((date) => date.id === dateId);
    if (fromVisible) return fromVisible;
    const [year, month, day] = dateId.split("-").map(Number);
    if (!year || !month || !day) return visibleDates[0];
    return buildDateOption(
      new Date(year, month - 1, day),
      startOfLocalDay(new Date()),
    );
  }, [visibleDates, dateId]);

  const scheduleLabel = useMemo(() => {
    return `${selectedDate.weekday} ${selectedDate.day} ${selectedDate.month} at ${timeId}`;
  }, [selectedDate, timeId]);

  useEffect(() => {
    if (!bookVisitOpen) return;
    const id = window.setTimeout(() => {
      setVisitType("home");
      setReason(null);
      setWeekOffset(0);
      setDateId(firstAvailableDateId(getVisibleDates(0)));
      setTimeId("01:00 PM");
    }, 0);
    return () => window.clearTimeout(id);
  }, [bookVisitOpen]);

  function goPrevWeek() {
    if (weekOffset <= 0) return;
    const next = weekOffset - 1;
    setWeekOffset(next);
    setDateId(firstAvailableDateId(getVisibleDates(next)));
  }

  function goNextWeek() {
    const next = weekOffset + 1;
    setWeekOffset(next);
    setDateId(firstAvailableDateId(getVisibleDates(next)));
  }

  function handleConfirm() {
    setBookVisitOpen(false);
  }

  return (
    <Dialog open={bookVisitOpen} onOpenChange={setBookVisitOpen}>
      <DialogPortal>
        <DialogOverlay />
        <DialogPrimitive.Content
          className={cn(
            dialogPrimitiveContentClass("max-w-160 sm:max-w-160"),
            "max-h-[min(92vh,880px)]",
          )}
          onOpenAutoFocus={(event) => {
            event.preventDefault();
            (event.currentTarget as HTMLElement).focus();
          }}
        >
        <DialogHeader className={dialogHeaderShellClass}>
          <div className="min-w-0 pr-2">
            <DialogTitle className={cn(typo.headingXxl, "text-foreground")}>
              Book a visit
            </DialogTitle>
            <DialogDescription className="sr-only">
              Choose a visit type, reason, and preferred schedule for your appointment request.
            </DialogDescription>
          </div>
          <DialogClose asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label="Close"
              className={cn("inline-flex", dialogCloseButtonClass)}
            >
              <HugeiconsIcon
                icon={Cancel01Icon}
                size={19}
                strokeWidth={1.5}
                color="currentColor"
              absoluteStrokeWidth />
            </Button>
          </DialogClose>
        </DialogHeader>

        <div className={dialogBodyShellClass}>
          <section className="flex flex-col gap-3 sm:gap-4">
            <h2 className={cn(typo.headingM, "text-foreground")}>Select Visit Type</h2>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
              {VISIT_TYPES.map((type) => {
                const selected = type.id === visitType;
                return (
                  <button
                    key={type.id}
                    type="button"
                    onClick={() => setVisitType(type.id)}
                    aria-pressed={selected}
                    className={cn(
                      "flex flex-col items-start gap-1 rounded-md border p-4 text-left shadow-[0_2px_4px_rgba(17,24,39,0.05)] transition-colors",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                      selected
                        ? "border-primary bg-sidebar-accent text-primary-active"
                        : "border-border bg-card text-foreground hover:bg-background",
                    )}
                  >
                    <HugeiconsIcon
                      icon={type.icon}
                      size={19}
                      strokeWidth={1.5}
                      color="currentColor"
                    absoluteStrokeWidth />
                    <span
                      className={cn(
                        typo.headingS,
                        "pt-2 text-sm leading-5",
                        selected
                          ? "text-primary-active"
                          : "text-foreground",
                      )}
                    >
                      {type.title}
                    </span>
                    <span className={cn(typo.caption, "text-tertiary-foreground")}>
                      {type.description}
                    </span>
                  </button>
                );
              })}
            </div>
          </section>

          <section className="flex flex-col gap-3 sm:gap-4">
            <h2 className={cn(typo.headingM, "text-foreground")}>Reason for Visit</h2>
            <DropdownMenu modal={false}>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className={cn(
                    "relative flex h-12 w-full items-center rounded-md border border-border bg-card px-4 shadow-[0_2px_4px_rgba(17,24,39,0.05)] sm:h-14",
                    "text-left outline-none transition-colors hover:bg-background",
                    "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                  )}
                >
                  <span
                    className={cn(
                      typo.input,
                      "min-w-0 flex-1",
                      !reason && "text-muted-foreground",
                    )}
                  >
                    {reason ?? "Select a reason..."}
                  </span>
                  <HugeiconsIcon
                    icon={ArrowDown01Icon}
                    size={19}
                    strokeWidth={1.5}
                    color="currentColor"
                    className="shrink-0 text-muted-foreground"
                  absoluteStrokeWidth />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="start"
                sideOffset={8}
                className="z-110 w-(--radix-dropdown-menu-trigger-width) rounded-md border-border bg-card p-1.5 shadow-md"
              >
                {VISIT_REASONS.map((item) => (
                  <DropdownMenuItem
                    key={item}
                    onSelect={() => setReason(item)}
                    className={cn(
                      "cursor-pointer rounded-sm px-3 py-2.5",
                      typo.input,
                      reason === item && "bg-background",
                    )}
                  >
                    {item}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </section>

          <section className="flex flex-col gap-3 sm:gap-4">
            <div className="flex items-center justify-between gap-3">
              <h2 className={cn(typo.headingM, "min-w-0 text-foreground")}>
                Preferred Schedule
              </h2>
              <div className="flex shrink-0 items-center gap-2">
                <button
                  type="button"
                  aria-label="Previous dates"
                  disabled={weekOffset === 0}
                  onClick={goPrevWeek}
                  className={DATE_NAV_BTN}
                >
                  <HugeiconsIcon
                    icon={ArrowLeft01Icon}
                    size={19}
                    strokeWidth={1.5}
                    color="currentColor"
                  absoluteStrokeWidth />
                </button>
                <button
                  type="button"
                  aria-label="Next dates"
                  onClick={goNextWeek}
                  className={DATE_NAV_BTN}
                >
                  <HugeiconsIcon
                    icon={ArrowRight01Icon}
                    size={19}
                    strokeWidth={1.5}
                    color="currentColor"
                  absoluteStrokeWidth />
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <p className={cn(typo.bodyM, "text-tertiary-foreground")}>Date</p>
              <div className="flex gap-2 sm:gap-3">
                {visibleDates.map((date) => {
                  const selected = date.id === dateId;
                  return (
                    <button
                      key={date.id}
                      type="button"
                      // Re-enable when busy dates are wired up:
                      // disabled={date.disabled}
                      onClick={() => setDateId(date.id)}
                      aria-pressed={selected}
                      className={cn(
                        "flex min-w-0 flex-1 flex-col items-center rounded-md px-1.5 py-2.5 transition-colors duration-300 ease-out sm:px-2",
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                        selected
                          ? "bg-primary p-2 text-primary-foreground"
                          : "border border-border bg-card text-muted-foreground",
                        // date.disabled && "cursor-not-allowed opacity-50",
                      )}
                    >
                      <span
                        className={cn(
                          "text-xs uppercase leading-4 tracking-[0.6px]",
                          selected ? "font-bold text-primary-foreground" : "font-normal",
                        )}
                      >
                        {date.weekday}
                      </span>
                      <span
                        className={cn(
                          "text-2xl font-semibold leading-8",
                          selected ? "text-primary-foreground" : "text-foreground",
                        )}
                      >
                        {date.day}
                      </span>
                      <span
                        className={cn(
                          "text-xs leading-4",
                          selected ? "text-primary-foreground" : "text-muted-foreground",
                        )}
                      >
                        {date.month}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <p className={cn(typo.bodyM, "text-tertiary-foreground")}>Time</p>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {TIME_OPTIONS.map((time) => {
                  const selected = time.id === timeId;
                  return (
                    <button
                      key={time.id}
                      type="button"
                      disabled={time.disabled}
                      onClick={() => setTimeId(time.id)}
                      aria-pressed={selected}
                      className={cn(
                        "flex h-11 items-center justify-center rounded-md border px-4 shadow-[0_1px_1px_rgba(17,24,39,0.04)] transition-colors sm:px-5",
                        typo.button,
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                        selected
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border bg-card text-foreground hover:bg-background",
                        time.disabled && "cursor-not-allowed opacity-50 hover:bg-card",
                      )}
                    >
                      {time.id}
                    </button>
                  );
                })}
              </div>
            </div>
          </section>

          <div className="flex items-start justify-between gap-4 rounded-md bg-background p-4 shadow-[0_2px_4px_rgba(17,24,39,0.05)]">
            <div className="flex min-w-0 flex-col gap-0.5">
              <p className={cn(typo.headingS, "text-sm leading-5 text-foreground")}>
                {selectedVisit.title}
              </p>
              <p className={cn(typo.bodyM, "text-muted-foreground")}>
                {scheduleLabel}
              </p>
            </div>
            <div className="flex shrink-0 flex-col items-end gap-0.5 text-right">
              <p className={cn(typo.headingS, "text-sm leading-5 text-foreground")}>
                Pending
              </p>
              <p className={cn(typo.caption, "text-muted-foreground")}>
                Subject to confirmation
              </p>
            </div>
          </div>
        </div>

        <DialogFooter className={cn(dialogFooterShellClass, "sm:flex-col sm:justify-stretch")}>
          <p className={cn(typo.bodyM, "text-center text-tertiary-foreground")}>
            Your care coordinator will confirm the assigned clinician.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
            <Button
              type="button"
              variant="secondary"
              size="cta"
              className="flex-1 shadow-[0_1px_1px_rgba(17,24,39,0.04)]"
              onClick={() => setBookVisitOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              size="cta"
              className="flex-1 shadow-[0_1px_1px_rgba(17,24,39,0.04)]"
              onClick={handleConfirm}
            >
              <HugeiconsIcon
                icon={DateTimeIcon}
                size={19}
                strokeWidth={1.5}
                color="currentColor"
              absoluteStrokeWidth />
              Confirm request
            </Button>
          </div>
        </DialogFooter>
        </DialogPrimitive.Content>
      </DialogPortal>
    </Dialog>
  );
}
