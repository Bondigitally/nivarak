"use client";

import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  createColumnHelper,
  type ColumnDef,
  type SortingState,
} from "@tanstack/react-table";
import { useState } from "react";
import { ArrowDown01Icon } from "@hugeicons/core-free-icons";
import { AppIcon } from "@/components/shared/AppIcon";
import { Button } from "@/components/ui/button";
import { dashboardCardClass } from "@/features/dashboard/data/dashboard-styles";
import { SectionTitle } from "@/features/dashboard/components/EmptyState";
import { radius } from "@/lib/tokens/radius";
import { typo } from "@/lib/tokens/typography";
import { cn } from "@/lib/utils";

// ─── Data model ───────────────────────────────────────────────────────────────
interface Recorder {
  initials: string;
  name: string;
  avatarClass: string;
}

interface VitalLogRow {
  id: string;
  date: string;
  time: string;
  bp: string;
  spo2: string;
  temp: string;
  weight: string;
  heartRate: string;
  recorder: Recorder;
}

// ─── Mock data from reference Figma ──────────────────────────────────────────
const LOG_DATA: VitalLogRow[] = [
  {
    id: "r1",
    date: "May 24, 2024",
    time: "09:15 AM",
    bp: "118/78",
    spo2: "99%",
    temp: "98.4°F",
    weight: "78.5 kg",
    heartRate: "72 bpm",
    recorder: { initials: "NS", name: "Nurse Sneha", avatarClass: "bg-primary/10 text-primary" },
  },
  {
    id: "r2",
    date: "May 23, 2024",
    time: "08:00 PM",
    bp: "122/82",
    spo2: "98%",
    temp: "98.6°F",
    weight: "78.7 kg",
    heartRate: "78 bpm",
    recorder: { initials: "RP", name: "Dr. Rahul P.", avatarClass: "bg-info-muted text-info" },
  },
  {
    id: "r3",
    date: "May 23, 2024",
    time: "08:00 PM",
    bp: "122/82",
    spo2: "98%",
    temp: "98.6°F",
    weight: "78.7 kg",
    heartRate: "82 bpm",
    recorder: { initials: "RP", name: "Dr. Rahul P.", avatarClass: "bg-info-muted text-info" },
  },
  {
    id: "r4",
    date: "May 23, 2024",
    time: "08:00 PM",
    bp: "122/82",
    spo2: "98%",
    temp: "98.6°F",
    weight: "78.7 kg",
    heartRate: "76 bpm",
    recorder: { initials: "RP", name: "Dr. Rahul P.", avatarClass: "bg-info-muted text-info" },
  },
  {
    id: "r5",
    date: "May 23, 2024",
    time: "08:00 PM",
    bp: "122/82",
    spo2: "98%",
    temp: "98.6°F",
    weight: "78.7 kg",
    heartRate: "72 bpm",
    recorder: { initials: "RP", name: "Dr. Rahul P.", avatarClass: "bg-info-muted text-info" },
  },
  {
    id: "r6",
    date: "May 23, 2024",
    time: "10:30 AM",
    bp: "120/80",
    spo2: "98%",
    temp: "98.8°F",
    weight: "78.8 kg",
    heartRate: "78 bpm",
    recorder: { initials: "NS", name: "Nurse Sneha", avatarClass: "bg-primary/10 text-primary" },
  },
];

// ─── Column definitions with specific widths & styles from Figma ──────────────
const colHelper = createColumnHelper<VitalLogRow>();

