"use client";

import type { ReactNode } from "react";
import { useSyncExternalStore } from "react";
import Image from "next/image";
import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react";
import {
  Cancel01Icon,
  CheckmarkCircle02Icon,
  Clock01Icon,
  DateTimeIcon,
  FileEditIcon,
  Home03Icon,
  Image01Icon,
  Stethoscope02Icon,
  Tick02Icon,
  Video01Icon,
} from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import { AppIcon } from "@/components/shared/AppIcon";
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
import { BADGE_ICON_SIZE, EMPTY_ICON_SIZE, ICON_SIZE, ICON_STROKE } from "@/lib/icons";
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
  { className: string; icon?: IconSvgElement }
> = {
  Confirmed: {
    className: "border-[rgba(16,185,129,0.2)] bg-success-muted text-success",
    icon: Tick02Icon,
  },
  Scheduled: {
    className: "border-info-muted bg-info-muted text-info",
    icon: Clock01Icon,
  },
  Completed: {
    className: "border-border bg-muted text-muted-foreground",
    icon: CheckmarkCircle02Icon,
  },
  Cancelled: {
    className: "border-destructive-muted bg-destructive-muted text-destructive",
  },
};

function FieldLabel({ children }: { children: ReactNode }) {
  return (
    <p className={cn(typo.overline, "tracking-[0.6px] text-muted-foreground")}>
      {children}
    </p>
  );
}

function IconChip({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex size-7 shrink-0 items-center justify-center overflow-hidden rounded-sm bg-info-muted text-foreground">
      {children}
    </span>
  );
}

