"use client";

import { useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { Notification01Icon, Search01Icon, CheckCheckIcon } from "@hugeicons/core-free-icons";
import { cn } from "@/lib/utils";
import { typo } from "@/lib/tokens/typography";
import { ICON_SIZE, ICON_STROKE } from "@/lib/icons";
import { radius } from "@/lib/tokens/radius";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { EmptyState } from "@/features/dashboard/components/EmptyState";
import {
  cardTitleClass,
  dashboardCardClass,
  dashboardSearchBarClass,
  dashboardSearchBarIconClass,
} from "@/features/dashboard/data/dashboard-styles";
import {
  MOCK_NOTIFICATIONS,
  NOTIFICATION_TABS,
  filterNotifications,
  groupNotifications,
  type NotificationTabKey,
  type NotificationTimeGroup,
} from "../data/alerts-data";
import { useNotificationStore } from "../store/notification-store";
import {
  NotificationItemCard,
  NOTIFICATION_LIST_CLASS,
  NOTIFICATION_LIST_ITEM_CLASS,
  NOTIFICATION_ROW_DIVIDER_CLASS,
} from "./notification-primitives";

function SearchBar({
  value,
  onChange,
}: {
  value: string;
  onChange: (q: string) => void;
}) {
  return (
    <label
      className={cn(
        dashboardSearchBarClass,
        "h-11 w-full min-w-0 max-w-none flex-1 cursor-text lg:w-70 lg:flex-none",
      )}
    >
      <HugeiconsIcon
        icon={Search01Icon}
        size={ICON_SIZE}
        strokeWidth={ICON_STROKE}
        absoluteStrokeWidth
        color="currentColor"
        className={dashboardSearchBarIconClass}
        aria-hidden
      />
      <input
        type="search"
        placeholder="Search notifications…"
        aria-label="Search notifications"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={cn(
          typo.input,
          "h-full min-w-0 flex-1 bg-transparent outline-none placeholder:text-placeholder [&::-webkit-search-cancel-button]:hidden",
        )}
      />
    </label>
  );
}

function TimeGroup({
  label,
  items,
  onMarkRead,
}: {
  label: string;
  items: ReturnType<typeof groupNotifications>[number][1];
  onMarkRead: (id: string) => void;
}) {
  const { isRead } = useNotificationStore();

  return (
    <section>
      <div className={cn(dashboardCardClass, "overflow-hidden bg-card p-0")}>
        <h2 className={cn(cardTitleClass, "px-5 pt-5 pb-3")}>{label}</h2>
        <ul className={NOTIFICATION_LIST_CLASS}>
          {items.map((item, index) => (
            <li key={item.id} className={NOTIFICATION_LIST_ITEM_CLASS}>
              {index > 0 ? (
                <div
                  className={NOTIFICATION_ROW_DIVIDER_CLASS}
                  aria-hidden
                />
              ) : null}
              <NotificationItemCard
                item={item}
                variant="page"
                isRead={isRead(item.id, item.read)}
                onMarkRead={onMarkRead}
              />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export function AlertsList() {
  const [activeTab, setActiveTab] = useState<NotificationTabKey>("all");
  const [query, setQuery] = useState("");
  const { markRead, markAllRead, unreadCount } = useNotificationStore();

  const unread = unreadCount();
  const filtered = filterNotifications(MOCK_NOTIFICATIONS, activeTab, query);
  const groups = groupNotifications(filtered);
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <SegmentedControl
          value={activeTab}
          onChange={setActiveTab}
          options={NOTIFICATION_TABS}
          ariaLabel="Filter notifications by category"
          layoutId="alertsActiveTab"
        />

        <div className="flex w-full min-w-0 items-center gap-3 lg:w-auto lg:max-w-105 lg:justify-end">
          <SearchBar value={query} onChange={setQuery} />
          {unread > 0 ? (
            <button
              type="button"
              onClick={markAllRead}
              className={cn(
                radius.md,
                "inline-flex h-11 shrink-0 items-center gap-2 px-3 text-sm font-medium text-muted-foreground transition-colors duration-150 hover:bg-accent hover:text-primary",
              )}
            >
              <HugeiconsIcon
                icon={CheckCheckIcon}
                size={ICON_SIZE}
                strokeWidth={ICON_STROKE}
                absoluteStrokeWidth
                color="currentColor"
                aria-hidden
              />
              Mark all read
            </button>
          ) : null}
        </div>
      </div>

      <div className="flex flex-col gap-6">
        {groups.length === 0 ? (
          <div className={cn(dashboardCardClass, "overflow-hidden bg-card p-0")}>
            <EmptyState
              icon={Notification01Icon}
              title={query ? "No notifications match your search" : "You're all caught up"}
              body={
                query
                  ? "Try a different keyword or clear the search."
                  : "New notifications will appear here when vitals, assessments, or tasks need your attention."
              }
              className="min-h-72"
            />
          </div>
        ) : (
          groups.map(([group, items]) => (
            <TimeGroup
              key={group}
              label={
                {
                  today: "Today",
                  yesterday: "Yesterday",
                  earlier: "Earlier This Week",
                }[group as NotificationTimeGroup]
              }
              items={items}
              onMarkRead={markRead}
            />
          ))
        )}
      </div>
    </div>
  );
}
