"use client";

import Link from "next/link";
import { useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowLeft01Icon } from "@hugeicons/core-free-icons";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { AppPageFrame } from "@/features/dashboard/components/AppPageFrame";
import { DashboardReveal } from "@/features/dashboard/components/DashboardReveal";
import {
  dashboardCardClass,
  dashboardPageShellClass,
  statusBadgeClass,
} from "@/features/dashboard/data/dashboard-styles";
import { getDoctorPatientById } from "@/features/patients/data/doctor-patients-data";
import { getAlertDetail } from "@/features/patients/data/patient-chart-data";
import { ICON_SIZE, ICON_STROKE } from "@/lib/icons";
import { severityConfig } from "@/lib/tokens/status-badges";
import { typo } from "@/lib/tokens/typography";
import { cn } from "@/lib/utils";

export function AlertDetailPage({ alertId }: { alertId: string }) {
  const alert = getAlertDetail(alertId);
  const [status, setStatus] = useState(alert?.status ?? "Open");
  const patient = alert ? getDoctorPatientById(alert.patientId) : undefined;

  if (!alert) notFound();

  const severity = severityConfig(alert.severity);

  return (
    <AppPageFrame>
      <DashboardReveal className={cn(dashboardPageShellClass)}>
        <Link
          href="/notifications"
          className={cn(
            typo.bodyS,
            "inline-flex w-fit items-center gap-1.5 text-muted-foreground transition-colors hover:text-foreground",
          )}
        >
          <HugeiconsIcon
            icon={ArrowLeft01Icon}
            size={ICON_SIZE}
            strokeWidth={ICON_STROKE}
            color="currentColor"
            absoluteStrokeWidth
          />
          Notifications
        </Link>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <PageHeader
              title={alert.title}
              subtitle={`${alert.source} · ${alert.timeLabel}`}
            />
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <span className={cn(statusBadgeClass, severity.badge)}>
                {severity.label}
              </span>
              <span
                className={cn(
                  statusBadgeClass,
                  status === "Resolved"
                    ? "bg-success-muted text-success"
                    : status === "Acknowledged"
                      ? "bg-info-muted text-info"
                      : "bg-warning-muted text-warning",
                )}
              >
                {status}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="primary-outline"
              disabled={status !== "Open"}
              onClick={() => setStatus("Acknowledged")}
            >
              Acknowledge
            </Button>
            <Button
              type="button"
              disabled={status === "Resolved"}
              onClick={() => setStatus("Resolved")}
            >
              Resolve
            </Button>
          </div>
        </div>

        <div className={cn(dashboardCardClass, "flex flex-col gap-3 p-5")}>
          <h2 className={typo.headingL}>Details</h2>
          <p className={cn(typo.bodyM, "text-muted-foreground")}>
            {alert.detail}
          </p>
          <Button asChild variant="primary-outline" size="sm" className="w-fit">
            <Link href={`/patients/${alert.patientId}`}>
              Open {alert.patientName}
              {patient ? ` (${patient.code})` : ""}
            </Link>
          </Button>
        </div>

        <div className={cn(dashboardCardClass, "overflow-hidden p-0")}>
          <div className="border-b border-divider px-5 py-4">
            <h2 className={typo.headingL}>Timeline</h2>
          </div>
          <ul>
            {alert.timeline.map((entry) => (
              <li
                key={entry.id}
                className="border-b border-divider px-5 py-4 last:border-b-0"
              >
                <div className="flex items-center justify-between gap-2">
                  <p className={cn(typo.bodyM, "text-muted-foreground")}>
                    {entry.text}
                  </p>
                  <span
                    className={cn(
                      typo.caption,
                      "shrink-0 text-muted-foreground",
                    )}
                  >
                    {entry.time}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </DashboardReveal>
    </AppPageFrame>
  );
}
