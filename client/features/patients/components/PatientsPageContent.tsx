"use client";

import { useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  UserGroupIcon,
  Search01Icon,
  ArrowRight01Icon,
} from "@hugeicons/core-free-icons";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { typo } from "@/lib/tokens/typography";
import {
  dashboardPageShellClass,
  dashboardCardClass,
} from "@/features/dashboard/data/dashboard-styles";
import { EmptyState } from "@/features/dashboard/components/EmptyState";
import { DashboardReveal } from "@/features/dashboard/components/DashboardReveal";
import { AppPageFrame } from "@/features/dashboard/components/AppPageFrame";
import { PageHeader } from "@/components/shared/PageHeader";
import { FilterPillGroup } from "@/components/shared/FilterPillGroup";
import { PatientAvatar } from "@/components/shared/PatientAvatar";
import { PatientRiskBadge } from "@/components/shared/PatientRiskBadge";
import { getAllPatients } from "@/features/patients/data/patients-list-data";
import type { PatientListItem, RiskLevel } from "@/lib/domain";
import { BADGE_ICON_SIZE, ICON_STROKE } from "@/lib/icons";

function PatientCard({ patient }: { patient: PatientListItem }) {
  return (
    <Link
      href={`/patients/${patient.id}`}
      className={cn(
        dashboardCardClass,
        "group flex min-w-0 flex-col gap-3 p-4 transition-shadow",
      )}
    >
      <div className="flex min-w-0 items-start gap-3">
        <PatientAvatar initials={patient.initials} riskLevel={patient.riskLevel} size="md" />
        <div className="min-w-0 flex-1 overflow-hidden">
          <div className="flex min-w-0 items-center gap-2">
            <span className={cn(typo.headingS, "min-w-0 truncate")}>{patient.name}</span>
            <PatientRiskBadge level={patient.riskLevel} />
          </div>
          <p className={cn(typo.bodyS, "mt-0.5 truncate")}>
            {patient.age}y · {patient.conditions.join(", ")}
          </p>
        </div>
        <HugeiconsIcon
          icon={ArrowRight01Icon}
          size={BADGE_ICON_SIZE}
          strokeWidth={ICON_STROKE}
          color="currentColor"
          className="mt-1 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100"
          absoluteStrokeWidth
        />
      </div>
      <div className="grid grid-cols-2 gap-x-3 gap-y-1 border-t border-divider pt-3">
        <div>
          <p className={cn(typo.caption, "text-tertiary-foreground")}>Nurse</p>
          <p className={cn(typo.bodyS, "truncate font-medium text-foreground")}>{patient.assignedNurse}</p>
        </div>
        <div>
          <p className={cn(typo.caption, "text-tertiary-foreground")}>Next Visit</p>
          <p className={cn(typo.bodyS, "truncate font-medium text-foreground")}>{patient.nextVisit}</p>
        </div>
      </div>
    </Link>
  );
}

export function PatientsPageContent() {
  const allPatients = getAllPatients();
  const [search, setSearch] = useState("");
  const [riskFilter, setRiskFilter] = useState<RiskLevel | "all">("all");

  const filtered = allPatients.filter((p) => {
    const matchSearch =
      search === "" ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.conditions.some((c) => c.toLowerCase().includes(search.toLowerCase()));
    const matchRisk = riskFilter === "all" || p.riskLevel === riskFilter;
    return matchSearch && matchRisk;
  });

  const riskCounts = {
    critical: allPatients.filter((p) => p.riskLevel === "critical").length,
    high: allPatients.filter((p) => p.riskLevel === "high").length,
    medium: allPatients.filter((p) => p.riskLevel === "medium").length,
    low: allPatients.filter((p) => p.riskLevel === "low").length,
  };

  return (
    <AppPageFrame>
      <DashboardReveal className={cn(dashboardPageShellClass)}>
        <PageHeader
          title="Patients"
          subtitle={`${allPatients.length} active patients under your coordination.`}
        />

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex min-w-0 flex-1 items-center gap-2 overflow-hidden rounded-full border border-border bg-card py-1 pl-4 pr-2 shadow-[0px_1px_2px_rgba(17,24,39,0.04)] transition-[border-color] hover:border-foreground/12 focus-within:border-border-focus/80">
            <HugeiconsIcon
              icon={Search01Icon}
              size={BADGE_ICON_SIZE}
              strokeWidth={ICON_STROKE}
              color="currentColor"
              className="shrink-0 text-muted-foreground"
              absoluteStrokeWidth
            />
            <input
              type="text"
              placeholder="Search patients or conditions…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={cn(
                typo.bodyM,
                "min-w-0 flex-1 bg-transparent text-foreground outline-none placeholder:text-placeholder",
              )}
            />
          </div>

          <FilterPillGroup
            value={riskFilter}
            onChange={setRiskFilter}
            options={[
              { id: "all", label: "All", count: allPatients.length },
              { id: "critical", label: "Critical", count: riskCounts.critical },
              { id: "high", label: "High", count: riskCounts.high },
              { id: "medium", label: "Medium", count: riskCounts.medium },
              { id: "low", label: "Low", count: riskCounts.low },
            ]}
            className="shrink-0"
          />
        </div>

        {filtered.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {filtered.map((patient) => (
              <PatientCard key={patient.id} patient={patient} />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={UserGroupIcon}
            title="No patients found"
            body="Try adjusting your search or filter to find patients."
          />
        )}
      </DashboardReveal>
    </AppPageFrame>
  );
}
