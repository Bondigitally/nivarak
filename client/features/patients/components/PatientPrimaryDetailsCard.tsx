"use client";

import Link from "next/link";
import {
  Alert02Icon,
  Chart01Icon,
} from "@hugeicons/core-free-icons";
import { AppIcon } from "@/components/shared/AppIcon";
import { ChevronIcon } from "@/components/shared/ChevronIcon";
import { PatientAvatar } from "@/components/shared/PatientAvatar";
import { dashboardCardClass } from "@/features/dashboard/data/dashboard-styles";
import { getPatientOverviewIasp } from "@/features/patients/data/patient-chart-data";
import type { DoctorPatientRow } from "@/lib/domain/doctor";
import type { RiskLevel } from "@/lib/domain";
import { BADGE_ICON_SIZE, ICON_SIZE } from "@/lib/icons";
import { riskConfig } from "@/lib/tokens/status-badges";
import { typo } from "@/lib/tokens/typography";
import { cn } from "@/lib/utils";

/** Header status chips — 12/500/16, tracking 0 */
const statusPillClass =
  "inline-flex h-7 items-center gap-2 rounded-full px-2.5 py-1.5 text-xs font-medium leading-4 tracking-normal";

function riskPillLabel(level: RiskLevel) {
  switch (level) {
    case "low":
      return "Low risk";
    case "medium":
      return "Medium risk";
    case "high":
      return "High risk";
    case "critical":
      return "Critical risk";
  }
}

function riskPillClasses(level: RiskLevel) {
  switch (level) {
    case "low":
      return {
        wrap: "bg-[#EDF9F5] text-[#10AB7F]",
        dot: "bg-[#10AB7F]",
      };
    case "medium":
      return {
        wrap: "bg-info-muted text-info",
        dot: "bg-info",
      };
    case "high":
    case "critical":
      return {
        wrap: "bg-warning-muted text-warning",
        dot: "bg-warning",
      };
  }
}

/** Figma 2364:2566 — patient primary details header card */
export function PatientPrimaryDetailsCard({
  patient,
  chartHref,
  showChartLink = true,
}: {
  patient: DoctorPatientRow;
  /** Destination for “Open patient chart” (defaults to vitals tab). */
  chartHref?: string;
  /** Hide on vitals tab — already viewing the chart destination. */
  showChartLink?: boolean;
}) {
  const overview = getPatientOverviewIasp(patient.id);
  const risk = riskConfig(patient.riskLevel);
  const pill = riskPillClasses(patient.riskLevel);

  return (
    <section
      className={cn(
        dashboardCardClass,
        "flex flex-wrap items-center justify-between gap-4 border-border/90 p-6",
      )}
    >
      <div className="flex min-w-0 flex-wrap items-center gap-5">
        <PatientAvatar
          initials={patient.initials}
          riskLevel={patient.riskLevel}
          size="lg"
          className="size-14 text-base font-semibold tracking-[0.4px]"
        />

        <div className="min-w-0">
          <h1
            className={cn(
              typo.headingL,
              "text-[17px] font-bold leading-[1.375] tracking-[-0.025em] text-foreground",
            )}
          >
            {patient.name}
          </h1>
          <p className={cn(typo.bodyM, "mt-0.5 text-muted-foreground")}>
            {patient.age} yrs
            <span className="mx-1.5 text-border" aria-hidden>
              ·
            </span>
            {patient.code}
          </p>
        </div>

        <div
          className="hidden h-11 w-px shrink-0 bg-divider sm:block"
          aria-hidden
        />

        <div className="flex flex-wrap items-center gap-2">
          <span className={cn(statusPillClass, pill.wrap)}>
            <span
              className={cn("size-2 shrink-0 rounded-sm", pill.dot)}
              aria-hidden
            />
            {riskPillLabel(patient.riskLevel)}
          </span>
          <span
            className={cn(statusPillClass, "bg-[#FCEFF0] text-[#CF545B]")}
          >
            <AppIcon icon={Alert02Icon} size={16} className="text-[#CF545B]" />
            Allergy: {overview.allergy}
          </span>
        </div>
      </div>

      {showChartLink ? (
        <Link
          href={chartHref ?? `/patients/${patient.id}/vitals`}
          className={cn(
            "inline-flex h-11 shrink-0 items-center gap-2 rounded-full bg-[#f5edfc] px-6 text-[13.5px] font-medium text-[#5c2882]",
            "transition-colors hover:bg-primary/15",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40",
          )}
          aria-label={`Open ${patient.name}'s vitals chart`}
        >
          <AppIcon icon={Chart01Icon} size={ICON_SIZE} />
          Open patient chart
          <ChevronIcon direction="right" size={BADGE_ICON_SIZE} />
        </Link>
      ) : null}

      <span className="sr-only">{risk.label}</span>
    </section>
  );
}