const COLUMNS: ColumnDef<VitalLogRow, string>[] = [
  colHelper.accessor("date", {
    id: "datetime",
    header: "DATE & TIME",
    enableSorting: true,
    sortingFn: "alphanumeric",
    cell: ({ row }) => (
      <div className="flex flex-col justify-start items-start">
        <div className="text-foreground text-sm font-medium leading-5 font-sans">
          {row.original.date}
        </div>
        <div className="text-muted-foreground text-xs font-normal leading-4 font-sans mt-0.5">
          {row.original.time}
        </div>
      </div>
    ),
  }),
  colHelper.accessor("bp", {
    header: "BP",
    enableSorting: false,
    cell: ({ getValue }) => (
      <span className="text-foreground text-sm font-medium leading-5 font-sans">
        {getValue()}
      </span>
    ),
  }),
  colHelper.accessor("spo2", {
    header: "SPO₂",
    enableSorting: false,
    cell: ({ getValue }) => (
      <span className="text-foreground text-sm font-normal leading-5 font-sans">
        {getValue()}
      </span>
    ),
  }),
  colHelper.accessor("temp", {
    header: "TEMP",
    enableSorting: false,
    cell: ({ getValue }) => (
      <span className="text-foreground text-sm font-normal leading-5 font-sans">
        {getValue()}
      </span>
    ),
  }),
  colHelper.accessor("weight", {
    header: "WEIGHT",
    enableSorting: false,
    cell: ({ getValue }) => (
      <span className="text-foreground text-sm font-normal leading-5 font-sans">
        {getValue()}
      </span>
    ),
  }),
  colHelper.accessor("heartRate", {
    header: "Heart rate",
    enableSorting: false,
    cell: ({ getValue }) => (
      <span className="text-foreground text-sm font-normal leading-5 font-sans">
        {getValue()}
      </span>
    ),
  }),
  colHelper.accessor((row) => row.recorder.name, {
    id: "recorder",
    header: "RECORDER",
    enableSorting: true,
    sortingFn: "alphanumeric",
    cell: ({ row }) => {
      const { initials, name, avatarClass } = row.original.recorder;
      return (
        <div className="flex items-center">
          <div className="w-8 h-6 pr-2 flex flex-col justify-start items-start">
            <div className={cn("w-6 h-6 rounded-full flex justify-center items-center font-sans font-bold text-[10px] leading-5 shrink-0", avatarClass)}>
              {initials}
            </div>
          </div>
          <div className="text-foreground text-sm font-normal leading-5 font-sans">
            {name}
          </div>
        </div>
      );
    },
  }),
];

// ─── Sort icon ────────────────────────────────────────────────────────────────
function SortIcon({ direction }: { direction: "asc" | "desc" | false }) {
  return (
    <span className="ml-1.5 inline-flex flex-col gap-[2px] text-tertiary-foreground group-hover:text-muted-foreground transition-colors">
      <svg
        width="8"
        height="5"
        viewBox="0 0 8 5"
        fill="currentColor"
        aria-hidden
        className={cn(direction === "asc" ? "opacity-100" : "opacity-25")}
      >
        <path d="M4 0L7.46 4.5H.54L4 0Z" />
      </svg>
      <svg
        width="8"
        height="5"
        viewBox="0 0 8 5"
        fill="currentColor"
        aria-hidden
        className={cn(direction === "desc" ? "opacity-100" : "opacity-25")}
      >
        <path d="M4 5L.54.5H7.46L4 5Z" />
      </svg>
    </span>
  );
}

const RECENT_LOG_INFO =
  "A chronological list of recorded vitals from you and your care team, including who logged each entry.";

function RecentLogTitle() {
  return (
    <SectionTitle info={RECENT_LOG_INFO} className="flex-none pr-0 text-foreground">
      Recent Log
    </SectionTitle>
  );
}

const LOG_METRICS: {
  key: keyof Pick<VitalLogRow, "bp" | "spo2" | "temp" | "weight" | "heartRate">;
  label: string;
}[] = [
  { key: "bp", label: "BP" },
  { key: "spo2", label: "SpO₂" },
  { key: "temp", label: "Temp" },
  { key: "weight", label: "Weight" },
  { key: "heartRate", label: "Heart rate" },
];

function VitalLogMobileCard({ row }: { row: VitalLogRow }) {
  const { initials, name, avatarClass } = row.recorder;

  return (
    <article className={cn(dashboardCardClass, "p-3")}>
      <header className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-lg font-semibold leading-6 text-foreground">
            {row.date}
          </p>
          <p className={cn(typo.bodyM, "mt-0.5")}>{row.time}</p>
        </div>
        <div
          className={cn(
            radius.full,
            "flex max-w-[55%] shrink-0 items-center gap-1.5 border border-border bg-muted/70 py-1 pr-2.5 pl-1",
          )}
        >
          <span
            className={cn(
              radius.full,
              "flex size-6 shrink-0 items-center justify-center font-sans text-[10px] font-bold leading-none",
              avatarClass,
            )}
          >
            {initials}
          </span>
          <span className={cn(typo.caption, "truncate font-medium text-foreground")}>
            {name}
          </span>
        </div>
      </header>

      <dl
        className={cn(
          radius.md,
          "mt-3 overflow-hidden border border-border bg-muted/70",
        )}
      >
        {LOG_METRICS.map((metric, index) => (
          <div
            key={metric.key}
            className={cn(
              "flex items-center justify-between gap-3 px-3 py-2",
              index > 0 && "border-t border-border",
            )}
          >
            <dt className={cn(typo.caption, "text-muted-foreground")}>
              {metric.label}
            </dt>
            <dd className="font-sans text-sm font-semibold leading-5 tabular-nums text-foreground">
              {row[metric.key]}
            </dd>
          </div>
        ))}
      </dl>
    </article>
  );
}

