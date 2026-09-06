"use client";

import { useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Calendar03Icon,
  UserMultiple02Icon,
  Tick02Icon,
  Add01Icon,
} from "@hugeicons/core-free-icons";
import { cn } from "@/lib/utils";
import { typo } from "@/lib/tokens/typography";
import {
  dashboardPageShellClass,
  dashboardCardClass,
  statusBadgeClass,
} from "@/features/dashboard/data/dashboard-styles";
import { EmptyState } from "@/features/dashboard/components/EmptyState";
import { DashboardReveal } from "@/features/dashboard/components/DashboardReveal";
import { AppPageFrame } from "@/components/layout/app-page-frame";
import { PageHeader } from "@/components/shared/PageHeader";
import { FilterPillGroup } from "@/components/shared/FilterPillGroup";
import { getTodaySchedule } from "@/features/schedule/data/schedule-data";
import {
  appointmentStatusConfig,
  visitTypeBadgeClasses,
} from "@/lib/tokens/status-badges";
import type { Appointment } from "@/lib/domain";
import { BADGE_ICON_SIZE, ICON_STROKE } from "@/lib/icons";

function ScheduleCard({ item }: { item: Appointment }) {
  const sts = appointmentStatusConfig(item.status);
  const isCompleted = item.status === "completed";

  return (
    <div
      className={cn(
        dashboardCardClass,
        "flex min-w-0 flex-col gap-3 p-4",
        isCompleted && "opacity-60",
      )}
    >
      <div className="flex min-w-0 items-start justify-between gap-3">
        <div className="flex min-w-0 flex-1 items-start gap-3">
          <div className="flex w-14 shrink-0 flex-col items-center justify-center rounded-lg bg-background px-1.5 py-1.5">
            <span className={cn(typo.caption, "text-tertiary-foreground")}>
              {item.time.slice(-2)}
            </span>
            <span className={cn(typo.headingS, "tabular-nums text-primary-active")}>
              {item.time.slice(0, -3)}
            </span>
          </div>
          <div className="min-w-0 flex-1">
            <p className={cn(typo.headingS, "truncate")}>{item.patientName}</p>
            <p className={cn(typo.bodyS, "mt-0.5 text-muted-foreground")}>
              {item.time} – {item.endTime}
            </p>
          </div>
        </div>
        <span className={cn(statusBadgeClass, "mt-0.5 shrink-0", sts.class)}>
          {isCompleted && (
            <HugeiconsIcon icon={Tick02Icon} size={BADGE_ICON_SIZE} strokeWidth={2} color="currentColor" absoluteStrokeWidth className="mr-0.5" />
          )}
          {sts.label}
        </span>
      </div>
      <div className="flex flex-wrap items-center gap-2 border-t border-divider pt-3">
        <span className={cn(statusBadgeClass, visitTypeBadgeClasses(item.visitType))}>
          {item.visitType}
        </span>
        <div className="flex min-w-0 items-center gap-1.5">
          <HugeiconsIcon
            icon={UserMultiple02Icon}
            size={BADGE_ICON_SIZE}
            strokeWidth={ICON_STROKE}
            color="currentColor"
            className="shrink-0 text-muted-foreground"
            absoluteStrokeWidth
          />
          <span className={cn(typo.bodyS, "min-w-0 truncate")}>{item.assignedTo}</span>
        </div>
      </div>
    </div>
  );
}

export function SchedulePageContent() {
  const schedule = getTodaySchedule();
  const [dayFilter, setDayFilter] = useState<"today" | "week" | "month">("today");
  const completed = schedule.filter((s) => s.status === "completed").length;
  const total = schedule.length;

  return (
    <AppPageFrame>
      <DashboardReveal className={cn(dashboardPageShellClass)}>
        <div className="flex min-w-0 items-start justify-between gap-4">
          <PageHeader
            title="Schedule"
            subtitle={`${completed}/${total} appointments completed today.`}
          />
          <button
            type="button"
            className="flex shrink-0 items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
          >
            <HugeiconsIcon icon={Add01Icon} size={BADGE_ICON_SIZE} strokeWidth={ICON_STROKE} color="currentColor" absoluteStrokeWidth />
            Book Appointment
          </button>
        </div>

        <FilterPillGroup
          value={dayFilter}
          onChange={setDayFilter}
          options={[
            { id: "today", label: "Today" },
            { id: "week", label: "Week" },
            { id: "month", label: "Month" },
          ]}
        />

        <div className="grid grid-cols-3 gap-3">
          {(["Home Visit", "Teleconsult", "Clinic"] as const).map((type) => {
            const count = schedule.filter((s) => s.visitType === type).length;
            return (
              <div key={type} className={cn(dashboardCardClass, "flex flex-col gap-1 p-4")}>
                <span className={cn(typo.headingXl, "tabular-nums")}>{count}</span>
                <span className={cn(statusBadgeClass, visitTypeBadgeClasses(type), "w-fit")}>{type}</span>
              </div>
            );
          })}
        </div>

        {schedule.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {schedule.map((item) => (
              <ScheduleCard key={item.id} item={item} />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={Calendar03Icon}
            title="No appointments scheduled"
            body="There are no visits or consultations scheduled for this period."
          />
        )}
      </DashboardReveal>
    </AppPageFrame>
  );
}
