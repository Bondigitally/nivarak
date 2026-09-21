"use client";

import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react";
import {
  CheckmarkCircle02Icon,
  Clock01Icon,
  Home03Icon,
  Tick02Icon,
  Video01Icon,
} from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import { AppIcon } from "@/components/shared/AppIcon";
import { statusBadgeClass } from "@/features/dashboard/data/dashboard-styles";
import { BADGE_ICON_SIZE, ICON_SIZE, ICON_STROKE } from "@/lib/icons";
import { typo } from "@/lib/tokens/typography";
import { cn } from "@/lib/utils";
import type {
  AppointmentItem,
  AppointmentStatus,
  AppointmentVisitType,
} from "../data/appointments-data";

const visitTypeTextClass: Record<AppointmentVisitType, string> = {
  "Home Visit": "text-success",
  Teleconsult: "text-info",
};

const statusStyles: Record<
  AppointmentStatus,
  { className: string; icon?: IconSvgElement; dotClassName?: string }
> = {
  Confirmed: {
    className: "border-success-muted bg-success-muted text-success",
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
    dotClassName: "bg-destructive",
  },
};

function StatusBadge({
  status,
  className,
}: {
  status: AppointmentStatus;
  className?: string;
}) {
  const statusStyle = statusStyles[status];

  return (
    <span
      className={cn(
        statusBadgeClass,
        "shrink-0 gap-1.5 border",
        statusStyle.className,
        className,
      )}
    >
      {statusStyle.icon ? (
        <AppIcon icon={statusStyle.icon} size={BADGE_ICON_SIZE} aria-hidden />
      ) : (
        <span
          className={cn("size-1.5 rounded-full", statusStyle.dotClassName)}
          aria-hidden
        />
      )}
      {status}
    </span>
  );
}

function PlaceLabel({ appointment }: { appointment: AppointmentItem }) {
  const placeIcon =
    appointment.placeKind === "video" ? Video01Icon : Home03Icon;
  const colorClass = visitTypeTextClass[appointment.visitType];

  return (
    <div className={cn("flex items-center gap-1", colorClass)}>
      <HugeiconsIcon
        icon={placeIcon}
        size={ICON_SIZE}
        strokeWidth={ICON_STROKE}
        color="currentColor"
        absoluteStrokeWidth
        className="shrink-0"
      />
      <span className={typo.caption}>{appointment.placeLabel}</span>
    </div>
  );
}

export function AppointmentRow({
  appointment,
  onDetailsClick,
}: {
  appointment: AppointmentItem;
  onDetailsClick: (appointment: AppointmentItem) => void;
}) {
  return (
    <article className="w-full rounded-lg border border-border bg-card shadow-[0px_2px_8px_rgba(17,24,39,0.05)]">
      {/* Mobile */}
      <div className="flex flex-col items-stretch p-3 md:hidden">
        <div className="flex items-center justify-between gap-4 self-stretch">
          <div className="flex shrink-0 flex-col items-start gap-0.5">
            <p className="text-xl font-semibold leading-7 text-foreground">
              {appointment.dateLabel}
            </p>
            <p className={cn(typo.bodyL, "text-sm leading-5 text-muted-foreground")}>
              {appointment.timeLabel}
            </p>
          </div>

          <div className="flex min-w-0 flex-col items-end gap-1.5">
            <p
              className={cn(
                typo.headingS,
                "min-w-0 text-right text-sm leading-5 text-foreground",
              )}
            >
              {appointment.clinician}
            </p>
            <PlaceLabel appointment={appointment} />
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between gap-3 self-stretch border-t border-border pt-3">
          <StatusBadge status={appointment.status} />
          <Button
            type="button"
            variant="primary-outline"
            className="h-9 shrink-0 px-4"
            onClick={() => onDetailsClick(appointment)}
          >
            Details
          </Button>
        </div>
      </div>

      {/* Tablet & Desktop — Figma row with pill Details */}
      <div className="hidden items-center justify-between gap-6 p-6 md:flex">
        <div className="flex min-w-0 items-center gap-6">
          <div className="flex min-w-30 shrink-0 flex-col items-start">
            <p className="text-2xl font-semibold leading-8 text-foreground">
              {appointment.dateLabel}
            </p>
            <p className={cn(typo.bodyL, "text-base leading-6 text-muted-foreground")}>
              {appointment.timeLabel}
            </p>
          </div>

          <div className="h-12 w-px shrink-0 bg-border" aria-hidden />

          <div className="flex min-w-0 flex-col items-start gap-2">
            <p
              className={cn(
                typo.headingS,
                "text-sm leading-5 text-foreground",
              )}
            >
              {appointment.clinician}
            </p>
            <PlaceLabel appointment={appointment} />
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-4">
          <StatusBadge status={appointment.status} />
          <Button
            type="button"
            variant="primary-outline"
            onClick={() => onDetailsClick(appointment)}
          >
            Details
          </Button>
        </div>
      </div>
    </article>
  );
}
