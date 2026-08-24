"use client";

import type { ReactNode } from "react";
import { useSyncExternalStore } from "react";
import Image from "next/image";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Cancel01Icon,
  Clock01Icon,
  DateTimeIcon,
  Home03Icon,
  Image01Icon,
  Location01Icon,
  Stethoscope02Icon,
  Tick02Icon,
  Video01Icon,
} from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { statusBadgeClass } from "@/features/dashboard/data/dashboard-styles";
import { SIDEBAR_DESKTOP_MEDIA } from "@/components/layout/sidebar-context";
import { typo } from "@/lib/tokens/typography";
import { cn } from "@/lib/utils";
import type { AppointmentItem, AppointmentStatus } from "../data/appointments-data";

/** Same compact breakpoint as the sidebar drawer — bottom sheet below `lg`. */
function subscribeCompact(onChange: () => void) {
  const mq = window.matchMedia(SIDEBAR_DESKTOP_MEDIA);
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
}

function getCompactSnapshot() {
  return !window.matchMedia(SIDEBAR_DESKTOP_MEDIA).matches;
}

function useIsCompactScreen() {
  return useSyncExternalStore(subscribeCompact, getCompactSnapshot, () => true);
}

const statusStyles: Record<
  AppointmentStatus,
  { className: string; showCheck: boolean }
> = {
  Confirmed: {
    className: "border-[rgba(16,185,129,0.2)] bg-[#ECFDF5] text-[#10B981]",
    showCheck: true,
  },
  Scheduled: {
    className: "border-[#BFDBFE] bg-[#EFF6FF] text-[#1D4ED8]",
    showCheck: false,
  },
  Completed: {
    className: "border-[#E5E7EB] bg-[#F9FAFB] text-[#4B5563]",
    showCheck: false,
  },
  Cancelled: {
    className: "border-[#FECACA] bg-[#FEF2F2] text-[#B91C1C]",
    showCheck: false,
  },
};

function FieldLabel({
  children,
  icon,
}: {
  children: ReactNode;
  icon?: ReactNode;
}) {
  return (
    <div className="flex items-center gap-2">
      {icon}
      <p className={cn(typo.overline, "tracking-[0.6px] text-muted-foreground")}>
        {children}
      </p>
    </div>
  );
}

