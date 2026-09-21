import { Tick02Icon } from "@hugeicons/core-free-icons";
import { AppIcon } from "@/components/shared/AppIcon";
import { BADGE_ICON_SIZE } from "@/lib/icons";
import { cn } from "@/lib/utils";

const hoverPreviewClass =
  "group-hover:bg-accent group-focus-visible:bg-accent group-has-[:focus-visible]:bg-accent";

const hoverTickPreviewClass =
  "opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 group-has-[:focus-visible]:opacity-100";

/** Shared task/table checkbox chrome — brand fill when checked; outlined minus when indeterminate. */
export function CheckboxIndicator({
  checked,
  indeterminate = false,
  showHoverPreview = false,
  className,
}: {
  checked: boolean;
  indeterminate?: boolean;
  /** Preview tick + muted fill on row hover when unchecked (tasks). */
  showHoverPreview?: boolean;
  className?: string;
}) {
  const isIndeterminate = indeterminate && !checked;

  return (
    <span
      className={cn(
        "flex size-5 shrink-0 items-center justify-center rounded-xs border shadow-[0_1px_2px_rgba(17,24,39,0.04)] transition-colors duration-150",
        checked
          ? "border-primary bg-primary text-primary-foreground"
          : isIndeterminate
            ? "border-primary bg-card text-primary"
            : cn("border-border bg-card", showHoverPreview && hoverPreviewClass),
        className,
      )}
      aria-hidden
    >
      {isIndeterminate ? (
        <span className="h-0.5 w-2.5 rounded-full bg-primary" />
      ) : checked || showHoverPreview ? (
        <AppIcon
          icon={Tick02Icon}
          size={BADGE_ICON_SIZE}
          className={cn(
            "transition-opacity duration-150",
            checked
              ? "opacity-100"
              : showHoverPreview
                ? hoverTickPreviewClass
                : "opacity-0",
          )}
          color={
            checked
              ? "var(--primary-foreground)"
              : "var(--muted-foreground)"
          }
        />
      ) : null}
    </span>
  );
}
