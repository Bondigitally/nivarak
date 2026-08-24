import { NotificationSnooze01Icon } from "@hugeicons/core-free-icons";
import { typo } from "@/lib/tokens/typography";
import { cn } from "@/lib/utils";
import { dashboardCardClass, dashboardCardHeaderClass, dashboardListItemClass } from "../data/dashboard-styles";
import { EmptyState, SectionTitle, ViewAllLink } from "./EmptyState";
import type { ActivityItem } from "../data/home-data";

export function RecentActivityCard({ items }: { items: ActivityItem[] | null }) {
  return (
    <section className={cn(dashboardCardClass, "flex flex-col p-5")}>
      <div className={dashboardCardHeaderClass}>
        <SectionTitle info="A timeline of medical logs, completed checks, and status updates from you and your care team.">
          Recent Activity
        </SectionTitle>
        <ViewAllLink />
      </div>
      {items && items.length > 0 ? (
        <ul className="flex flex-col">
          {items.map((item) => (
            <li
              key={item.id}
              className={cn(
                dashboardListItemClass,
                "flex flex-col gap-1 border-b border-[rgba(220,226,243,0.3)] py-3 first:pt-0 last:border-b-0 last:pb-0",
              )}
            >
              <p className={typo.headingS}>{item.title}</p>
              <p className={cn(typo.caption, "text-[rgba(77,68,80,0.6)]")}>{item.timestamp}</p>
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState
          icon={NotificationSnooze01Icon}
          title="No recent activity"
          body="A record of your medical logs, completed checks, and status reports is shown up here."
          className="min-h-45"
        />
      )}
    </section>
  );
}
