"use client";

/**
 * Coordinator-only page — displays the lead pipeline (prospective patients).
 * All leads are visible to coordinators; clinical staff do not see this route.
 * Status filter chips act as quick-select toggles (click again to deselect).
 */

import { useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { Target02Icon, Search01Icon } from "@hugeicons/core-free-icons";
import { cn } from "@/lib/utils";
import { typo } from "@/lib/tokens/typography";
import { cardShadowClass, cardShadowHoverClass } from "@/lib/tokens/elevation";
import {
  dashboardPageShellClass,
  dashboardCardClass,
  statusBadgeClass,
} from "@/features/dashboard/data/dashboard-styles";
import { EmptyState } from "@/features/dashboard/components/EmptyState";
import { DashboardReveal } from "@/features/dashboard/components/DashboardReveal";
import { AppPageFrame } from "@/features/dashboard/components/AppPageFrame";
import { PageHeader } from "@/components/shared/PageHeader";
import { leadStatusConfig } from "@/lib/tokens/status-badges";
import { getLeads } from "@/features/leads/data/leads-data";
import type { Lead, LeadStatus } from "@/lib/domain";
import { BADGE_ICON_SIZE, ICON_STROKE } from "@/lib/icons";

const STATUS_ORDER: LeadStatus[] = [
  "new",
  "contacted",
  "assessing",
  "enrolled",
  "declined",
];

function LeadCard({ lead }: { lead: Lead }) {
  const sts = leadStatusConfig(lead.status);

  return (
    <div className={cn(dashboardCardClass, "flex min-w-0 flex-col gap-3 p-4")}>
      <div className="flex min-w-0 items-start gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-semibold text-primary-active">
          {lead.initials}
        </span>
        <div className="min-w-0 flex-1 overflow-hidden">
          <div className="flex min-w-0 items-center gap-2">
            <span className={cn(typo.headingS, "min-w-0 truncate")}>{lead.name}</span>
            <span className={cn(statusBadgeClass, "shrink-0", sts.class)}>{sts.label}</span>
          </div>
          <p className={cn(typo.bodyS, "mt-0.5")}>{lead.age}y</p>
        </div>
      </div>
      <div className="flex flex-col gap-1 border-t border-divider pt-3 text-sm">
        <div className="flex min-w-0 gap-2">
          <span className={cn(typo.caption, "w-24 shrink-0 text-tertiary-foreground")}>Referral from</span>
          <span className={cn(typo.bodyS, "min-w-0 truncate font-medium text-foreground")}>{lead.referralSource}</span>
        </div>
        <div className="flex min-w-0 gap-2">
          <span className={cn(typo.caption, "w-24 shrink-0 text-tertiary-foreground")}>Received</span>
          <span className={cn(typo.bodyS, "min-w-0 truncate text-foreground")}>{lead.dateReceived}</span>
        </div>
        <div className="flex min-w-0 gap-2">
          <span className={cn(typo.caption, "w-24 shrink-0 text-tertiary-foreground")}>Notes</span>
          <span className={cn(typo.bodyS, "min-w-0 line-clamp-2 text-muted-foreground")}>{lead.notes}</span>
        </div>
      </div>
      <div className="flex gap-2 border-t border-divider pt-3">
        <button
          type="button"
          className="flex-1 rounded-md border border-border bg-card px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-accent hover:text-ring"
        >
          View Details
        </button>
        {lead.status !== "enrolled" && lead.status !== "declined" && (
          <button
            type="button"
            className="flex-1 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground transition-opacity hover:opacity-90"
          >
            {lead.status === "new" ? "Contact" : lead.status === "contacted" ? "Assess" : "Enroll"}
          </button>
        )}
      </div>
    </div>
  );
}

export function LeadsPageContent() {
  const leads = getLeads();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<LeadStatus | "all">("all");

  const filtered = leads.filter((l) => {
    const matchSearch =
      search === "" ||
      l.name.toLowerCase().includes(search.toLowerCase()) ||
      l.referralSource.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || l.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const counts = STATUS_ORDER.reduce(
    (acc, s) => ({ ...acc, [s]: leads.filter((l) => l.status === s).length }),
    {} as Record<LeadStatus, number>,
  );

  return (
    <AppPageFrame>
      <DashboardReveal className={cn(dashboardPageShellClass)}>
        <PageHeader
          title="Leads"
          subtitle="Track and manage prospective patients through your enrolment pipeline."
        />

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
          {STATUS_ORDER.map((status) => {
            const sts = leadStatusConfig(status);
            return (
              <button
                key={status}
                type="button"
                onClick={() => setStatusFilter(statusFilter === status ? "all" : status)}
                className={cn(
                  "flex flex-col items-center gap-1 rounded-xl bg-card p-3 transition-shadow",
                  cardShadowClass,
                  statusFilter === status
                    ? "ring-2 ring-primary ring-offset-1"
                    : cardShadowHoverClass,
                )}
              >
                <span className={cn(typo.headingXl, "tabular-nums")}>{counts[status]}</span>
                <span className={cn(statusBadgeClass, sts.class)}>{sts.label}</span>
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-2 overflow-hidden rounded-full border border-border bg-card py-1 pl-4 pr-2 shadow-[0px_1px_2px_rgba(17,24,39,0.04)] transition-[border-color] hover:border-foreground/12 focus-within:border-border-focus/80">
          <HugeiconsIcon
            icon={Search01Icon}
            size={BADGE_ICON_SIZE}
            strokeWidth={ICON_STROKE}
            color="currentColor"
            className="shrink-0 text-muted-foreground"
            absoluteStrokeWidth
          />
          <input
            type="text"
            placeholder="Search by name or referral source…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={cn(
              typo.bodyM,
              "min-w-0 flex-1 bg-transparent text-foreground outline-none placeholder:text-placeholder",
            )}
          />
        </div>

        {filtered.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {filtered.map((lead) => (
              <LeadCard key={lead.id} lead={lead} />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={Target02Icon}
            title="No leads found"
            body="Adjust your search or filter to find leads in the pipeline."
          />
        )}
      </DashboardReveal>
    </AppPageFrame>
  );
}