/** Shared icon | label / value grid for appointment detail rows. */
function DetailField({
  label,
  icon,
  children,
}: {
  label: ReactNode;
  icon?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="grid grid-cols-[1.75rem_minmax(0,1fr)] items-start gap-x-2 gap-y-2">
      <div className="flex size-7 shrink-0 items-center justify-center" aria-hidden={!icon}>
        {icon ?? null}
      </div>
      <div className="flex min-w-0 flex-col gap-2">
        <FieldLabel>{label}</FieldLabel>
        {children}
      </div>
    </div>
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
          "flex w-full flex-col gap-0 overflow-hidden bg-card p-0",
          "shadow-[0_12px_24px_rgba(17,24,39,0.12)]",
          "data-[state=closed]:duration-300 data-[state=open]:duration-500",
          isCompact
            ? "inset-x-0 bottom-0 top-auto h-auto max-h-[90dvh] rounded-t-xl border-t border-border sm:max-w-none"
            : "h-full w-full max-w-none border-l border-border rounded-bl-xl rounded-tl-xl sm:max-w-xl",
        )}
      >
        {appointment ? (
          <>
            {isCompact ? (
              <div
                className="flex shrink-0 items-center justify-center pt-3"
                aria-hidden
              >
                <span className="h-1 w-10 rounded-full bg-border" />
              </div>
            ) : null}
            <SheetHeader className="shrink-0 space-y-0 border-b border-border px-dash-pad-x py-5 text-left sm:px-8 sm:py-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex min-w-0 flex-col gap-1">
                  <SheetTitle className={cn(typo.headingXl, "text-foreground")}>
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
                      size={ICON_SIZE}
                      strokeWidth={ICON_STROKE}
                      color="currentColor"
                    absoluteStrokeWidth />
                  </Button>
                </SheetClose>
              </div>
            </SheetHeader>

            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-dash-pad-x py-6 sm:px-8 sm:py-7">
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
                    {statusStyle.icon ? (
                      <AppIcon
                        icon={statusStyle.icon}
                        size={BADGE_ICON_SIZE}
                        aria-hidden
                      />
                    ) : null}
                    {appointment.status}
                  </span>
                </div>

                <div className="flex flex-col gap-6">
                  <DetailField
                    label="Time window"
                    icon={
                      <IconChip>
                        <HugeiconsIcon
                          icon={Clock01Icon}
                          size={ICON_SIZE}
                          strokeWidth={ICON_STROKE}
                          color="currentColor"
                          absoluteStrokeWidth
                        />
                      </IconChip>
                    }
                  >
                    <p className={cn(typo.bodyL, "text-foreground")}>
                      {appointment.timeWindowLabel}
                    </p>
                  </DetailField>

                  <DetailField
                    label="Clinician"
                    icon={
                      <IconChip>
                        <HugeiconsIcon
                          icon={Stethoscope02Icon}
                          size={ICON_SIZE}
                          strokeWidth={ICON_STROKE}
                          color="currentColor"
                          absoluteStrokeWidth
                        />
                      </IconChip>
                    }
                  >
                    <div className="flex items-center gap-3">
                      {appointment.clinicianAvatarUrl ? (
                        <span className="relative size-10 shrink-0 overflow-hidden rounded-full border border-border bg-border">
                          <Image
                            src={appointment.clinicianAvatarUrl}
                            alt=""
                            fill
                            sizes="40px"
                            className="object-cover object-[center_30%]"
                          />
                        </span>
                      ) : (
                        <span className="flex size-10 shrink-0 items-center justify-center rounded-full border border-border bg-sidebar-accent text-sm font-semibold text-primary-active">
                          {appointment.clinicianInitials}
                        </span>
                      )}
                      <div className="min-w-0">
                        <p className={cn(typo.headingS, "text-sm leading-5 text-foreground")}>
                          {appointment.clinician}
                        </p>
                        <p className={cn(typo.caption, "text-muted-foreground")}>
                          {appointment.clinicianRole}
                        </p>
                      </div>
                    </div>
                  </DetailField>

                  <DetailField
                    label={locationLabel}
                    icon={
                      <IconChip>
                        <HugeiconsIcon
                          icon={locationIcon}
                          size={ICON_SIZE}
                          strokeWidth={ICON_STROKE}
                          color="currentColor"
                          absoluteStrokeWidth
                        />
                      </IconChip>
                    }
                  >
                    {appointment.addressLines && appointment.addressLines.length > 0 ? (
                      <div className="rounded-md border border-border bg-sidebar-accent p-4">
                        <p className={cn(typo.bodyL, "text-foreground")}>
                          {appointment.addressLines.map((line) => (
                            <span key={line} className="block">
                              {line}
                            </span>
                          ))}
                        </p>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 rounded-md border border-border bg-sidebar-accent p-4">
                        <HugeiconsIcon
                          icon={
                            appointment.placeKind === "video"
                              ? Video01Icon
                              : Home03Icon
                          }
                          size={ICON_SIZE}
                          strokeWidth={ICON_STROKE}
                          color="currentColor"
                          className="shrink-0 text-muted-foreground"
                          absoluteStrokeWidth
                        />
                        <p className={cn(typo.bodyL, "text-foreground")}>
                          {appointment.placeLabel}
                        </p>
                      </div>
                    )}
                  </DetailField>

                  <DetailField
                    label="Reason for visit"
                    icon={
                      <IconChip>
                        <HugeiconsIcon
                          icon={FileEditIcon}
                          size={ICON_SIZE}
                          strokeWidth={ICON_STROKE}
                          color="currentColor"
                          absoluteStrokeWidth
                        />
                      </IconChip>
                    }
                  >
                    <p className={cn(typo.bodyL, "text-foreground")}>
                      {appointment.reason}
                    </p>
                  </DetailField>
                </div>

                {appointment.showMap ? (
                  <div className="relative h-40 w-full overflow-hidden rounded-md border border-border bg-sidebar-accent">
                    <div className="absolute inset-0 flex items-center justify-center text-tertiary-foreground">
                      <HugeiconsIcon
                        icon={Image01Icon}
                        size={EMPTY_ICON_SIZE}
                        strokeWidth={ICON_STROKE}
                        color="currentColor"
                        absoluteStrokeWidth
                      />
                    </div>
                    <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-white/80 to-transparent p-2">
                      <span className="inline-flex rounded-sm bg-card/90 px-2 py-1 text-xs leading-4 text-foreground backdrop-blur-[2px]">
                        View full map
                      </span>
                    </div>
                  </div>
                ) : null}
              </div>
            </div>

            <SheetFooter
              className={cn(
                "mt-auto flex shrink-0 flex-col gap-3 border-t border-border bg-card px-dash-pad-x py-6 sm:flex-col sm:space-x-0 sm:p-8",
                !isCompact && "rounded-bl-xl",
              )}
            >
              {appointment.tab === "upcoming" ? (
                <Button type="button" size="cta" className="w-full">
                  <HugeiconsIcon
                    icon={DateTimeIcon}
                    size={ICON_SIZE}
                    strokeWidth={ICON_STROKE}
                    color="currentColor"
                  absoluteStrokeWidth />
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
