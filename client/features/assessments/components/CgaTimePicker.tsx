"use client";

import { useEffect, useRef, useState } from "react";
import { Clock01Icon } from "@hugeicons/core-free-icons";
import { AppIcon } from "@/components/shared/AppIcon";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { fieldInputClassName } from "@/components/ui/input";
import { BADGE_ICON_SIZE } from "@/lib/icons";
import { radius } from "@/lib/tokens/radius";
import { typo } from "@/lib/tokens/typography";
import { cn } from "@/lib/utils";

const HOURS = Array.from({ length: 12 }, (_, i) => i + 1);
const MINUTES = Array.from({ length: 60 }, (_, i) => i);
const PERIODS = ["AM", "PM"] as const;

type DayPeriod = (typeof PERIODS)[number];

type ParsedTime = {
  hour12: number;
  minute: number;
  period: DayPeriod;
};

function parseTime24(value: string): ParsedTime {
  const match = /^(\d{1,2}):(\d{2})$/.exec(value.trim());
  if (!match) return { hour12: 9, minute: 0, period: "AM" };
  const hour24 = Number(match[1]);
  const minute = Number(match[2]);
  if (
    !Number.isFinite(hour24) ||
    !Number.isFinite(minute) ||
    hour24 < 0 ||
    hour24 > 23 ||
    minute < 0 ||
    minute > 59
  ) {
    return { hour12: 9, minute: 0, period: "AM" };
  }
  const period: DayPeriod = hour24 >= 12 ? "PM" : "AM";
  const hour12 = hour24 % 12 === 0 ? 12 : hour24 % 12;
  return { hour12, minute, period };
}

function toTime24(hour12: number, minute: number, period: DayPeriod): string {
  let hour24 = hour12 % 12;
  if (period === "PM") hour24 += 12;
  return `${String(hour24).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}

function formatDisplay(value: string): string {
  if (!value.trim()) return "";
  const { hour12, minute, period } = parseTime24(value);
  return `${String(hour12).padStart(2, "0")}:${String(minute).padStart(2, "0")} ${period}`;
}

function TimeColumn({
  "aria-label": ariaLabel,
  options,
  value,
  onChange,
  formatOption = String,
}: {
  "aria-label": string;
  options: readonly (number | string)[];
  value: number | string;
  onChange: (next: number | string) => void;
  formatOption?: (option: number | string) => string;
}) {
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const list = listRef.current;
    if (!list) return;
    const selected = list.querySelector<HTMLElement>('[data-selected="true"]');
    selected?.scrollIntoView({ block: "center" });
  }, [value]);

  return (
    <div
      ref={listRef}
      role="listbox"
      aria-label={ariaLabel}
      className={cn(
        radius.md,
        "h-40 w-14 overflow-y-auto overscroll-contain bg-muted/50 p-1",
      )}
    >
      {options.map((option) => {
        const selected = option === value;
        return (
          <button
            key={String(option)}
            type="button"
            role="option"
            aria-selected={selected}
            data-selected={selected ? "true" : undefined}
            onClick={() => onChange(option)}
            className={cn(
              radius.md,
              typo.bodyM,
              "flex h-8 w-full items-center justify-center tabular-nums transition-colors",
              selected
                ? "bg-primary/10 font-medium text-primary"
                : "text-foreground hover:bg-accent",
            )}
          >
            {formatOption(option)}
          </button>
        );
      })}
    </div>
  );
}

/**
 * Compact time control: hugged trigger + scrollable hour / minute / AM·PM popover.
 * Value is stored as 24-hour `HH:mm`.
 */
export function CgaTimePicker({
  id,
  value,
  onChange,
  "aria-label": ariaLabel,
  placeholder = "Select time",
}: {
  id?: string;
  value: string;
  onChange: (next: string) => void;
  "aria-label": string;
  placeholder?: string;
}) {
  const [open, setOpen] = useState(false);
  const parsed = parseTime24(value);
  const display = formatDisplay(value);

  function commit(next: Partial<ParsedTime>) {
    const hour12 = next.hour12 ?? parsed.hour12;
    const minute = next.minute ?? parsed.minute;
    const period = next.period ?? parsed.period;
    onChange(toTime24(hour12, minute, period));
  }

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <button
          id={id}
          type="button"
          aria-label={ariaLabel}
          className={cn(
            fieldInputClassName,
            "inline-flex w-fit max-w-full shrink-0 items-center gap-2 px-3 tabular-nums",
          )}
        >
          <span
            className={cn(
              "whitespace-nowrap",
              display ? "text-foreground" : "text-placeholder",
            )}
          >
            {display || placeholder}
          </span>
          <AppIcon
            icon={Clock01Icon}
            size={BADGE_ICON_SIZE}
            className="shrink-0 text-muted-foreground"
            aria-hidden
          />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        sideOffset={8}
        className={cn(radius.md, "border-border bg-card p-2 shadow-md")}
        onCloseAutoFocus={(event) => event.preventDefault()}
      >
        <div
          className={cn(
            radius.md,
            "flex items-stretch gap-1.5 bg-muted/30 p-1.5",
          )}
        >
          <TimeColumn
            aria-label="Hour"
            options={HOURS}
            value={parsed.hour12}
            onChange={(next) => commit({ hour12: Number(next) })}
            formatOption={(option) => String(option).padStart(2, "0")}
          />
          <TimeColumn
            aria-label="Minute"
            options={MINUTES}
            value={parsed.minute}
            onChange={(next) => commit({ minute: Number(next) })}
            formatOption={(option) => String(option).padStart(2, "0")}
          />
          <TimeColumn
            aria-label="AM or PM"
            options={PERIODS}
            value={parsed.period}
            onChange={(next) =>
              commit({ period: next === "PM" ? "PM" : "AM" })
            }
          />
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
