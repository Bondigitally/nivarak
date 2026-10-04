"use client";

import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import { cn } from "@/lib/utils";
import { BADGE_ICON_SIZE, ICON_SIZE, ICON_STROKE } from "@/lib/icons";
import { radius } from "@/lib/tokens/radius";
import { buttonVariants } from "@/components/ui/button";
import { statusBadgeClass } from "@/features/dashboard/data/dashboard-styles";
import {
  CATEGORY_BADGE,
  CATEGORY_LABEL,
  SOURCE_META,
  type NotificationItem,
} from "../data/alerts-data";
import { CheckCheckIcon } from "@hugeicons/core-free-icons";

/** Neutral wash for unread rows — between card white and Surface/TableHeader. */
export const UNREAD_ROW_CLASS = "bg-table-header/70";

/** Outer inset for every notification row inside a section card. */
export const NOTIFICATION_ROW_OUTER_CLASS = "px-4 py-1.5";

/** Shared inner padding for read and unread notification rows. */
export const NOTIFICATION_ROW_INNER_CLASS = cn(
  radius.md,
  "flex gap-3 px-4 py-4",
);

/** Surface for read / checked notifications (no border). */
export const READ_ROW_CLASS = "bg-card";

/** Compact action chips — uses Button `sm` (32px) + secondary. */
export const NOTIFICATION_ACTION_BUTTON_CLASS = buttonVariants({
  variant: "secondary",
  size: "sm",
});

export function NotificationIconBubble({
  item,
  size = "md",
}: {
  item: NotificationItem;
  size?: "sm" | "md";
}) {
  const source = SOURCE_META[item.source];

  return (
    <span
      className={cn(
        radius.md,
        "flex shrink-0 items-center justify-center border border-border bg-muted text-muted-foreground",
        size === "sm" ? "size-8" : "size-10",
      )}
    >
      <HugeiconsIcon
        icon={source.icon}
        size={size === "sm" ? BADGE_ICON_SIZE : ICON_SIZE}
        strokeWidth={ICON_STROKE}
        absoluteStrokeWidth
        color="currentColor"
        aria-hidden
      />
    </span>
  );
}

export function NotificationCategoryBadge({
  category,
  className,
}: {
  category: NotificationItem["category"];
  className?: string;
}) {
  return (
    <span
      className={cn(
        statusBadgeClass,
        "shrink-0 border",
        CATEGORY_BADGE[category],
        className,
      )}
    >
      {CATEGORY_LABEL[category]}
    </span>
  );
}

export function NotificationTimestamp({
  time,
  className,
}: {
  time: string;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "shrink-0 whitespace-nowrap text-xs leading-4 text-muted-foreground",
        className,
      )}
    >
      {time}
    </span>
  );
}

export function NotificationTimeColumn({
  time,
  isRead,
  className,
}: {
  time: string;
  isRead: boolean;
  className?: string;
}) {
  return (
    <div className={cn("flex shrink-0 flex-col items-end gap-1.5", className)}>
      {!isRead ? <NotificationUnreadDot /> : null}
      <NotificationTimestamp time={time} />
    </div>
  );
}

export function NotificationUnreadDot({ className }: { className?: string }) {
  return (
    <span
      aria-label="Unread"
      className={cn("size-2 shrink-0 rounded-full bg-info", className)}
    />
  );
}

export function NotificationActionLinks({
  item,
  onMarkRead,
}: {
  item: NotificationItem;
  onMarkRead?: (id: string) => void;
}) {
  if (item.actions.length === 0 && !onMarkRead) return null;

  return (
    <div className="flex flex-wrap items-center gap-2">
      {item.actions.map((action) => (
        <Link
          key={action.label}
          href={action.href}
          onClick={(event) => event.stopPropagation()}
          className={cn(NOTIFICATION_ACTION_BUTTON_CLASS)}
        >
          {action.label}
        </Link>
      ))}
      {onMarkRead ? (
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onMarkRead(item.id);
          }}
          className={cn(NOTIFICATION_ACTION_BUTTON_CLASS, "shrink-0")}
        >
          <HugeiconsIcon
            icon={CheckCheckIcon}
            size={BADGE_ICON_SIZE}
            strokeWidth={ICON_STROKE}
            absoluteStrokeWidth
            color="currentColor"
            aria-hidden
            className="shrink-0"
          />
          Mark read
        </button>
      ) : null}
    </div>
  );
}
