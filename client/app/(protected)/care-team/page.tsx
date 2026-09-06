"use client";

import { AppPageFrame } from "@/components/layout/app-page-frame";
import { PageHeader } from "@/components/shared/PageHeader";
import { DashboardReveal } from "@/features/dashboard/components/DashboardReveal";
import { dashboardGridStackClass, dashboardPageShellClass } from "@/features/dashboard/data/dashboard-styles";
import { FamilyCaregiversSection } from "@/features/care-team/components/FamilyCaregiversSection";
import { MedicalStaffSection } from "@/features/care-team/components/MedicalStaffSection";
import {
  MOCK_FAMILY_CAREGIVERS,
  MOCK_MEDICAL_STAFF,
} from "@/features/care-team/data/care-team-data";
import { useSidebar } from "@/components/layout/sidebar-context";
import { cn } from "@/lib/utils";

export default function CareTeamPage() {
  const { openInviteCaregiver } = useSidebar();

  return (
    <AppPageFrame>
      <DashboardReveal className={cn(dashboardPageShellClass)}>
        <PageHeader
          title="Care Team"
          subtitle="Review your completed health assessments and monitor your progress over time."
        />

        <div className={cn(dashboardGridStackClass)}>
          <MedicalStaffSection members={MOCK_MEDICAL_STAFF} />
          <FamilyCaregiversSection
            caregivers={MOCK_FAMILY_CAREGIVERS}
            onInvite={openInviteCaregiver}
          />
        </div>
      </DashboardReveal>
    </AppPageFrame>
  );
}
