"use client";

import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { Notification01Icon } from "@hugeicons/core-free-icons";
import { AppTopBar } from "@/components/layout/app-top-bar";
import { useSidebar } from "@/components/layout/sidebar-context";
import { useUserRole } from "@/components/layout/user-role-context";
import { DashboardIconButton } from "@/components/shared/DashboardIconButton";
import { NotificationPanel } from "@/features/alerts/components/NotificationPanel";
import { useNotificationStore } from "@/features/alerts/store/notification-store";
import {
  SearchShortcutHint,
  SpotlightSearch,
} from "@/features/dashboard/components/SpotlightSearch";
import { dashboardHeaderIconButtonClass } from "@/lib/tokens/page-shell";
import { getPageFrameConfig } from "@/lib/auth/page-frame-config";
import { ICON_SIZE, ICON_STROKE } from "@/lib/icons";
import { cn } from "@/lib/utils";

export function AppPageFrame({
  children,
  onAddPatient,
}: {
  children: ReactNode;
  onAddPatient?: () => void;
}) {
  const { role } = useUserRole();
  const frameConfig = getPageFrameConfig(role);
  const { openBookVisit } = useSidebar();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const patientUnread = useNotificationStore((s) => s.unreadCount());
  const coordinatorUnread = useNotificationStore((s) =>
    s.coordinatorUnreadCount(),
  );
  const unreadCount =
    role === "coordinator" || role === "admin"
      ? coordinatorUnread
      : patientUnread;

  useEffect(() => {
    if (!frameConfig.enableSpotlight) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (!(event.metaKey || event.ctrlKey) || event.key.toLowerCase() !== "k")
        return;
      if (event.repeat) return;
      event.preventDefault();
      setOpen((current) => !current);
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [frameConfig.enableSpotlight]);

  useEffect(() => {
    if (open) return;
    const id = window.setTimeout(() => setQuery(""), 0);
    return () => window.clearTimeout(id);
  }, [open]);

  const primaryAction =
    frameConfig.primaryAction.action === "addPatient"
      ? {
          label: frameConfig.primaryAction.label,
          icon: frameConfig.primaryAction.icon,
          onClick: onAddPatient,
        }
      : {
          label: frameConfig.primaryAction.label,
          icon: frameConfig.primaryAction.icon,
          onClick: openBookVisit,
        };

  return (
    <div className="font-sans">
      <AppTopBar
        searchPlaceholder={frameConfig.searchPlaceholder}
        searchAriaLabel={frameConfig.searchAriaLabel}
        onSearchClick={
          frameConfig.enableSpotlight ? () => setOpen(true) : undefined
        }
        searchAriaProps={
          frameConfig.enableSpotlight
            ? {
                "aria-haspopup": "dialog",
                "aria-expanded": open,
                "aria-keyshortcuts": "Meta+K Control+K",
              }
            : undefined
        }
        searchHint={<SearchShortcutHint />}
        primaryAction={primaryAction}
        endSlot={
          <NotificationPanel
            trigger={
              <DashboardIconButton
                type="button"
                aria-label={
                  unreadCount > 0
                    ? `Notifications, ${unreadCount} unread`
                    : "Notifications"
                }
                className={cn(
                  dashboardHeaderIconButtonClass,
                  "active:shadow-[0px_1px_2px_rgba(17,24,39,0.04)]",
                )}
              >
                <span className="relative inline-flex">
                  <HugeiconsIcon
                    icon={Notification01Icon}
                    size={ICON_SIZE}
                    strokeWidth={ICON_STROKE}
                    color="currentColor"
                    absoluteStrokeWidth
                  />
                  {unreadCount > 0 && (
                    <span
                      className="absolute right-0 top-0 size-2 rounded-full bg-destructive ring-2 ring-card"
                      aria-hidden
                    />
                  )}
                </span>
              </DashboardIconButton>
            }
          />
        }
      >
        {frameConfig.enableSpotlight ? (
          <SpotlightSearch
            open={open}
            onOpenChange={setOpen}
            query={query}
            onQueryChange={setQuery}
          />
        ) : null}
      </AppTopBar>
      {children}
    </div>
  );
}
