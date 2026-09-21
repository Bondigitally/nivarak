"use client";

import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react";
import {
  Cancel01Icon,
  Clock01Icon,
  Home03Icon,
  Tick02Icon,
  Video01Icon,
} from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import { AppIcon } from "@/components/shared/AppIcon";
import {
  dashboardCardClass,
  statusBadgeClass,
} from "@/features/dashboard/data/dashboard-styles";
import { cardElevatedHoverShadowClass } from "@/lib/tokens/elevation";
import { BADGE_ICON_SIZE, ICON_SIZE, ICON_STROKE } from "@/lib/icons";
import { typo } from "@/lib/tokens/typography";
import { cn } from "@/lib/utils";
import {
  appointmentStatusBadgeStyles,
  type AppointmentItem,
  type AppointmentStatus,
  type AppointmentVisitType,
} from "../data/appointments-data";

const visitTypeTextClass: Record<AppointmentVisitType, string> = {
  "Home Visit": "text-success",
  Teleconsult: "text-info",
};

const STATUS_ICONS: Record<
  (typeof appointmentStatusBadgeStyles)[AppointmentStatus]["icon"],
  IconSvgElement
> = {
  tick: Tick02Icon,
  clock: Clock01Icon,
  close: Cancel01Icon,
};

function StatusBadge({
  status,
  className,
}: {
  status: AppointmentStatus;
  className?: string;
}) {
  const statusStyle = appointmentStatusBadgeStyles[status];

  return (
    <span
      className={cn(
        statusBadgeClass,
        "shrink-0 gap-1.5 border",
        statusStyle.className,
        className,
      )}
    >
      <AppIcon
        icon={STATUS_ICONS[statusStyle.icon]}
        size={BADGE_ICON_SIZE}
        aria-hidden
      />
      {status}
    </span>
  );
}

function PlaceLabel({ appointment }: { appointment: AppointmentItem }) {
  const placeIcon =
    appointment.placeKind === "video" ? Video01Icon : Home03Icon;
  const colorClass =
    appointment.status === "Cancelled"
      ? "text-muted-foreground"
      : visitTypeTextClass[appointment.visitType];

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
  const isCancelled = appointment.status === "Cancelled";

  return (
    <article
      className={cn(
        dashboardCardClass,
        cardElevatedHoverShadowClass,
        "w-full",
        isCancelled && "opacity-70",
      )}
    >
      {/* Mobile */}
      <div className="flex flex-col items-stretch p-3 md:hidden">
        <div className="flex items-center justify-between gap-4 self-stretch">
          <div className="flex shrink-0 flex-col items-start gap-0.5">
            <p
              className={cn(
                "text-xl font-semibold leading-7",
                isCancelled ? "text-muted-foreground" : "text-foreground",
              )}
            >
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
                "min-w-0 text-right text-sm leading-5",
                isCancelled ? "text-muted-foreground" : "text-foreground",
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

      {/* Tablet & Desktop */}
      <div className="hidden items-center justify-between gap-6 p-6 md:flex">
        <div className="flex min-w-0 items-center gap-6">
          <div className="flex min-w-30 shrink-0 flex-col items-start">
            <p
              className={cn(
                "text-2xl font-semibold leading-8",
                isCancelled ? "text-muted-foreground" : "text-foreground",
              )}
            >
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
                "text-sm leading-5",
                isCancelled ? "text-muted-foreground" : "text-foreground",
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
