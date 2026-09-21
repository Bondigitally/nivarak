import type { ReactNode } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  dashboardCardClass,
  dashboardGridClass,
  dashboardGridFullClass,
  dashboardGridHalfClass,
  dashboardGridStackClass,
  dashboardPageShellClass,
  dashboardSearchBarClass,
  dashboardTwoColGridClass,
  vitalsCardMetricsRowClass,
  vitalsSummaryGridClass,
} from "@/lib/tokens/page-shell";
import { cn } from "@/lib/utils";
import { shellHeaderChromeClass } from "@/components/layout/shell-chrome";

function TopBarSkeleton() {
  return (
    <header
      className={cn(
        shellHeaderChromeClass,
        "sticky top-0 z-20 grid w-full grid-cols-[1fr_minmax(0,var(--max-width-dash-search))_1fr] items-center gap-dash-topbar-gap px-dash-pad-x",
      )}
    >
      <div className="justify-self-start">
        <Skeleton className="size-8 rounded-md lg:hidden" />
      </div>
      <div
        className={cn(
          dashboardSearchBarClass,
          "w-full min-w-0 flex-none border-transparent bg-border/50 shadow-none",
        )}
      >
        <Skeleton className="size-4 shrink-0 rounded-full" />
        <Skeleton className="h-4 w-48 max-w-[60%] rounded-full" />
      </div>
      <div className="flex shrink-0 items-center justify-self-end gap-dash-topbar-gap">
        <Skeleton className="hidden h-10 w-40 rounded-full sm:block" />
        <Skeleton className="size-10 rounded-full sm:hidden" />
        <Skeleton className="size-10 rounded-full" />
      </div>
    </header>
  );
}

function TitleSkeleton({
  wide = false,
  withAction = false,
}: {
  wide?: boolean;
  withAction?: boolean;
}) {
  return (
    <div className="flex items-start justify-between gap-3">
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <Skeleton className={cn("h-8 max-w-full", wide ? "w-64" : "w-48")} />
        <Skeleton className={cn("h-5 max-w-full", wide ? "w-full max-w-xl" : "w-72")} />
      </div>
      {withAction ? <Skeleton className="size-10 shrink-0 rounded-full" /> : null}
    </div>
  );
}

function SkeletonCard({
  className,
  rows = 3,
}: {
  className?: string;
  rows?: number;
}) {
  return (
    <div className={cn(dashboardCardClass, "flex flex-col gap-4 p-6", className)}>
      <div className="flex items-start justify-between gap-3">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-5 w-16" />
      </div>
      <div className="flex flex-col gap-3">
        {Array.from({ length: rows }, (_, index) => (
          <Skeleton
            key={index}
            className={cn("h-10 w-full", index === rows - 1 && "w-[80%]")}
          />
        ))}
      </div>
    </div>
  );
}

function ListRowSkeleton() {
  return (
    <div className={cn(dashboardCardClass, "flex items-center gap-4 p-4")}>
      <Skeleton className="size-10 shrink-0 rounded-full" />
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <Skeleton className="h-4 w-40 max-w-full" />
        <Skeleton className="h-3.5 w-28 max-w-full" />
      </div>
      <Skeleton className="h-8 w-20 shrink-0 rounded-full" />
    </div>
  );
}

function PageSkeletonShell({ children }: { children: ReactNode }) {
  return (
    <div className="font-sans" aria-busy="true" aria-live="polite">
      <span className="sr-only">Loading page</span>
      <TopBarSkeleton />
      <div className={cn(dashboardPageShellClass)}>{children}</div>
    </div>
  );
}

/** Home /dashboard */
export function DashboardHomeSkeleton() {
  return (
    <PageSkeletonShell>
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-8 w-64 max-w-full" />
          <Skeleton className="h-5 w-80 max-w-full" />
        </div>
        <Skeleton className="size-10 shrink-0 rounded-full" />
      </div>
      <Skeleton className={cn(dashboardCardClass, "h-40 w-full border-transparent")} />
      <div className={dashboardGridClass}>
        <div className={cn(dashboardGridHalfClass, dashboardGridStackClass)}>
          <SkeletonCard rows={4} />
          <SkeletonCard rows={3} />
        </div>
        <div className={cn(dashboardGridHalfClass, dashboardGridStackClass)}>
          <SkeletonCard rows={2} />
          <SkeletonCard rows={3} />
          <SkeletonCard rows={2} />
        </div>
      </div>
      <SkeletonCard rows={4} />
    </PageSkeletonShell>
  );
}

