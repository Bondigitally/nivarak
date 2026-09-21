"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import { Notification01Icon } from "@hugeicons/core-free-icons";
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
import { severityConfig } from "@/lib/tokens/status-badges";
import type { Notification } from "@/lib/domain";
import { BADGE_ICON_SIZE, ICON_STROKE } from "@/lib/icons";

function AlertRow({
  alert,
  index,
}: {
  alert: Notification;
  index: number;
}) {
  const sev = severityConfig(alert.severity ?? "info");

  return (
    <li className={dashboardDividedItemClass}>
      {index > 0 && <div className={dashboardRowDividerClass} aria-hidden />}
      <div
        className={cn(
          dashboardDividedRowClass,
          "-mx-2 flex min-w-0 items-start gap-3 px-2 py-3.5",
          alert.read && "opacity-60",
        )}
      >
        {alert.icon && (
          <span
            className={cn(
              "mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg",
              sev.icon,
            )}
          >
            <HugeiconsIcon
              icon={alert.icon}
              size={BADGE_ICON_SIZE}
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
          <div className="mt-1 flex min-w-0 flex-wrap items-center gap-1.5">
            {alert.patientName && (
              <>
                <span className={cn(typo.caption, "font-medium text-primary-active")}>
                  {alert.patientName}
                </span>
                <span className={typo.caption}>·</span>
              </>
            )}
            {alert.timeLabel && (
              <span className={cn(typo.caption, "text-muted-foreground")}>
                {alert.timeLabel}
              </span>
            )}
          </div>
        </div>
        <span className={cn(statusBadgeClass, "mt-0.5 shrink-0 capitalize", sev.badge)}>
          {alert.severity}
        </span>
      </div>
    </li>
  );
}

export function RecentAlertsCard({ alerts }: { alerts: Notification[] }) {
  const unreadCount = alerts.filter((a) => !a.read).length;

  return (
    <section className={cn(dashboardCardClass, "flex h-fit shrink-0 flex-col p-5")}>
      <div className={dashboardCardHeaderClass}>
        <div className="flex min-w-0 items-center gap-2">
          <SectionTitle>Recent Alerts</SectionTitle>
          {unreadCount > 0 && (
            <span className={cn(statusBadgeClass, "shrink-0 bg-destructive-muted text-destructive")}>
              {unreadCount} unread
            </span>
          )}
        </div>
        <ViewAllLink href="/alerts" />
      </div>
      {alerts.length > 0 ? (
        <ul className="flex min-w-0 flex-col">
          {alerts.map((alert, index) => (
            <AlertRow key={alert.id} alert={alert} index={index} />
          ))}
        </ul>
      ) : (
        <EmptyState
          icon={Notification01Icon}
          title="No recent alerts"
          body="All patients are on track. No critical alerts at this time."
          className="min-h-0"
        />
      )}
    </section>
  );
}
