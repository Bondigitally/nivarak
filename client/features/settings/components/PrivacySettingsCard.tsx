"use client";

import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowRight01Icon, UserShield01Icon } from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import { dashboardCardClass } from "@/features/dashboard/data/dashboard-styles";
import { typo } from "@/lib/tokens/typography";
import { cn } from "@/lib/utils";
import { SettingsSectionHeader } from "./SettingsSectionHeader";

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

      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between md:gap-6">
        <div className="min-w-0 flex-1 rounded-lg border border-border bg-[#F8F5FA] p-4">
          <div className="min-w-0 space-y-2">
            <p className={cn(typo.button, "font-bold text-[#531575]")}>{title}</p>
            <p className={cn(typo.caption, "text-[#4D4450]")}>{body}</p>
          </div>
        </div>

        <Button
          asChild
          variant="primary-outline"
          className="w-full shrink-0 shadow-[0_1px_2px_rgba(17,24,39,0.04)] md:w-auto [&_svg]:size-4.75"
        >
          <Link href="/care-team">
            Manage linked caregivers
            <HugeiconsIcon
              icon={ArrowRight01Icon}
              size={19}
              strokeWidth={1.75}
              color="currentColor"
              className="size-4.75"
            />
          </Link>
        </Button>
      </div>
    </section>
  );
}
