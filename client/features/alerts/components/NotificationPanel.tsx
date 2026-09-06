"use client";

import { useState, type ReactNode } from "react";
import * as PopoverPrimitive from "@radix-ui/react-popover";
import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Cancel01Icon,
  CheckCheckIcon,
  Notification01Icon,
} from "@hugeicons/core-free-icons";
import { cn } from "@/lib/utils";
import { typo } from "@/lib/tokens/typography";
import { ICON_SIZE, ICON_STROKE } from "@/lib/icons";
import { radius } from "@/lib/tokens/radius";
import { EmptyState } from "@/features/dashboard/components/EmptyState";
import { useNotificationStore } from "../store/notification-store";
import {
  MOCK_NOTIFICATIONS,
  type NotificationItem,
} from "../data/alerts-data";
import {
  NotificationCategoryBadge,
  NotificationIconBubble,
  NotificationTimeColumn,
  NOTIFICATION_ROW_INNER_CLASS,
  NOTIFICATION_ROW_OUTER_CLASS,
  NOTIFICATION_ACTION_BUTTON_CLASS,
  READ_ROW_CLASS,
  UNREAD_ROW_CLASS,
} from "./notification-primitives";

function getPreviewItems(
  items: NotificationItem[],
  readIds: string[],
): { unread: NotificationItem[]; read: NotificationItem[] } {
  const unread = items.filter((n) => !n.read && !readIds.includes(n.id));
  const read = items.filter((n) => n.read || readIds.includes(n.id));
  return {
    unread: unread.slice(0, 5),
    read: read.slice(0, Math.max(0, 5 - unread.length)),
  };
}

function PanelItem({
  item,
  isRead,
  onMarkRead,
  onClose,
}: {
  item: NotificationItem;
  isRead: boolean;
  onMarkRead: (id: string) => void;
  onClose: () => void;
}) {
  const primaryAction = item.actions[0];

  return (
    <div className={cn(NOTIFICATION_ROW_OUTER_CLASS, "px-3")}>
      <div
        role="button"
        tabIndex={0}
        onClick={() => {
          if (!isRead) onMarkRead(item.id);
        }}
        onKeyDown={(event) => {
          if (event.key !== "Enter" && event.key !== " ") return;
          event.preventDefault();
          if (!isRead) onMarkRead(item.id);
        }}
        className={cn(
          NOTIFICATION_ROW_INNER_CLASS,
          "cursor-pointer transition-colors duration-150 hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset",
          isRead ? READ_ROW_CLASS : UNREAD_ROW_CLASS,
        )}
      >
        <NotificationIconBubble item={item} size="sm" />

        <span className="flex min-w-0 flex-1 flex-col gap-1">
          <span className="flex min-w-0 items-start justify-between gap-2">
            <span className="flex min-w-0 flex-1 flex-wrap items-center gap-1.5">
              <span
                className={cn(
                  "min-w-0 text-sm leading-5 text-foreground",
                  isRead ? "font-normal" : "font-semibold",
                )}
              >
                {item.title}
              </span>
              <NotificationCategoryBadge category={item.category} />
            </span>
            <NotificationTimeColumn time={item.time} isRead={isRead} />
          </span>

        <p
          className={cn(
            "line-clamp-2 text-xs leading-4",
            isRead ? "text-muted-foreground/80" : "text-muted-foreground",
          )}
        >
          {item.body}
        </p>

        {primaryAction ? (
          <Link
            href={primaryAction.href}
            onClick={(event) => {
              event.stopPropagation();
              onClose();
            }}
            className={cn(NOTIFICATION_ACTION_BUTTON_CLASS, "mt-1 w-fit")}
          >
            {primaryAction.label}
          </Link>
        ) : null}
        </span>
      </div>
    </div>
  );
}

function PanelSection({
  label,
  items,
  readIds,
  onMarkRead,
  onClose,
}: {
  label?: string;
  items: NotificationItem[];
  readIds: string[];
  onMarkRead: (id: string) => void;
  onClose: () => void;
}) {
  if (items.length === 0) return null;

  return (
    <div className="flex flex-col">
      {label ? (
        <p className="px-4 pt-3 pb-1 text-[11px] font-semibold tracking-[0.08em] text-muted-foreground uppercase">
          {label}
        </p>
      ) : null}
      <div className="flex flex-col py-1">
        {items.map((item) => (
          <PanelItem
            key={item.id}
            item={item}
            isRead={item.read || readIds.includes(item.id)}
            onMarkRead={onMarkRead}
            onClose={onClose}
          />
        ))}
      </div>
    </div>
  );
}

function PanelContent({ onClose }: { onClose: () => void }) {
  const { readIds, markRead, markAllRead, unreadCount } = useNotificationStore();
  const count = unreadCount();
  const { unread, read } = getPreviewItems(MOCK_NOTIFICATIONS, readIds);
  const hasItems = unread.length > 0 || read.length > 0;

  return (
    <div className="flex flex-col">
      <div className="flex items-center justify-between gap-3 border-b border-divider px-4 py-3.5">
        <h2 className={cn(typo.headingS, "min-w-0 leading-none")}>Notifications</h2>

        <div className="flex shrink-0 items-center gap-1">
          {count > 0 ? (
            <button
              type="button"
              onClick={markAllRead}
              className={cn(
                radius.md,
                "inline-flex h-9 shrink-0 items-center gap-1.5 px-2.5 text-sm font-medium text-muted-foreground transition-colors duration-150 hover:bg-accent hover:text-primary",
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
          <button
            type="button"
            aria-label="Close notifications"
            onClick={onClose}
            className={cn(
              radius.sm,
              "flex size-9 items-center justify-center text-muted-foreground transition-colors duration-150 hover:bg-accent hover:text-foreground",
            )}
          >
            <HugeiconsIcon
              icon={Cancel01Icon}
              size={ICON_SIZE}
              strokeWidth={ICON_STROKE}
              absoluteStrokeWidth
              color="currentColor"
              aria-hidden
            />
          </button>
        </div>
      </div>

      <div className="max-h-105 overflow-y-auto">
        {!hasItems ? (
          <EmptyState
            icon={Notification01Icon}
            title="All caught up"
            body="New vitals, assessments, and task updates will appear here."
            className="min-h-56 py-8"
          />
        ) : (
          <>
            <PanelSection
              label={unread.length > 0 && read.length > 0 ? "New" : undefined}
              items={unread}
              readIds={readIds}
              onMarkRead={markRead}
              onClose={onClose}
            />
            <PanelSection
              label={unread.length > 0 && read.length > 0 ? "Earlier" : undefined}
              items={read}
              readIds={readIds}
              onMarkRead={markRead}
              onClose={onClose}
            />
          </>
        )}
      </div>

      <div className="border-t border-divider bg-muted/30 px-4 py-2.5">
        <Link
          href="/alerts"
          onClick={onClose}
          className={cn(
            radius.md,
            "flex w-full items-center justify-center py-2 text-sm font-medium text-primary transition-colors duration-150 hover:bg-primary/5",
          )}
        >
          View all notifications
        </Link>
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
            radius.lg,
            "z-50 w-90 overflow-hidden border border-border bg-card p-0",
            "shadow-[0_16px_40px_rgba(17,24,39,0.12),0_2px_8px_rgba(17,24,39,0.06)]",
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
