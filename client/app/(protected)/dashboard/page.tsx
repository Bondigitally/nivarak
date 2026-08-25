import { DashboardReveal } from "@/features/dashboard/components/DashboardReveal";
import { HomeGreeting } from "@/features/dashboard/components/HomeGreeting";
import { DashboardPageFrame } from "@/features/dashboard/components/HomeTopBar";
import { dashboardPageShellClass } from "@/features/dashboard/data/dashboard-styles";
import { cn } from "@/lib/utils";

/**
 * Chrome-only shell. Insight cards land in dashboard-insights;
 * widget cards land in dashboard-widgets.
 */
export default function DashboardPage() {
  return (
    <DashboardPageFrame notificationCount={0}>
      <DashboardReveal className={cn(dashboardPageShellClass)}>
        <HomeGreeting name="there" subtitle="Your care dashboard" />
      </DashboardReveal>
    </DashboardPageFrame>
  );
}
