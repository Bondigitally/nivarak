"use client";

import { DashboardPageFrame } from "@/features/dashboard/components/HomeTopBar";
import { DashboardReveal } from "@/features/dashboard/components/DashboardReveal";
import { DashboardIconButton } from "@/features/dashboard/components/DashboardIconButton";
import { EmptyState } from "@/features/dashboard/components/EmptyState";
import { MedicationCards } from "@/features/medications/components/MedicationCards";
import { MOCK_TODAY_MEDICATIONS } from "@/features/medications/data/medications-data";
import { dashboardCardClass, dashboardPageShellClass } from "@/features/dashboard/data/dashboard-styles";
import { getHomeDashboardData } from "@/features/dashboard/data/home-data";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { typo } from "@/lib/tokens/typography";
import { cn } from "@/lib/utils";
import { HugeiconsIcon } from "@hugeicons/react";
import { EnergyIcon, Medicine02Icon } from "@hugeicons/core-free-icons";

export default function MedicationsPage() {
  const data = getHomeDashboardData();
  const notificationCount = data?.notificationCount ?? 3;
  const medications = MOCK_TODAY_MEDICATIONS;
  const hasMedications = medications.length > 0;

  return (
    <DashboardPageFrame notificationCount={notificationCount}>
      <DashboardReveal className={cn(dashboardPageShellClass)}>
        <div className="flex items-center justify-between gap-4">
          <div className="flex min-w-0 flex-col gap-1">
            <h1 className={typo.headingXxl}>Today&apos;s Medications</h1>
            <p className={typo.bodyL}>
              Medication list managed by your care team, you log adherence only.
            </p>
          </div>

          <TooltipProvider delayDuration={200}>
            <Tooltip>
              <TooltipTrigger asChild>
                <DashboardIconButton
                  type="button"
                  aria-label="Quick menu"
                  className="shrink-0 text-primary"
                >
                  <HugeiconsIcon icon={EnergyIcon} size={19} strokeWidth={1.5} color="currentColor" absoluteStrokeWidth />
                </DashboardIconButton>
              </TooltipTrigger>
              <TooltipContent side="bottom">Quick menu</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        {hasMedications ? (
          <MedicationCards medications={medications} />
        ) : (
          <div className={cn(dashboardCardClass, "flex min-h-95 flex-col")}>
            <EmptyState
              icon={Medicine02Icon}
              title="No medications on file"
              body="Medications prescribed by your care team will appear here so you can mark doses as taken or skipped."
            />
          </div>
        )}
      </DashboardReveal>
    </DashboardPageFrame>
  );
}
