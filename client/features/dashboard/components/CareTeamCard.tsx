import { UserAdd01Icon } from "@hugeicons/core-free-icons";
import { typo } from "@/lib/tokens/typography";
import { cn } from "@/lib/utils";
import {
  dashboardCardClass,
  dashboardCardHeaderClass,
  dashboardDividedRowClass,
  dashboardRowDividerClass,
  statusBadgeClass,
} from "../data/dashboard-styles";
import { EmptyState, SectionTitle, ViewAllLink } from "./EmptyState";
import type { CareTeamMember } from "../data/home-data";

export function CareTeamCard({ members }: { members: CareTeamMember[] | null }) {
  return (
    <section className={cn(dashboardCardClass, "flex min-h-0 flex-1 flex-col p-5")}>
      <div className={dashboardCardHeaderClass}>
        <SectionTitle info="Your clinicians and family caregivers who help manage appointments, medications, and daily care tasks.">
          Care Team
        </SectionTitle>
        <ViewAllLink href="/care-team" />
      </div>
      {members && members.length > 0 ? (
        <ul className="flex min-h-0 flex-col">
          {members.map((member, index) => (
            <li key={member.id} className="relative">
              {index > 0 ? (
                <div className={dashboardRowDividerClass} aria-hidden />
              ) : null}
              <div
                className={cn(
                  dashboardDividedRowClass,
                  "-mx-2 flex items-center gap-3 px-2 py-3.5",
                )}
              >
                <span className="flex size-12 shrink-0 items-center justify-center rounded-full border border-border bg-[#F2EBF9] text-sm font-semibold text-(--primary-active)">
                  {member.initials}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className={typo.headingS}>{member.name}</p>
                    {member.available ? (
                      <span
                        className={cn(
                          statusBadgeClass,
                          "bg-[#ECFDF5] text-[#047857]",
                        )}
                      >
                        Available
                      </span>
                    ) : null}
                  </div>
                  <p className={typo.bodyS}>{member.role}</p>
                </div>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState
          icon={UserAdd01Icon}
          title="No family caregivers yet"
          body="Invite a family member to help manage appointments, medications, and daily care tasks."
          actionLabel="Invite Caregiver"
          className="min-h-0 flex-1"
        />
      )}
    </section>
  );
}
