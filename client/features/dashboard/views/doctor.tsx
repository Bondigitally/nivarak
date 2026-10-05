"use client";

import Link from "next/link";
import { useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  File01Icon,
  Alert02Icon,
  Plant01Icon,
  HeartPulseIcon,
  FileEditIcon,
  UserFullViewIcon,
} from "@hugeicons/core-free-icons";
import { AppPageFrame } from "@/features/dashboard/components/AppPageFrame";
import { DashboardReveal } from "@/features/dashboard/components/DashboardReveal";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { AppointmentDetailsDrawer } from "@/features/appointments/components/AppointmentDetailsDrawer";
import type { AppointmentItem } from "@/features/appointments/data/appointments-data";
import {
  dashboardCardClass,
  dashboardGridClass,
  dashboardGridHalfClass,
  dashboardPageShellClass,
} from "@/features/dashboard/data/dashboard-styles";
import {
  getDoctorAttentionItems,
  getDoctorStats,
  getDoctorTodaySchedule,
} from "@/features/dashboard/data/doctor-stats-data";
import type { DoctorAttentionItem, DoctorScheduleSlot } from "@/lib/domain";
import { ICON_SIZE, ICON_STROKE } from "@/lib/icons";
import { statusBadgeClass } from "@/lib/tokens/status-badges";
import { typo } from "@/lib/tokens/typography";
import { cn } from "@/lib/utils";

function attentionIcon(kind: DoctorAttentionItem["kind"]) {
  switch (kind) {
    case "urgent-alert":
      return HeartPulseIcon;
    case "care-plan":
      return Plant01Icon;
    case "review":
      return FileEditIcon;
    default:
      return File01Icon;
  }
}

function StatCard({
  icon,
  label,
  value,
  sub,
  badgeClassName,
}: {
  icon: React.ComponentProps<typeof HugeiconsIcon>["icon"];
  label: string;
  value: string | number;
  sub: string;
  badgeClassName: string;
}) {
  return (
    <div className={cn(dashboardCardClass, "flex min-w-0 flex-col gap-3 p-5")}>
      <div className="flex items-center gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <HugeiconsIcon
            icon={icon}
            size={ICON_SIZE}
            strokeWidth={ICON_STROKE}
            color="currentColor"
            absoluteStrokeWidth
          />
        </span>
        <span className={cn(typo.bodyM, "text-muted-foreground")}>{label}</span>
      </div>
      <div className="flex min-w-0 items-center gap-2">
        <span className={cn(typo.headingXxl, "tabular-nums")}>{value}</span>
        <span className={cn(statusBadgeClass, "shrink-0", badgeClassName)}>
          {sub}
        </span>
      </div>
    </div>
  );
}

function AttentionRow({ item }: { item: DoctorAttentionItem }) {
  return (
    <div
      className={cn(
        dashboardCardClass,
        "flex min-w-0 items-center justify-between gap-3 px-4 py-5",
      )}
    >
      <div className="flex min-w-0 items-center gap-3">
        <span
          className={cn(
            "flex size-10 shrink-0 items-center justify-center rounded-full",
            item.urgent
              ? "bg-destructive-muted text-destructive"
              : "bg-primary/10 text-primary",
          )}
        >
          <HugeiconsIcon
            icon={attentionIcon(item.kind)}
            size={ICON_SIZE}
            strokeWidth={ICON_STROKE}
            color="currentColor"
            absoluteStrokeWidth
          />
        </span>
        <div className="min-w-0">
          <p
            className={cn(
              typo.headingS,
              "text-sm",
              item.urgent && "text-destructive",
            )}
          >
            {item.title}
          </p>
          <p className={cn(typo.caption, "mt-0.5 truncate text-muted-foreground")}>
            {item.detail}
          </p>
        </div>
      </div>
      <Button
        asChild
        size="sm"
        variant={item.urgent ? "destructive-outline" : "primary-outline"}
        className="shrink-0"
      >
        <Link href={item.href}>Act</Link>
      </Button>
    </div>
  );
}

function slotToAppointmentItem(slot: DoctorScheduleSlot): AppointmentItem {
  return {
    id: slot.id,
    tab: "upcoming",
    dateLabel: "Today",
    dateFullLabel: "Today",
    timeLabel: slot.time,
    timeWindowLabel: slot.endTime
      ? `${slot.time} – ${slot.endTime}`
      : slot.time,
    clinician: "Dr. Mehta",
    clinicianRole: "Physician",
    clinicianInitials: "DM",
    clinicianAvatarUrl: null,
    visitType: slot.kind === "visit" ? "Home Visit" : "Teleconsult",
    placeLabel: slot.subtitle,
    placeKind: slot.kind === "huddle" ? "video" : "location",
    addressLines: null,
    reason: slot.subtitle,
    status: "Scheduled",
    showMap: false,
    patientId: slot.patientId,
    patientName: slot.patientId ? slot.title : undefined,
  };
}

