"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import {
  LaptopIcon,
  Logout01Icon,
  SecurityIcon,
} from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import { dashboardCardClass } from "@/features/dashboard/data/dashboard-styles";
import { typo } from "@/lib/tokens/typography";
import { cn } from "@/lib/utils";
import { SettingsSectionHeader } from "./SettingsSectionHeader";
import type { ActiveSession } from "../data/settings-data";

export function SecuritySettingsCard({
  notice,
  sessions,
}: {
  notice: string;
  sessions: ActiveSession[];
}) {
  return (
    <section
      className={cn(dashboardCardClass, "flex flex-col items-end gap-6 p-6")}
    >
      <SettingsSectionHeader
        icon={SecurityIcon}
        title="Security"
        className="w-full"
      />

      <div className="flex w-full items-start gap-4 rounded-lg bg-[#E7EFF8] p-4">
        <p className={cn(typo.bodyL, "text-muted-foreground")}>{notice}</p>
      </div>

      <ul className="flex w-full flex-col gap-3">
        {sessions.map((session) => (
          <li
            key={session.id}
            className="flex flex-col gap-3 rounded-xl border border-[#E9E0E8] bg-white p-4 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="flex min-w-0 items-center gap-3">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-[#F5EBF4] text-primary">
                <HugeiconsIcon
                  icon={LaptopIcon}
                  size={19}
                  strokeWidth={1.75}
                  color="currentColor"
                  className="size-[19px]"
                />
              </span>
              <div className="min-w-0">
                <p className={typo.headingS}>Active sessions</p>
                <p className={cn(typo.bodyL, "text-[#4D4450]")}>
                  {session.device} · {session.location}
                  {session.isCurrent ? " · Current session" : ""}
                </p>
              </div>
            </div>
            <Button
              type="button"
              variant="link"
              className="h-11 shrink-0 self-end px-5 text-[#BA1A1A] hover:text-[#BA1A1A] sm:self-auto"
            >
              Log out
            </Button>
          </li>
        ))}
      </ul>

      <Button type="button" variant="destructive-outline">
        <HugeiconsIcon
          icon={Logout01Icon}
          size={19}
          strokeWidth={1.75}
          color="currentColor"
          className="size-[19px]"
        />
        Log out all
      </Button>
    </section>
  );
}
