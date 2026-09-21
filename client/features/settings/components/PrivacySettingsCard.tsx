"use client";

import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowRight01Icon, UserShield01Icon } from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import { dashboardCardClass } from "@/features/dashboard/data/dashboard-styles";
import { typo } from "@/lib/tokens/typography";
import { cn } from "@/lib/utils";
import { SettingsSectionHeader } from "./SettingsSectionHeader";
import { ICON_SIZE, ICON_STROKE } from "@/lib/icons";

export function PrivacySettingsCard({
  title,
  body,
}: {
  title: string;
  body: string;
}) {
  return (
    <section className={cn(dashboardCardClass, "flex flex-col gap-6 p-6")}>
      <SettingsSectionHeader icon={UserShield01Icon} title="Privacy" />

      <div className="flex flex-col gap-4 rounded-md bg-sidebar-accent p-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
        <div className="min-w-0 space-y-2">
          <p className={cn(typo.headingS, "text-primary-active")}>{title}</p>
          <p className={cn(typo.caption, "text-muted-foreground")}>{body}</p>
        </div>

        <Button
          asChild
          variant="primary-outline"
          className="w-full shrink-0 shadow-[0_1px_2px_rgba(17,24,39,0.04)] sm:w-auto [&_svg]:size-4.75"
        >
          <Link href="/care-team">
            Manage linked caregivers
            <HugeiconsIcon
              icon={ArrowRight01Icon}
              size={ICON_SIZE}
              strokeWidth={ICON_STROKE}
              color="currentColor"
              className="size-4.75"
            absoluteStrokeWidth />
          </Link>
        </Button>
      </div>
    </section>
  );
}
