"use client";

import { useMemo, useState } from "react";
import { PageHeader } from "@/components/shared/PageHeader";
import { TableSearch } from "@/components/shared/table-search";
import { AppIcon } from "@/components/shared/AppIcon";
import { Button } from "@/components/ui/button";
import { AppPageFrame } from "@/features/dashboard/components/AppPageFrame";
import { DashboardReveal } from "@/features/dashboard/components/DashboardReveal";
import { IasScoreCard } from "@/features/dashboard/components/IasScoreCard";
import {
  dashboardCardClass,
  dashboardPageShellClass,
} from "@/features/dashboard/data/dashboard-styles";
import { getHomeDashboardData } from "@/features/dashboard/data/home-data";
import {
  RecentAssessmentsHeading,
  RecentAssessmentsTable,
  assessmentResultClass,
} from "@/features/assessments/components/RecentAssessmentsTable";
import {
  ASSESSMENT_ROWS,
  type AssessmentRow,
} from "@/features/assessments/data/assessments-data";
import { HugeiconsIcon } from "@hugeicons/react";
import { AssignmentsIcon, Pdf02Icon, ViewIcon } from "@hugeicons/core-free-icons";
import { radius } from "@/lib/tokens/radius";
import { typo } from "@/lib/tokens/typography";
import { cn } from "@/lib/utils";
import { EMPTY_ICON_SIZE, ICON_STROKE } from "@/lib/icons";

function AssessmentMobileCard({ row }: { row: AssessmentRow }) {
  return (
    <article className={cn(dashboardCardClass, "p-3")}>
      <header>
        <h3 className={cn(typo.headingS, "text-foreground")}>{row.name}</h3>
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
        <Button
          type="button"
          variant="primary-outline"
          className="h-9 min-w-0 flex-1 px-3"
        >
          <AppIcon icon={ViewIcon} />
          View report
        </Button>
        <Button
          type="button"
          variant="secondary"
          className="h-9 min-w-0 flex-1 px-3"
        >
          <AppIcon icon={Pdf02Icon} />
          Download PDF
        </Button>
      </footer>
    </article>
  );
}

export function AssessmentsPageContent() {
  const data = getHomeDashboardData();
  const hasAssessment = data?.assessment !== null;
  const assessment = data?.assessment;
  const [mobileQuery, setMobileQuery] = useState("");

  const mobileRows = useMemo(() => {
    const needle = mobileQuery.trim().toLowerCase();
    if (!needle) return ASSESSMENT_ROWS;
    return ASSESSMENT_ROWS.filter((row) =>
      [row.name, row.result, row.date].some((value) =>
        value.toLowerCase().includes(needle),
      ),
    );
  }, [mobileQuery]);

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
              <RecentAssessmentsHeading count={mobileRows.length} />
              <TableSearch
                value={mobileQuery}
                onChange={setMobileQuery}
                placeholder="Search assessments…"
                aria-label="Search assessments"
              />
              <ul className="flex flex-col gap-3">
                {mobileRows.map((row, index) => (
                  <li key={`${row.name}-${row.date}-${index}`}>
                    <AssessmentMobileCard row={row} />
                  </li>
                ))}
              </ul>
              <Button type="button" variant="secondary" className="w-full">
                Load more
              </Button>
            </section>

            <div className="hidden lg:block">
              <RecentAssessmentsTable data={ASSESSMENT_ROWS} />
            </div>
          </div>
        ) : (
          <div
            className={cn(
              dashboardCardClass,
              "flex min-h-95 flex-col items-center justify-center p-6",
            )}
          >
            <div className="flex max-w-dash-search flex-col items-center text-center">
              <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-muted text-primary">
                <HugeiconsIcon
                  icon={AssignmentsIcon}
                  size={EMPTY_ICON_SIZE}
                  strokeWidth={ICON_STROKE}
                  color="currentColor"
                  absoluteStrokeWidth
                />
              </div>
              <h2 className="font-sans text-xl font-semibold leading-7 text-foreground">
                No assessments yet
              </h2>
              <p className="mt-2 text-sm font-normal leading-5 text-muted-foreground">
                Take the Independent Ageing Score (IAS) to establish your
                baseline and unlock personalized care insights.
              </p>
              <Button
                type="button"
                variant="default"
                size="cta"
                className="mt-6 px-6 text-sm font-medium"
              >
                Take Assessment
              </Button>
            </div>
          </div>
        )}
      </DashboardReveal>
    </AppPageFrame>
  );
}
