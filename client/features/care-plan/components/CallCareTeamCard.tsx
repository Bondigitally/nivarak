import { HugeiconsIcon } from "@hugeicons/react";
import { Alert01Icon, Call02Icon } from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import {
  cardTitleClass,
  dashboardCardClass,
} from "@/features/dashboard/data/dashboard-styles";
import { SectionInfoButton } from "@/features/dashboard/components/EmptyState";
import { ICON_SIZE, ICON_STROKE } from "@/lib/icons";
import { cn } from "@/lib/utils";

export function CallCareTeamCard({ triggers }: { triggers: string[] }) {
  return (
    <section
      className={cn(
        dashboardCardClass,
        "flex h-full flex-1 flex-col gap-5 self-stretch p-6",
      )}
    >
      <div className="flex items-center gap-2.5">
        <span
          className="inline-flex size-5 shrink-0 items-center justify-center text-destructive"
          aria-hidden
        >
          <HugeiconsIcon
            icon={Alert01Icon}
            size={ICON_SIZE}
            strokeWidth={ICON_STROKE}
            absoluteStrokeWidth
            color="currentColor"
            className="block size-5"
          />
        </span>
        <h2 className={cardTitleClass}>
          When to call care team
        </h2>
        <SectionInfoButton info="Warning signs that mean you should contact your care team right away. Use Call Care Team for urgent help." />
      </div>

      <div className="rounded-md bg-destructive-muted px-4 py-3">
        <ul className="flex flex-col gap-2">
          {triggers.map((trigger) => (
            <li key={trigger} className="flex items-center gap-2.5">
              <span
                className="size-1.5 shrink-0 rounded-full bg-destructive"
                aria-hidden
              />
              <span className="text-sm font-normal leading-5 text-muted-foreground">
                {trigger}
              </span>
            </li>
          ))}
        </ul>
      </div>

      <Button type="button" variant="destructive-outline" size="cta" className="w-full">
        <HugeiconsIcon icon={Call02Icon} size={ICON_SIZE} strokeWidth={ICON_STROKE} color="currentColor" absoluteStrokeWidth />
        Call Care Team
      </Button>
    </section>
  );
}
