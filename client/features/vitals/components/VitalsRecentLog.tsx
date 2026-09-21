"use client";

/**
 * VitalsRecentLog renders the same `LOG_DATA` in two responsive layouts:
 *  - Mobile: a scrollable card list with an inline sort toggle.
 *  - Desktop: a `DataTable` with column-header sort controls.
 *
 * TanStack Table (`useReactTable`) is used on the mobile path because mobile
 * needs programmatic date-sort state that mirrors the desktop column sorts,
 * while desktop delegates sorting entirely to the `DataTable` toolbar.
 *
 * "Load more" buttons are UI stubs — no pagination is wired yet (mock data only).
 */

import {
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
} from "@tanstack/react-table";
import { useMemo, useState } from "react";
import { ArrowDown01Icon } from "@hugeicons/core-free-icons";
import { AppIcon } from "@/components/shared/AppIcon";
import {
  DataTable,
  DataTableAvatar,
  DataTableIdentity,
  DataTableLoadMore,
  type DataTableColumn,
} from "@/components/shared/data-table";
import { TableSearch } from "@/components/shared/table-search";
import { Button } from "@/components/ui/button";
import { dashboardCardClass } from "@/features/dashboard/data/dashboard-styles";
import { SectionTitle } from "@/features/dashboard/components/EmptyState";
import { radius } from "@/lib/tokens/radius";
import { typo } from "@/lib/tokens/typography";
import { cn } from "@/lib/utils";

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

const COLUMNS: ColumnDef<VitalLogRow>[] = [
  {
    accessorKey: "date",
    id: "datetime",
    enableSorting: true,
    sortingFn: "alphanumeric",
  },
  {
    accessorFn: (row) => row.recorder.name,
    id: "recorder",
    enableSorting: true,
    sortingFn: "alphanumeric",
  },
];

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

function parseVitalNumber(value: string) {
  const match = value.match(/[\d.]+/);
  return match ? parseFloat(match[0]) : 0;
}

/**
 * Searches across date, time, recorder name, and vital values for a given row.
 * Used for the mobile inline search; desktop search is handled by DataTable.
 */
function matchesLogQuery(row: VitalLogRow, needle: string) {
  return [
    row.date,
    row.time,
    row.bp,
    row.spo2,
    row.temp,
    row.weight,
    row.heartRate,
    row.recorder.name,
  ].some((value) => value.toLowerCase().includes(needle));
}

const TABLE_COLUMNS: DataTableColumn<VitalLogRow>[] = [
  {
    id: "datetime",
    header: "Date & time",
    className: "w-44",
    sortValue: (row) => Date.parse(`${row.date} ${row.time}`),
    cell: (row) => <DataTableIdentity title={row.date} subtitle={row.time} />,
  },
  {
    id: "recorder",
    header: "Recorder",
    className: "w-52",
    sortValue: (row) => row.recorder.name,
    filterValue: (row) => row.recorder.name,
    cell: (row) => (
      <DataTableIdentity
        leading={
          <DataTableAvatar className={row.recorder.avatarClass}>
            {row.recorder.initials}
          </DataTableAvatar>
        }
        title={row.recorder.name}
      />
    ),
  },
  {
    id: "bp",
    header: "BP",
    className: "w-24",
    cellClassName: "font-medium text-foreground tabular-nums",
    sortValue: (row) => parseVitalNumber(row.bp),
    sortKind: "number",
    cell: (row) => row.bp,
  },
  {
    id: "spo2",
    header: "SpO₂",
    className: "w-24",
    cellClassName: "tabular-nums",
    sortValue: (row) => parseVitalNumber(row.spo2),
    sortKind: "number",
    cell: (row) => row.spo2,
  },
  {
    id: "temp",
    header: "Temp",
    className: "w-24",
    cellClassName: "tabular-nums",
    sortValue: (row) => parseVitalNumber(row.temp),
    sortKind: "number",
    cell: (row) => row.temp,
  },
  {
    id: "weight",
    header: "Weight",
    className: "w-24",
    cellClassName: "tabular-nums",
    sortValue: (row) => parseVitalNumber(row.weight),
    sortKind: "number",
    cell: (row) => row.weight,
  },
  {
    id: "heartRate",
    header: "Heart rate",
    className: "w-28",
    cellClassName: "tabular-nums",
    sortValue: (row) => parseVitalNumber(row.heartRate),
    sortKind: "number",
    cell: (row) => row.heartRate,
  },
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

export function VitalsRecentLog() {
  const [query, setQuery] = useState("");
  const [sorting, setSorting] = useState<SortingState>([
    { id: "datetime", desc: true },
  ]);

  const filteredData = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return LOG_DATA;
    return LOG_DATA.filter((row) => matchesLogQuery(row, needle));
  }, [query]);

  const table = useReactTable({
    data: filteredData,
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

  const search = (
    <TableSearch
      value={query}
      onChange={setQuery}
      placeholder="Search log…"
      aria-label="Search recent log"
    />
  );

  return (
    <div className="flex w-full flex-col self-stretch">
      <section className="flex w-full flex-col gap-3 lg:hidden">
        <div className="flex flex-col gap-3">
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
          {search}
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

      <div className="hidden w-full lg:block">
        <DataTable
          leading={<RecentLogTitle />}
          tools={search}
          columns={TABLE_COLUMNS}
          data={filteredData}
          getRowId={(row) => row.id}
          footer={<DataTableLoadMore />}
        />
      </div>
    </div>
  );
}
