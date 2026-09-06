"use client";

import { Notification01Icon } from "@hugeicons/core-free-icons";
import { dashboardCardClass } from "@/features/dashboard/data/dashboard-styles";
import { typo } from "@/lib/tokens/typography";
import { cn } from "@/lib/utils";
import { SettingsSectionHeader } from "./SettingsSectionHeader";
import { ToggleSwitch } from "@/components/ui/toggle-switch";
import type { NotificationPreference } from "../data/settings-data";

export function NotificationsSettingsCard({
  preferences,
  onToggle,
}: {
  preferences: NotificationPreference[];
  onToggle: (id: string, enabled: boolean) => void;
}) {
  return (
    <section className={cn(dashboardCardClass, "flex flex-col gap-6 p-6")}>
      <SettingsSectionHeader
        icon={Notification01Icon}
        title="Notifications"
      />

      <ul className="flex flex-col gap-4">
        {preferences.map((item, index) => {
          const titleId = `notif-title-${item.id}`;
          const switchId = `notif-switch-${item.id}`;
          const isLast = index === preferences.length - 1;

          return (
            <li
              key={item.id}
              className={cn(
                "flex items-center justify-between gap-4 py-2",
                !isLast && "border-b border-border/30",
              )}
            >
              <div className="min-w-0 flex-1">
                <p id={titleId} className={typo.headingS}>
                  {item.title}
                </p>
                <p className={cn(typo.caption, "text-muted-foreground")}>{item.description}</p>
              </div>
              <ToggleSwitch
                id={switchId}
                labelledBy={titleId}
                checked={item.enabled}
                onCheckedChange={(next) => onToggle(item.id, next)}
              />
            </li>
          );
        })}
      </ul>
    </section>
  );
}
