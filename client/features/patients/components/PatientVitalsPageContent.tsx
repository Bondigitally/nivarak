"use client";

import { useState } from "react";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/shared/PageHeader";
import { PatientChartShell } from "@/features/patients/components/PatientChartShell";
import { getDoctorPatientById } from "@/features/patients/data/doctor-patients-data";
import type { VitalMetricId } from "@/features/vitals/components/VitalsSummaryCards";
import { VitalIntroCard } from "@/features/vitals/components/VitalIntroCard";
import { VitalsTrendCard } from "@/features/vitals/components/VitalsTrendCard";
import { VitalsRecentLog } from "@/features/vitals/components/VitalsRecentLog";
import {
  dashboardCardClass,
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
        subtitle="View and compare your vital signs over time"
      />

      <div className={cn(dashboardGridClass, "items-stretch")}>
        {/*
          Single dashboard card: intro/illustration on the left, trend chart
          on the right. Chart tabs drive which vital the intro shows.
        */}
        <section
          className={cn(
            dashboardCardClass,
            dashboardGridFullClass,
            "min-h-[28rem] overflow-hidden",
          )}
          aria-label="Vitals trend"
        >
          <div className="flex h-full min-h-[28rem] flex-col lg:flex-row">
            <div className="flex w-full shrink-0 flex-col p-6 lg:w-[min(22rem,34%)]">
              <VitalIntroCard
                vitalId={activeVital}
                bare
                className="min-h-0 flex-1"
              />
            </div>
            {/* Inset to match column p-6 (24px) — does not run edge-to-edge */}
            <div
              className="hidden w-px shrink-0 self-stretch bg-border lg:my-6 lg:block"
              aria-hidden
            />
            <div className="min-w-0 flex-1 p-5">
              <VitalsTrendCard
                bare
                activeTab={activeVital}
                onActiveTabChange={setActiveVital}
              />
            </div>
          </div>
        </section>

        <div className={dashboardGridFullClass}>
          <VitalsRecentLog />
        </div>
      </div>
    </PatientChartShell>
  );
}
