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

function OwnerBadge({ owner }: { owner: string }) {
  return (
    <span className={cn(statusBadgeClass, "bg-sidebar-accent text-primary")}>
      {owner}
    </span>
  );
}

function ActionStatusBadge({ status }: { status: CarePlanAction["status"] }) {
  const style = STATUS_STYLES[status];
  return (
    <span className={cn(statusBadgeClass, "shrink-0", style.bg, style.text)}>
      {status}
    </span>
  );
}

export function ActionPlanCard({ actions }: { actions: CarePlanAction[] }) {
  return (
    <section className="overflow-hidden rounded-lg border border-border bg-card">
      <div className="border-b border-border px-6 pt-5 pb-4">
        <SectionTitle
          info="Recommended actions from your care plan, with owners and status so you can see what is on track."
          className="flex-none pr-0 text-[20px] text-foreground"
        >
          Action plan
        </SectionTitle>
      </div>

      <ul className="flex flex-col gap-3 p-4 lg:hidden">
        {actions.map((row) => (
          <li key={row.id}>
            <article className="rounded-lg border border-border bg-background p-4">
              <div className="flex items-start justify-between gap-3">
                <p className="min-w-0 text-base font-normal leading-6 text-foreground">
                  {row.action}
                </p>
                <ActionStatusBadge status={row.status} />
              </div>
              <dl className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2">
                <div className="flex items-center gap-2">
                  <dt className="text-[13px] font-normal leading-4 text-muted-foreground">
                    Owner
                  </dt>
                  <dd>
                    <OwnerBadge owner={row.owner} />
                  </dd>
                </div>
                <div className="flex items-center gap-2">
                  <dt className="text-[13px] font-normal leading-4 text-muted-foreground">
                    Timeframe
                  </dt>
                  <dd className="text-[13px] font-normal leading-4 text-muted-foreground">
                    {row.timeframe}
                  </dd>
                </div>
              </dl>
            </article>
          </li>
        ))}
      </ul>

      <div className="hidden w-full overflow-x-auto lg:block">
        <table className="w-full min-w-[620px] border-collapse">
          <thead>
            <tr className="border-b border-border bg-table-header">
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
                    <OwnerBadge owner={row.owner} />
                  </td>
                  <td className="px-6 py-3.5 text-[13px] font-normal leading-4 text-muted-foreground">
                    {row.timeframe}
                  </td>
                  <td className="px-6 py-3.5">
                    <ActionStatusBadge status={row.status} />
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
