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
import { TruncateHoverMarquee } from "@/components/shared/TruncateHoverMarquee";
import { typo } from "@/lib/tokens/typography";
import { cn } from "@/lib/utils";

const formSelectTriggerClassName = cn(
  fieldInputClassName,
  "inline-flex items-center justify-between gap-2 text-left",
);

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
  contentClassName,
  container,
  enableHoverScroll = false,
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
  /** Extra classes for the menu (e.g. higher z-index inside dialogs). */
  contentClassName?: string;
  /**
   * Portal target for the menu. Pass a Dialog content node so the menu
   * stacks above the dialog overlay (z-100) and scrolls under scroll lock.
   */
  container?: HTMLElement | null;
  /** Scroll truncated trigger label on hover (overflow only). */
  enableHoverScroll?: boolean;
  "aria-label"?: string;
}) {
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [menuWidth, setMenuWidth] = useState<number>();
  const [menuOpen, setMenuOpen] = useState(false);
  const [hoveredItemValue, setHoveredItemValue] = useState<string | null>(null);
  const items = useMemo(() => toSelectOptions(options), [options]);
  const selected = items.find((item) => item.value === value);
  const triggerLabel = selected?.label ?? placeholder;

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
      {/* modal={false} avoids focus/dismiss fights when nested in a Radix Dialog */}
      <DropdownMenu
        modal={false}
        open={menuOpen}
        onOpenChange={(open) => {
          setMenuOpen(open);
          if (!open) setHoveredItemValue(null);
        }}
      >
        <DropdownMenuTrigger asChild disabled={disabled}>
          <button
            ref={triggerRef}
            id={id}
            type="button"
            aria-label={ariaLabel}
            data-invalid={error || undefined}
            className={cn(
              formSelectTriggerClassName,
              "form-select-trigger",
              error && "border-destructive focus-visible:ring-destructive/30",
              className,
            )}
          >
            {enableHoverScroll && !menuOpen ? (
              <TruncateHoverMarquee
                className="min-w-0 flex-1"
                textClassName={cn(!selected && "text-placeholder")}
              >
                {triggerLabel}
              </TruncateHoverMarquee>
            ) : (
              <span
                className={cn(
                  "min-w-0 flex-1 truncate",
                  !selected && "text-placeholder",
                )}
              >
                {triggerLabel}
              </span>
            )}
            <ChevronIcon
              direction="down"
              size={DROPDOWN_CHEVRON_SIZE}
            />
          </button>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          container={container}
          side="bottom"
          align="start"
          sideOffset={8}
          avoidCollisions={false}
          style={menuWidth ? { width: menuWidth } : undefined}
          className={cn(
            "max-w-[calc(100vw-2rem)] overflow-hidden rounded-md border-border bg-card p-0 shadow-md",
            !menuWidth && "w-[min(20rem,calc(100vw-2.5rem))]",
            typo.input,
            contentClassName,
          )}
          onCloseAutoFocus={(event) => event.preventDefault()}
        >
          <div className="max-h-64 overflow-y-auto overscroll-contain p-1.5">
            {items.map((item) => {
              const isSelected = item.value === value;
              return (
                <DropdownMenuItem
                  key={item.value}
                  onSelect={() => onChange(item.value)}
                  onMouseEnter={() =>
                    enableHoverScroll && setHoveredItemValue(item.value)
                  }
                  onMouseLeave={() =>
                    enableHoverScroll && setHoveredItemValue(null)
                  }
                  className={cn(
                    "min-w-0 w-full cursor-pointer gap-3 overflow-hidden rounded-sm px-3 py-2.5",
                    typo.input,
                    isSelected && "bg-background text-foreground",
                  )}
                >
                  {enableHoverScroll ? (
                    <TruncateHoverMarquee
                      className="min-w-0 flex-1"
                      hovered={hoveredItemValue === item.value}
                    >
                      {item.label}
                    </TruncateHoverMarquee>
                  ) : (
                    <span className="min-w-0 flex-1 truncate">{item.label}</span>
                  )}
                </DropdownMenuItem>
              );
            })}
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}
