import { NotificationSnooze01Icon } from "@hugeicons/core-free-icons";
import { typo } from "@/lib/tokens/typography";
import { cn } from "@/lib/utils";
import {
  dashboardCardClass,
  dashboardCardHeaderClass,
  dashboardCardListClass,
  dashboardDividedItemClass,
  dashboardDividedRowClass,
  dashboardPreviewRowClass,
  dashboardRowDividerClass,
} from "../data/dashboard-styles";
import { EmptyState, SectionTitle, ViewAllLink } from "./EmptyState";
import type { ActivityItem } from "../data/home-data";

const RECENT_ACTIVITY_PREVIEW_COUNT = 3;

export function RecentActivityCard({ items }: { items: ActivityItem[] | null }) {
  const previewItems = items?.slice(0, RECENT_ACTIVITY_PREVIEW_COUNT) ?? null;

  return (
    <section className={cn(dashboardCardClass, "flex h-full min-h-0 flex-col p-5")}>
      <div className={dashboardCardHeaderClass}>
        <SectionTitle info="A timeline of medical logs, completed checks, and status updates from you and your care team.">
          Recent Activity
        </SectionTitle>
        <ViewAllLink />
      </div>
      {previewItems && previewItems.length > 0 ? (
        <ul className={dashboardCardListClass}>
          {previewItems.map((item, index) => (
            <li key={item.id} className={dashboardDividedItemClass}>
              {index > 0 ? (
                <div className={dashboardRowDividerClass} aria-hidden />
              ) : null}
              <div
                className={cn(
                  dashboardDividedRowClass,
                  dashboardPreviewRowClass,
                  "-mx-2 flex-col items-start justify-center gap-1",
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
