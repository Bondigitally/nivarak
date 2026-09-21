"use client";

import type { ReactNode } from "react";
import { useState, useSyncExternalStore } from "react";
import Image from "next/image";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react";
import {
  Alert02Icon,
  Cancel01Icon,
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
  Dialog,
  DialogDescription,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  dialogFooterShellClass,
  dialogHeaderShellClass,
  dialogPrimitiveContentClass,
} from "@/components/ui/dialog";
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
import {
  SIDEBAR_DESKTOP_MEDIA,
  useSidebar,
} from "@/components/layout/sidebar-context";
import { BADGE_ICON_SIZE, EMPTY_ICON_SIZE, ICON_SIZE, ICON_STROKE } from "@/lib/icons";
import { typo } from "@/lib/tokens/typography";
import { cn } from "@/lib/utils";
import {
  appointmentStatusBadgeStyles,
  type AppointmentItem,
  type AppointmentStatus,
} from "../data/appointments-data";

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

const STATUS_ICONS: Record<
  (typeof appointmentStatusBadgeStyles)[AppointmentStatus]["icon"],
  IconSvgElement
> = {
  tick: Tick02Icon,
  clock: Clock01Icon,
  close: Cancel01Icon,
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
  const { openBookVisit } = useSidebar();
  const [confirmCancelOpen, setConfirmCancelOpen] = useState(false);
  const sheetSide = isCompact ? "bottom" : "right";
  const statusStyle = appointment
    ? appointmentStatusBadgeStyles[appointment.status]
    : appointmentStatusBadgeStyles.Scheduled;
  const locationIcon =
    appointment?.placeKind === "video" ? Video01Icon : Home03Icon;
  const locationLabel =
    appointment?.placeKind === "video" ? "Mode" : "Location";
  const canManage =
    appointment?.tab === "upcoming" && appointment.status === "Scheduled";

  function handleDrawerOpenChange(nextOpen: boolean) {
    if (!nextOpen) setConfirmCancelOpen(false);
    onOpenChange(nextOpen);
  }

  function handleConfirmCancel() {
    setConfirmCancelOpen(false);
    onOpenChange(false);
  }

  function handleReschedule() {
    onOpenChange(false);
    openBookVisit();
  }

  return (
    <>
    <Sheet open={open} onOpenChange={handleDrawerOpenChange}>
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
                    <AppIcon
                      icon={STATUS_ICONS[statusStyle.icon]}
                      size={BADGE_ICON_SIZE}
                      aria-hidden
                    />
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
                        <span className="flex size-10 shrink-0 items-center justify-center rounded-full border border-border bg-muted text-sm font-semibold text-foreground">
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
                      <p className={cn(typo.bodyL, "text-foreground")}>
                        {appointment.addressLines.map((line) => (
                          <span key={line} className="block">
                            {line}
                          </span>
                        ))}
                      </p>
                    ) : (
                      <p className={cn(typo.bodyL, "text-foreground")}>
                        {appointment.placeLabel}
                      </p>
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
                  <div className="relative h-40 w-full overflow-hidden rounded-md border border-border bg-muted">
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

            {canManage ? (
              <SheetFooter
                className={cn(
                  "mt-auto flex shrink-0 flex-col gap-3 border-t border-border bg-card px-dash-pad-x py-6 sm:flex-col sm:space-x-0 sm:p-8",
                  !isCompact && "rounded-bl-xl",
                )}
              >
                <Button
                  type="button"
                  size="cta"
                  className="w-full"
                  onClick={handleReschedule}
                >
                  <HugeiconsIcon
                    icon={DateTimeIcon}
                    size={ICON_SIZE}
                    strokeWidth={ICON_STROKE}
                    color="currentColor"
                    absoluteStrokeWidth
                  />
                  Reschedule
                </Button>

                <Button
                  type="button"
                  variant="destructive-outline"
                  size="cta"
                  className="w-full"
                  onClick={() => setConfirmCancelOpen(true)}
                >
                  Cancel appointment
                </Button>
              </SheetFooter>
            ) : null}
          </>
        ) : null}
      </SheetContent>
    </Sheet>

    <Dialog open={confirmCancelOpen} onOpenChange={setConfirmCancelOpen}>
      <DialogPortal>
        <DialogOverlay />
        <DialogPrimitive.Content
          className={dialogPrimitiveContentClass("max-w-md")}
        >
          <div className={cn(dialogHeaderShellClass, "border-b-0")}>
            <div className="min-w-0">
              <DialogTitle
                className={cn(
                  typo.headingXl,
                  "flex items-center gap-2 text-foreground",
                )}
              >
                <AppIcon icon={Alert02Icon} className="size-6 text-destructive" />
                Cancel appointment?
              </DialogTitle>
              <DialogDescription className={cn(typo.bodyM, "mt-1 text-muted-foreground")}>
                {appointment
                  ? `Are you sure you want to cancel your ${appointment.visitType.toLowerCase()} with ${appointment.clinician} on ${appointment.dateFullLabel}? This can’t be undone.`
                  : "Are you sure you want to cancel this appointment? This can’t be undone."}
              </DialogDescription>
            </div>
          </div>
          <div
            className={cn(
              dialogFooterShellClass,
              "flex-col-reverse items-stretch gap-3 border-t-0 py-4 sm:flex-row sm:items-center sm:justify-end sm:py-4",
            )}
          >
            <Button
              type="button"
              variant="secondary"
              className="w-full sm:w-auto"
              onClick={() => setConfirmCancelOpen(false)}
            >
              Keep appointment
            </Button>
            <Button
              type="button"
              variant="destructive"
              className="w-full sm:w-auto"
              onClick={handleConfirmCancel}
            >
              Yes, cancel
            </Button>
          </div>
        </DialogPrimitive.Content>
      </DialogPortal>
    </Dialog>
    </>
  );
}
