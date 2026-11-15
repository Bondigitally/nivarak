"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import { Notification01Icon, Tick02Icon } from "@hugeicons/core-free-icons";
import { cn } from "@/lib/utils";
import { typo } from "@/lib/tokens/typography";
import {
  dashboardPageShellClass,
  dashboardCardClass,
  dashboardCardStackClass,
  statusBadgeClass,
} from "@/features/dashboard/data/dashboard-styles";
import { EmptyState } from "@/features/dashboard/components/EmptyState";
import { DashboardReveal } from "@/features/dashboard/components/DashboardReveal";
import { AppPageFrame } from "@/features/dashboard/components/AppPageFrame";
import { PageHeader } from "@/components/shared/PageHeader";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { severityConfig } from "@/lib/tokens/status-badges";
import { useNotificationStore } from "@/features/alerts/store/notification-store";
import type { AlertSeverity, Notification } from "@/lib/domain";
import {
  BADGE_ICON_SIZE,
  ICON_SIZE,
  ICON_STROKE,
  iconTileClass,
} from "@/lib/icons";

type AlertFilter = "all" | "unread" | AlertSeverity;

function DoctorAlertCard({
  alert,
  onAcknowledge,
}: {
  alert: Notification;
  onAcknowledge: (id: string) => void;
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
      {alert.icon ? (
        <span
          className={cn(
            "mt-0.5 flex shrink-0 items-center justify-center rounded-lg",
            iconTileClass,
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
      ) : null}

      <div className="min-w-0 flex-1 overflow-hidden">
        <div className="flex min-w-0 items-start gap-2">
          <Link
            href={`/notifications/${alert.id}`}
            className={cn(
              typo.headingS,
              "min-w-0 flex-1 leading-5 text-sm text-foreground hover:text-primary",
            )}
          >
            {alert.title}
          </Link>
          {!alert.read ? (
            <span className="mt-1.5 size-2 shrink-0 rounded-full bg-primary" />
          ) : null}
        </div>
        <div className="mt-1.5 flex flex-wrap items-center gap-2">
          <span className={cn(statusBadgeClass, sev.badge)}>{sev.label}</span>
          {alert.patientName ? (
            <span className={cn(typo.caption, "font-medium text-primary-active")}>
              {alert.patientName}
            </span>
          ) : null}
          {alert.timeLabel ? (
            <>
              <span className={typo.caption}>·</span>
              <span className={cn(typo.caption, "text-muted-foreground")}>
                {alert.timeLabel}
              </span>
            </>
          ) : null}
        </div>
      </div>

      {!alert.read ? (
        <button
          type="button"
          onClick={() => onAcknowledge(alert.id)}
          className="mt-0.5 flex shrink-0 items-center gap-1.5 rounded-md border border-border bg-card px-2.5 py-1 text-xs font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
        >
          <HugeiconsIcon
            icon={Tick02Icon}
            size={BADGE_ICON_SIZE}
            strokeWidth={2}
            color="currentColor"
            absoluteStrokeWidth
          />
          Acknowledge
        </button>
      ) : null}
    </div>
  );
}

export function DoctorAlertsView() {
  const alerts = useNotificationStore((s) => s.coordinatorAlerts);
  const markCoordinatorRead = useNotificationStore((s) => s.markCoordinatorRead);
  const markAllCoordinatorRead = useNotificationStore(
    (s) => s.markAllCoordinatorRead,
  );
  const [filter, setFilter] = useState<AlertFilter>("all");

  const filtered = alerts.filter((a) => {
    if (filter === "unread") return !a.read;
    if (filter === "all") return true;
    return a.severity === filter;
  });

  const unread = alerts.filter((a) => !a.read).length;
  const critical = alerts.filter((a) => a.severity === "critical").length;

  const filterTabs = useMemo(
    () => [
      { id: "all" as const, label: `All (${alerts.length})` },
      { id: "unread" as const, label: `Open (${unread})` },
      {
        id: "critical" as const,
        label: `Critical (${alerts.filter((a) => a.severity === "critical").length})`,
      },
      {
        id: "warning" as const,
        label: `Warning (${alerts.filter((a) => a.severity === "warning").length})`,
      },
      {
        id: "info" as const,
        label: `Info (${alerts.filter((a) => a.severity === "info").length})`,
      },
    ],
    [alerts, unread],
  );

  return (
    <AppPageFrame>
      <DashboardReveal className={cn(dashboardPageShellClass)}>
        <div className="flex min-w-0 items-start justify-between gap-dash-gutter">
          <PageHeader
            title="Alerts"
            subtitle={
              unread > 0
                ? `${unread} open alert${unread > 1 ? "s" : ""}${critical > 0 ? ` · ${critical} critical` : ""}`
                : "No open clinical alerts."
            }
          />
          {unread > 0 ? (
            <button
              type="button"
              onClick={markAllCoordinatorRead}
              className="flex shrink-0 items-center gap-1.5 rounded-full border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent hover:text-primary-active"
            >
              <HugeiconsIcon
                icon={Tick02Icon}
                size={BADGE_ICON_SIZE}
                strokeWidth={ICON_STROKE}
                color="currentColor"
                absoluteStrokeWidth
              />
              Acknowledge all
            </button>
          ) : null}
        </div>

        <SegmentedControl
          value={filter}
          onChange={setFilter}
          options={filterTabs}
          ariaLabel="Alert filters"
          layoutId="doctorAlertsFilterTabs"
          surface="card"
          variant="inset"
          className="shrink-0"
        />

        {filtered.length > 0 ? (
          <div className={dashboardCardStackClass}>
            {filtered.map((alert) => (
              <DoctorAlertCard
                key={alert.id}
                alert={alert}
                onAcknowledge={markCoordinatorRead}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={Notification01Icon}
            title={filter === "unread" ? "No open alerts" : "No alerts"}
            body={
              filter === "unread"
                ? "You're caught up. No alerts need acknowledgment."
                : "No alerts match the selected severity filter."
            }
          />
        )}
      </DashboardReveal>
    </AppPageFrame>
  );
}