function IconChip({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex size-7 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-[#F4F9FF] text-[#1A1A1A]">
      {children}
    </span>
  );
}

export function AppointmentDetailsDrawer({
  appointment,
  open,
  onOpenChange,
}: {
  appointment: AppointmentItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const isCompact = useIsCompactScreen();
  const sheetSide = isCompact ? "bottom" : "right";
  const statusStyle = appointment
    ? statusStyles[appointment.status]
    : statusStyles.Confirmed;
  const locationIcon =
    appointment?.placeKind === "video" ? Video01Icon : Home03Icon;
  const locationLabel =
    appointment?.placeKind === "video" ? "Mode" : "Location";

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        key={sheetSide}
        side={sheetSide}
        showCloseButton={false}
        className={cn(
          "flex w-full flex-col gap-0 overflow-hidden bg-white p-0",
          "shadow-[0_12px_24px_rgba(17,24,39,0.12)]",
          "data-[state=closed]:duration-300 data-[state=open]:duration-500",
          isCompact
            ? "inset-x-0 bottom-0 top-auto h-auto max-h-[90dvh] rounded-t-[20px] border-t border-[#E9E4ED] sm:max-w-none"
            : "h-full max-w-lg border-l border-[#E9E4ED] rounded-bl-[20px] rounded-tl-[20px]",
        )}
      >
        {appointment ? (
          <>
            {isCompact ? (
              <div
                className="flex shrink-0 items-center justify-center pt-3"
                aria-hidden
              >
                <span className="h-1 w-10 rounded-full bg-[#E9E4ED]" />
              </div>
            ) : null}
            <SheetHeader className="shrink-0 space-y-0 border-b border-[#E9E4ED] px-6 py-5 text-left sm:px-8 sm:py-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex min-w-0 flex-col gap-1">
                  <SheetTitle className={cn(typo.headingXl, "text-[#1A1A1A]")}>
                    {appointment.visitType}
                  </SheetTitle>
                  <SheetDescription className={cn(typo.bodyL, "text-muted-foreground")}>
                    {appointment.dateFullLabel}
                  </SheetDescription>
                </div>
                <SheetClose asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    aria-label="Close drawer"
                    className="size-10 shrink-0 rounded-full text-muted-foreground shadow-[0_1px_1px_rgba(17,24,39,0.04)] hover:text-foreground"
                  >
                    <HugeiconsIcon
                      icon={Cancel01Icon}
                      size={16}
                      strokeWidth={1.75}
                      color="currentColor"
                    />
                  </Button>
                </SheetClose>
              </div>
            </SheetHeader>

            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-6 py-6 sm:px-8 sm:py-7">
              <div className="flex flex-col gap-7 sm:gap-8">
                <div className="flex items-center justify-between gap-4">
                  <FieldLabel>Status</FieldLabel>
                  <span
                    className={cn(
                      statusBadgeClass,
                      "gap-1.5 border",
                      statusStyle.className,
                    )}
                  >
                    {statusStyle.showCheck ? (
                      <HugeiconsIcon
                        icon={Tick02Icon}
                        size={14}
                        strokeWidth={1.75}
                        color="currentColor"
                      />
                    ) : null}
                    {appointment.status}
                  </span>
                </div>

                <div className="flex flex-col gap-6">
                  <div className="flex flex-col gap-2">
                    <FieldLabel
                      icon={
                        <IconChip>
                          <HugeiconsIcon
                            icon={Clock01Icon}
                            size={16}
                            strokeWidth={1.75}
                            color="currentColor"
                          />
                        </IconChip>
                      }
                    >
                      Time window
                    </FieldLabel>
                    <p className={cn(typo.bodyL, "pl-9 text-[#1A1A1A]")}>
                      {appointment.timeWindowLabel}
                    </p>
                  </div>

                  <div className="flex flex-col gap-2">
                    <FieldLabel
                      icon={
                        <IconChip>
                          <HugeiconsIcon
                            icon={Stethoscope02Icon}
                            size={16}
                            strokeWidth={1.75}
                            color="currentColor"
                          />
                        </IconChip>
                      }
                    >
                      Clinician
                    </FieldLabel>
                    <div className="flex items-center gap-3 pl-9">
                      {appointment.clinicianAvatarUrl ? (
                        <span className="relative size-10 shrink-0 overflow-hidden rounded-full border border-[#E9E4ED] bg-[#E9E0E8]">
                          <Image
                            src={appointment.clinicianAvatarUrl}
                            alt=""
                            fill
                            sizes="40px"
                            className="object-cover object-[center_30%]"
                          />
                        </span>
                      ) : (
                        <span className="flex size-10 shrink-0 items-center justify-center rounded-full border border-[#E9E4ED] bg-[#F2EBF9] text-sm font-semibold text-(--primary-active)">
                          {appointment.clinicianInitials}
                        </span>
                      )}
                      <div className="min-w-0">
                        <p className={cn(typo.headingS, "text-sm leading-5 text-[#1A1A1A]")}>
                          {appointment.clinician}
                        </p>
                        <p className={cn(typo.caption, "text-muted-foreground")}>
                          {appointment.clinicianRole}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <FieldLabel
                      icon={
                        <IconChip>
                          <HugeiconsIcon
                            icon={locationIcon}
                            size={16}
                            strokeWidth={1.75}
                            color="currentColor"
                          />
                        </IconChip>
                      }
                    >
                      {locationLabel}
                    </FieldLabel>
                    {appointment.addressLines && appointment.addressLines.length > 0 ? (
                      <div className="rounded-lg border border-[#E9E4ED] bg-[#FBF1FA] p-4">
                        <p className={cn(typo.bodyL, "text-[#1A1A1A]")}>
                          {appointment.addressLines.map((line) => (
                            <span key={line} className="block">
                              {line}
                            </span>
                          ))}
                        </p>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 rounded-lg border border-[#E9E4ED] bg-[#FBF1FA] p-4">
                        <HugeiconsIcon
                          icon={
                            appointment.placeKind === "video"
                              ? Video01Icon
                              : Location01Icon
                          }
                          size={16}
                          strokeWidth={1.75}
                          color="currentColor"
                          className="shrink-0 text-muted-foreground"
                        />
                        <p className={cn(typo.bodyL, "text-[#1A1A1A]")}>
                          {appointment.placeLabel}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col gap-2">
                    <FieldLabel>Reason for visit</FieldLabel>
                    <p className={cn(typo.bodyL, "text-[#1A1A1A]")}>
                      {appointment.reason}
                    </p>
                  </div>
                </div>

                {appointment.showMap ? (
                  <div className="relative h-40 w-full overflow-hidden rounded-lg border border-[#E9E4ED] bg-[#EFE5EE]">
                    <div className="absolute inset-0 flex items-center justify-center text-[#C4B5C8]">
                      <HugeiconsIcon
                        icon={Image01Icon}
                        size={48}
                        strokeWidth={1.75}
                        color="currentColor"
                      />
                    </div>
                    <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-white/80 to-transparent p-2">
                      <span className="inline-flex rounded bg-white/90 px-2 py-1 text-xs leading-4 text-[#1A1A1A] backdrop-blur-[2px]">
                        View full map
                      </span>
                    </div>
                  </div>
                ) : null}
              </div>
            </div>

            <SheetFooter
              className={cn(
                "mt-auto flex shrink-0 flex-col gap-3 border-t border-[#E9E4ED] bg-white p-6 sm:flex-col sm:space-x-0 sm:p-8",
                !isCompact && "rounded-bl-[20px]",
              )}
            >
              {appointment.tab === "upcoming" ? (
                <Button type="button" size="cta" className="w-full">
                  <HugeiconsIcon
                    icon={DateTimeIcon}
                    size={16}
                    strokeWidth={1.75}
                    color="currentColor"
                  />
                  Confirm request
                </Button>
              ) : null}
              <SheetClose asChild>
                <Button
                  type="button"
                  variant="secondary"
                  size="cta"
                  className="w-full"
                >
                  Close
                </Button>
              </SheetClose>
            </SheetFooter>
          </>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}
