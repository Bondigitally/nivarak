"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import { Call02Icon } from "@hugeicons/core-free-icons";
import { cn } from "@/lib/utils";
import { typo } from "@/lib/tokens/typography";
import {
  dashboardPageShellClass,
  dashboardCardClass,
  statusBadgeClass,
} from "@/features/dashboard/data/dashboard-styles";
import { DashboardReveal } from "@/features/dashboard/components/DashboardReveal";
import { AppPageFrame } from "@/features/dashboard/components/AppPageFrame";
import { PageHeader } from "@/components/shared/PageHeader";
import { getStaffMembers } from "@/features/staff/data/staff-data";
import type { StaffMember } from "@/lib/domain";
import { staffAvailabilityConfig, staffRoleColor } from "@/lib/tokens/status-badges";
import { BADGE_ICON_SIZE, ICON_STROKE } from "@/lib/icons";

function StaffCard({ member }: { member: StaffMember }) {
  const avail = staffAvailabilityConfig(member.availability);

  return (
    <div className={cn(dashboardCardClass, "flex min-w-0 flex-col gap-4 p-5")}>
      <div className="flex min-w-0 items-start gap-3">
        <div className="relative shrink-0">
          <span className="flex size-11 items-center justify-center rounded-full bg-muted text-sm font-semibold text-primary-active">
            {member.initials}
          </span>
          <span className={cn("absolute -bottom-0.5 -right-0.5 size-3 rounded-full border-2 border-card", avail.dot)} />
        </div>
        <div className="min-w-0 flex-1 overflow-hidden">
          <span className={cn(typo.headingS, "min-w-0 truncate")}>{member.name}</span>
          <div className="mt-1 flex flex-wrap items-center gap-1.5">
            <span className={cn(statusBadgeClass, "shrink-0", staffRoleColor(member.role))}>
              {member.role}
            </span>
            <span className={cn(statusBadgeClass, "shrink-0", avail.cls)}>
              {avail.label}
            </span>
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-1.5 border-t border-divider pt-3">
        <div className="flex min-w-0 justify-between gap-2">
          <span className={cn(typo.caption, "text-tertiary-foreground")}>Specialization</span>
          <span className={cn(typo.bodyS, "font-medium text-foreground")}>{member.specialization}</span>
        </div>
        <div className="flex min-w-0 justify-between gap-2">
          <span className={cn(typo.caption, "text-tertiary-foreground")}>Patients assigned</span>
          <span className={cn(typo.bodyS, "font-medium text-foreground tabular-nums")}>
            {member.patientsAssigned}
          </span>
        </div>
      </div>
      <div className="flex gap-2 border-t border-divider pt-3">
        <a
          href={`tel:${member.phone}`}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-md border border-border bg-card px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-accent hover:text-primary-active"
        >
          <HugeiconsIcon icon={Call02Icon} size={BADGE_ICON_SIZE} strokeWidth={ICON_STROKE} color="currentColor" absoluteStrokeWidth />
          Call
        </a>
        <button
          type="button"
          className="flex flex-1 items-center justify-center gap-1.5 rounded-md bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary-active transition-colors hover:bg-primary/20"
        >
          View Schedule
        </button>
      </div>
    </div>
  );
}

export function StaffPageContent() {
  const staff = getStaffMembers();
  const available = staff.filter((s) => s.availability === "available").length;
  const busy = staff.filter((s) => s.availability === "busy").length;
  const offDuty = staff.filter((s) => s.availability === "off-duty").length;

  return (
    <AppPageFrame>
      <DashboardReveal className={cn(dashboardPageShellClass)}>
        <PageHeader
          title="Staff"
          subtitle={`${staff.length} staff members · ${available} available, ${busy} busy, ${offDuty} off duty.`}
        />

        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Available", count: available, dot: "bg-success" },
            { label: "Busy", count: busy, dot: "bg-warning" },
            { label: "Off Duty", count: offDuty, dot: "bg-muted-foreground/40" },
          ].map(({ label, count, dot }) => (
            <div key={label} className={cn(dashboardCardClass, "flex items-center gap-3 p-4")}>
              <span className={cn("size-3 shrink-0 rounded-full", dot)} />
              <div className="min-w-0">
                <p className={cn(typo.headingL, "tabular-nums")}>{count}</p>
                <p className={cn(typo.caption, "text-muted-foreground")}>{label}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {staff.map((member) => (
            <StaffCard key={member.id} member={member} />
          ))}
        </div>
      </DashboardReveal>
    </AppPageFrame>
  );
}
