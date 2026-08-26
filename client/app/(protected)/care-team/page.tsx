"use client";

import { DashboardPageFrame } from "@/features/dashboard/components/HomeTopBar";
import { DashboardReveal } from "@/features/dashboard/components/DashboardReveal";
import { dashboardGridStackClass, dashboardPageShellClass } from "@/features/dashboard/data/dashboard-styles";
import { getHomeDashboardData } from "@/features/dashboard/data/home-data";
import { FamilyCaregiversSection } from "@/features/care-team/components/FamilyCaregiversSection";
import { MedicalStaffSection } from "@/features/care-team/components/MedicalStaffSection";
import {
  MOCK_FAMILY_CAREGIVERS,
  MOCK_MEDICAL_STAFF,
} from "@/features/care-team/data/care-team-data";
import { useSidebar } from "@/components/layout/sidebar-context";
import { typo } from "@/lib/tokens/typography";
import { cn } from "@/lib/utils";

export default function CareTeamPage() {
  const data = getHomeDashboardData();
  const notificationCount = data?.notificationCount ?? 3;
  const { openInviteCaregiver } = useSidebar();

  return (
    <DashboardPageFrame notificationCount={notificationCount}>
      <DashboardReveal className={cn(dashboardPageShellClass)}>
        <div className="flex flex-col gap-1">
          <h1 className={typo.headingXxl}>Care Team</h1>
          <p className={typo.bodyL}>
            Review your completed health assessments and monitor your progress over time.
          </p>
        </div>

        <div className={cn(dashboardGridStackClass)}>
          <MedicalStaffSection members={MOCK_MEDICAL_STAFF} />
          <FamilyCaregiversSection
            caregivers={MOCK_FAMILY_CAREGIVERS}
            onInvite={openInviteCaregiver}
          />
        </div>
      </DashboardReveal>
    </DashboardPageFrame>
  );
}
