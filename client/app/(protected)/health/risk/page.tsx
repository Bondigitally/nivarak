import { AppPageFrame } from "@/features/dashboard/components/AppPageFrame";
import { PageHeader } from "@/components/shared/PageHeader";
import { DashboardReveal } from "@/features/dashboard/components/DashboardReveal";
import { dashboardPageShellClass } from "@/features/dashboard/data/dashboard-styles";
import { getHomeDashboardData } from "@/features/dashboard/data/home-data";
import { cn } from "@/lib/utils";

export default function RiskStatusPage() {
  const data = getHomeDashboardData();

  return (
    <AppPageFrame>
      <DashboardReveal className={cn(dashboardPageShellClass)}>
        <PageHeader title="Risk Status" subtitle="Placeholder for risk status." />
      </DashboardReveal>
    </AppPageFrame>
  );
}
