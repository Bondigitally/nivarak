"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import {
  CheckmarkCircle02Icon,
  ChevronRightIcon,
  Location01Icon,
  Video01Icon,
} from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import { statusBadgeClass } from "@/features/dashboard/data/dashboard-styles";
import { typo } from "@/lib/tokens/typography";
import { cn } from "@/lib/utils";
import type {
  AppointmentItem,
  AppointmentStatus,
  AppointmentVisitType,
} from "../data/appointments-data";

const visitTypeStyles: Record<AppointmentVisitType, { className: string }> = {
  "Home Visit": {
    className: "border-[#BFDBFE] bg-[#EFF6FF] text-[#1D4ED8]",
  },
  Teleconsult: {
    className: "border-[#FDE68A] bg-[#FFFBEB] text-[#B45309]",
  },
};

const statusStyles: Record<
  AppointmentStatus,
  { className: string; dotClassName: string }
> = {
  Confirmed: {
    className: "border-[#BBF7D0] bg-[#F0FDF4] text-[#15803D]",
    dotClassName: "bg-[#22C55E]",
  },
  Scheduled: {
    className: "border-[#BFDBFE] bg-[#EFF6FF] text-[#1D4ED8]",
    dotClassName: "bg-[#3B82F6]",
  },
  Completed: {
    className: "border-[#E5E7EB] bg-[#F9FAFB] text-[#4B5563]",
    dotClassName: "bg-[#9CA3AF]",
  },
  Cancelled: {
    className: "border-[#FECACA] bg-[#FEF2F2] text-[#B91C1C]",
    dotClassName: "bg-[#EF4444]",
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
      {status === "Completed" ? (
        <HugeiconsIcon
          icon={CheckmarkCircle02Icon}
          size={12}
          strokeWidth={1.75}
          color="currentColor"
          aria-hidden
        />
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

export function AppointmentRow({
  appointment,
  onDetailsClick,
}: {
  appointment: AppointmentItem;
  onDetailsClick: (appointment: AppointmentItem) => void;
}) {
  const visitStyle = visitTypeStyles[appointment.visitType];
  const placeIcon =
    appointment.placeKind === "video" ? Video01Icon : Location01Icon;

  return (
    <article className="w-full rounded-[14px] border border-[#E9E4ED] bg-white shadow-[0px_2px_8px_rgba(17,24,39,0.05)]">
      {/* Mobile */}
      <div className="flex flex-col items-stretch p-3 md:hidden">
        <div className="flex items-center justify-between gap-4 self-stretch">
          <div className="flex shrink-0 flex-col items-start gap-0.5">
            <p className="text-xl font-semibold leading-7 text-[#1A1A1A]">
              {appointment.dateLabel}
            </p>
            <p className={cn(typo.bodyL, "text-sm leading-5 text-[#5F6368]")}>
              {appointment.timeLabel}
            </p>
          </div>

          <div className="flex min-w-0 flex-col items-end gap-1.5">
            <p
              className={cn(
                typo.headingS,
                "min-w-0 text-right text-sm leading-5 text-[#1A1A1A]",
              )}
            >
              {appointment.clinician}
            </p>
            <span
              className={cn(
                statusBadgeClass,
                "shrink-0 border",
                visitStyle.className,
              )}
            >
              {appointment.visitType}
            </span>
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between gap-3 self-stretch border-t border-[#E9E4ED] pt-3">
          <StatusBadge status={appointment.status} />
          <Button
            type="button"
            variant="secondary"
            className="h-auto min-w-0 border-0 bg-transparent px-0 py-0 font-semibold text-primary shadow-none hover:bg-transparent hover:text-primary active:bg-transparent"
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
            <p className="text-2xl font-semibold leading-8 text-[#1A1A1A]">
              {appointment.dateLabel}
            </p>
            <p className={cn(typo.bodyL, "text-base leading-6 text-[#5F6368]")}>
              {appointment.timeLabel}
            </p>
          </div>

          <div className="h-12 w-px shrink-0 bg-[#D0C2D1]" aria-hidden />

          <div className="flex min-w-0 flex-col items-start gap-2">
            <div className="flex flex-wrap items-center gap-3">
              <p
                className={cn(
                  typo.headingS,
                  "text-sm leading-5 text-[#1A1A1A]",
                )}
              >
                {appointment.clinician}
              </p>
              <span
                className={cn(
                  statusBadgeClass,
                  "shrink-0 border",
                  visitStyle.className,
                )}
              >
                {appointment.visitType}
              </span>
            </div>
            <div className="flex items-center gap-1 text-[#5F6368]">
              <HugeiconsIcon
                icon={placeIcon}
                size={12}
                strokeWidth={1.75}
                color="currentColor"
                className="shrink-0"
              />
              <span className={cn(typo.caption, "text-[#5F6368]")}>
                {appointment.placeLabel}
              </span>
            </div>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-4">
          <StatusBadge status={appointment.status} />
          <Button
            type="button"
            variant="secondary"
            className="h-11 rounded-full px-5 font-semibold text-primary shadow-[0px_1px_2px_rgba(17,24,39,0.04)] hover:bg-accent hover:text-primary"
            onClick={() => onDetailsClick(appointment)}
          >
            Details
            <HugeiconsIcon
              icon={ChevronRightIcon}
              size={12}
              strokeWidth={1.75}
              color="currentColor"
            />
          </Button>
        </div>
      </div>
    </article>
  );
}
