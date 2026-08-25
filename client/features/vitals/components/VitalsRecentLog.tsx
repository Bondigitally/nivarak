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
import { cn } from "@/lib/utils";
import { SectionTitle } from "@/features/dashboard/components/EmptyState";

// ─── Data model ───────────────────────────────────────────────────────────────
interface Recorder {
  initials: string;
  name: string;
  avatarClass: string;
}

export interface VitalLogRow {
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
    recorder: { initials: "NS", name: "Nurse Sneha", avatarClass: "bg-[rgba(108,49,142,0.10)] text-[#6C318E]" },
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
    recorder: { initials: "RP", name: "Dr. Rahul P.", avatarClass: "bg-[#DBEAFE] text-[#1D4ED8]" },
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
    recorder: { initials: "RP", name: "Dr. Rahul P.", avatarClass: "bg-[#DBEAFE] text-[#1D4ED8]" },
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
    recorder: { initials: "RP", name: "Dr. Rahul P.", avatarClass: "bg-[#DBEAFE] text-[#1D4ED8]" },
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
    recorder: { initials: "RP", name: "Dr. Rahul P.", avatarClass: "bg-[#DBEAFE] text-[#1D4ED8]" },
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
    recorder: { initials: "NS", name: "Nurse Sneha", avatarClass: "bg-[rgba(108,49,142,0.10)] text-[#6C318E]" },
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
        <div className="text-[#201A25] text-sm font-medium leading-5 font-sans">
          {row.original.date}
        </div>
        <div className="text-[#615A66] text-xs font-normal leading-4 font-sans mt-0.5">
          {row.original.time}
        </div>
      </div>
    ),
  }),
  colHelper.accessor("bp", {
    header: "BP",
    enableSorting: false,
    cell: ({ getValue }) => (
      <span className="text-[#201A25] text-sm font-medium leading-5 font-sans">
        {getValue()}
      </span>
    ),
  }),
  colHelper.accessor("spo2", {
    header: "SPO₂",
    enableSorting: false,
    cell: ({ getValue }) => (
      <span className="text-[#201A25] text-sm font-normal leading-5 font-sans">
        {getValue()}
      </span>
    ),
  }),
  colHelper.accessor("temp", {
    header: "TEMP",
    enableSorting: false,
    cell: ({ getValue }) => (
      <span className="text-[#201A25] text-sm font-normal leading-5 font-sans">
        {getValue()}
      </span>
    ),
  }),
  colHelper.accessor("weight", {
    header: "WEIGHT",
    enableSorting: false,
    cell: ({ getValue }) => (
      <span className="text-[#201A25] text-sm font-normal leading-5 font-sans">
        {getValue()}
      </span>
    ),
  }),
  colHelper.accessor("heartRate", {
    header: "Heart rate",
    enableSorting: false,
    cell: ({ getValue }) => (
      <span className="text-[#201A25] text-sm font-normal leading-5 font-sans">
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
          <div className="text-[#201A25] text-sm font-normal leading-5 font-sans">
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
    <span className="ml-1.5 inline-flex flex-col gap-[2px] text-[#8A8F98] group-hover:text-[#5F6368] transition-colors">
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
  const [sorting, setSorting] = useState<SortingState>([]);

  const table = useReactTable({
    data: LOG_DATA,
    columns: COLUMNS,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getRowId: (row) => row.id,
  });

  return (
    <div
      className="self-stretch pt-5 bg-white flex flex-col justify-start items-start rounded-[12px]"
      style={{ outline: "1px #E5E2E1 solid", outlineOffset: "-1px", boxShadow: "0px 2px 8px rgba(17, 24, 39, 0.05)" }}
    >
      {/* Title */}
      <div className="self-stretch px-5 pb-5 flex flex-col justify-start items-start">
        <SectionTitle
          info="A chronological list of recorded vitals from you and your care team, including who logged each entry."
          className="flex-none pr-0 text-[#1A1A1A]"
        >
          Recent Log
        </SectionTitle>
      </div>

      {/* Table wrapper */}
      <div className="self-stretch bg-white overflow-hidden rounded-b-[12px]">
        <div className="overflow-x-auto w-full">
          <table className="w-full min-w-[860px] border-collapse">
            <thead>
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  <th colSpan={COLUMNS.length} className="px-0 pt-3 pb-0">
                    {/* Lavender pill header — same as assessments table */}
                    <div className="mx-6 flex h-11 items-center bg-[#F3F0F6] rounded-[14px]">
                      {headerGroup.headers.map((header) => {
                        const canSort = header.column.getCanSort();
                        const sorted = header.column.getIsSorted();
                        const widthClass = COL_WIDTHS[header.id] || "";
                        return (
                          <div
                            key={header.id}
                            className={cn(
                              "flex h-full min-w-0 items-center px-4 text-left text-xs font-semibold text-[#615A66] font-sans whitespace-nowrap select-none transition-colors",
                              canSort && "cursor-pointer hover:text-[#201A25]",
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
                  className="hover:bg-[#FAFAFA] transition-colors duration-100"
                >
                  <td colSpan={COLUMNS.length} className="px-6 py-0">
                    <div className="flex w-full items-center border-b border-[#F0EDF3]">
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
              <tr className="hover:bg-[#FAFAFA] transition-colors duration-100">
                <td colSpan={COLUMNS.length} className="px-6 py-0">
                  <div className="flex items-center justify-center py-3">
                    <button
                      type="button"
                      className="text-[#5F6368] text-sm font-medium leading-5 font-sans outline-none"
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
  );
}
