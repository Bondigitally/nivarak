"use client";

import { useMemo, useState } from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react";
import {
  ArrowDown01Icon,
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

const DATE_OPTIONS = [
  { id: "mon-12", weekday: "MON", day: "12", month: "Nov", disabled: false },
  { id: "tue-13", weekday: "TUE", day: "13", month: "Nov", disabled: false },
  { id: "wed-14", weekday: "WED", day: "14", month: "Nov", disabled: false },
  { id: "thu-15", weekday: "THU", day: "15", month: "Nov", disabled: false },
  { id: "fri-16", weekday: "FRI", day: "16", month: "Nov", disabled: false },
  { id: "sat-17", weekday: "SAT", day: "17", month: "Nov", disabled: true },
  { id: "sun-18", weekday: "SUN", day: "18", month: "Nov", disabled: true },
] as const;

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

export function BookVisitModal() {
  const { bookVisitOpen, setBookVisitOpen } = useSidebar();
  const [visitType, setVisitType] = useState<VisitTypeId>("home");
  const [reason, setReason] = useState<string | null>(null);
  const [dateId, setDateId] = useState<string>("tue-13");
  const [timeId, setTimeId] = useState<string>("01:00 PM");

  const selectedVisit = VISIT_TYPES.find((item) => item.id === visitType) ?? VISIT_TYPES[0];
  const selectedDate = DATE_OPTIONS.find((item) => item.id === dateId) ?? DATE_OPTIONS[1];

  const scheduleLabel = useMemo(() => {
    return `${selectedDate.weekday} ${selectedDate.day} ${selectedDate.month} at ${timeId}`;
  }, [selectedDate, timeId]);

  function handleConfirm() {
    setBookVisitOpen(false);
  }

  return (
    <Dialog open={bookVisitOpen} onOpenChange={setBookVisitOpen}>
      <DialogPortal>
        <DialogOverlay className="z-100" />
        <DialogPrimitive.Content
          className={cn(
            "fixed top-1/2 left-1/2 z-100 flex max-h-[min(92vh,880px)] w-[calc(100%-2rem)] max-w-160 -translate-x-1/2 -translate-y-1/2 flex-col gap-0 overflow-hidden rounded-[20px] border border-[#E9E4ED] bg-white p-0 shadow-[0_12px_24px_-4px_rgba(17,24,39,0.12)] outline-none sm:max-w-160",
            "duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out",
            "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
            "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
          )}
          onOpenAutoFocus={(event) => {
            event.preventDefault();
            (event.currentTarget as HTMLElement).focus();
          }}
        >
        <DialogHeader
          className="flex shrink-0 flex-row items-center justify-between gap-4 space-y-0 rounded-none border-b border-[#E9E4ED] bg-transparent px-6 py-5 text-left sm:px-8 sm:py-6"
        >
          <div className="min-w-0 pr-2">
            <DialogTitle className={cn(typo.headingXxl, "text-[#1A1A1A]")}>
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
              className="size-10 shrink-0 rounded-full text-muted-foreground shadow-[0_1px_1px_rgba(17,24,39,0.04)] hover:text-foreground"
            >
              <HugeiconsIcon
                icon={Cancel01Icon}
                size={16}
                strokeWidth={1.75}
                color="currentColor"
              />
            </Button>
          </DialogClose>
        </DialogHeader>

        <div className="flex min-h-0 flex-1 flex-col gap-6 overflow-x-hidden overflow-y-auto overscroll-contain px-6 py-6 sm:gap-8 sm:px-8 sm:py-7">
          <section className="flex flex-col gap-3 sm:gap-4">
            <h2 className={cn(typo.headingM, "text-[#1A1A1A]")}>Select Visit Type</h2>
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
                      "flex flex-col items-start gap-1 rounded-[14px] border p-4 text-left shadow-[0_2px_4px_rgba(17,24,39,0.05)] transition-colors",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                      selected
                        ? "border-primary bg-[#FFF7FC]"
                        : "border-[#E9E4ED] bg-white hover:bg-[#F8F5FA]",
                    )}
                  >
                    <HugeiconsIcon
                      icon={type.icon}
                      size={19}
                      strokeWidth={1.75}
                      color="currentColor"
                    />
                    <span className={cn(typo.headingS, "pt-2 text-sm leading-5 text-[#1A1A1A]")}>
                      {type.title}
                    </span>
                    <span className={cn(typo.caption, "text-[#8A8F98]")}>{type.description}</span>
                  </button>
                );
              })}
            </div>
          </section>

          <section className="flex flex-col gap-3 sm:gap-4">
            <h2 className={cn(typo.headingM, "text-[#1A1A1A]")}>Reason for Visit</h2>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className={cn(
                    "relative flex h-12 w-full items-center rounded-[14px] border border-[#E9E4ED] bg-white px-4 shadow-[0_2px_4px_rgba(17,24,39,0.05)] sm:h-14",
                    "text-left outline-none transition-colors hover:bg-[#F8F5FA]",
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
                    size={16}
                    strokeWidth={1.75}
                    color="currentColor"
                    className="shrink-0 text-muted-foreground"
                  />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="start"
                sideOffset={8}
                className="w-(--radix-dropdown-menu-trigger-width) rounded-[14px] border-border bg-card p-1.5 shadow-md"
              >
                {VISIT_REASONS.map((item) => (
                  <DropdownMenuItem
                    key={item}
                    onSelect={() => setReason(item)}
                    className={cn(
                      "cursor-pointer rounded-[10px] px-3 py-2.5",
                      typo.input,
                      reason === item && "bg-[#F8F5FA]",
                    )}
                  >
                    {item}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </section>

          <section className="flex flex-col gap-3 sm:gap-4">
            <h2 className={cn(typo.headingM, "text-[#1A1A1A]")}>Preferred Schedule</h2>

            <div className="flex flex-col gap-2">
              <p className={cn(typo.bodyM, "text-[#8A8F98]")}>Date</p>
              <div className="flex gap-2 sm:gap-3">
                {DATE_OPTIONS.map((date) => {
                  const selected = date.id === dateId;
                  return (
                    <button
                      key={date.id}
                      type="button"
                      disabled={date.disabled}
                      onClick={() => setDateId(date.id)}
                      aria-pressed={selected}
                      className={cn(
                        "flex min-w-0 flex-1 flex-col items-center rounded-xl px-1.5 py-2.5 transition-colors sm:px-2",
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                        selected
                          ? "bg-primary p-2 text-white"
                          : "border border-[#D0C2D1] bg-white text-[#4D4450]",
                        date.disabled && "cursor-not-allowed opacity-50",
                      )}
                    >
                      <span
                        className={cn(
                          "text-xs uppercase leading-4 tracking-[0.6px]",
                          selected ? "font-bold text-white" : "font-normal",
                        )}
                      >
                        {date.weekday}
                      </span>
                      <span
                        className={cn(
                          "text-2xl font-semibold leading-8",
                          selected ? "text-white" : "text-[#1F1A20]",
                        )}
                      >
                        {date.day}
                      </span>
                      <span
                        className={cn(
                          "text-xs leading-4",
                          selected ? "text-white" : "text-[#4D4450]",
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
              <p className={cn(typo.bodyM, "text-[#8A8F98]")}>Time</p>
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
                        "flex h-11 items-center justify-center rounded-[14px] border px-4 shadow-[0_1px_1px_rgba(17,24,39,0.04)] transition-colors sm:px-5",
                        typo.button,
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                        selected
                          ? "border-primary bg-primary text-white"
                          : "border-[#E9E4ED] bg-white text-[#1A1A1A] hover:bg-[#F8F5FA]",
                        time.disabled && "cursor-not-allowed opacity-50 hover:bg-white",
                      )}
                    >
                      {time.id}
                    </button>
                  );
                })}
              </div>
            </div>
          </section>

          <div className="flex items-start justify-between gap-4 rounded-[14px] bg-[#F8F5FA] p-4 shadow-[0_2px_4px_rgba(17,24,39,0.05)]">
            <div className="flex min-w-0 flex-col gap-0.5">
              <p className={cn(typo.headingS, "text-sm leading-5 text-[#1A1A1A]")}>
                {selectedVisit.title}
              </p>
              <p className={cn(typo.bodyM, "text-[#8A8F98]")}>{scheduleLabel}</p>
            </div>
            <div className="flex shrink-0 flex-col items-end gap-0.5 text-right">
              <p className={cn(typo.headingS, "text-sm leading-5 text-[#1A1A1A]")}>Pending</p>
              <p className={cn(typo.caption, "text-[#8A8F98]")}>Subject to confirmation</p>
            </div>
          </div>
        </div>

        <DialogFooter className="flex shrink-0 flex-col gap-3 rounded-none border-t border-[#E9E4ED] bg-white px-6 py-5 sm:flex-col sm:justify-stretch sm:gap-4 sm:px-8 sm:py-6">
          <p className={cn(typo.bodyM, "text-center text-[#8A8F98]")}>
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
                strokeWidth={1.75}
                color="currentColor"
              />
              Confirm request
            </Button>
          </div>
        </DialogFooter>
        </DialogPrimitive.Content>
      </DialogPortal>
    </Dialog>
  );
}
