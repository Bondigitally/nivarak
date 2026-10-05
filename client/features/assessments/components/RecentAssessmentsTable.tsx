"use client";

import { useMemo, useState } from "react";
import {
  DataTable,
  DataTableAvatar,
  DataTableIdentity,
  type DataTableColumn,
  type DataTableFilterGroup,
} from "@/components/shared/data-table";
import { createDateRangeFilterGroup } from "@/components/shared/data-table-date-filter";
import { TableSearch } from "@/components/shared/table-search";
import { statusBadgeClass } from "@/features/dashboard/data/dashboard-styles";
import { AssessmentActionsMenu } from "@/features/assessments/components/AssessmentActionsMenu";
import { cardTitleClass } from "@/features/dashboard/data/dashboard-styles";
import type {
  AssessmentRow,
  AssessmentStatusType,
} from "@/features/assessments/data/assessments-data";
import { typo } from "@/lib/tokens/typography";
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
  createDateRangeFilterGroup<AssessmentRow>({
    label: "Date completed",
    getDateMs: rowDateMs,
  }),
];

export function RecentAssessmentsHeading() {
  return (
    <div className="flex min-w-0 flex-col gap-0.5">
      <h2 className={cardTitleClass}>Recent Assessments</h2>
      <p className={typo.bodyM}>
        Browse completed assessments and their results over time.
      </p>
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
        sortValue: (row) => row.name,
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
        sortValue: (row) => riskRank(row),
        sortKind: "number",
        cell: (row) => (
          <span className={assessmentResultClass(row.statusType)}>{row.result}</span>
        ),
      },
      {
        id: "date",
        header: "Date completed",
        className: "w-44",
        cellClassName: "whitespace-nowrap",
        sortValue: (row) => rowDateMs(row),
        sortKind: "date",
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
      leading={<RecentAssessmentsHeading />}
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
      defaultPageSize={15}
    />
  );
}
