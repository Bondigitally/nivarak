import { DashboardPageFrame } from "@/features/dashboard/components/HomeTopBar";
import { DashboardReveal } from "@/features/dashboard/components/DashboardReveal";
import { dashboardPageShellClass } from "@/features/dashboard/data/dashboard-styles";
import { getHomeDashboardData } from "@/features/dashboard/data/home-data";
import { typo } from "@/lib/tokens/typography";
import { cn } from "@/lib/utils";

export default function RiskStatusPage() {
  const data = getHomeDashboardData();

  return (
    <DashboardPageFrame notificationCount={data.notificationCount}>
      <DashboardReveal className={cn(dashboardPageShellClass)}>
        <div className="flex flex-col gap-1">
          <h1 className={typo.headingXxl}>Risk Status</h1>
          <p className={typo.bodyL}>Placeholder for risk status.</p>
        </div>
      </DashboardReveal>
    </DashboardPageFrame>
  );
}
