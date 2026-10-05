import Image from "next/image";
import { UserAdd01Icon } from "@hugeicons/core-free-icons";
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
  statusBadgeClass,
} from "../data/dashboard-styles";
import { EmptyState, SectionTitle, ViewAllLink } from "./EmptyState";
import type { CareTeamMember } from "../data/home-data";

function CareTeamAvatar({ member }: { member: CareTeamMember }) {
  return (
    <span className="relative flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-full border border-border bg-muted text-xs font-semibold text-muted-foreground">
      {member.imageSrc ? (
        <Image
          src={member.imageSrc}
          alt=""
          fill
          className="object-cover object-center"
          sizes="36px"
        />
      ) : (
        member.initials
      )}
    </span>
  );
}

export function CareTeamCard({ members }: { members: CareTeamMember[] | null }) {
  return (
    <section className={cn(dashboardCardClass, "flex h-full min-h-0 flex-col p-5")}>
      <div className={dashboardCardHeaderClass}>
        <SectionTitle info="Your clinicians and family caregivers who help manage appointments, medications, and daily care tasks.">
          Care Team
        </SectionTitle>
        <ViewAllLink href="/care-team" />
      </div>
      {members && members.length > 0 ? (
        <ul className={dashboardCardListClass}>
          {members.map((member, index) => (
            <li key={member.id} className={dashboardDividedItemClass}>
              {index > 0 ? (
                <div className={dashboardRowDividerClass} aria-hidden />
              ) : null}
              <div
                className={cn(
                  dashboardDividedRowClass,
                  dashboardPreviewRowClass,
                  "-mx-2",
                )}
              >
                <CareTeamAvatar member={member} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className={cn(typo.headingS, "truncate")}>{member.name}</p>
                    {member.available ? (
                      <span
                        className={cn(
                          statusBadgeClass,
                          "shrink-0 bg-success-muted text-success",
                        )}
                      >
                        Available
                      </span>
                    ) : null}
                  </div>
                  <p className={cn(typo.bodyS, "truncate")}>{member.role}</p>
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
          className="min-h-0"
        />
      )}
    </section>
  );
}
