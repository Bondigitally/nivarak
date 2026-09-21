"use client";

import Image from "next/image";
import { HugeiconsIcon } from "@hugeicons/react";
import { Add01Icon } from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import {
  dashboardCardClass,
  dashboardTwoColGridClass,
} from "@/features/dashboard/data/dashboard-styles";
import { SectionTitle } from "@/features/dashboard/components/EmptyState";
import { typo } from "@/lib/tokens/typography";
import { cn } from "@/lib/utils";
import type { FamilyCaregiver } from "../data/care-team-data";
import { ICON_SIZE, ICON_STROKE } from "@/lib/icons";

function FamilyCaregiverCard({ caregiver }: { caregiver: FamilyCaregiver }) {
  return (
    <article
      className={cn(
        dashboardCardClass,
        "flex w-full flex-col gap-4 px-4 py-5",
        "sm:min-h-24 sm:flex-row sm:items-center sm:justify-between sm:py-6",
      )}
    >
      <div className="flex min-w-0 items-center gap-4">
        <div className="relative size-16 shrink-0 overflow-hidden rounded-md">
          <Image
            src={caregiver.imageSrc}
            alt=""
            fill
            className="object-cover"
            sizes="64px"
          />
        </div>
        <div className="min-w-0">
          <h3 className={cn(typo.headingS, "truncate text-foreground")}>
            {caregiver.name}
          </h3>
          <p className={cn(typo.bodyS, "text-muted-foreground")}>
            {caregiver.relationship}
          </p>
        </div>
      </div>

      <Button
        type="button"
        variant="primary-outline"
        className="w-full shadow-[0_1px_2px_rgba(17,24,39,0.04)] sm:hidden"
      >
        Manage
      </Button>
      <Button
        type="button"
        variant="link"
        className="hidden shrink-0 text-primary-active no-underline after:hidden hover:no-underline hover:after:opacity-0 focus-visible:after:opacity-0 sm:inline-flex"
      >
        Manage
      </Button>
    </article>
  );
}

function AddFamilyMemberCard({ onInvite }: { onInvite: () => void }) {
  return (
    <div
      className={cn(
        dashboardCardClass,
        "flex w-full flex-col gap-4 border border-dashed border-border p-4 shadow-none hover:shadow-none",
        "sm:min-h-24 sm:flex-row sm:items-center sm:justify-between sm:p-6",
      )}
    >
      <div className="flex min-w-0 items-center gap-4">
        <span className="flex size-16 shrink-0 items-center justify-center rounded-full border-2 border-dashed border-border bg-card text-muted-foreground">
          <HugeiconsIcon
            icon={Add01Icon}
            size={ICON_SIZE}
            strokeWidth={ICON_STROKE}
            color="currentColor"
          absoluteStrokeWidth />
        </span>
        <p className="text-lg font-normal leading-7 text-muted-foreground">
          Add Family Member
        </p>
      </div>

      <Button
        type="button"
        variant="primary-outline"
        className="w-full shadow-[0_1px_2px_rgba(17,24,39,0.04)] sm:w-auto sm:shrink-0"
        onClick={onInvite}
      >
        Invite
      </Button>
    </div>
  );
}

export function FamilyCaregiversSection({
  caregivers,
  onInvite,
}: {
  caregivers: FamilyCaregiver[];
  onInvite: () => void;
}) {
  return (
    <section
      className={cn(
        dashboardCardClass,
        "flex flex-col gap-4 overflow-hidden p-6",
      )}
    >
      <SectionTitle
        info="Family members and friends who help with your care. Invite new caregivers or manage existing ones."
        className="flex-none pr-0 text-foreground"
      >
        Family caregivers
      </SectionTitle>
      <div className={dashboardTwoColGridClass}>
        {caregivers.map((caregiver) => (
          <FamilyCaregiverCard key={caregiver.id} caregiver={caregiver} />
        ))}
        <AddFamilyMemberCard onInvite={onInvite} />
      </div>
    </section>
  );
}
