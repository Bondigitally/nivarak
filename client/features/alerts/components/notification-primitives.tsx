"use client";

import { useState, type KeyboardEvent } from "react";
import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowRight02Icon } from "@hugeicons/core-free-icons";
import { cn } from "@/lib/utils";
import { BADGE_ICON_SIZE, ICON_SIZE, ICON_STROKE, iconTileClass } from "@/lib/icons";
import { radius } from "@/lib/tokens/radius";
import { typo } from "@/lib/tokens/typography";
import { buttonVariants } from "@/components/ui/button";
import { AnimatedArrowIcon } from "@/features/dashboard/components/AnimatedArrowIcon";
import { statusBadgeClass } from "@/features/dashboard/data/dashboard-styles";
import {
  CATEGORY_BADGE,
  CATEGORY_LABEL,
  NOTIFICATION_ICON_TILE,
  SOURCE_META,
  type NotificationItem,
} from "../data/alerts-data";

/**
 * Notification list row surface — full-bleed, square corners, subtle gray hover
 * (Surface/Hover) so rows stay one continuous list (not inset rounded cards).
 */
export const NOTIFICATION_ROW_CLASS = cn(
  "relative flex gap-3.5 px-5 py-3.5 transition-colors duration-150",
  "hover:bg-accent",
);

/** List item — peer/group so adjacent dividers can retint with the hover wash. */
export const NOTIFICATION_LIST_ITEM_CLASS = "peer/row group/row relative";

export const NOTIFICATION_LIST_CLASS = "flex flex-col";

/**
 * Top-edge divider between rows (inset to match `px-5`).
 * Stays present on hover; retints to Surface/Hover so it blends with the
 * gray row wash instead of cutting a hard line across it.
 */
export const NOTIFICATION_ROW_DIVIDER_CLASS = cn(
  "pointer-events-none absolute inset-x-5 top-0 h-px bg-divider",
  "transition-colors duration-150",
  "group-hover/row:bg-accent peer-hover/row:bg-accent",
);

/** Dual-action row — secondary (e.g. Dismiss). */
const NOTIFICATION_SECONDARY_ACTION_CLASS = buttonVariants({
  variant: "secondary",
  size: "sm",
});

/** Dual-action row — primary CTA. */
const NOTIFICATION_PRIMARY_ACTION_CLASS = buttonVariants({
  variant: "primary-outline",
  size: "sm",
});

/** Single action — text link; arrow reveals on hover (panel + page). */
const NOTIFICATION_TEXT_ACTION_CLASS = cn(
  typo.bodyM,
  "inline-flex w-fit items-center gap-1 font-medium text-primary transition-colors duration-150 hover:text-primary/80",
);

function NotificationActionArrow({ hovered }: { hovered: boolean }) {
  return (
    <AnimatedArrowIcon
      icon={ArrowRight02Icon}
      direction="right"
      idleHidden
      size={BADGE_ICON_SIZE}
      className="size-4"
      hovered={hovered}
    />
  );
}

export function NotificationSourceAvatar({
  item,
  size = "md",
}: {
  item: NotificationItem;
  size?: "xxs" | "xs" | "sm" | "md";
}) {
  const source = SOURCE_META[item.source];
  const tileSize =
    size === "xxs"
      ? "size-8"
      : size === "xs"
        ? "size-9"
        : iconTileClass;
  const iconSize =
    size === "xxs"
      ? 12
      : size === "xs"
        ? 14
        : ICON_SIZE;
  const tileRadius = size === "xxs" || size === "xs" ? radius.sm : radius.md;

  return (
    <span
      className={cn(
        tileRadius,
        "flex shrink-0 items-center justify-center",
        tileSize,
        NOTIFICATION_ICON_TILE[item.category],
      )}
      title={source.label}
    >
      <HugeiconsIcon
        icon={source.icon}
        size={iconSize}
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
    <time
      className={cn(
        typo.caption,
        "shrink-0 whitespace-nowrap text-tertiary-foreground",
        className,
      )}
    >
      {time}
    </time>
  );
}

export function NotificationUnreadDot({
  className,
  visible = true,
}: {
  className?: string;
  /** When false, keeps layout space but hides the dot. */
  visible?: boolean;
}) {
  return (
    <span
      aria-hidden={!visible}
      aria-label={visible ? "Unread" : undefined}
      className={cn(
        "size-2 shrink-0 rounded-full",
        visible ? "bg-success" : "bg-transparent",
        className,
      )}
    />
  );
}

function useActionHover() {
  const [hovered, setHovered] = useState(false);

  return {
    hovered,
    hoverHandlers: {
      onMouseEnter: () => setHovered(true),
      onMouseLeave: () => setHovered(false),
      onFocus: () => setHovered(true),
      onBlur: () => setHovered(false),
    },
  };
}

