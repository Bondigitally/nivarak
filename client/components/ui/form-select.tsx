"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronIcon } from "@/components/shared/ChevronIcon";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { fieldSelectTriggerClassName } from "@/components/ui/input";
import { ICON_SIZE } from "@/lib/icons";
import { typo } from "@/lib/tokens/typography";
import { cn } from "@/lib/utils";

export type FormSelectOption = { value: string; label: string };

function toSelectOptions(
  options: readonly FormSelectOption[] | readonly string[],
): FormSelectOption[] {
  return options.map((opt) =>
    typeof opt === "string" ? { value: opt, label: opt } : opt,
  );
}

/**
 * Auth PhoneField–style dropdown for form fields.
 * Replaces native `<select>` with the same menu chrome as country-code picker.
 */
export function FormSelect({
  id,
  name,
  value,
  options,
  onChange,
  placeholder = "Select one",
  disabled = false,
  error = false,
  className,
  "aria-label": ariaLabel,
}: {
  id?: string;
  name?: string;
  value: string;
  options: readonly FormSelectOption[] | readonly string[];
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  error?: boolean;
  className?: string;
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
  }, []);

  return (
    <>
      {name ? <input type="hidden" name={name} value={value} /> : null}
      <DropdownMenu>
        <DropdownMenuTrigger asChild disabled={disabled}>
          <button
            ref={triggerRef}
            id={id}
            type="button"
            aria-label={ariaLabel}
            aria-invalid={error || undefined}
            className={cn(
              fieldSelectTriggerClassName,
              "form-select-trigger",
              error &&
                "border-destructive focus-visible:ring-destructive/30 aria-[invalid=true]:border-destructive",
              className,
            )}
          >
            <span
              className={cn(
                "min-w-0 flex-1 truncate",
                !selected && "text-placeholder",
              )}
            >
              {selected?.label ?? placeholder}
            </span>
            <ChevronIcon
              direction="down"
              size={ICON_SIZE}
              className="shrink-0 text-muted-foreground"
            />
          </button>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          side="bottom"
          align="start"
          sideOffset={8}
          avoidCollisions={false}
          style={menuWidth ? { width: menuWidth } : undefined}
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
    </>
  );
}