/** /settings — stacked settings cards, no page title */
export function SettingsPageSkeleton() {
  return (
    <PageSkeletonShell>
      <div className={cn(dashboardCardClass, "flex flex-col gap-6 p-6")}>
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Skeleton className="size-16 shrink-0 rounded-md" />
            <div className="flex flex-col gap-2">
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-4 w-28" />
            </div>
          </div>
          <Skeleton className="h-10 w-28 rounded-full" />
        </div>
        <div className={dashboardTwoColGridClass}>
          {Array.from({ length: 4 }, (_, index) => (
            <div key={index} className="flex flex-col gap-2">
              <Skeleton className="h-3.5 w-24" />
              <Skeleton className="h-11 w-full rounded-md" />
            </div>
          ))}
        </div>
      </div>

      <div className={cn(dashboardCardClass, "flex flex-col gap-4 p-6")}>
        <Skeleton className="h-6 w-40" />
        {Array.from({ length: 4 }, (_, index) => (
          <div key={index} className="flex items-center justify-between gap-4">
            <div className="flex min-w-0 flex-1 flex-col gap-2">
              <Skeleton className="h-4 w-44 max-w-full" />
              <Skeleton className="h-3.5 w-64 max-w-full" />
            </div>
            <Skeleton className="h-6 w-11 shrink-0 rounded-full" />
          </div>
        ))}
      </div>

      <SkeletonCard rows={2} />
      <SkeletonCard rows={3} />
    </PageSkeletonShell>
  );
}

/** /care-team */
export function CareTeamPageSkeleton() {
  return (
    <PageSkeletonShell>
      <TitleSkeleton wide />
      <div className={dashboardGridStackClass}>
        <div className={cn(dashboardCardClass, "flex flex-col gap-4 p-6")}>
          <Skeleton className="h-6 w-40" />
          <div className="flex flex-wrap gap-4">
            {Array.from({ length: 3 }, (_, index) => (
              <div
                key={index}
                className={cn(dashboardCardClass, "flex min-w-[220px] flex-1 flex-col gap-3 p-4")}
              >
                <Skeleton className="aspect-square w-full rounded-md" />
                <Skeleton className="h-5 w-36" />
                <Skeleton className="h-4 w-20 rounded-full" />
                <Skeleton className="h-3.5 w-full" />
                <Skeleton className="h-3.5 w-2/3" />
              </div>
            ))}
          </div>
        </div>
        <div className={cn(dashboardCardClass, "flex flex-col gap-4 p-6")}>
          <Skeleton className="h-6 w-44" />
          <div className={dashboardTwoColGridClass}>
            <ListRowSkeleton />
            <div
              className={cn(
                dashboardCardClass,
                "flex min-h-24 items-center gap-4 border-dashed p-4",
              )}
            >
              <Skeleton className="size-16 shrink-0 rounded-full" />
              <Skeleton className="h-5 w-40" />
            </div>
          </div>
        </div>
      </div>
    </PageSkeletonShell>
  );
}