function NotificationActionLink({
  action,
  className,
  onActionClick,
  showArrow = false,
  itemHovered = false,
}: {
  action: NotificationItem["actions"][number];
  className: string;
  onActionClick?: () => void;
  showArrow?: boolean;
  itemHovered?: boolean;
}) {
  const { hovered: actionFocused, hoverHandlers } = useActionHover();
  const arrowHovered = itemHovered || actionFocused;

  return (
    <Link
      href={action.href}
      onClick={(event) => {
        event.stopPropagation();
        onActionClick?.();
      }}
      className={className}
      {...(showArrow ? hoverHandlers : {})}
    >
      <span className="shrink-0">{action.label}</span>
      {showArrow ? <NotificationActionArrow hovered={arrowHovered} /> : null}
    </Link>
  );
}

function NotificationTextAction({
  action,
  onActionClick,
  itemHovered = false,
}: {
  action: NotificationItem["actions"][number];
  onActionClick?: () => void;
  itemHovered?: boolean;
}) {
  const { hovered: actionFocused, hoverHandlers } = useActionHover();
  const arrowHovered = itemHovered || actionFocused;

  return (
    <Link
      href={action.href}
      onClick={(event) => {
        event.stopPropagation();
        onActionClick?.();
      }}
      className={NOTIFICATION_TEXT_ACTION_CLASS}
      {...hoverHandlers}
    >
      <span className="shrink-0">{action.label}</span>
      <NotificationActionArrow hovered={arrowHovered} />
    </Link>
  );
}

export function NotificationActionLinks({
  item,
  onActionClick,
  itemHovered = false,
}: {
  item: NotificationItem;
  onActionClick?: () => void;
  itemHovered?: boolean;
}) {
  const actions = item.actions.slice(0, 2);
  if (actions.length === 0) return null;

  if (actions.length === 1) {
    return (
      <div className="mt-1.5">
        <NotificationTextAction
          action={actions[0]}
          onActionClick={onActionClick}
          itemHovered={itemHovered}
        />
      </div>
    );
  }

  return (
    <div className="mt-2 flex flex-wrap items-center gap-2">
      {actions.map((action, index) => (
        <NotificationActionLink
          key={action.label}
          action={action}
          onActionClick={onActionClick}
          showArrow={index === actions.length - 1}
          itemHovered={itemHovered}
          className={
            index === actions.length - 1
              ? NOTIFICATION_PRIMARY_ACTION_CLASS
              : NOTIFICATION_SECONDARY_ACTION_CLASS
          }
        />
      ))}
    </div>
  );
}

function NotificationContentRow({
  item,
  isRead,
  onMarkRead,
  onActionClick,
  itemHovered = false,
}: {
  item: NotificationItem;
  isRead: boolean;
  onMarkRead: (id: string) => void;
  onActionClick?: () => void;
  itemHovered?: boolean;
}) {
  function markIfUnread() {
    if (!isRead) onMarkRead(item.id);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    markIfUnread();
  }

  return (
    <div className="flex min-w-0 flex-1 flex-col gap-1.5">
      <div
        role="button"
        tabIndex={0}
        onClick={markIfUnread}
        onKeyDown={handleKeyDown}
        aria-label={`${item.title}${isRead ? "" : ", unread"}`}
        className={cn(
          "min-w-0 cursor-pointer",
          "rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset",
        )}
      >
        <div className="flex min-w-0 items-start justify-between gap-4">
          <span
            className={cn(
              typo.bodyM,
              "min-w-0 text-foreground",
              isRead ? "font-medium" : "font-semibold",
            )}
          >
            {item.title}
          </span>

          <div className="flex shrink-0 items-center gap-2">
            <NotificationTimestamp time={item.time} />
            <NotificationUnreadDot visible={!isRead} />
          </div>
        </div>

        <p
          className={cn(
            typo.bodyM,
            "mt-1 line-clamp-2",
            isRead && "text-tertiary-foreground",
          )}
        >
          {item.body}
        </p>
      </div>

      <NotificationActionLinks
        item={item}
        onActionClick={onActionClick}
        itemHovered={itemHovered}
      />
    </div>
  );
}

/** Shared notification row used by the dropdown panel and alerts page. */
export function NotificationItemCard({
  item,
  isRead,
  variant: _variant = "page",
  onMarkRead,
  onActionClick,
}: {
  item: NotificationItem;
  isRead: boolean;
  /** `panel` — dropdown popover; `page` — alerts list */
  variant?: "panel" | "page";
  onMarkRead: (id: string) => void;
  onActionClick?: () => void;
}) {
  const { hovered: itemHovered, hoverHandlers } = useActionHover();

  return (
    <div
      className={cn(
        NOTIFICATION_ROW_CLASS,
        isRead && "opacity-85 hover:opacity-100",
      )}
      {...hoverHandlers}
    >
      <NotificationSourceAvatar item={item} size="sm" />
      <NotificationContentRow
        item={item}
        isRead={isRead}
        onMarkRead={onMarkRead}
        onActionClick={onActionClick}
        itemHovered={itemHovered}
      />
    </div>
  );
}
