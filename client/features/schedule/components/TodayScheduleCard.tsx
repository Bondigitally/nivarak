"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import {
  Calendar03Icon,
  Clock01Icon,
  UserMultiple02Icon,
  Tick02Icon,
} from "@hugeicons/core-free-icons";
import { cn } from "@/lib/utils";
import { typo } from "@/lib/tokens/typography";
import {
  dashboardCardClass,
  dashboardCardHeaderClass,
  dashboardDividedItemClass,
  dashboardDividedRowClass,
  dashboardRowDividerClass,
  statusBadgeClass,
} from "@/features/dashboard/data/dashboard-styles";
import { SectionTitle, ViewAllLink, EmptyState } from "@/features/dashboard/components/EmptyState";
import {
  appointmentStatusConfig,
  visitTypeBadgeClasses,
} from "@/lib/tokens/status-badges";
import type { Appointment } from "@/lib/domain";
import { BADGE_ICON_SIZE, ICON_STROKE } from "@/lib/icons";

export function ScheduleRow({
  item,
  index,
}: {
  item: Appointment;
  index: number;
}) {
  const sts = appointmentStatusConfig(item.status);
  const isCompleted = item.status === "completed";

  return (
    <li className={dashboardDividedItemClass}>
      {index > 0 && <div className={dashboardRowDividerClass} aria-hidden />}
      <div
        className={cn(
          dashboardDividedRowClass,
          "-mx-2 flex min-w-0 items-start gap-3 px-2 py-3.5",
          isCompleted && "opacity-60",
        )}
      >
        <div className="flex w-18 shrink-0 flex-col items-center justify-center rounded-md bg-background px-1.5 py-1.5">
          <span className={cn(typo.caption, "text-tertiary-foreground")}>
            {item.time.slice(-2)}
          </span>
          <span className={cn(typo.headingS, "text-primary-active tabular-nums text-sm")}>
            {item.time.slice(0, -3)}
          </span>
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex min-w-0 flex-wrap items-center gap-2">
            <span className={cn(typo.headingS, "min-w-0 truncate text-sm leading-5")}>
              {item.patientName}
            </span>
            <span
              className={cn(
                statusBadgeClass,
                "shrink-0",
                visitTypeBadgeClasses(item.visitType),
              )}
            >
              {item.visitType}
            </span>
          </div>
          <div className="mt-1.5 flex min-w-0 flex-col gap-1">
            <div className="flex min-w-0 items-center gap-1.5">
              <span className="flex size-5 shrink-0 items-center justify-center rounded text-muted-foreground">
                <HugeiconsIcon icon={Clock01Icon} size={BADGE_ICON_SIZE} strokeWidth={ICON_STROKE} color="currentColor" absoluteStrokeWidth />
              </span>
              <span className={cn(typo.caption, "min-w-0 truncate")}>
                {item.time} – {item.endTime}
              </span>
            </div>
            <div className="flex min-w-0 items-center gap-1.5">
              <span className="flex size-5 shrink-0 items-center justify-center rounded text-muted-foreground">
                <HugeiconsIcon icon={UserMultiple02Icon} size={BADGE_ICON_SIZE} strokeWidth={ICON_STROKE} color="currentColor" absoluteStrokeWidth />
              </span>
              <span className={cn(typo.caption, "min-w-0 truncate")}>
                {item.assignedTo}
              </span>
            </div>
          </div>
        </div>
        <span className={cn(statusBadgeClass, "mt-0.5 shrink-0", sts.class)}>
          {isCompleted && (
            <HugeiconsIcon icon={Tick02Icon} size={BADGE_ICON_SIZE} strokeWidth={2} color="currentColor" absoluteStrokeWidth className="mr-0.5" />
          )}
          {sts.label}
        </span>
      </div>
    </li>
  );
}

export function TodayScheduleCard({
  schedule,
}: {
  schedule: Appointment[];
}) {
  return (
    <section className={cn(dashboardCardClass, "flex h-fit shrink-0 flex-col p-5")}>
      <div className={dashboardCardHeaderClass}>
        <SectionTitle info="All patient appointments and care visits scheduled for today across your care team.">
          Today&apos;s Schedule
        </SectionTitle>
        <ViewAllLink href="/schedule" />
      </div>
      {schedule.length > 0 ? (
        <ul className="flex min-w-0 flex-col">
          {schedule.map((item, index) => (
            <ScheduleRow key={item.id} item={item} index={index} />
          ))}
        </ul>
      ) : (
        <EmptyState
          icon={Calendar03Icon}
          title="No appointments today"
          body="There are no visits or consultations scheduled for today."
          className="min-h-0"
        />
      )}
    </section>
  );
}
