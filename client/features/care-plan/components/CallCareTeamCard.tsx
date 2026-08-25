import { HugeiconsIcon } from "@hugeicons/react";
import { Alert01Icon, Call02Icon } from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { typo } from "@/lib/tokens/typography";
import { SectionInfoButton } from "@/features/dashboard/components/EmptyState";

export function CallCareTeamCard({ triggers }: { triggers: string[] }) {
  return (
    <section className="flex h-full flex-1 flex-col gap-5 self-stretch rounded-2xl border border-[#E9E4ED] bg-white p-6">
      <div className="flex items-center gap-2.5">
        <span className="inline-flex size-4 shrink-0 text-destructive" aria-hidden>
          <HugeiconsIcon
            icon={Alert01Icon}
            size={16}
            strokeWidth={1.75}
            color="currentColor"
          />
        </span>
        <h2 className={cn(typo.headingL, "font-medium text-[#1F2937]")}>
          When to call care team
        </h2>
        <SectionInfoButton info="Warning signs that mean you should contact your care team right away. Use Call Care Team for urgent help." />
      </div>

      <div className="rounded-[14px] bg-[#FEF2F2] px-4 py-3">
        <ul className="flex flex-col gap-2">
          {triggers.map((trigger) => (
            <li key={trigger} className="flex items-center gap-2.5">
              <span
                className="size-1.5 shrink-0 rounded-full bg-destructive"
                aria-hidden
              />
              <span className="text-sm font-normal leading-5 text-[#374151]">
                {trigger}
              </span>
            </li>
          ))}
        </ul>
      </div>

      <Button type="button" variant="destructive-outline" size="cta" className="w-full">
        <HugeiconsIcon icon={Call02Icon} size={19} strokeWidth={1.75} color="currentColor" />
        Call Care Team
      </Button>
    </section>
  );
}
