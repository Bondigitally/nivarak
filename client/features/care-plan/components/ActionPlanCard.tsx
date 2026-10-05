"use client";

import { useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import {
  DataTable,
  DataTableIdentity,
  TablePaginationBar,
  type DataTableColumn,
} from "@/components/shared/data-table";
import {
  dashboardCardClass,
  statusBadgeClass,
} from "@/features/dashboard/data/dashboard-styles";
import { SectionTitle } from "@/features/dashboard/components/EmptyState";
import { typo } from "@/lib/tokens/typography";
import type { CarePlanAction } from "@/features/care-plan/data/care-plan-data";

const PAGE_SIZES = [10, 15, 25, 50];

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
    <span className={cn(statusBadgeClass, "bg-muted text-muted-foreground")}>
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

const COLUMNS: DataTableColumn<CarePlanAction>[] = [
  {
    id: "action",
    header: "Action",
    sortValue: (row) => row.action,
    cell: (row) => <DataTableIdentity title={row.action} />,
  },
  {
    id: "owner",
    header: "Owner",
    className: "w-40",
    sortValue: (row) => row.owner,
    cell: (row) => <OwnerBadge owner={row.owner} />,
  },
  {
    id: "timeframe",
    header: "Timeframe",
    className: "w-40",
    cellClassName: "whitespace-nowrap",
    sortValue: (row) => row.timeframe,
    cell: (row) => row.timeframe,
  },
  {
    id: "status",
    header: "Status",
    className: "w-36",
    sortValue: (row) => row.status,
    cell: (row) => <ActionStatusBadge status={row.status} />,
  },
];

export function ActionPlanCard({ actions }: { actions: CarePlanAction[] }) {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);

  const pageCount = Math.max(1, Math.ceil(actions.length / pageSize) || 1);
  const safePage = Math.min(Math.max(1, page), pageCount);

  useEffect(() => {
    setPage(1);
  }, [actions, pageSize]);

  useEffect(() => {
    if (page !== safePage) setPage(safePage);
  }, [page, safePage]);

  const pagedActions = useMemo(() => {
    const start = (safePage - 1) * pageSize;
    return actions.slice(start, start + pageSize);
  }, [actions, pageSize, safePage]);

  return (
    <section className={cn(dashboardCardClass, "overflow-hidden")}>
      <div className="px-5 pt-5 pb-4">
        <div className="flex min-w-0 flex-col gap-0.5">
          <SectionTitle className="flex-none pr-0 text-foreground">
            Action plan
          </SectionTitle>
          <p className={typo.bodyM}>
            Recommended care-plan actions with owners and status.
          </p>
        </div>
      </div>

      <ul className="flex flex-col gap-3 p-4 lg:hidden">
        {pagedActions.map((row) => (
          <li key={row.id}>
            <article className="rounded-lg bg-muted p-4">
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
      {actions.length > 0 ? (
        <div className="border-t border-divider py-3 lg:hidden">
          <TablePaginationBar
            total={actions.length}
            page={safePage}
            pageSize={pageSize}
            pageSizes={PAGE_SIZES}
            onPageChange={setPage}
            onPageSizeChange={(size) => {
              setPageSize(size);
              setPage(1);
            }}
          />
        </div>
      ) : null}

      <div className="hidden px-5 pb-2 lg:block">
        <DataTable
          columns={COLUMNS}
          data={actions}
          getRowId={(row) => row.id}
          defaultPageSize={15}
        />
      </div>
    </section>
  );
}
