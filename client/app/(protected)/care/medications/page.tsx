"use client";

import { AppPageFrame } from "@/features/dashboard/components/AppPageFrame";
import { PageHeader } from "@/components/shared/PageHeader";
import { DashboardReveal } from "@/features/dashboard/components/DashboardReveal";
import { DashboardIconButton } from "@/features/dashboard/components/DashboardIconButton";
import { EmptyState } from "@/features/dashboard/components/EmptyState";
import { MedicationCards } from "@/features/medications/components/MedicationCards";
import { MOCK_TODAY_MEDICATIONS } from "@/features/medications/data/medications-data";
import { dashboardCardClass, dashboardPageShellClass } from "@/features/dashboard/data/dashboard-styles";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { HugeiconsIcon } from "@hugeicons/react";
import { EnergyIcon, Medicine02Icon } from "@hugeicons/core-free-icons";
import { ICON_SIZE, ICON_STROKE } from "@/lib/icons";

export default function MedicationsPage() {
  const medications = MOCK_TODAY_MEDICATIONS;
  const hasMedications = medications.length > 0;

  return (
    <AppPageFrame>
      <DashboardReveal className={cn(dashboardPageShellClass)}>
        <div className="flex items-center justify-between gap-4">
          <PageHeader
            title="Today's Medications"
            subtitle="Medication list managed by your care team, you log adherence only."
          />

          <TooltipProvider delayDuration={200}>
            <Tooltip>
              <TooltipTrigger asChild>
                <DashboardIconButton
                  type="button"
                  aria-label="Quick menu"
                  className="shrink-0 text-primary hover:text-ring transition-colors"
                >
                  <HugeiconsIcon icon={EnergyIcon} size={ICON_SIZE} strokeWidth={ICON_STROKE} color="currentColor" absoluteStrokeWidth />
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
    </AppPageFrame>
  );
}
