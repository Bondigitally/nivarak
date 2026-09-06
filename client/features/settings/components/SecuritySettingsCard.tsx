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
import { ICON_SIZE, ICON_STROKE } from "@/lib/icons";

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

      <div className="flex w-full items-start gap-4 rounded-md bg-info-muted p-4">
        <p className={cn(typo.bodyM, "text-muted-foreground")}>{notice}</p>
      </div>

      <ul className="flex w-full flex-col gap-3">
        {sessions.map((session) => (
          <li
            key={session.id}
            className="flex flex-col gap-3 rounded-md border border-border bg-card p-4 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="flex min-w-0 items-center gap-3">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-sm bg-sidebar-accent text-primary">
                <HugeiconsIcon
                  icon={LaptopIcon}
                  size={ICON_SIZE}
                  strokeWidth={ICON_STROKE}
                  color="currentColor"
                  className="size-5"
                absoluteStrokeWidth />
              </span>
              <div className="min-w-0">
                <p className={typo.headingS}>Active sessions</p>
                <p className={cn(typo.caption, "text-muted-foreground")}>
                  {session.device} · {session.location}
                  {session.isCurrent ? " · Current session" : ""}
                </p>
              </div>
            </div>
            <Button
              type="button"
              variant="link"
              className="h-11 shrink-0 self-end px-5 text-destructive hover:text-destructive sm:self-auto"
            >
              Log out
            </Button>
          </li>
        ))}
      </ul>

      <Button type="button" variant="destructive-outline">
        <HugeiconsIcon
          icon={Logout01Icon}
          size={ICON_SIZE}
          strokeWidth={ICON_STROKE}
          color="currentColor"
          className="size-5"
        absoluteStrokeWidth />
        Log out all
      </Button>
    </section>
  );
}