// ─── Column flex shares — fill the row (no trailing dead space) ───────────────
const COL_WIDTHS: Record<string, string> = {
  datetime: "min-w-[9rem] flex-[1.35]",
  bp: "min-w-[4.5rem] flex-1",
  spo2: "min-w-[4rem] flex-1",
  temp: "min-w-[4.5rem] flex-1",
  weight: "min-w-[5rem] flex-1",
  heartRate: "min-w-[5.5rem] flex-1",
  recorder: "min-w-[10rem] flex-[1.5]",
};

// ─── Component ────────────────────────────────────────────────────────────────
export function VitalsRecentLog() {
  const [sorting, setSorting] = useState<SortingState>([
    { id: "datetime", desc: true },
  ]);

  const table = useReactTable({
    data: LOG_DATA,
    columns: COLUMNS,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getRowId: (row) => row.id,
  });

  const dateSorted = table.getColumn("datetime")?.getIsSorted() ?? false;
  const sortLabel =
    dateSorted === "asc" ? "Oldest" : dateSorted === "desc" ? "Newest" : "Date";

  return (
    <div className="flex w-full flex-col self-stretch">
      <section className="flex w-full flex-col gap-3 lg:hidden">
        <div className="flex items-start justify-between gap-3">
          <RecentLogTitle />
          <Button
            type="button"
            variant="secondary"
            className="h-9 shrink-0 px-3"
            aria-label={`Sort by date, ${sortLabel}`}
            onClick={() => table.getColumn("datetime")?.toggleSorting()}
          >
            <AppIcon
              icon={ArrowDown01Icon}
              className={cn(
                "transition-transform",
                dateSorted === "asc" && "rotate-180",
              )}
            />
            <span className="text-xs">{sortLabel}</span>
          </Button>
        </div>

        <ul className="flex flex-col gap-3">
          {table.getRowModel().rows.map((row) => (
            <li key={row.id}>
              <VitalLogMobileCard row={row.original} />
            </li>
          ))}
        </ul>

        <Button type="button" variant="secondary" className="w-full">
          Load more
        </Button>
      </section>

      <div
        className="hidden flex-col items-start justify-start rounded-md bg-card pt-5 lg:flex"
        style={{ outline: "1px solid var(--border)", outlineOffset: "-1px", boxShadow: "0px 2px 8px rgba(17, 24, 39, 0.05)" }}
      >
      <div className="flex flex-col items-start justify-start self-stretch px-5 pb-5">
        <RecentLogTitle />
      </div>

      {/* Table wrapper */}
      <div className="self-stretch overflow-hidden rounded-b-md bg-card">
        <div className="w-full overflow-x-auto">
          <table className="w-full min-w-[860px] border-collapse">
            <thead>
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  <th colSpan={COLUMNS.length} className="px-0 pt-3 pb-0">
                    {/* Lavender pill header — same as assessments table */}
                    <div className="mx-6 flex h-11 items-center rounded-xl bg-table-header">
                      {headerGroup.headers.map((header) => {
                        const canSort = header.column.getCanSort();
                        const sorted = header.column.getIsSorted();
                        const widthClass = COL_WIDTHS[header.id] || "";
                        return (
                          <div
                            key={header.id}
                            className={cn(
                              "flex h-full min-w-0 items-center px-4 text-left text-xs font-semibold text-muted-foreground font-sans whitespace-nowrap select-none transition-colors",
                              canSort && "cursor-pointer hover:text-foreground",
                              widthClass
                            )}
                            style={{ letterSpacing: "0.3px" }}
                            onClick={canSort ? header.column.getToggleSortingHandler() : undefined}
                          >
                            {header.isPlaceholder ? null : (
                              <span className="inline-flex items-center">
                                {flexRender(header.column.columnDef.header, header.getContext())}
                                {canSort && <SortIcon direction={sorted} />}
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </th>
                </tr>
              ))}
            </thead>

            <tbody>
              {table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  className="hover:bg-accent transition-colors duration-100"
                >
                  <td colSpan={COLUMNS.length} className="px-6 py-0">
                    <div className="flex w-full items-center border-b border-divider">
                      {row.getVisibleCells().map((cell) => {
                        const widthClass = COL_WIDTHS[cell.column.id] || "";
                        return (
                          <div key={cell.id} className={cn("min-w-0 py-3 px-4", widthClass)}>
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                          </div>
                        );
                      })}
                    </div>
                  </td>
                </tr>
              ))}
              {/* Load More row */}
              <tr className="hover:bg-accent transition-colors duration-100">
                <td colSpan={COLUMNS.length} className="px-6 py-0">
                  <div className="flex items-center justify-center py-3">
                    <button
                      type="button"
                      className="text-muted-foreground text-sm font-medium leading-5 font-sans outline-none"
                    >
                      Load More
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      </div>
    </div>
  );
}
