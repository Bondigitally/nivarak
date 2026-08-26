import { cn } from "@/lib/utils";
import { statusBadgeClass } from "@/features/dashboard/data/dashboard-styles";
import { SectionTitle } from "@/features/dashboard/components/EmptyState";
import type { CarePlanAction } from "@/features/dashboard/data/home-data";

const STATUS_STYLES: Record<
  CarePlanAction["status"],
  { bg: string; text: string }
> = {
  "On Track": { bg: "bg-success-muted", text: "text-success" },
  "At Risk": { bg: "bg-warning-muted", text: "text-warning" },
  Done: { bg: "bg-background", text: "text-muted-foreground" },
};

export function ActionPlanCard({ actions }: { actions: CarePlanAction[] }) {
  return (
    <section className="overflow-hidden rounded-2xl border border-border bg-card">
      <div className="border-b border-border px-6 pt-5 pb-4">
        <SectionTitle
          info="Recommended actions from your care plan, with owners and status so you can see what is on track."
          className="flex-none pr-0 text-[20px] text-foreground"
        >
          Action plan
        </SectionTitle>
      </div>

      <div className="w-full overflow-x-auto">
        <table className="w-full min-w-[620px] border-collapse">
          <thead>
            <tr className="border-b border-border bg-background">
              <th
                scope="col"
                className="h-11 px-6 text-left text-sm font-medium leading-5 text-muted-foreground"
              >
                Action
              </th>
              <th
                scope="col"
                className="h-11 px-6 text-left text-sm font-medium leading-5 text-muted-foreground"
              >
                Owner
              </th>
              <th
                scope="col"
                className="h-11 px-6 text-left text-sm font-medium leading-5 text-muted-foreground"
              >
                Timeframe
              </th>
              <th
                scope="col"
                className="h-11 px-6 text-left text-sm font-medium leading-5 text-muted-foreground"
              >
                Status
              </th>
            </tr>
          </thead>
          <tbody>
            {actions.map((row, index) => {
              const statusStyle = STATUS_STYLES[row.status];
              const isLast = index === actions.length - 1;

              return (
                <tr
                  key={row.id}
                  className={cn(!isLast && "border-b border-border")}
                >
                  <td className="px-6 py-3.5 text-base font-normal leading-6 text-foreground">
                    {row.action}
                  </td>
                  <td className="px-6 py-3.5">
                    <span
                      className={cn(statusBadgeClass, "bg-sidebar-accent text-primary")}
                    >
                      {row.owner}
                    </span>
                  </td>
                  <td className="px-6 py-3.5 text-[13px] font-normal leading-4 text-muted-foreground">
                    {row.timeframe}
                  </td>
                  <td className="px-6 py-3.5">
                    <span
                      className={cn(
                        statusBadgeClass,
                        statusStyle.bg,
                        statusStyle.text,
                      )}
                    >
                      {row.status}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
