import { Tick02Icon } from "@hugeicons/core-free-icons";
import { AppIcon } from "@/components/shared/AppIcon";
import { cn } from "@/lib/utils";

export function TaskCheckbox({ completed }: { completed: boolean }) {
  return (
    <span
      className={cn(
        "flex size-[19px] shrink-0 items-center justify-center rounded-xs shadow-[0_1px_2px_rgba(17,24,39,0.04)] transition-colors duration-150",
        completed
          ? "border border-border bg-muted"
          : "border-[1.5px] border-primary bg-card",
      )}
      aria-hidden
    >
      {completed ? <AppIcon icon={Tick02Icon} color="var(--info)" /> : null}
    </span>
  );
}
