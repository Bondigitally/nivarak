"use client";

import { AppPageFrame } from "@/components/layout/app-page-frame";
import { PageHeader } from "@/components/shared/PageHeader";
import { DashboardReveal } from "@/features/dashboard/components/DashboardReveal";
import {
  dashboardCardClass,
  dashboardPageShellClass,
  statusBadgeClass,
} from "@/features/dashboard/data/dashboard-styles";
import { getHomeDashboardData } from "@/features/dashboard/data/home-data";
import { IasScoreCard } from "@/features/dashboard/components/IasScoreCard";
import { SectionInfoButton } from "@/features/dashboard/components/EmptyState";
import { AssessmentActionsMenu } from "@/features/assessments/components/AssessmentActionsMenu";
import {
  ASSESSMENT_ROWS,
  type AssessmentRow,
  type AssessmentStatusType,
} from "@/features/assessments/data/assessments-data";
import { AppIcon } from "@/components/shared/AppIcon";
import { Button } from "@/components/ui/button";
import { HugeiconsIcon } from "@hugeicons/react";
import { AssignmentsIcon, Pdf02Icon, ViewIcon } from "@hugeicons/core-free-icons";
import { radius } from "@/lib/tokens/radius";
import { typo } from "@/lib/tokens/typography";
import { cn } from "@/lib/utils";
import { EMPTY_ICON_SIZE, ICON_STROKE } from "@/lib/icons";

function assessmentResultClass(statusType: AssessmentStatusType) {
  return cn(
    statusBadgeClass,
    "shrink-0 gap-1.5 border",
    statusType === "normal" && "border-success-muted bg-success-muted text-success",
    statusType === "mid" && "border-warning-muted bg-warning-muted text-warning",
    statusType === "high" && "border-destructive-muted bg-destructive-muted text-destructive",
  );
}

function AssessmentMobileCard({ row }: { row: AssessmentRow }) {
  return (
    <article className={cn(dashboardCardClass, "p-3")}>
      <header>
        <h3 className={cn(typo.headingS, "text-foreground")}>
          {row.name}
        </h3>
      </header>

      <div
        className={cn(
          radius.md,
          "mt-3 flex items-center justify-between gap-3 border border-border bg-muted/70 px-3 py-2",
        )}
      >
        <div className="min-w-0">
          <p className={cn(typo.caption, "text-muted-foreground")}>Completed</p>
          <p className="font-sans text-sm font-semibold leading-5 text-foreground">
            {row.date}
          </p>
        </div>
        <span className={assessmentResultClass(row.statusType)}>
          {row.result}
        </span>
      </div>

      <footer className="mt-3 flex gap-2">
        <Button type="button" variant="primary-outline" className="h-9 min-w-0 flex-1 px-3">
          <AppIcon icon={ViewIcon} />
          View report
        </Button>
        <Button type="button" variant="secondary" className="h-9 min-w-0 flex-1 px-3">
          <AppIcon icon={Pdf02Icon} />
          Download PDF
        </Button>
      </footer>
    </article>
  );
}

function RecentAssessmentsHeading() {
  return (
    <div className="flex min-w-0 items-center gap-2">
      <h2 className="font-sans text-[22px] font-semibold leading-7 text-foreground">
        Recent Assessments
      </h2>
      <span className={cn(statusBadgeClass, "bg-sidebar-accent text-primary")}>
        {ASSESSMENT_ROWS.length}
      </span>
      <SectionInfoButton info="Completed health assessments and their results over time. Open a row to view or download the report." />
    </div>
  );
}

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

            <section className="flex flex-col gap-3 lg:hidden">
              <RecentAssessmentsHeading />
              <ul className="flex flex-col gap-3">
                {ASSESSMENT_ROWS.map((row, index) => (
                  <li key={`${row.name}-${row.date}-${index}`}>
                    <AssessmentMobileCard row={row} />
                  </li>
                ))}
              </ul>
              <Button type="button" variant="secondary" className="w-full">
                Load more
              </Button>
            </section>

            <div
              className="hidden flex-col items-stretch justify-start self-stretch rounded-md bg-card lg:flex"
              style={{
                outline: "1px solid var(--border)",
                outlineOffset: "-1px",
                boxShadow: "0px 2px 8px rgba(17, 24, 39, 0.05)",
              }}
            >
              <div className="flex items-center gap-2 self-stretch px-5 pt-5 pb-3">
                <RecentAssessmentsHeading />
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
                            <span className={assessmentResultClass(row.statusType)}>
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
