import { NotificationSnooze01Icon } from "@hugeicons/core-free-icons";
import { typo } from "@/lib/tokens/typography";
import { cn } from "@/lib/utils";
import {
  dashboardCardClass,
  dashboardCardHeaderClass,
  dashboardDividedItemClass,
  dashboardDividedRowClass,
  dashboardRowDividerClass,
} from "../data/dashboard-styles";
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
        <ul className="flex min-w-0 flex-col">
          {items.map((item, index) => (
            <li key={item.id} className={dashboardDividedItemClass}>
              {index > 0 ? (
                <div className={dashboardRowDividerClass} aria-hidden />
              ) : null}
              <div
                className={cn(
                  dashboardDividedRowClass,
                  "-mx-2 flex flex-col gap-1 px-2 py-3.5",
                )}
              >
                <p className={typo.headingS}>{item.title}</p>
                <p className={cn(typo.caption, "text-tertiary-foreground/60")}>
                  {item.timestamp}
                </p>
              </div>
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
