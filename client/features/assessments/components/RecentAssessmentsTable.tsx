"use client";

import { useMemo, useState } from "react";
import {
  DataTable,
  DataTableAvatar,
  DataTableIdentity,
  DataTableLoadMore,
  type DataTableColumn,
  type DataTableCustomRange,
  type DataTableFilterGroup,
  type DataTableSortChoice,
} from "@/components/shared/data-table";
import { TableSearch } from "@/components/shared/table-search";
import { statusBadgeClass } from "@/features/dashboard/data/dashboard-styles";
import { AssessmentActionsMenu } from "@/features/assessments/components/AssessmentActionsMenu";
import { SectionInfoButton } from "@/features/dashboard/components/EmptyState";
import { cardTitleClass } from "@/features/dashboard/data/dashboard-styles";
import type {
  AssessmentRow,
  AssessmentStatusType,
} from "@/features/assessments/data/assessments-data";
import { cn } from "@/lib/utils";

export function assessmentResultClass(statusType: AssessmentStatusType) {
  return cn(
    statusBadgeClass,
    "shrink-0 gap-1.5 border",
    statusType === "normal" && "border-success-muted bg-success-muted text-success",
    statusType === "mid" && "border-warning-muted bg-warning-muted text-warning",
    statusType === "high" && "border-destructive-muted bg-destructive-muted text-destructive",
  );
}

function assessmentCode(name: string) {
  const match = name.match(/\(([^)]+)\)\s*$/);
  return match?.[1] ?? name.slice(0, 3).toUpperCase();
}

function assessmentType(name: string) {
  const code = assessmentCode(name);
  if (code === "IAS" || code === "IASP") return "IAS";
  return code;
}

function riskLevel(row: AssessmentRow) {
  if (row.statusType === "high" || row.result === "High Risk") return "High";
  if (row.statusType === "mid" || row.result === "Mid Risk") return "Mid";
  return "Low";
}

function riskRank(row: AssessmentRow) {
  const level = riskLevel(row);
  if (level === "High") return 2;
  if (level === "Mid") return 1;
  return 0;
}

function rowDateMs(row: AssessmentRow) {
  return Date.parse(row.date);
}

function startOfDay(ms: number) {
  const date = new Date(ms);
  date.setHours(0, 0, 0, 0);
  return date.getTime();
}

function matchesDateCompleted(
  row: AssessmentRow,
  selected: string[],
  custom?: DataTableCustomRange,
) {
  const preset = selected[0];
  if (!preset) return true;

  const rowDay = startOfDay(rowDateMs(row));
  const today = startOfDay(Date.now());
  const day = 24 * 60 * 60 * 1000;

  if (preset === "custom") {
    const from = custom?.from ? startOfDay(Date.parse(custom.from)) : null;
    const to = custom?.to ? startOfDay(Date.parse(custom.to)) : null;
    if (from != null && !Number.isNaN(from) && rowDay < from) return false;
    if (to != null && !Number.isNaN(to) && rowDay > to) return false;
    return true;
  }

  const lookback =
    preset === "7d"
      ? 7 * day
      : preset === "30d"
        ? 30 * day
        : preset === "3m"
          ? 90 * day
          : preset === "6m"
            ? 180 * day
            : null;

  if (lookback == null) return true;
  return rowDay >= today - lookback && rowDay <= today;
}

const FILTER_GROUPS: DataTableFilterGroup<AssessmentRow>[] = [
  {
    id: "assessment",
    label: "Assessment",
    options: [
      { value: "IAS", label: "IAS" },
      { value: "CGA", label: "CGA" },
    ],
    matches: (row, selected) => selected.includes(assessmentType(row.name)),
  },
  {
    id: "riskLevel",
    label: "Risk Level",
    options: [
      { value: "Low", label: "Low" },
      { value: "Mid", label: "Mid" },
      { value: "High", label: "High" },
    ],
    matches: (row, selected) => selected.includes(riskLevel(row)),
  },
  {
    id: "dateCompleted",
    label: "Date Completed",
    mode: "single",
    options: [
      { value: "7d", label: "Last 7 days" },
      { value: "30d", label: "Last 30 days" },
      { value: "3m", label: "Last 3 months" },
      { value: "6m", label: "Last 6 months" },
      { value: "custom", label: "Custom" },
    ],
    matches: matchesDateCompleted,
  },
];

const SORT_CHOICES: DataTableSortChoice<AssessmentRow>[] = [
  {
    id: "date-newest",
    group: "Date Completed",
    label: "Newest first",
    compare: (a, b) => rowDateMs(b) - rowDateMs(a),
  },
  {
    id: "date-oldest",
    group: "Date Completed",
    label: "Oldest first",
    compare: (a, b) => rowDateMs(a) - rowDateMs(b),
  },
  {
    id: "risk-high-low",
    group: "Risk Level",
    label: "High to Low",
    compare: (a, b) => riskRank(b) - riskRank(a) || rowDateMs(b) - rowDateMs(a),
  },
  {
    id: "risk-low-high",
    group: "Risk Level",
    label: "Low to High",
    compare: (a, b) => riskRank(a) - riskRank(b) || rowDateMs(b) - rowDateMs(a),
  },
];

export function RecentAssessmentsHeading({ count }: { count: number }) {
  return (
    <div className="flex min-w-0 items-center gap-2">
      <h2 className={cardTitleClass}>
        Recent Assessments
      </h2>
      <span className={cn(statusBadgeClass, "bg-muted text-primary")}>
        {count}
      </span>
      <SectionInfoButton info="Completed health assessments and their results over time. Open a row to view or download the report." />
    </div>
  );
}

export function RecentAssessmentsTable({ data }: { data: AssessmentRow[] }) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return data;
    return data.filter((row) =>
      [row.name, row.result, row.date].some((value) =>
        value.toLowerCase().includes(needle),
      ),
    );
  }, [data, query]);

  const columns = useMemo<DataTableColumn<AssessmentRow>[]>(
    () => [
      {
        id: "name",
        header: "Assessment",
        cell: (row) => (
          <DataTableIdentity
            leading={
              <DataTableAvatar className="bg-muted text-primary">
                {assessmentCode(row.name)}
              </DataTableAvatar>
            }
            title={row.name}
          />
        ),
      },
      {
        id: "result",
        header: "Result",
        className: "w-40",
        cell: (row) => (
          <span className={assessmentResultClass(row.statusType)}>{row.result}</span>
        ),
      },
      {
        id: "date",
        header: "Date completed",
        className: "w-44",
        cellClassName: "whitespace-nowrap",
        cell: (row) => row.date,
      },
      {
        id: "actions",
        header: <span className="sr-only">Actions</span>,
        className: "w-14",
        cellClassName: "text-right",
        cell: () => <AssessmentActionsMenu />,
      },
    ],
    [],
  );

  return (
    <DataTable
      leading={<RecentAssessmentsHeading count={filtered.length} />}
      tools={
        <TableSearch
          value={query}
          onChange={setQuery}
          placeholder="Search assessments…"
          aria-label="Search assessments"
        />
      }
      columns={columns}
      data={filtered}
      getRowId={(row, index) => `${row.name}-${row.date}-${index}`}
      filterGroups={FILTER_GROUPS}
      sortChoices={SORT_CHOICES}
      footer={<DataTableLoadMore />}
    />
  );
}