function ScheduleSlotRow({
  slot,
  onOpen,
}: {
  slot: DoctorScheduleSlot;
  onOpen: (slot: DoctorScheduleSlot) => void;
}) {
  const barClass =
    slot.accent === "primary"
      ? "bg-primary"
      : slot.accent === "warning"
        ? "bg-warning"
        : "bg-info";

  return (
    <button
      type="button"
      onClick={() => onOpen(slot)}
      className="flex w-full min-w-0 items-start gap-3 border-b border-divider px-4 py-4 text-left transition-colors last:border-b-0 hover:bg-muted/40"
    >
      <div className="flex min-w-0 flex-1 items-start gap-0">
        <span className={cn("mt-0.5 mr-2 h-9 w-0.5 shrink-0 rounded-full", barClass)} />
        <div className="min-w-0">
          <p className={cn(typo.headingS, "text-sm")}>{slot.title}</p>
          <p className={cn(typo.caption, "text-muted-foreground")}>{slot.time}</p>
        </div>
      </div>
      <div className="min-w-0 text-right">
        <p className={cn(typo.bodyS, "text-muted-foreground")}>{slot.subtitle}</p>
      </div>
    </button>
  );
}

export function DoctorDashboardView() {
  const stats = getDoctorStats();
  const attention = getDoctorAttentionItems();
  const schedule = getDoctorTodaySchedule();
  const [selected, setSelected] = useState<AppointmentItem | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  function openSlot(slot: DoctorScheduleSlot) {
    setSelected(slotToAppointmentItem(slot));
    setDrawerOpen(true);
  }

  return (
    <AppPageFrame>
      <DashboardReveal className={cn(dashboardPageShellClass)}>
        <PageHeader
          title="Good Morning, Dr. Mehta"
          subtitle="Reviews, alerts, and today's clinical schedule."
        />

        <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
          <StatCard
            icon={FileEditIcon}
            label="Reviews pending"
            value={stats.reviewsPending}
            sub={`+${stats.reviewsDeltaToday} today`}
            badgeClassName="bg-success-muted text-success"
          />
          <StatCard
            icon={File01Icon}
            label="Unsigned CGAs"
            value={String(stats.unsignedCgas).padStart(2, "0")}
            sub="Priority"
            badgeClassName="bg-destructive-muted text-destructive"
          />
          <StatCard
            icon={Alert02Icon}
            label="Open alerts"
            value={String(stats.openAlerts).padStart(2, "0")}
            sub="Critical"
            badgeClassName="bg-destructive-muted text-destructive"
          />
          <StatCard
            icon={UserFullViewIcon}
            label="Visits today"
            value={stats.visitsToday}
            sub="Scheduled"
            badgeClassName="bg-info-muted text-info"
          />
        </div>

        <div className={dashboardGridClass}>
          <section className={cn(dashboardGridHalfClass, "flex flex-col gap-3")}>
            <h2 className={cn(typo.headingL, "px-1")}>Needs your attention</h2>
            <div className="flex flex-col gap-3">
              {attention.map((item) => (
                <AttentionRow key={item.id} item={item} />
              ))}
            </div>
          </section>

          <section className={cn(dashboardGridHalfClass, "flex flex-col gap-3")}>
            <h2 className={cn(typo.headingL, "px-1")}>Today&apos;s Schedule</h2>
            <div className={cn(dashboardCardClass, "overflow-hidden p-0")}>
              <div className="flex items-center justify-between border-b border-divider px-4 py-3">
                <span className={cn(typo.overline, "text-muted-foreground")}>
                  TIME
                </span>
                <span className={cn(typo.overline, "text-muted-foreground")}>
                  ACTIVITY
                </span>
              </div>
              <div>
                {schedule.map((slot) => (
                  <ScheduleSlotRow key={slot.id} slot={slot} onOpen={openSlot} />
                ))}
              </div>
            </div>
          </section>
        </div>
      </DashboardReveal>

      <AppointmentDetailsDrawer
        appointment={selected}
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
      />
    </AppPageFrame>
  );
}
