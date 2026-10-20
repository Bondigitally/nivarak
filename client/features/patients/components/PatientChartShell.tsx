"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowLeft01Icon } from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { AppPageFrame } from "@/features/dashboard/components/AppPageFrame";
import { DashboardReveal } from "@/features/dashboard/components/DashboardReveal";
import { dashboardPageShellClass } from "@/features/dashboard/data/dashboard-styles";
import { PatientPrimaryDetailsCard } from "@/features/patients/components/PatientPrimaryDetailsCard";
import { getDoctorPatientById } from "@/features/patients/data/doctor-patients-data";
import { type ChartTab } from "@/features/patients/data/patient-chart-data";
import { ICON_SIZE, ICON_STROKE } from "@/lib/icons";
import { typo } from "@/lib/tokens/typography";
import { cn } from "@/lib/utils";

const TABS: { id: ChartTab; label: string; suffix: string }[] = [
  { id: "overview", label: "Overview", suffix: "" },
  { id: "assessments", label: "Assessments", suffix: "/assessments" },
  { id: "vitals", label: "Vitals", suffix: "/vitals" },
  { id: "care-plan", label: "Care Plan", suffix: "/care-plan" },
  { id: "notes", label: "Notes", suffix: "/notes" },
];

function resolveTab(pathname: string, patientId: string): ChartTab {
  const base = `/patients/${patientId}`;
  if (pathname.startsWith(`${base}/assessments`)) return "assessments";
  if (pathname.startsWith(`${base}/vitals`)) return "vitals";
  if (pathname.startsWith(`${base}/care-plan`)) return "care-plan";
  if (pathname.startsWith(`${base}/notes`)) return "notes";
  return "overview";
}

export function PatientChartShell({
  patientId,
  children,
  title,
  showKpis: _showKpis = true,
}: {
  patientId: string;
  children: React.ReactNode;
  title?: string;
  /** @deprecated KPI strip removed — overview uses IAS-P panel instead. */
  showKpis?: boolean;
}) {
  void _showKpis;
  const pathname = usePathname();
  const router = useRouter();
  const patient = getDoctorPatientById(patientId);
  const tab = resolveTab(pathname, patientId);

  if (!patient) {
    return (
      <AppPageFrame>
        <DashboardReveal className={cn(dashboardPageShellClass)}>
          <h1 className={typo.headingXl}>Patient not found</h1>
          <p className={cn(typo.bodyM, "text-muted-foreground")}>
            This patient record is unavailable.
          </p>
          <Button asChild variant="primary-outline">
            <Link href="/patients">Back to patients</Link>
          </Button>
        </DashboardReveal>
      </AppPageFrame>
    );
  }

  return (
    <AppPageFrame>
      <DashboardReveal className={cn(dashboardPageShellClass)}>
        <div className="flex flex-col gap-3">
          <Button asChild variant="ghost" size="sm" className="w-fit -ml-2 gap-1.5">
            <Link href="/patients">
              <HugeiconsIcon
                icon={ArrowLeft01Icon}
                size={ICON_SIZE}
                strokeWidth={ICON_STROKE}
                color="currentColor"
                absoluteStrokeWidth
              />
              Back to patients
            </Link>
          </Button>
          <PatientPrimaryDetailsCard
            patient={patient}
            showChartLink={tab !== "vitals"}
          />
          {title ? (
            <p className={cn(typo.caption, "px-1 text-muted-foreground")}>
              {title}
            </p>
          ) : null}
        </div>

        <SegmentedControl
          ariaLabel="Patient chart sections"
          layoutId={`patient-chart-tabs-${patientId}`}
          options={TABS.map((t) => ({ id: t.id, label: t.label }))}
          value={tab}
          onChange={(next) => {
            const target = TABS.find((t) => t.id === next);
            if (!target) return;
            router.push(`/patients/${patientId}${target.suffix}`);
          }}
          className="w-fit max-w-full"
        />

        {children}
      </DashboardReveal>
    </AppPageFrame>
  );
}