/** /care/appointments */
export function AppointmentsPageSkeleton() {
  return (
    <PageSkeletonShell>
      <TitleSkeleton />
      <div className={dashboardGridStackClass}>
        <Skeleton className="h-11 w-full max-w-sm rounded-full" />
        <div className="flex flex-col gap-3">
          {Array.from({ length: 4 }, (_, index) => (
            <div
              key={index}
              className={cn(dashboardCardClass, "flex flex-col gap-3 p-5 sm:flex-row sm:items-center")}
            >
              <div className="flex min-w-0 flex-1 flex-col gap-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-5 w-48 max-w-full" />
                <Skeleton className="h-4 w-40 max-w-full" />
              </div>
              <div className="flex items-center gap-2">
                <Skeleton className="h-7 w-24 rounded-full" />
                <Skeleton className="h-7 w-20 rounded-full" />
                <Skeleton className="h-9 w-24 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </PageSkeletonShell>
  );
}

/** /care/medications */
export function MedicationsPageSkeleton() {
  return (
    <PageSkeletonShell>
      <TitleSkeleton wide withAction />
      <div className="flex flex-col gap-3">
        {Array.from({ length: 3 }, (_, index) => (
          <div key={index} className={cn(dashboardCardClass, "flex flex-col gap-4 p-5")}>
            <div className="flex items-start justify-between gap-3">
              <div className="flex flex-col gap-2">
                <Skeleton className="h-5 w-44" />
                <Skeleton className="h-4 w-56 max-w-full" />
              </div>
              <Skeleton className="h-7 w-24 rounded-full" />
            </div>
            <div className="flex flex-wrap gap-2">
              <Skeleton className="h-10 w-28 rounded-full" />
              <Skeleton className="h-10 w-28 rounded-full" />
            </div>
          </div>
        ))}
      </div>
    </PageSkeletonShell>
  );
}

/** /care/plan */
export function CarePlanPageSkeleton() {
  return (
    <PageSkeletonShell>
      <TitleSkeleton wide withAction />
      <div className={dashboardGridClass}>
        <div className={dashboardGridFullClass}>
          <SkeletonCard rows={5} />
        </div>
        <div className={dashboardGridHalfClass}>
          <SkeletonCard rows={3} />
        </div>
        <div className={dashboardGridHalfClass}>
          <SkeletonCard rows={3} />
        </div>
      </div>
    </PageSkeletonShell>
  );
}

/** /care/tasks */
export function TasksPageSkeleton() {
  return (
    <PageSkeletonShell>
      <TitleSkeleton />
      <div className="flex flex-col gap-5">
        <div className={cn(dashboardCardClass, "flex flex-col gap-4 p-5")}>
          <div className="flex items-center justify-between gap-3">
            <Skeleton className="h-5 w-36" />
            <Skeleton className="h-6 w-24 rounded-full" />
          </div>
          <Skeleton className="h-2 w-full rounded-full" />
        </div>

        <div
          className={cn(
            dashboardCardClass,
            "flex min-h-16 items-center justify-between border border-destructive px-4 py-4 shadow-none hover:shadow-none sm:px-5",
          )}
        >
          <Skeleton className="h-5 w-56" />
          <Skeleton className="size-5 shrink-0" />
        </div>

        <div className={cn(dashboardCardClass, "flex flex-col overflow-hidden")}>
          <div className="flex items-center justify-between gap-3 border-b border-divider px-4 py-3.5">
            <Skeleton className="h-5 w-14" />
            <Skeleton className="h-9 w-40 shrink-0 rounded-full" />
          </div>
          {Array.from({ length: 4 }, (_, index) => (
            <div
              key={index}
              className={cn(
                "flex items-center gap-3 px-4 py-3.5",
                index > 0 && "border-t border-divider",
              )}
            >
              <Skeleton className="size-5 shrink-0 rounded-md" />
              <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                <Skeleton className="h-4 w-full max-w-xs" />
                <Skeleton className="h-3 w-32" />
              </div>
              <Skeleton className="h-9 w-16 shrink-0 rounded-full" />
            </div>
          ))}
        </div>

        <div
          className={cn(
            dashboardCardClass,
            "flex min-h-16 items-center justify-between px-4 py-4 sm:px-5",
          )}
        >
          <Skeleton className="h-5 w-36" />
          <Skeleton className="size-5 shrink-0" />
        </div>
      </div>
    </PageSkeletonShell>
  );
}

/** /health/assessments */
export function AssessmentsPageSkeleton() {
  return (
    <PageSkeletonShell>
      <TitleSkeleton wide />
      <Skeleton className={cn(dashboardCardClass, "h-36 w-full border-transparent")} />
      <div className={cn(dashboardCardClass, "flex flex-col gap-4 p-5")}>
        <div className="flex items-center gap-2">
          <Skeleton className="h-7 w-48" />
          <Skeleton className="h-6 w-8 rounded-full" />
        </div>
        <div className="flex flex-col gap-2">
          <Skeleton className="h-11 w-full rounded-md" />
          {Array.from({ length: 5 }, (_, index) => (
            <Skeleton key={index} className="h-12 w-full rounded-md" />
          ))}
        </div>
      </div>
    </PageSkeletonShell>
  );
}

/** /health/records */
export function RecordsPageSkeleton() {
  return (
    <PageSkeletonShell>
      <TitleSkeleton wide />
      <div className="flex min-h-45 w-full flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-primary-disabled bg-card px-5 py-6">
        <Skeleton className="size-12 rounded-full" />
        <Skeleton className="h-5 w-56 max-w-full" />
        <Skeleton className="h-4 w-72 max-w-full" />
        <div className="mt-2 flex gap-2">
          <Skeleton className="h-10 w-32 rounded-full" />
          <Skeleton className="h-10 w-28 rounded-full" />
        </div>
      </div>
      <div className="flex flex-col gap-3">
        <Skeleton className="h-6 w-36" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }, (_, index) => (
            <div key={index} className={cn(dashboardCardClass, "flex flex-col gap-3 p-5")}>
              <Skeleton className="size-12 rounded-md" />
              <Skeleton className="h-5 w-28" />
              <Skeleton className="h-4 w-20" />
            </div>
          ))}
        </div>
      </div>
      <div className={cn(dashboardCardClass, "flex flex-col gap-4 p-5")}>
        <div className="flex items-center gap-2">
          <Skeleton className="h-7 w-40" />
          <Skeleton className="h-6 w-8 rounded-full" />
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <Skeleton className="h-11 w-full flex-1 rounded-full" />
          <Skeleton className="h-11 w-28 rounded-full" />
        </div>
        <Skeleton className="h-11 w-full max-w-md rounded-full" />
        <div className="flex flex-col gap-2">
          {Array.from({ length: 4 }, (_, index) => (
            <Skeleton key={index} className="h-12 w-full rounded-md" />
          ))}
        </div>
      </div>
    </PageSkeletonShell>
  );
}

