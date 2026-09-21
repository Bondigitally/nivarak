"use client";

import { Cancel01Icon, Search01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  dashboardSearchBarClass,
  dashboardSearchBarIconClass,
} from "@/lib/tokens/page-shell";
import { ICON_SIZE, ICON_STROKE } from "@/lib/icons";
import { typo } from "@/lib/tokens/typography";
import { cn } from "@/lib/utils";

export function TableSearch({
  value,
  onChange,
  placeholder,
  "aria-label": ariaLabel,
  className,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  "aria-label": string;
  className?: string;
}) {
  const hasQuery = Boolean(value.trim());

  return (
    <label
      className={cn(
        dashboardSearchBarClass,
        "h-11 w-full min-w-0 max-w-none flex-1 cursor-text sm:w-56 sm:flex-none lg:w-70",
        !hasQuery && "pr-5",
        className,
      )}
    >
      <HugeiconsIcon
        icon={Search01Icon}
        size={ICON_SIZE}
        strokeWidth={ICON_STROKE}
        color="currentColor"
        className={dashboardSearchBarIconClass}
        absoluteStrokeWidth
      />
      <input
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        aria-label={ariaLabel}
        className={cn(
          typo.input,
          "h-full min-w-0 flex-1 bg-transparent outline-none placeholder:text-placeholder [&::-webkit-search-cancel-button]:hidden",
        )}
      />
      {hasQuery ? (
        <button
          type="button"
          aria-label="Clear search"
          onClick={() => onChange("")}
          className="flex size-9 shrink-0 items-center justify-center rounded-full text-muted-foreground hover:bg-accent"
        >
          <HugeiconsIcon
            icon={Cancel01Icon}
            size={ICON_SIZE}
            strokeWidth={ICON_STROKE}
            color="currentColor"
            absoluteStrokeWidth
          />
        </button>
      ) : null}
    </label>
  );
}
