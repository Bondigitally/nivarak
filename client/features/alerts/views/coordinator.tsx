"use client";

import { useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { Notification01Icon, Tick02Icon } from "@hugeicons/core-free-icons";
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
import { severityConfig } from "@/lib/tokens/status-badges";
import { useNotificationStore } from "@/features/alerts/store/notification-store";
import type { AlertSeverity, Notification } from "@/lib/domain";
import { BADGE_ICON_SIZE, ICON_SIZE, ICON_STROKE } from "@/lib/icons";

function AlertCard({
  alert,
  onMarkRead,
}: {
  alert: Notification;
  onMarkRead: (id: string) => void;
}) {
  const sev = severityConfig(alert.severity ?? "info");

  return (
    <div
      className={cn(
        dashboardCardClass,
        "flex min-w-0 items-start gap-4 p-4",
        alert.read && "opacity-60",
      )}
    >
      {alert.icon && (
        <span
          className={cn(
            "mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg",
            sev.icon,
          )}
        >
          <HugeiconsIcon
            icon={alert.icon}
            size={ICON_SIZE}
            strokeWidth={ICON_STROKE}
            color="currentColor"
            absoluteStrokeWidth
          />
        </span>
      )}
      <div className="min-w-0 flex-1 overflow-hidden">
        <div className="flex min-w-0 items-start gap-2">
          <span className={cn(typo.headingS, "min-w-0 flex-1 leading-5 text-sm")}>
            {alert.title}
          </span>
          {!alert.read && (
            <span className="mt-1.5 size-2 shrink-0 rounded-full bg-primary" />
          )}
        </div>
        <div className="mt-1.5 flex flex-wrap items-center gap-2">
          <span className={cn(statusBadgeClass, sev.badge)}>{sev.label}</span>
          {alert.patientName && (
            <span className={cn(typo.caption, "font-medium text-primary-active")}>
              {alert.patientName}
            </span>
          )}
          {alert.timeLabel && (
            <>
              <span className={typo.caption}>·</span>
              <span className={cn(typo.caption, "text-muted-foreground")}>
                {alert.timeLabel}
              </span>
            </>
          )}
        </div>
      </div>
      {!alert.read && (
        <button
          type="button"
          onClick={() => onMarkRead(alert.id)}
          className="mt-0.5 flex shrink-0 items-center gap-1.5 rounded-md border border-border bg-card px-2.5 py-1 text-xs font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
        >
          <HugeiconsIcon icon={Tick02Icon} size={BADGE_ICON_SIZE} strokeWidth={2} color="currentColor" absoluteStrokeWidth />
          Mark read
        </button>
      )}
    </div>
  );
}

export function CoordinatorAlertsView() {
  const alerts = useNotificationStore((s) => s.coordinatorAlerts);
  const markCoordinatorRead = useNotificationStore((s) => s.markCoordinatorRead);
  const markAllCoordinatorRead = useNotificationStore((s) => s.markAllCoordinatorRead);
  const [filter, setFilter] = useState<"all" | "unread" | AlertSeverity>("all");

  const filtered = alerts.filter((a) => {
    if (filter === "unread") return !a.read;
    if (filter === "all") return true;
    return a.severity === filter;
  });

  const unread = alerts.filter((a) => !a.read).length;
  const critical = alerts.filter((a) => a.severity === "critical").length;

  return (
    <AppPageFrame>
      <DashboardReveal className={cn(dashboardPageShellClass)}>
        <div className="flex min-w-0 items-start justify-between gap-4">
          <PageHeader
            title="Alerts"
            subtitle={
              unread > 0
                ? `${unread} unread alert${unread > 1 ? "s" : ""}${critical > 0 ? ` · ${critical} critical` : ""}`
                : "All alerts are read. No critical items."
            }
          />
          {unread > 0 && (
            <button
              type="button"
              onClick={markAllCoordinatorRead}
              className="flex shrink-0 items-center gap-1.5 rounded-full border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent hover:text-primary-active"
            >
              <HugeiconsIcon icon={Tick02Icon} size={BADGE_ICON_SIZE} strokeWidth={ICON_STROKE} color="currentColor" absoluteStrokeWidth />
              Mark all read
            </button>
          )}
        </div>

        <FilterPillGroup
          value={filter}
          onChange={setFilter}
          options={[
            { id: "all", label: "All", count: alerts.length },
            { id: "unread", label: "Unread", count: unread },
            { id: "critical", label: "Critical", count: alerts.filter((a) => a.severity === "critical").length },
            { id: "warning", label: "Warning", count: alerts.filter((a) => a.severity === "warning").length },
            { id: "info", label: "Info", count: alerts.filter((a) => a.severity === "info").length },
          ]}
        />

        {filtered.length > 0 ? (
          <div className="flex flex-col gap-3">
            {filtered.map((alert) => (
              <AlertCard key={alert.id} alert={alert} onMarkRead={markCoordinatorRead} />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={Notification01Icon}
            title={filter === "unread" ? "No unread alerts" : "No alerts"}
            body={
              filter === "unread"
                ? "You're all caught up. No unread alerts."
                : "No alerts match the selected filter."
            }
          />
        )}
      </DashboardReveal>
    </AppPageFrame>
  );
}