/** /health/vitals */
export function VitalsPageSkeleton() {
  return (
    <PageSkeletonShell>
      <TitleSkeleton wide />
      <div className={vitalsSummaryGridClass}>
        {Array.from({ length: 5 }, (_, index) => (
          <div
            key={index}
            className={cn(
              "@container flex min-h-55 flex-col p-5",
              dashboardCardClass,
            )}
          >
            <div className="flex min-h-12 items-start justify-between gap-3">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="size-12 shrink-0 rounded-full" />
            </div>
            <div className={vitalsCardMetricsRowClass}>
              <Skeleton className="h-8 w-20 @max-[15.5rem]:h-[30px]" />
              <Skeleton className="h-6 w-16 shrink-0 rounded-full @max-[15.5rem]:mt-1" />
            </div>
            <Skeleton className="mt-1.5 h-3 w-20" />
            <div className="mt-auto flex flex-col gap-1 pt-5">
              <Skeleton className="h-9 w-full rounded-sm" />
              <div className="flex justify-between">
                <Skeleton className="h-2.5 w-8" />
                <Skeleton className="h-2.5 w-8" />
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className={cn(dashboardCardClass, "flex flex-col gap-4 p-6")}>
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-10 w-full max-w-lg rounded-full" />
        <Skeleton className="h-64 w-full rounded-lg" />
      </div>
      <div className={cn(dashboardCardClass, "flex flex-col gap-4 p-6")}>
        <Skeleton className="h-6 w-36" />
        <div className="flex flex-col gap-2">
          <Skeleton className="h-11 w-full rounded-md" />
          {Array.from({ length: 5 }, (_, index) => (
            <Skeleton key={index} className="h-12 w-full rounded-md" />
          ))}
        </div>
      </div>
    </PageSkeletonShell>
  );
}

/** /health/risk — title-only placeholder page */
export function RiskPageSkeleton() {
  return (
    <PageSkeletonShell>
      <TitleSkeleton />
    </PageSkeletonShell>
  );
}
