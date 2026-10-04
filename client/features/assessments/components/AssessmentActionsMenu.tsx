"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import { MoreHorizontalIcon, Pdf02Icon, ViewIcon } from "@hugeicons/core-free-icons";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function AssessmentActionsMenu() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label="Assessment actions"
          className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground outline-none transition-colors hover:bg-sidebar-accent hover:text-primary focus-visible:ring-2 focus-visible:ring-primary/30"
        >
          <HugeiconsIcon icon={MoreHorizontalIcon} size={19} strokeWidth={1.5} color="currentColor" absoluteStrokeWidth />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-45 rounded-md border border-border bg-card p-1 shadow-lg">
        <DropdownMenuItem className="flex cursor-pointer items-center gap-2 rounded-sm px-3 py-2 text-sm text-muted-foreground hover:bg-background hover:text-primary">
          <HugeiconsIcon icon={ViewIcon} size={19} strokeWidth={1.5} color="currentColor" absoluteStrokeWidth />
          View report
        </DropdownMenuItem>
        <DropdownMenuItem className="flex cursor-pointer items-center gap-2 rounded-sm px-3 py-2 text-sm text-muted-foreground hover:bg-background hover:text-primary">
          <HugeiconsIcon icon={Pdf02Icon} size={19} strokeWidth={1.5} color="currentColor" absoluteStrokeWidth />
          Download PDF
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
