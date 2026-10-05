"use client";

import { AppPageFrame } from "@/features/dashboard/components/AppPageFrame";
import { PageHeader } from "@/components/shared/PageHeader";
import { DashboardReveal } from "@/features/dashboard/components/DashboardReveal";
import { dashboardPageShellClass } from "@/features/dashboard/data/dashboard-styles";
import { getHomeDashboardData } from "@/features/dashboard/data/home-data";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { HugeiconsIcon } from "@hugeicons/react";
import { Medicine02Icon } from "@hugeicons/core-free-icons";
import { VitalsSummaryCards } from "@/features/vitals/components/VitalsSummaryCards";
import { VitalsTrendCard } from "@/features/vitals/components/VitalsTrendCard";
import { VitalsRecentLog } from "@/features/vitals/components/VitalsRecentLog";
import { EMPTY_ICON_SIZE, ICON_STROKE } from "@/lib/icons";

export default function VitalsPage() {
  const data = getHomeDashboardData();
  const hasVitals = data?.vitals != null;

  return (
    <AppPageFrame>
      <DashboardReveal className={cn(dashboardPageShellClass)}>
        <PageHeader
          title="Vitals"
          subtitle="Track all vitals from your health record and monitor trends over time to stay on top of your wellness goals."
        />

        {hasVitals && <VitalsSummaryCards />}
        {hasVitals && <VitalsTrendCard />}
        {hasVitals && <VitalsRecentLog />}

        {!hasVitals && (
          /* Empty State */
          <div className="flex min-h-95 flex-col items-center justify-center rounded-lg border border-border bg-card p-6">
            <div className="flex max-w-dash-search flex-col items-center text-center">
              <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-sidebar-accent text-primary">
                <HugeiconsIcon icon={Medicine02Icon} size={EMPTY_ICON_SIZE} strokeWidth={ICON_STROKE} color="currentColor" absoluteStrokeWidth />
              </div>
              <h2 className="font-sans text-xl font-semibold leading-7 text-foreground">
                No vitals recorded yet
              </h2>
              <p className="mt-2 text-sm font-normal leading-5 text-muted-foreground">
                Record your first vitals reading to start tracking BP, pulse, SpO₂, temperature, and more over time.
              </p>
              <Button
                type="button"
                variant="default"
                size="cta"
                className="mt-6 px-6 text-sm font-medium"
              >
                Record Vitals
              </Button>
            </div>
          </div>
        )}
      </DashboardReveal>
    </AppPageFrame>
  );
}
