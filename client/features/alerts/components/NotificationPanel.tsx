"use client";

import { useMemo, useState, type ReactNode } from "react";
import * as PopoverPrimitive from "@radix-ui/react-popover";
import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Cancel01Icon,
  CheckCheckIcon,
  Notification01Icon,
} from "@hugeicons/core-free-icons";
import { AppIcon } from "@/components/shared/AppIcon";
import { Button } from "@/components/ui/button";
import { dialogCloseButtonClass } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { typo } from "@/lib/tokens/typography";
import { ICON_SIZE, ICON_STROKE } from "@/lib/icons";
import { radius } from "@/lib/tokens/radius";
import { cardShadowClass } from "@/lib/tokens/elevation";
import { EmptyState } from "@/features/dashboard/components/EmptyState";
import { useNotificationStore } from "../store/notification-store";
import {
  MOCK_NOTIFICATIONS,
  type NotificationItem,
} from "../data/alerts-data";
import { SegmentedControl } from "@/components/ui/segmented-control";
import {
  NotificationItemCard,
  NOTIFICATION_LIST_CLASS,
  NOTIFICATION_LIST_ITEM_CLASS,
  NOTIFICATION_ROW_DIVIDER_CLASS,
} from "./notification-primitives";

type PanelFilter = "all" | "unread";

const PANEL_FILTER_OPTIONS = [
  { id: "all" as const, label: "All" },
  { id: "unread" as const, label: "Unread" },
];

/**
 * Merges the static `item.read` flag with runtime `readIds` from the store,
 * then caps the list at 6 items.
 *
 * The 6-item cap is intentional — this popover is a quick-glance preview,
 * not the full inbox. "View all notifications" links to /notifications.
 * Mirrors the dual-model read tracking in `notification-store` (static read
 * flag on item OR marked read at runtime).
 */
function getPanelItems(
  items: NotificationItem[],
  readIds: string[],
  filter: PanelFilter,
): NotificationItem[] {
  const withReadState = items.map((item) => ({
    ...item,
    read: item.read || readIds.includes(item.id),
  }));

  const filtered =
    filter === "unread"
      ? withReadState.filter((item) => !item.read)
      : withReadState;

  return filtered.slice(0, 6);
}

function PanelContent({ onClose }: { onClose: () => void }) {
  const { readIds, markRead, markAllRead, unreadCount } = useNotificationStore();
  const [filter, setFilter] = useState<PanelFilter>("all");
  const count = unreadCount();

  const items = useMemo(
    () => getPanelItems(MOCK_NOTIFICATIONS, readIds, filter),
    [readIds, filter],
  );

  return (
    <div className="flex flex-col">
      <div className="flex items-center justify-between gap-3 px-5 py-4">
        <h2 className={cn(typo.headingS, "min-w-0")}>Notifications</h2>

        <div className="flex shrink-0 items-center gap-2">
          <SegmentedControl
            value={filter}
            onChange={setFilter}
            options={PANEL_FILTER_OPTIONS}
            ariaLabel="Filter notifications"
            surface="card"
            layoutId="notificationPanelFilter"
            className="shrink-0"
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label="Close notifications"
            onClick={onClose}
            className={dialogCloseButtonClass}
          >
            <AppIcon icon={Cancel01Icon} />
          </Button>
        </div>
      </div>

      <div className="max-h-[min(28rem,calc(100dvh-14rem))] overflow-y-auto border-t border-divider">
        {items.length === 0 ? (
          <EmptyState
            icon={Notification01Icon}
            title={filter === "unread" ? "No unread notifications" : "All caught up"}
            body={
              filter === "unread"
                ? "You're up to date. Switch to All to see earlier notifications."
                : "New vitals, assessments, and task updates will appear here."
            }
            className="min-h-56 py-8"
          />
        ) : (
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
                  variant="panel"
                  isRead={item.read}
                  onMarkRead={markRead}
                  onActionClick={onClose}
                />
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="flex items-center gap-2 border-t border-divider px-5 py-3">
        {count > 0 ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={markAllRead}
            className="shrink-0 text-muted-foreground hover:text-primary"
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
          </Button>
        ) : null}

        <Button
          asChild
          variant="ghost"
          size="sm"
          className={cn(
            "text-muted-foreground hover:bg-transparent hover:text-primary",
            count > 0 ? "ml-auto" : "w-full justify-center",
          )}
        >
          <Link href="/notifications" onClick={onClose}>
            View all notifications
          </Link>
        </Button>
      </div>
    </div>
  );
}

export function NotificationPanel({ trigger }: { trigger: ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <PopoverPrimitive.Root open={open} onOpenChange={setOpen}>
      <PopoverPrimitive.Trigger asChild>{trigger}</PopoverPrimitive.Trigger>
      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Content
          align="end"
          sideOffset={10}
          collisionPadding={16}
          className={cn(
            radius.xl,
            cardShadowClass,
            "z-50 w-[min(30rem,calc(100vw-2rem))] overflow-hidden border border-border bg-card p-0",
            "data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95",
            "data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95",
            "data-[side=bottom]:slide-in-from-top-2",
          )}
        >
          <PanelContent onClose={() => setOpen(false)} />
        </PopoverPrimitive.Content>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  );
}
