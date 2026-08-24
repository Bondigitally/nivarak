"use client";

import { cn } from "@/lib/utils";

export function SettingsToggle({
  checked,
  onCheckedChange,
  id,
  labelledBy,
}: {
  checked: boolean;
  onCheckedChange: (next: boolean) => void;
  id: string;
  labelledBy: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      id={id}
      aria-checked={checked}
      aria-labelledby={labelledBy}
      onClick={() => onCheckedChange(!checked)}
      className={cn(
        "relative h-6 w-11 shrink-0 cursor-pointer rounded-full transition-colors duration-150",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        checked ? "bg-primary" : "bg-[#D0C2D1]",
      )}
    >
      <span
        aria-hidden
        className={cn(
          "absolute top-[3px] size-[18px] rounded-[9px] bg-white shadow-sm transition-[left] duration-150",
          checked ? "left-[23px]" : "left-[3px]",
        )}
      />
    </button>
  );
}
