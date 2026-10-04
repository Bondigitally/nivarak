"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import {
  UserGroupIcon,
  CheckListIcon,
  Calendar03Icon,
  Notification01Icon,
} from "@hugeicons/core-free-icons";
import { cn } from "@/lib/utils";
import { typo } from "@/lib/tokens/typography";
import { dashboardCardClass } from "@/features/dashboard/data/dashboard-styles";
import type { CoordinatorStats } from "@/lib/domain";
import { ICON_SIZE, ICON_STROKE } from "@/lib/icons";

interface StatCardProps {
  icon: React.ComponentProps<typeof HugeiconsIcon>["icon"];
  label: string;
  value: string | number;
  sub?: React.ReactNode;
  accentClass?: string;
  iconBgClass?: string;
}

function StatCard({
  icon,
  label,
  value,
  sub,
  accentClass = "text-muted-foreground",
  iconBgClass = "bg-muted",
}: StatCardProps) {
  return (
    <div className={cn(dashboardCardClass, "flex min-w-0 flex-col gap-3 p-5")}>
      <div className="flex items-start justify-between gap-2">
        <span
          className={cn(
            "flex size-9 shrink-0 items-center justify-center rounded-md",
            iconBgClass,
            accentClass,
          )}
        >
          <HugeiconsIcon
            icon={icon}
            size={ICON_SIZE}
            strokeWidth={ICON_STROKE}
            color="currentColor"
            absoluteStrokeWidth
          />
        </span>
        <span className={cn(typo.caption, "shrink-0")}>{label}</span>
      </div>
      <div className="flex min-w-0 flex-col gap-0.5">
        <span className={cn(typo.headingXxl, "tabular-nums")}>{value}</span>
        {sub && <span className={typo.bodyS}>{sub}</span>}
      </div>
    </div>
  );
}

export function StatsRow({ stats }: { stats: CoordinatorStats }) {
  return (
    <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
      <StatCard
        icon={UserGroupIcon}
        label="Active Patients"
        value={stats.activePatients}
        sub={
          <span className="text-success">
            +{stats.patientsDelta} this week
          </span>
        }
      />
      <StatCard
        icon={CheckListIcon}
        label="Tasks Due Today"
        value={stats.tasksDueToday}
        sub={
          stats.tasksOverdue > 0 ? (
            <span className="text-destructive">
              {stats.tasksOverdue} overdue
            </span>
          ) : (
            <span className="text-success">All on track</span>
          )
        }
        accentClass="text-warning"
        iconBgClass="bg-warning-muted"
      />
      <StatCard
        icon={Calendar03Icon}
        label="Appointments Today"
        value={stats.appointmentsToday}
        sub={
          <span className="text-muted-foreground">
            Next at {stats.nextAppointmentTime}
          </span>
        }
      />
      <StatCard
        icon={Notification01Icon}
        label="Unread Alerts"
        value={stats.unreadAlerts}
        sub={
          stats.criticalAlerts > 0 ? (
            <span className="text-destructive">
              {stats.criticalAlerts} critical
            </span>
          ) : (
            <span className="text-muted-foreground">No critical alerts</span>
          )
        }
        accentClass={stats.unreadAlerts > 0 ? "text-destructive" : "text-success"}
        iconBgClass={stats.unreadAlerts > 0 ? "bg-destructive-muted" : "bg-success-muted"}
      />
    </div>
  );
}
