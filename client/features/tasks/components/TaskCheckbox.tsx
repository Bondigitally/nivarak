import { Tick02Icon } from "@hugeicons/core-free-icons";
import { AppIcon } from "@/components/shared/AppIcon";
import { cn } from "@/lib/utils";

/** Incomplete hover/focus preview — works with `group` on row buttons or labels. */
const incompletePreview =
  "group-hover:bg-muted group-focus-visible:bg-muted group-has-[:focus-visible]:bg-muted";

const incompleteTickPreview =
  "opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 group-has-[:focus-visible]:opacity-100";

export function TaskCheckbox({
  completed,
  hoverPreview = true,
}: {
  completed: boolean;
  /** Show checkmark + muted fill on row hover when incomplete. */
  hoverPreview?: boolean;
}) {
  return (
    <span
      className={cn(
        "flex size-5 shrink-0 items-center justify-center rounded-xs border border-border shadow-[0_1px_2px_rgba(17,24,39,0.04)] transition-colors duration-150",
        completed ? "bg-muted" : cn("bg-card", hoverPreview && incompletePreview),
      )}
      aria-hidden
    >
      {completed || hoverPreview ? (
        <AppIcon
          icon={Tick02Icon}
          className={cn(
            "transition-opacity duration-150",
            completed
              ? "opacity-100"
              : hoverPreview
                ? incompleteTickPreview
                : "opacity-0",
          )}
          color={completed ? "var(--info)" : "var(--muted-foreground)"}
        />
      ) : null}
    </span>
  );
}
