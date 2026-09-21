"use client";

import Link from "next/link";
import { PageHeader } from "@/components/shared/PageHeader";
import { DashboardIconButton } from "@/components/shared/DashboardIconButton";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { AppPageFrame } from "@/features/dashboard/components/AppPageFrame";
import { DashboardReveal } from "@/features/dashboard/components/DashboardReveal";
import {
  dashboardCardClass,
  dashboardGridClass,
  dashboardGridFullClass,
  dashboardGridHalfClass,
  dashboardPageShellClass,
} from "@/features/dashboard/data/dashboard-styles";
import { ActionPlanCard } from "@/features/care-plan/components/ActionPlanCard";
import { CallCareTeamCard } from "@/features/care-plan/components/CallCareTeamCard";
import { ReferralsCard } from "@/features/care-plan/components/ReferralsCard";
import { getCarePlanSnapshot } from "@/features/care-plan/data/care-plan-data";
import { HugeiconsIcon } from "@hugeicons/react";
import { ClipboardListIcon, EnergyIcon } from "@hugeicons/core-free-icons";
import { EMPTY_ICON_SIZE, ICON_SIZE, ICON_STROKE } from "@/lib/icons";
import { cn } from "@/lib/utils";

export function CarePlanPageContent() {
  const carePlan = getCarePlanSnapshot();

  return (
    <AppPageFrame>
      <DashboardReveal className={cn(dashboardPageShellClass)}>
        <div className="flex items-center justify-between gap-3">
          <PageHeader
            title="Care Plan"
            subtitle="Review your completed health assessments and monitor your progress over time."
          />
          <TooltipProvider delayDuration={200}>
            <Tooltip>
              <TooltipTrigger asChild>
                <DashboardIconButton
                  type="button"
                  aria-label="Quick menu"
                  className="shrink-0 text-primary hover:text-ring transition-colors"
                >
                  <HugeiconsIcon
                    icon={EnergyIcon}
                    size={ICON_SIZE}
                    strokeWidth={ICON_STROKE}
                    color="currentColor"
                    absoluteStrokeWidth
                  />
                </DashboardIconButton>
              </TooltipTrigger>
              <TooltipContent side="bottom">Quick menu</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        {carePlan ? (
          <div className={dashboardGridClass}>
            <div className={dashboardGridFullClass}>
              <ActionPlanCard actions={carePlan.actions} />
            </div>
            <div className={dashboardGridHalfClass}>
              <ReferralsCard referrals={carePlan.referrals} />
            </div>
            <div className={dashboardGridHalfClass}>
              <CallCareTeamCard triggers={carePlan.callTriggers} />
            </div>
          </div>
        ) : (
          <div
            className={cn(
              dashboardCardClass,
              "flex min-h-95 flex-col items-center justify-center p-6",
            )}
          >
            <div className="flex max-w-105 flex-col items-center text-center">
              <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-muted text-primary">
                <HugeiconsIcon
                  icon={ClipboardListIcon}
                  size={EMPTY_ICON_SIZE}
                  strokeWidth={ICON_STROKE}
                  color="currentColor"
                  absoluteStrokeWidth
                />
              </div>
              <h2 className="font-sans text-xl font-semibold leading-7 text-foreground">
                No care plan yet
              </h2>
              <p className="mt-2 text-sm font-normal leading-5 text-muted-foreground">
                Once assessments are complete, your personalized care plan,
                referrals, and care guidance will show up here.
              </p>
              <Button
                type="button"
                variant="default"
                size="default"
                className="mt-6 px-6 text-sm font-medium"
                asChild
              >
                <Link href="/health/assessments">View Assessments</Link>
              </Button>
            </div>
          </div>
        )}
      </DashboardReveal>
    </AppPageFrame>
  );
}
