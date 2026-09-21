import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react";
import { SpoonAndForkIcon, WalkingIcon } from "@hugeicons/core-free-icons";
import { cn } from "@/lib/utils";
import {
  dashboardCardClass,
  statusBadgeClass,
} from "@/features/dashboard/data/dashboard-styles";
import { SectionTitle } from "@/features/dashboard/components/EmptyState";
import type { CarePlanReferral } from "@/features/care-plan/data/care-plan-data";
import { ICON_SIZE, ICON_STROKE } from "@/lib/icons";

const REFERRAL_ICONS: Record<CarePlanReferral["icon"], IconSvgElement> = {
  walking: WalkingIcon,
  nutrition: SpoonAndForkIcon,
};

const STATUS_STYLES: Record<
  CarePlanReferral["status"],
  { bg: string; text: string }
> = {
  Scheduled: { bg: "bg-background", text: "text-muted-foreground" },
  Pending: { bg: "bg-warning-muted", text: "text-warning" },
};

export function ReferralsCard({ referrals }: { referrals: CarePlanReferral[] }) {
  return (
    <section
      className={cn(
        dashboardCardClass,
        "flex h-full flex-1 flex-col gap-5 self-stretch p-6",
      )}
    >
      <SectionTitle
        info="Specialist and therapy referrals arranged by your care team, with scheduling status for each."
        className="flex-none pr-0 text-foreground"
      >
        Referrals
      </SectionTitle>

      <ul className="flex flex-col gap-3">
        {referrals.map((referral) => {
          const statusStyle = STATUS_STYLES[referral.status];

          return (
            <li
              key={referral.id}
              className="flex items-center justify-between gap-3 rounded-md bg-muted p-4"
            >
              <div className="flex min-w-0 items-center gap-2">
                <span className="inline-flex size-4.75 shrink-0 text-foreground" aria-hidden>
                  <HugeiconsIcon
                    icon={REFERRAL_ICONS[referral.icon]}
                    size={ICON_SIZE}
                    strokeWidth={ICON_STROKE}
                    color="currentColor"
                  absoluteStrokeWidth />
                </span>
                <span className="truncate text-base font-normal leading-6 text-foreground">
                  {referral.label}
                </span>
              </div>
              <span
                className={cn(
                  statusBadgeClass,
                  "shrink-0",
                  statusStyle.bg,
                  statusStyle.text,
                )}
              >
                {referral.status}
              </span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
