"use client";

import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { AppPageFrame } from "@/features/dashboard/components/AppPageFrame";
import { DashboardReveal } from "@/features/dashboard/components/DashboardReveal";
import {
  dashboardCardClass,
  dashboardPageShellClass,
} from "@/features/dashboard/data/dashboard-styles";
import { getHomeDashboardData } from "@/features/dashboard/data/home-data";
import { VitalsSummaryCards } from "@/features/vitals/components/VitalsSummaryCards";
import { VitalsTrendCard } from "@/features/vitals/components/VitalsTrendCard";
import { VitalsRecentLog } from "@/features/vitals/components/VitalsRecentLog";
import { HugeiconsIcon } from "@hugeicons/react";
import { Medicine02Icon } from "@hugeicons/core-free-icons";
import { EMPTY_ICON_SIZE, ICON_STROKE } from "@/lib/icons";
import { cn } from "@/lib/utils";

export function VitalsPageContent() {
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
          <div
            className={cn(
              dashboardCardClass,
              "flex min-h-95 flex-col items-center justify-center p-6",
            )}
          >
            <div className="flex max-w-dash-search flex-col items-center text-center">
              <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-sidebar-accent text-primary">
                <HugeiconsIcon
                  icon={Medicine02Icon}
                  size={EMPTY_ICON_SIZE}
                  strokeWidth={ICON_STROKE}
                  color="currentColor"
                  absoluteStrokeWidth
                />
              </div>
              <h2 className="font-sans text-xl font-semibold leading-7 text-foreground">
                No vitals recorded yet
              </h2>
              <p className="mt-2 text-sm font-normal leading-5 text-muted-foreground">
                Record your first vitals reading to start tracking BP, pulse,
                SpO₂, temperature, and more over time.
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
