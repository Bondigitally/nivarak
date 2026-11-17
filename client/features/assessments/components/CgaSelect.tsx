"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import { ChevronIcon } from "@/components/shared/ChevronIcon";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { fieldInputClassName } from "@/components/ui/input";
import { DROPDOWN_CHEVRON_SIZE } from "@/lib/icons";
import { typo } from "@/lib/tokens/typography";
import { cn } from "@/lib/utils";

export type CgaSelectOption = { value: string; label: string };

function toSelectOptions(
  options: readonly CgaSelectOption[] | readonly string[],
): CgaSelectOption[] {
  return options.map((opt) =>
    typeof opt === "string" ? { value: opt, label: opt } : opt,
  );
}

/**
 * Field trigger + card menu dropdown for CGA wizard sections.
 */
export function CgaSelect({
  id,
  value,
  options,
  onChange,
  placeholder = "Select…",
  disabled = false,
  muted = false,
  compact = false,
  "aria-label": ariaLabel,
}: {
  id?: string;
  value: string;
  options: readonly CgaSelectOption[] | readonly string[];
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  muted?: boolean;
  compact?: boolean;
  "aria-label"?: string;
}) {
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [menuWidth, setMenuWidth] = useState<number>();
  const items = useMemo(() => toSelectOptions(options), [options]);
  const selected = items.find((item) => item.value === value);

  useEffect(() => {
    const el = triggerRef.current;
    if (!el) return;

    const syncWidth = () => setMenuWidth(el.getBoundingClientRect().width);
    syncWidth();

    const observer = new ResizeObserver(syncWidth);
    observer.observe(el);
    return () => observer.disconnect();
  }, [compact]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild disabled={disabled}>
        <button
          ref={triggerRef}
          id={id}
          type="button"
          aria-label={ariaLabel}
          className={cn(
            compact
              ? cn(
                  typo.bodyS,
                  "inline-flex h-8 min-w-20 flex-1 items-center justify-between gap-2 rounded-sm px-1.5",
                  "text-muted-foreground outline-none transition-colors",
                  "hover:bg-background hover:text-foreground",
                  "focus-visible:bg-background focus-visible:ring-2 focus-visible:ring-ring/40",
                )
              : cn(
                  fieldInputClassName,
                  "flex items-center justify-between gap-3 text-left",
                  muted && "bg-muted text-muted-foreground",
                ),
            "disabled:pointer-events-none",
          )}
        >
          <span
            className={cn(
              "min-w-0 flex-1 truncate font-normal",
              selected ? "text-foreground" : "text-placeholder",
            )}
          >
            {selected?.label ?? placeholder}
          </span>
          <ChevronIcon
            direction="down"
            size={DROPDOWN_CHEVRON_SIZE}
            className="text-muted-foreground"
          />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        side="bottom"
        align="start"
        sideOffset={8}
        avoidCollisions={false}
        style={
          menuWidth ? { width: Math.max(menuWidth, compact ? 160 : 0) } : undefined
        }
        className={cn(
          "max-w-[calc(100vw-2rem)] overflow-hidden rounded-md border-border bg-card p-0 shadow-md",
          !menuWidth && "w-[min(20rem,calc(100vw-2.5rem))]",
          typo.input,
        )}
      >
        <div className="max-h-64 overflow-y-auto overscroll-contain p-1.5">
          {items.map((item) => {
            const isSelected = item.value === value;
            return (
              <DropdownMenuItem
                key={item.value}
                onSelect={() => onChange(item.value)}
                className={cn(
                  "cursor-pointer gap-3 rounded-sm px-3 py-2.5",
                  typo.input,
                  isSelected && "bg-background text-foreground",
                )}
              >
                <span className="min-w-0 flex-1 truncate">{item.label}</span>
              </DropdownMenuItem>
            );
          })}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}