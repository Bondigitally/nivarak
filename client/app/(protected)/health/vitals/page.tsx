"use client";

import { DashboardPageFrame } from "@/features/dashboard/components/HomeTopBar";
import { DashboardReveal } from "@/features/dashboard/components/DashboardReveal";
import { dashboardPageShellClass } from "@/features/dashboard/data/dashboard-styles";
import { getHomeDashboardData } from "@/features/dashboard/data/home-data";
import { typo } from "@/lib/tokens/typography";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { HugeiconsIcon } from "@hugeicons/react";
import { Medicine02Icon } from "@hugeicons/core-free-icons";
import { VitalsSummaryCards } from "@/features/vitals/components/VitalsSummaryCards";
import { VitalsTrendCard } from "@/features/vitals/components/VitalsTrendCard";
import { VitalsRecentLog } from "@/features/vitals/components/VitalsRecentLog";

export default function VitalsPage() {
  const data = getHomeDashboardData();
  const notificationCount = data?.notificationCount ?? 3;
  const hasVitals = data?.vitals != null;

  return (
    <DashboardPageFrame notificationCount={notificationCount}>
      <DashboardReveal className={cn(dashboardPageShellClass)}>
        {/* Title and Subtitle */}
        <div className="flex flex-col gap-1">
          <h1 className={typo.headingXxl}>Vitals</h1>
          <p className={typo.bodyL}>
            Track all vitals from your health record and monitor trends over time to stay on top of your wellness goals.
          </p>
        </div>

        {hasVitals && <VitalsSummaryCards />}
        {hasVitals && <VitalsTrendCard />}
        {hasVitals && <VitalsRecentLog />}

        {!hasVitals && (
          /* Empty State */
          <div className="flex min-h-[380px] flex-col items-center justify-center rounded-xl border border-border bg-card p-6">
            <div className="flex max-w-[480px] flex-col items-center text-center">
              <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-sidebar-accent text-primary">
                <HugeiconsIcon icon={Medicine02Icon} size={32} strokeWidth={1.75} color="currentColor" />
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
    </DashboardPageFrame>
  );
}
