"use client";

import { AppPageFrame } from "@/components/layout/app-page-frame";
import { PageHeader } from "@/components/shared/PageHeader";
import { DashboardReveal } from "@/features/dashboard/components/DashboardReveal";
import {
  dashboardPageShellClass,
  statusBadgeClass,
} from "@/features/dashboard/data/dashboard-styles";
import { getHomeDashboardData } from "@/features/dashboard/data/home-data";
import { IasScoreCard } from "@/features/dashboard/components/IasScoreCard";
import { SectionInfoButton } from "@/features/dashboard/components/EmptyState";
import { AssessmentActionsMenu } from "@/features/assessments/components/AssessmentActionsMenu";
import { ASSESSMENT_ROWS } from "@/features/assessments/data/assessments-data";
import { Button } from "@/components/ui/button";
import { HugeiconsIcon } from "@hugeicons/react";
import { AssignmentsIcon } from "@hugeicons/core-free-icons";
import { cn } from "@/lib/utils";
import { EMPTY_ICON_SIZE, ICON_STROKE } from "@/lib/icons";

export default function AssessmentsPage() {
  const data = getHomeDashboardData();
  const hasAssessment = data?.assessment !== null;
  const assessment = data?.assessment;

  return (
    <AppPageFrame>
      <DashboardReveal className={cn(dashboardPageShellClass)}>
        <PageHeader
          title="Assessments"
          subtitle="Review your completed health assessments and monitor your progress over time."
        />

        {hasAssessment && assessment ? (
          <div className="flex flex-col gap-3">
            <IasScoreCard assessment={assessment} variant="plain" />

            <div
              className="flex flex-col items-stretch justify-start self-stretch rounded-md bg-card"
              style={{
                outline: "1px solid var(--border)",
                outlineOffset: "-1px",
                boxShadow: "0px 2px 8px rgba(17, 24, 39, 0.05)",
              }}
            >
              <div className="flex items-center gap-2 self-stretch px-5 pt-5 pb-3">
                <h2 className="font-sans text-[22px] font-semibold leading-7 text-foreground">
                  Recent Assessments
                </h2>
                <span className={cn(statusBadgeClass, "bg-sidebar-accent text-primary")}>
                  {ASSESSMENT_ROWS.length}
                </span>
                <SectionInfoButton info="Completed health assessments and their results over time. Open a row to view or download the report." />
              </div>

              <div className="overflow-hidden self-stretch rounded-b-md px-5 pt-2 pb-2">
                <div className="w-full overflow-x-auto">
                  <table className="w-full min-w-160 table-fixed border-separate border-spacing-0">
                    <colgroup>
                      <col />
                      <col className="w-44" />
                      <col className="w-36" />
                      <col className="w-14" />
                    </colgroup>
                    <thead>
                      <tr className="bg-table-header">
                        <th scope="col" className="h-11 rounded-l-xl px-4 text-left font-sans text-xs font-semibold tracking-[0.3px] text-muted-foreground whitespace-nowrap">
                          Assessment Name
                        </th>
                        <th scope="col" className="h-11 px-4 text-left font-sans text-xs font-semibold tracking-[0.3px] text-muted-foreground whitespace-nowrap">
                          Date Completed
                        </th>
                        <th scope="col" className="h-11 px-4 text-left font-sans text-xs font-semibold tracking-[0.3px] text-muted-foreground whitespace-nowrap">
                          Result
                        </th>
                        <th scope="col" className="h-11 w-14 rounded-r-xl px-2">
                          <span className="sr-only">Actions</span>
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {ASSESSMENT_ROWS.map((row, index) => (
                        <tr key={index} className="transition-colors duration-300 ease-out hover:bg-accent">
                          <td className="truncate border-b border-divider px-4 py-3 font-sans text-sm font-medium leading-5 text-foreground">
                            {row.name}
                          </td>
                          <td className="border-b border-divider px-4 py-3 font-sans text-sm font-normal leading-5 text-muted-foreground whitespace-nowrap">
                            {row.date}
                          </td>
                          <td className="border-b border-divider px-4 py-3">
                            <span
                              className={cn(
                                statusBadgeClass,
                                row.statusType === "normal" && "bg-success-muted text-success",
                                row.statusType === "mid" && "bg-warning-muted text-warning",
                                row.statusType === "high" && "bg-destructive-muted text-destructive"
                              )}
                            >
                              {row.result}
                            </span>
                          </td>
                          <td className="w-14 border-b border-divider px-2 py-3 text-right">
                            <AssessmentActionsMenu />
                          </td>
                        </tr>
                      ))}
                      <tr className="transition-colors duration-300 ease-out hover:bg-accent">
                        <td colSpan={4} className="px-4 py-3 text-center">
                          <button
                            type="button"
                            className="font-sans text-sm font-medium leading-5 text-muted-foreground outline-none transition-colors duration-300 ease-out hover:text-primary"
                          >
                            Load More
                          </button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex min-h-95 flex-col items-center justify-center rounded-lg border border-border bg-card p-6">
            <div className="flex max-w-dash-search flex-col items-center text-center">
              <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-sidebar-accent text-primary">
                <HugeiconsIcon icon={AssignmentsIcon} size={EMPTY_ICON_SIZE} strokeWidth={ICON_STROKE} color="currentColor" absoluteStrokeWidth />
              </div>
              <h2 className="font-sans text-xl font-semibold leading-7 text-foreground">No assessments yet</h2>
              <p className="mt-2 text-sm font-normal leading-5 text-muted-foreground">
                Take the Independent Ageing Score (IAS-P) to establish your baseline and unlock personalized care insights.
              </p>
              <Button type="button" variant="default" size="cta" className="mt-6 px-6 text-sm font-medium">
                Take Assessment
              </Button>
            </div>
          </div>
        )}
      </DashboardReveal>
    </AppPageFrame>
  );
}
