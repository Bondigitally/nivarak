"use client";

import Link from "next/link";
import { useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { Tick02Icon } from "@hugeicons/core-free-icons";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/shared/PageHeader";
import { PatientRiskBadge } from "@/components/shared/PatientRiskBadge";
import { Button } from "@/components/ui/button";
import {
  dashboardCardClass,
  statusBadgeClass,
} from "@/features/dashboard/data/dashboard-styles";
import { PatientChartShell } from "@/features/patients/components/PatientChartShell";
import {
  getDoctorAssessmentById,
  getDoctorPatientById,
  riskToBadgeLevel,
} from "@/features/patients/data/doctor-patients-data";
import {
  assessmentNeedsSignature,
  getCgaDomains,
  getClinicalInsights,
} from "@/features/patients/data/patient-chart-data";
import type {
  DoctorAssessmentRow,
  DoctorAssessmentStatus,
  DoctorAssessmentType,
} from "@/lib/domain/doctor";
import { ICON_SIZE, ICON_STROKE } from "@/lib/icons";
import { typo } from "@/lib/tokens/typography";
import { cn } from "@/lib/utils";

export function DoctorAssessmentDetail({
  patientId,
  assessmentId,
}: {
  patientId: string;
  assessmentId: string;
}) {
  const patient = getDoctorPatientById(patientId);
  const existing = getDoctorAssessmentById(assessmentId);
  const [signed, setSigned] = useState(false);
  const [changesRequested, setChangesRequested] = useState(false);

  if (!patient) notFound();

  let assessment: DoctorAssessmentRow | null = null;
  if (existing && existing.patientId === patientId) {
    assessment = existing;
  } else if (assessmentId === "iasp-new") {
    // New CGAs use CgaAssessmentWizard; IAS-P new drafts land here until
    // the clinician flow is linked to the patient IASP modal.
    assessment = {
      id: assessmentId,
      patientId,
      patientName: patient.name,
      patientCode: patient.code,
      type: "IAS-P" as DoctorAssessmentType,
      scoreLabel: "In progress",
      status: "In progress" as DoctorAssessmentStatus,
      date: "Today",
      clinician: "Dr. Mehta",
    };
  }

  if (!assessment) notFound();

  const domains = getCgaDomains();
  const insights = getClinicalInsights();
  const effectiveStatus: DoctorAssessmentStatus = signed
    ? "Signed"
    : assessment.status;
  const isSigned = effectiveStatus === "Signed";
  const needsReview =
    !signed &&
    assessmentNeedsSignature(assessment.status) &&
    !changesRequested;

  return (
    <PatientChartShell
      patientId={patientId}
      showKpis={false}
      title={`${assessment.type} detail`}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <PageHeader
            title={`${assessment.type} · ${assessment.scoreLabel}`}
            subtitle={`${patient.name} (${patient.code}) · ${assessment.date} · ${assessment.clinician}`}
          />
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span
              className={cn(
                statusBadgeClass,
                effectiveStatus === "Signed"
                  ? "bg-success-muted text-success"
                  : effectiveStatus === "Needs review"
                    ? "bg-warning-muted text-warning"
                    : "bg-muted text-muted-foreground",
              )}
            >
              {changesRequested ? "Changes requested" : effectiveStatus}
            </span>
            {assessment.riskLevel ? (
              <PatientRiskBadge
                level={riskToBadgeLevel(assessment.riskLevel)}
              />
            ) : null}
          </div>
        </div>

        {needsReview ? (
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="primary-outline"
              onClick={() => setChangesRequested(true)}
            >
              Request Changes
            </Button>
            <Button type="button" onClick={() => setSigned(true)}>
              <HugeiconsIcon
                icon={Tick02Icon}
                size={ICON_SIZE}
                strokeWidth={ICON_STROKE}
                color="currentColor"
                absoluteStrokeWidth
              />
              Sign &amp; Approve
            </Button>
          </div>
        ) : null}
      </div>

      <div className={cn(dashboardCardClass, "overflow-hidden p-0")}>
        <div className="border-b border-divider px-5 py-4">
          <h2 className={typo.headingL}>Domain scores</h2>
        </div>
        <ul>
          {domains.map((domain) => (
            <li
              key={domain.id}
              className="flex items-start justify-between gap-3 border-b border-divider px-5 py-4 last:border-b-0"
            >
              <div className="min-w-0">
                <p className={cn(typo.headingS, "text-sm")}>{domain.name}</p>
                <p className={cn(typo.caption, "mt-0.5 text-muted-foreground")}>
                  {domain.note}
                </p>
              </div>
              <span
                className={cn(typo.bodyS, "shrink-0 tabular-nums font-medium")}
              >
                {domain.score}
              </span>
            </li>
          ))}
        </ul>
      </div>

      {isSigned ? (
        <div className={cn(dashboardCardClass, "flex flex-col gap-4 p-5")}>
          <h2 className={typo.headingL}>Clinical insights</h2>
          <ul className="flex flex-col gap-3">
            {insights.map((insight) => (
              <li
                key={insight.id}
                className="border-l-2 border-primary/40 pl-3"
              >
                <p className={typo.headingS}>{insight.title}</p>
                <p className={cn(typo.bodyM, "mt-1 text-muted-foreground")}>
                  {insight.body}
                </p>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div className={cn(dashboardCardClass, "flex flex-col gap-2 p-5")}>
          <h2 className={typo.headingL}>Clinical insights</h2>
          <p className={cn(typo.bodyM, "text-muted-foreground")}>
            Insights unlock after you Sign &amp; Approve this assessment.
          </p>
        </div>
      )}

      <div className={cn(dashboardCardClass, "flex flex-col gap-2 p-5")}>
        <h2 className={typo.headingL}>Signature</h2>
        {isSigned ? (
          <>
            <p className={cn(typo.bodyM, "font-medium")}>
              {signed ? "Dr. Mehta" : assessment.clinician}
            </p>
            <p className={cn(typo.caption, "text-muted-foreground")}>
              {signed ? "Signed just now" : `Signed ${assessment.date}`}
            </p>
          </>
        ) : (
          <p className={cn(typo.bodyM, "text-muted-foreground")}>
            {changesRequested
              ? "Returned to author for revisions."
              : "Not signed yet."}
          </p>
        )}
        <Link
          href={`/patients/${patientId}/assessments`}
          className={cn(typo.bodyS, "mt-2 w-fit text-primary hover:underline")}
        >
          Back to assessments
        </Link>
      </div>
    </PatientChartShell>
  );
}
