"use client";

import { useState } from "react";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/shared/PageHeader";
import { PatientChartShell } from "@/features/patients/components/PatientChartShell";
import { getDoctorPatientById } from "@/features/patients/data/doctor-patients-data";
import {
  VitalsSummaryCards,
  type VitalMetricId,
} from "@/features/vitals/components/VitalsSummaryCards";
import { VitalsTrendCard } from "@/features/vitals/components/VitalsTrendCard";
import { VitalsRecentLog } from "@/features/vitals/components/VitalsRecentLog";
import {
  dashboardGridClass,
  dashboardGridFullClass,
} from "@/features/dashboard/data/dashboard-styles";
import { cn } from "@/lib/utils";

export function PatientVitalsPageContent({ patientId }: { patientId: string }) {
  const patient = getDoctorPatientById(patientId);
  const [activeVital, setActiveVital] = useState<VitalMetricId>("bp");

  if (!patient) notFound();

  return (
    <PatientChartShell patientId={patientId} showKpis={false}>
      <PageHeader
        title="Vitals trends"
        subtitle={`Monitor BP, pulse, SpO₂, and related trends for ${patient.name}.`}
      />

      <div className={cn(dashboardGridClass, "items-stretch")}>
        <div className="col-span-4 min-w-0 xl:col-span-4">
          <VitalsSummaryCards
            variant="carousel"
            activeId={activeVital}
            onActiveIdChange={setActiveVital}
          />
        </div>
        <div className="col-span-4 min-w-0 xl:col-span-8">
          <VitalsTrendCard
            activeTab={activeVital}
            onActiveTabChange={setActiveVital}
          />
        </div>
        <div className={dashboardGridFullClass}>
          <VitalsRecentLog />
        </div>
      </div>
    </PatientChartShell>
  );
}
