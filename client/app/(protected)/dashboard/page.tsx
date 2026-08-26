import { DashboardReveal } from "@/features/dashboard/components/DashboardReveal";
import { HomeGreeting } from "@/features/dashboard/components/HomeGreeting";
import { DashboardPageFrame } from "@/features/dashboard/components/HomeTopBar";
import { IasScoreCard } from "@/features/dashboard/components/IasScoreCard";
import { RiskStatusCard } from "@/features/dashboard/components/RiskStatusCard";
import {
  dashboardGridClass,
  dashboardGridHalfClass,
  dashboardGridStackClass,
  dashboardPageShellClass,
} from "@/features/dashboard/data/dashboard-styles";
import { getHomeDashboardData } from "@/features/dashboard/data/home-data";
import { cn } from "@/lib/utils";

/**
 * Insights layer: IAS + risk. Remaining widgets land in dashboard-widgets.
 */
export default function DashboardPage() {
  const data = getHomeDashboardData();

  return (
    <DashboardPageFrame notificationCount={data.notificationCount}>
      <DashboardReveal className={cn(dashboardPageShellClass)}>
        <HomeGreeting name={data.greetingName} subtitle={data.greetingSubtitle} />
        <IasScoreCard assessment={data.assessment} />
        <div className={dashboardGridClass}>
          <div className={cn(dashboardGridHalfClass, dashboardGridStackClass)}>
            <RiskStatusCard risk={data.risk} />
          </div>
        </div>
      </DashboardReveal>
    </DashboardPageFrame>
  );
}
