"use client";

import type { IconSvgElement } from "@hugeicons/react";
import { MoreHorizontalIcon } from "@hugeicons/core-free-icons";
import { AppIcon } from "@/components/shared/AppIcon";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export type RowActionItem = {
  label: string;
  icon: IconSvgElement;
  variant?: "default" | "destructive";
  onClick?: () => void;
};

export function RowActionsMenu({
  label,
  items,
}: {
  label: string;
  items: RowActionItem[];
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label={label}
          className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground outline-none transition-colors hover:bg-sidebar-accent hover:text-primary focus-visible:ring-2 focus-visible:ring-primary/30"
        >
          <AppIcon icon={MoreHorizontalIcon} />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-45 rounded-md border border-border bg-card p-1 shadow-lg"
      >
        {items.map((item) => (
          <DropdownMenuItem
            key={item.label}
            variant={item.variant}
            onClick={item.onClick}
            className={
              item.variant === "destructive"
                ? "cursor-pointer px-3 py-2 hover:bg-destructive-muted"
                : "cursor-pointer px-3 py-2 text-muted-foreground hover:bg-background hover:text-primary"
            }
          >
            <AppIcon icon={item.icon} />
            {item.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
