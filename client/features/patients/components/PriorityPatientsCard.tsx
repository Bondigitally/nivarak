"use client";

import Link from "next/link";
import { UserGroupIcon } from "@hugeicons/core-free-icons";
import { cn } from "@/lib/utils";
import { typo } from "@/lib/tokens/typography";
import {
  dashboardCardClass,
  dashboardCardHeaderClass,
  dashboardDividedItemClass,
  dashboardDividedRowClass,
  dashboardRowDividerClass,
} from "@/features/dashboard/data/dashboard-styles";
import { SectionTitle, ViewAllLink, EmptyState } from "@/features/dashboard/components/EmptyState";
import { PatientAvatar } from "@/components/shared/PatientAvatar";
import { PatientRiskBadge } from "@/components/shared/PatientRiskBadge";
import type { PriorityPatient } from "@/lib/domain";

function PatientRow({
  patient,
  index,
}: {
  patient: PriorityPatient;
  index: number;
}) {
  return (
    <li className={dashboardDividedItemClass}>
      {index > 0 && <div className={dashboardRowDividerClass} aria-hidden />}
      <Link
        href={`/patients/${patient.id}`}
        className={cn(
          dashboardDividedRowClass,
          "group -mx-2 flex min-w-0 items-center gap-3 px-2 py-3.5",
        )}
      >
        <PatientAvatar initials={patient.initials} riskLevel={patient.riskLevel} />
        <div className="min-w-0 flex-1 overflow-hidden">
          <div className="flex min-w-0 items-center gap-2">
            <span className={cn(typo.headingS, "min-w-0 truncate text-sm leading-5")}>
              {patient.name}
            </span>
            <PatientRiskBadge level={patient.riskLevel} />
          </div>
          <p className={cn(typo.bodyS, "mt-0.5 truncate")}>
            {patient.age}y · {patient.condition}
          </p>
          <p className={cn(typo.caption, "mt-0.5 truncate text-muted-foreground")}>
            {patient.lastActivity}
          </p>
        </div>
        {patient.pendingTasks > 0 && (
          <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-warning-muted text-[11px] font-semibold text-warning">
            {patient.pendingTasks}
          </span>
        )}
      </Link>
    </li>
  );
}

export function PriorityPatientsCard({
  patients,
}: {
  patients: PriorityPatient[];
}) {
  return (
    <section className={cn(dashboardCardClass, "flex h-fit shrink-0 flex-col p-5")}>
      <div className={dashboardCardHeaderClass}>
        <SectionTitle info="Patients flagged as high priority based on risk level, missed appointments, or pending critical tasks.">
          Priority Patients
        </SectionTitle>
        <ViewAllLink href="/patients" />
      </div>
      {patients.length > 0 ? (
        <ul className="flex min-w-0 flex-col">
          {patients.map((patient, index) => (
            <PatientRow key={patient.id} patient={patient} index={index} />
          ))}
        </ul>
      ) : (
        <EmptyState
          icon={UserGroupIcon}
          title="No priority patients"
          body="All patients are on track. No flags or critical items at this time."
          className="min-h-0"
        />
      )}
    </section>
  );
}
