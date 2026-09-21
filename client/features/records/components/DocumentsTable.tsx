"use client";

import { useMemo, type ReactNode } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  DataTable,
  DataTableAvatar,
  DataTableIdentity,
  DataTableLoadMore,
  type DataTableColumn,
} from "@/components/shared/data-table";
import { DocActionsMenu } from "@/features/records/components/DocActionsMenu";
import {
  DOC_ICON_MAP,
  type DocType,
  type DocumentRow,
} from "@/features/records/data/records-data";
import { BADGE_ICON_SIZE, ICON_STROKE } from "@/lib/icons";

const DOC_TYPE_LABEL: Record<DocType, { label: string }> = {
  lab: { label: "Lab results" },
  imaging: { label: "Imaging" },
  notes: { label: "Notes" },
  medication: { label: "Medication" },
};

function parseFileSize(size: string) {
  const value = parseFloat(size);
  if (Number.isNaN(value)) return 0;
  if (/gb/i.test(size)) return value * 1024;
  if (/kb/i.test(size)) return value / 1024;
  return value;
}

export function DocumentsTable({
  data,
  leading,
  tools,
  subheader,
}: {
  data: DocumentRow[];
  leading?: ReactNode;
  tools?: ReactNode;
  subheader?: ReactNode;
}) {
  const columns = useMemo<DataTableColumn<DocumentRow>[]>(
    () => [
      {
        id: "name",
        header: "Document",
        sortValue: (row) => row.name,
        filterValue: (row) => DOC_TYPE_LABEL[row.type].label,
        filterLabel: "Type",
        cell: (row) => {
          const { icon, bg, color } = DOC_ICON_MAP[row.type];
          return (
            <DataTableIdentity
              leading={
                <DataTableAvatar className={bg}>
                  <HugeiconsIcon
                    icon={icon}
                    size={BADGE_ICON_SIZE}
                    strokeWidth={ICON_STROKE}
                    color={color}
                    absoluteStrokeWidth
                  />
                </DataTableAvatar>
              }
              title={row.name}
              subtitle={DOC_TYPE_LABEL[row.type].label}
            />
          );
        },
      },
      {
        id: "size",
        header: "Size",
        className: "w-28",
        cellClassName: "whitespace-nowrap",
        sortValue: (row) => parseFileSize(row.size),
        sortKind: "number",
        cell: (row) => row.size,
      },
      {
        id: "date",
        header: "Date",
        className: "w-40",
        cellClassName: "whitespace-nowrap",
        sortValue: (row) => Date.parse(row.date),
        cell: (row) => row.date,
      },
      {
        id: "actions",
        header: <span className="sr-only">Actions</span>,
        className: "w-14",
        cellClassName: "text-right",
        cell: () => <DocActionsMenu />,
      },
    ],
    [],
  );

  return (
    <DataTable
      framed={false}
      leading={leading}
      tools={tools}
      subheader={subheader}
      columns={columns}
      data={data}
      getRowId={(row) => row.id}
      footer={<DataTableLoadMore />}
    />
  );
}
