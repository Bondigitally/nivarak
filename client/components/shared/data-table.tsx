"use client";

import {
  useLayoutEffect,
  useEffect,
  useMemo,
  useRef,
  useState,
  type MouseEvent,
  type ReactNode,
} from "react";
import {
  Cancel01Icon,
  FilterIcon,
} from "@hugeicons/core-free-icons";
import { parseDate, type DateValue } from "@internationalized/date";
import type { RangeValue } from "react-aria-components";
import { AppIcon } from "@/components/shared/AppIcon";
import { ChevronIcon } from "@/components/shared/ChevronIcon";
import { Button } from "@/components/ui/button";
import { JollyDateRangePicker } from "@/components/ui/date-range-picker";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { BADGE_ICON_SIZE } from "@/lib/icons";
import { findScrollParent } from "@/lib/dom";
import { CheckboxIndicator } from "@/components/shared/checkbox-indicator";
import { cardShadowClass } from "@/lib/tokens/elevation";
import { radius } from "@/lib/tokens/radius";
import { cn } from "@/lib/utils";

export type DataTableColumn<T> = {
  id: string;
  header: ReactNode;
  className?: string;
  headerClassName?: string;
  cellClassName?: string;
  cell: (row: T) => ReactNode;
  /** Label in Sort / Filter menus. Inferred from a string `header`. */
  label?: string;
  filterLabel?: string;
  sortValue?: (row: T) => string | number;
  sortKind?: "text" | "date" | "number";
  filterValue?: (row: T) => string;
};

export type DataTableFilterOption = {
  value: string;
  label: string;
};

export type DataTableFilterGroup<T> = {
  id: string;
  label: string;
  /** multi = checkboxes; single = radio (e.g. date range). */
  mode?: "multi" | "single";
  options: DataTableFilterOption[];
  matches: (row: T, selected: string[], custom?: DataTableCustomRange) => boolean;
};

export type DataTableSortChoice<T> = {
  id: string;
  /** Option label. With `group`, shown nested (e.g. "High to Low"). */
  label: string;
  /** Parent label in Sort menu (e.g. "Risk Level"). */
  group?: string;
  compare: (a: T, b: T) => number;
};

export type DataTableCustomRange = {
  from: string;
  to: string;
};

export type DataTableProps<T> = {
  columns: DataTableColumn<T>[];
  data: T[];
  getRowId?: (row: T, index: number) => string;
  empty?: ReactNode;
  footer?: ReactNode;
  className?: string;
  /** Title (or other chrome) on the left of Sort / Filter. */
  leading?: ReactNode;
  /**
   * Card chrome around the table. Default true.
   * Set false when the parent is already a card so the table stays on that surface.
   */
  framed?: boolean;
  /** Filter button. Default true. Sorting is via column headers. */
  toolbar?: boolean;
  /** Optional controls before Filter (e.g. search). */
  tools?: ReactNode;
  /** Row below the toolbar (e.g. segmented tabs). */
  subheader?: ReactNode;
  /** Explicit Filter menu groups. When set, replaces column-derived filters. */
  filterGroups?: DataTableFilterGroup<T>[];
  /**
   * @deprecated Prefer `sortValue` on columns — header click sorting.
   * Still applied when set, but no Sort toolbar is shown.
   */
  sortChoices?: DataTableSortChoice<T>[];
  /** Client-side pagination with page-size dropdown. Default true. Set false to opt out. */
  paginate?: boolean;
  /** Page-size options for `paginate`. Default: 10, 15, 25, 50. */
  pageSizes?: number[];
  /** Initial page size when `paginate` is enabled. Default: first of `pageSizes`. */
  defaultPageSize?: number;
};

const DEFAULT_PAGE_SIZES = [10, 15, 25, 50] as const;

type SortState = { id: string; desc: boolean } | null;

function isoFromDateValue(value: DateValue) {
  return `${value.year}-${String(value.month).padStart(2, "0")}-${String(value.day).padStart(2, "0")}`;
}

function rangeValueFromCustom(
  range: DataTableCustomRange,
): RangeValue<DateValue> | null {
  if (!range.from || !range.to) return null;
  try {
    return { start: parseDate(range.from), end: parseDate(range.to) };
  } catch {
    return null;
  }
}

function columnLabel<T>(column: DataTableColumn<T>) {
  if (column.label) return column.label;
  if (typeof column.header === "string") return column.header;
  return null;
}

function resolveSortKind<T>(column: DataTableColumn<T>): "text" | "date" | "number" {
  if (column.sortKind) return column.sortKind;
  const text = `${column.id} ${columnLabel(column) ?? ""}`.toLowerCase();
  if (/(date|time)/.test(text)) return "date";
  return "text";
}

function preferredSortDesc(kind: "text" | "date" | "number") {
  return kind !== "text";
}

function DataTableChip({
  label,
  onRemove,
}: {
  label: string;
  onRemove: () => void;
}) {
  return (
    <span
      className={cn(
        radius.sm,
        "inline-flex max-w-full items-center gap-0.5 bg-primary/10 py-1 pr-1 pl-2.5 text-xs font-medium leading-4 text-primary",
      )}
    >
      <span className="truncate">{label}</span>
      <button
        type="button"
        aria-label={`Remove ${label}`}
        onClick={onRemove}
        className="flex size-5 shrink-0 items-center justify-center rounded-sm text-primary outline-none hover:bg-primary/15 hover:text-ring"
      >
        <AppIcon icon={Cancel01Icon} size={BADGE_ICON_SIZE} />
      </button>
    </span>
  );
}

function compareSortValues(
  a: string | number,
  b: string | number,
  desc: boolean,
) {
  const cmp =
    typeof a === "number" && typeof b === "number"
      ? a - b
      : String(a).localeCompare(String(b), undefined, {
          numeric: true,
          sensitivity: "base",
        });
  return desc ? -cmp : cmp;
}

export function DataTableAvatar({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      className={cn(
        radius.full,
        "flex size-9 shrink-0 items-center justify-center text-[10px] font-bold leading-none",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function DataTableIdentity({
  leading,
  title,
  subtitle,
}: {
  leading?: ReactNode;
  title: ReactNode;
  subtitle?: ReactNode;
}) {
  return (
    <div className="flex min-w-0 items-center gap-3">
      {leading}
      <div className="min-w-0">
        <p className="truncate text-sm font-medium leading-5 text-foreground">
          {title}
        </p>
        {subtitle ? (
          <p className="mt-0.5 truncate text-xs font-normal leading-4 text-muted-foreground">
            {subtitle}
          </p>
        ) : null}
      </div>
    </div>
  );
}

export function DataTableSortHeader({
  title,
  direction,
  onClick,
}: {
  title: string;
  direction: "asc" | "desc" | false;
  onClick: () => void;
}) {
  const active = direction !== false;
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex cursor-pointer items-center gap-1.5 text-sm font-medium leading-5 select-none",
        "outline-none focus-visible:text-foreground",
        active
          ? "text-foreground"
          : "text-muted-foreground hover:text-foreground",
      )}
    >
      {title}
      <span
        className={cn(
          "inline-flex flex-col gap-0.5",
          active ? "text-primary" : "text-tertiary-foreground",
        )}
      >
        <svg
          width="10"
          height="6"
          viewBox="0 0 10 6"
          fill="none"
          aria-hidden
          className={cn(direction === "asc" ? "opacity-100" : "opacity-30")}
        >
          <path
            d="M2 4.25L5 1.75L8 4.25"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <svg
          width="10"
          height="6"
          viewBox="0 0 10 6"
          fill="none"
          aria-hidden
          className={cn(direction === "desc" ? "opacity-100" : "opacity-30")}
        >
          <path
            d="M2 1.75L5 4.25L8 1.75"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
    </button>
  );
}

export function DataTableLoadMore({ onClick }: { onClick?: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="text-sm font-medium leading-5 text-muted-foreground outline-none transition-colors hover:text-ring"
    >
      Load more
    </button>
  );
}

export function TablePaginationBar({
  total,
  page,
  pageSize,
  pageSizes = [...DEFAULT_PAGE_SIZES],
  onPageChange,
  onPageSizeChange,
}: {
  total: number;
  page: number;
  pageSize: number;
  pageSizes?: number[];
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
}) {
  const pageCount = Math.max(1, Math.ceil(total / pageSize) || 1);
  const safePage = Math.min(Math.max(1, page), pageCount);
  const canPrev = safePage > 1;
  const canNext = safePage < pageCount;
  const pages = buildPaginationItems(safePage, pageCount);

  const pageBtnClass =
    "inline-flex size-8 shrink-0 items-center justify-center rounded-sm border border-border " +
    "font-sans text-sm tabular-nums outline-none transition-colors " +
    "focus-visible:ring-2 focus-visible:ring-primary/30 " +
    "disabled:pointer-events-none disabled:opacity-40";

  return (
    <div className="flex w-full flex-wrap items-center justify-between gap-3 px-5">
      <div className="flex items-center gap-1.5 font-sans text-sm leading-5 text-muted-foreground">
        <span>Showing</span>
        <DropdownMenu modal={false}>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              aria-label={`Rows per page, currently ${pageSize}`}
              className={cn(
                "inline-flex h-8 items-center gap-1 rounded-sm border border-border bg-transparent px-2",
                "font-sans text-sm font-medium text-foreground outline-none",
                "transition-colors hover:bg-accent",
                "focus-visible:ring-2 focus-visible:ring-primary/30",
              )}
            >
              {pageSize}
              <ChevronIcon direction="down" size={14} />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="start"
            className="min-w-20 rounded-md border border-border bg-card p-1 shadow-lg"
          >
            <DropdownMenuRadioGroup
              value={String(pageSize)}
              onValueChange={(value) => onPageSizeChange(Number(value))}
            >
              {pageSizes.map((size) => (
                <DropdownMenuRadioItem
                  key={size}
                  value={String(size)}
                  className="cursor-pointer text-muted-foreground"
                >
                  {size}
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>
        <span>
          of {total} {total === 1 ? "result" : "results"}
        </span>
      </div>

      <nav
        aria-label="Pagination"
        className="flex flex-wrap items-center gap-1.5"
      >
        <button
          type="button"
          aria-label="Previous page"
          disabled={!canPrev}
          onClick={() => onPageChange(safePage - 1)}
          className={cn(
            pageBtnClass,
            "border-transparent bg-transparent text-muted-foreground",
            "hover:border-border hover:text-foreground",
            "active:border-border",
          )}
        >
          <ChevronIcon direction="left" size={16} />
        </button>
        {pages.map((item, index) =>
          item === "ellipsis" ? (
            <span
              key={`ellipsis-${index}`}
              aria-hidden
              className="inline-flex size-8 items-center justify-center font-sans text-sm text-muted-foreground"
            >
              …
            </span>
          ) : (
            <button
              key={item}
              type="button"
              aria-label={`Page ${item}`}
              aria-current={item === safePage ? "page" : undefined}
              onClick={() => onPageChange(item)}
              className={cn(
                pageBtnClass,
                item === safePage
                  ? "border-primary bg-transparent font-medium text-primary hover:bg-transparent"
                  : "bg-transparent text-muted-foreground hover:text-foreground",
              )}
            >
              {item}
            </button>
          ),
        )}
        <button
          type="button"
          aria-label="Next page"
          disabled={!canNext}
          onClick={() => onPageChange(safePage + 1)}
          className={cn(
            pageBtnClass,
            "border-transparent bg-transparent text-muted-foreground",
            "hover:border-border hover:text-foreground",
            "active:border-border",
          )}
        >
          <ChevronIcon direction="right" size={16} />
        </button>
      </nav>
    </div>
  );
}

/** Standard pagination window: 1 2 3 4 5 … N / 1 … 8 9 10 … N / 1 … N-4 … N */
function buildPaginationItems(
  current: number,
  pageCount: number,
  siblingCount = 1,
): Array<number | "ellipsis"> {
  const range = (from: number, to: number) =>
    Array.from({ length: Math.max(0, to - from + 1) }, (_, i) => from + i);

  // first + last + current + 2*siblings + 2 ellipsis placeholders
  const maxButtons = siblingCount * 2 + 5;

  if (pageCount <= maxButtons) {
    return range(1, pageCount);
  }

  const leftSibling = Math.max(current - siblingCount, 1);
  const rightSibling = Math.min(current + siblingCount, pageCount);
  const showLeftEllipsis = leftSibling > 2;
  const showRightEllipsis = rightSibling < pageCount - 1;

  if (!showLeftEllipsis && showRightEllipsis) {
    const leftCount = 3 + 2 * siblingCount;
    return [...range(1, leftCount), "ellipsis", pageCount];
  }

  if (showLeftEllipsis && !showRightEllipsis) {
    const rightCount = 3 + 2 * siblingCount;
    return [1, "ellipsis", ...range(pageCount - rightCount + 1, pageCount)];
  }

  return [
    1,
    "ellipsis",
    ...range(leftSibling, rightSibling),
    "ellipsis",
    pageCount,
  ];
}


function DataTableCheckbox({
  checked,
  indeterminate = false,
  onChange,
  "aria-label": ariaLabel,
}: {
  checked: boolean;
  indeterminate?: boolean;
  onChange: () => void;
  "aria-label": string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.indeterminate = indeterminate;
    }
  }, [indeterminate]);

  return (
    <label className="group relative block size-5 shrink-0 cursor-pointer leading-none">
      <input
        ref={inputRef}
        type="checkbox"
        className="sr-only"
        checked={checked}
        onChange={onChange}
        aria-label={ariaLabel}
      />
      <CheckboxIndicator checked={checked} indeterminate={indeterminate} />
    </label>
  );
}

function ToolbarButton({
  icon,
  label,
  active,
}: {
  icon: typeof FilterIcon;
  label: string;
  active?: boolean;
}) {
  return (
    <Button
      type="button"
      variant="secondary"
      className={cn(
        "shrink-0 border border-border bg-transparent hover:bg-accent",
        active && "border-primary/30 text-primary hover:text-ring",
      )}
    >
      <AppIcon icon={icon} />
      <span className="hidden sm:inline">{label}</span>
    </Button>
  );
}

export function DataTable<T>({
  columns,
  data,
  getRowId,
  empty,
  footer,
  className,
  leading,
  framed = true,
  toolbar = true,
  tools,
  subheader,
  filterGroups,
  sortChoices,
  paginate = true,
  pageSizes,
  defaultPageSize,
}: DataTableProps<T>) {
  const resolvedPageSizes = pageSizes?.length
    ? pageSizes
    : [...DEFAULT_PAGE_SIZES];
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [sort, setSort] = useState<SortState>(null);
  const [sortChoiceId, setSortChoiceId] = useState<string | null>(null);
  const [filters, setFilters] = useState<Record<string, string[]>>({});
  const [customRange, setCustomRange] = useState<DataTableCustomRange>({
    from: "",
    to: "",
  });
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(
    () => defaultPageSize ?? resolvedPageSizes[0] ?? 10,
  );
  const toolbarAnchorRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const pendingAnchorTopRef = useRef<number | null>(null);
  const openMenuCountRef = useRef(0);
  const [cardMinHeight, setCardMinHeight] = useState<number | null>(null);

  function captureToolbarAnchor() {
    const node = toolbarAnchorRef.current;
    if (!node) return;
    pendingAnchorTopRef.current = node.getBoundingClientRect().top;
  }

  function onToolbarMenuOpenChange(open: boolean) {
    openMenuCountRef.current = Math.max(
      0,
      openMenuCountRef.current + (open ? 1 : -1),
    );
    const anyOpen = openMenuCountRef.current > 0;

    if (anyOpen) {
      setCardMinHeight((current) => {
        if (current != null) return current;
        return cardRef.current?.getBoundingClientRect().height ?? null;
      });
      return;
    }

    captureToolbarAnchor();
    setCardMinHeight(null);
  }

  const useCustomFilters = filterGroups != null && filterGroups.length > 0;
  const useCustomSort = sortChoices != null && sortChoices.length > 0;

  const filterableColumns = useMemo(
    () =>
      columns.filter(
        (column) => column.filterValue != null && columnLabel(column) != null,
      ),
    [columns],
  );

  const filterOptions = useMemo(() => {
    const options: Record<string, string[]> = {};
    for (const column of filterableColumns) {
      const values = new Set<string>();
      for (const row of data) {
        values.add(column.filterValue!(row));
      }
      options[column.id] = [...values];
    }
    return options;
  }, [data, filterableColumns]);

  const visibleRows = useMemo(() => {
    let rows = data;

    if (useCustomFilters) {
      rows = rows.filter((row) =>
        filterGroups!.every((group) => {
          const selectedValues = filters[group.id];
          if (!selectedValues || selectedValues.length === 0) return true;
          return group.matches(row, selectedValues, customRange);
        }),
      );
    } else {
      rows = rows.filter((row) =>
        filterableColumns.every((column) => {
          const selectedValues = filters[column.id];
          if (!selectedValues || selectedValues.length === 0) return true;
          return selectedValues.includes(column.filterValue!(row));
        }),
      );
    }

    if (useCustomSort && sortChoiceId) {
      const choice = sortChoices!.find((item) => item.id === sortChoiceId);
      if (choice) {
        rows = [...rows].sort(choice.compare);
      }
    } else if (sort) {
      const column = columns.find((item) => item.id === sort.id);
      if (column?.sortValue) {
        rows = [...rows].sort((a, b) =>
          compareSortValues(column.sortValue!(a), column.sortValue!(b), sort.desc),
        );
      }
    }

    return rows;
  }, [
    columns,
    customRange,
    data,
    filterGroups,
    filterableColumns,
    filters,
    sort,
    sortChoiceId,
    sortChoices,
    useCustomFilters,
    useCustomSort,
  ]);

  const pageCount = Math.max(1, Math.ceil(visibleRows.length / pageSize) || 1);
  const safePage = Math.min(Math.max(1, page), pageCount);

  useEffect(() => {
    if (!paginate) return;
    if (page !== safePage) setPage(safePage);
  }, [paginate, page, safePage]);

  useEffect(() => {
    if (!paginate) return;
    setPage(1);
  }, [paginate, filters, sort, sortChoiceId, customRange, data, pageSize]);

  const pagedRows = useMemo(() => {
    if (!paginate) return visibleRows;
    const start = (safePage - 1) * pageSize;
    return visibleRows.slice(start, start + pageSize);
  }, [paginate, pageSize, safePage, visibleRows]);

  const rowIds = useMemo(
    () =>
      pagedRows.map(
        (row, index) => getRowId?.(row, index) ?? String(index),
      ),
    [pagedRows, getRowId],
  );

  const selectedCount = rowIds.filter((id) => selected.has(id)).length;
  const allSelected = rowIds.length > 0 && selectedCount === rowIds.length;
  const someSelected = selectedCount > 0 && !allSelected;
  const activeFilterCount = Object.values(filters).reduce(
    (count, values) => count + values.length,
    0,
  );

  function toggleAll() {
    setSelected(allSelected ? new Set() : new Set(rowIds));
  }

  function toggleRow(id: string) {
    setSelected((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleFilterValue(groupId: string, value: string, mode: "multi" | "single" = "multi") {
    const clearingCustom =
      value === "custom" &&
      mode === "single" &&
      filters[groupId]?.[0] === "custom";

    captureToolbarAnchor();
    setFilters((current) => {
      if (mode === "single") {
        const existing = current[groupId]?.[0];
        if (existing === value) {
          const next = { ...current };
          delete next[groupId];
          return next;
        }
        return { ...current, [groupId]: [value] };
      }

      const existing = current[groupId] ?? [];
      const nextValues = existing.includes(value)
        ? existing.filter((item) => item !== value)
        : [...existing, value];
      const next = { ...current };
      if (nextValues.length === 0) delete next[groupId];
      else next[groupId] = nextValues;
      return next;
    });

    if (clearingCustom) {
      setCustomRange({ from: "", to: "" });
    }
  }

  const activeFilterChips = useMemo(() => {
    if (useCustomFilters) {
      return filterGroups!.flatMap((group) =>
        (filters[group.id] ?? []).map((value) => {
          const optionLabel =
            group.options.find((option) => option.value === value)?.label ??
            value;
          const isCustomDate = value === "custom";
          const rangeLabel =
            isCustomDate && customRange.from && customRange.to
              ? `${customRange.from} – ${customRange.to}`
              : isCustomDate
                ? "Custom range"
                : null;

          return {
            groupId: group.id,
            value,
            label: `${group.label}: ${rangeLabel ?? optionLabel}`,
            mode: group.mode ?? "multi",
          };
        }),
      );
    }

    return filterableColumns.flatMap((column) =>
      (filters[column.id] ?? []).map((value) => ({
        groupId: column.id,
        value,
        label: `${column.filterLabel ?? columnLabel(column) ?? column.id}: ${value}`,
        mode: "multi" as const,
      })),
    );
  }, [
    customRange.from,
    customRange.to,
    filterGroups,
    filterableColumns,
    filters,
    useCustomFilters,
  ]);

  const showCustomRange =
    useCustomFilters &&
    Object.values(filters).some((values) => values.includes("custom"));
  const showFilterMenu = useCustomFilters || filterableColumns.length > 0;
  const hasFilterChips = activeFilterChips.length > 0;

  const colCount = columns.length + 1;
  const showToolbar = toolbar && showFilterMenu;
  const showTools = tools != null;
  const showSubheader = subheader != null;
  const showHeader =
    leading != null || showToolbar || showTools || showSubheader;

  /*
   * Keep the toolbar's viewport Y stable when row/chip height changes
   * (e.g. applying or clearing a filter) so the page doesn't jump.
   * Event handlers call captureToolbarAnchor() before updating filter/sort
   * state; a scroll listener cannot do this because content clamp fires
   * scroll and would overwrite the pre-update top.
   */
  useLayoutEffect(() => {
    const node = toolbarAnchorRef.current;
    const root = findScrollParent(node);
    if (!node || !root) return;

    const beforeTop = pendingAnchorTopRef.current;
    pendingAnchorTopRef.current = null;
    if (beforeTop == null) return;

    const delta = node.getBoundingClientRect().top - beforeTop;
    if (Math.abs(delta) > 0.5) {
      root.scrollTop += delta;
    }
  }, [
    visibleRows.length,
    hasFilterChips,
    filters,
    sort,
    sortChoiceId,
    customRange,
    cardMinHeight,
  ]);

  function toggleColumnSort(column: DataTableColumn<T>) {
    if (column.sortValue == null) return;
    const preferred = preferredSortDesc(resolveSortKind(column));
    captureToolbarAnchor();
    setSortChoiceId(null);
    setSort((current) => {
      if (current?.id !== column.id) {
        return { id: column.id, desc: preferred };
      }
      if (current.desc === preferred) {
        return { id: column.id, desc: !preferred };
      }
      return null;
    });
  }

  function onRowClick(id: string, event: MouseEvent<HTMLTableRowElement>) {
    const target = event.target;
    if (
      target instanceof Element &&
      target.closest(
        "button, a, input, label, textarea, select, [role='menu'], [role='menuitem']",
      )
    ) {
      return;
    }
    toggleRow(id);
  }

  const table = (
    <>
      {showHeader ? (
        <div className="flex flex-col gap-3 px-5 pt-5 pb-3">
          <div ref={toolbarAnchorRef}>
            <div
              className={cn(
                "flex items-center gap-3 bg-card",
                leading ? "justify-between" : "justify-end",
              )}
            >
              {leading ? <div className="min-w-0">{leading}</div> : null}
              {showTools || showToolbar ? (
                <div className="flex min-w-0 shrink-0 items-center gap-2">
                  {tools}
                  {showToolbar ? (
                    <DropdownMenu
                      modal={false}
                      onOpenChange={onToolbarMenuOpenChange}
                    >
                      <DropdownMenuTrigger asChild>
                        <span>
                          <ToolbarButton
                            icon={FilterIcon}
                            label="Filter"
                            active={activeFilterCount > 0}
                          />
                        </span>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        align="end"
                        className="w-auto max-w-[min(100vw-2rem,56rem)] rounded-md border border-border bg-card p-3 shadow-lg"
                        onCloseAutoFocus={(event) => event.preventDefault()}
                      >
                      {useCustomFilters ? (
                        <div className="flex flex-col gap-4">
                          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:gap-6">
                            {filterGroups!.map((group) => {
                              const mode = group.mode ?? "multi";
                              return (
                                <div
                                  key={group.id}
                                  className="min-w-36 shrink-0"
                                >
                                  <DropdownMenuLabel className="px-1 pt-0 text-xs font-medium text-muted-foreground">
                                    {group.label}
                                  </DropdownMenuLabel>
                                  {mode === "single" ? (
                                    <DropdownMenuRadioGroup
                                      value={(filters[group.id] ?? [])[0] ?? ""}
                                      onValueChange={(value) =>
                                        toggleFilterValue(
                                          group.id,
                                          value,
                                          "single",
                                        )
                                      }
                                    >
                                      {group.options.map((option) => (
                                        <DropdownMenuRadioItem
                                          key={option.value}
                                          value={option.value}
                                          onSelect={(event) =>
                                            event.preventDefault()
                                          }
                                          className="cursor-pointer text-muted-foreground"
                                        >
                                          {option.label}
                                        </DropdownMenuRadioItem>
                                      ))}
                                    </DropdownMenuRadioGroup>
                                  ) : (
                                    group.options.map((option) => (
                                      <DropdownMenuCheckboxItem
                                        key={option.value}
                                        checked={(
                                          filters[group.id] ?? []
                                        ).includes(option.value)}
                                        onCheckedChange={() =>
                                          toggleFilterValue(
                                            group.id,
                                            option.value,
                                          )
                                        }
                                        onSelect={(event) =>
                                          event.preventDefault()
                                        }
                                        className="cursor-pointer text-muted-foreground"
                                      >
                                        {option.label}
                                      </DropdownMenuCheckboxItem>
                                    ))
                                  )}
                                </div>
                              );
                            })}
                          </div>

                          {showCustomRange ? (
                            <div
                              className="border-t border-divider pt-3"
                              onPointerDown={(event) => event.stopPropagation()}
                              onKeyDown={(event) => event.stopPropagation()}
                            >
                              <JollyDateRangePicker
                                label="Custom range"
                                className="min-w-[20rem]"
                                value={rangeValueFromCustom(customRange)}
                                onChange={(value) => {
                                  captureToolbarAnchor();
                                  if (!value) {
                                    setCustomRange({ from: "", to: "" });
                                    return;
                                  }
                                  setCustomRange({
                                    from: isoFromDateValue(value.start),
                                    to: isoFromDateValue(value.end),
                                  });
                                }}
                              />
                            </div>
                          ) : null}

                          {activeFilterCount > 0 ? (
                            <>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => {
                                  captureToolbarAnchor();
                                  setFilters({});
                                  setCustomRange({ from: "", to: "" });
                                }}
                                className="cursor-pointer px-3 py-2 text-muted-foreground hover:bg-background hover:text-primary"
                              >
                                Clear filters
                              </DropdownMenuItem>
                            </>
                          ) : null}
                        </div>
                      ) : (
                        <>
                          {filterableColumns.map((column, index) => {
                            const label =
                              column.filterLabel ?? columnLabel(column);
                            if (!label) return null;
                            const values = filterOptions[column.id] ?? [];
                            return (
                              <div key={column.id}>
                                {index > 0 ? <DropdownMenuSeparator /> : null}
                                <DropdownMenuLabel className="text-xs font-medium text-muted-foreground">
                                  {label}
                                </DropdownMenuLabel>
                                {values.map((value) => (
                                  <DropdownMenuCheckboxItem
                                    key={value}
                                    checked={(filters[column.id] ?? []).includes(
                                      value,
                                    )}
                                    onCheckedChange={() =>
                                      toggleFilterValue(column.id, value)
                                    }
                                    onSelect={(event) => event.preventDefault()}
                                    className="cursor-pointer text-muted-foreground"
                                  >
                                    {value}
                                  </DropdownMenuCheckboxItem>
                                ))}
                              </div>
                            );
                          })}
                          {activeFilterCount > 0 ? (
                            <>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => {
                                  captureToolbarAnchor();
                                  setFilters({});
                                }}
                                className="cursor-pointer px-3 py-2 text-muted-foreground hover:bg-background hover:text-primary"
                              >
                                Clear filters
                              </DropdownMenuItem>
                            </>
                          ) : null}
                        </>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                  ) : null}
                </div>
              ) : null}
            </div>
          </div>

          {showSubheader ? <div className="min-w-0">{subheader}</div> : null}

          {hasFilterChips ? (
            <div className="flex flex-wrap items-center gap-2 [overflow-anchor:none]">
              {activeFilterChips.map((chip) => (
                <DataTableChip
                  key={`${chip.groupId}-${chip.value}`}
                  label={chip.label}
                  onRemove={() =>
                    toggleFilterValue(chip.groupId, chip.value, chip.mode)
                  }
                />
              ))}
              {activeFilterChips.length > 1 ? (
                <button
                  type="button"
                  onClick={() => {
                    captureToolbarAnchor();
                    setFilters({});
                    setCustomRange({ from: "", to: "" });
                  }}
                  className="text-xs font-medium leading-4 text-muted-foreground outline-none hover:text-primary"
                >
                  Clear all
                </button>
              ) : null}
            </div>
          ) : null}
        </div>
      ) : null}

      <div className="horizontal-scroll-stable w-full [overflow-anchor:none]">
        <table className="w-full min-w-160 table-fixed border-collapse">
          <colgroup>
            <col className="w-14" />
            {columns.map((column) => (
              <col key={column.id} className={column.className} />
            ))}
          </colgroup>
          <thead>
            <tr>
              <th
                scope="col"
                className="h-16 w-14 border-b border-border p-0 align-middle"
              >
                <div className="flex h-16 items-center justify-center">
                  <DataTableCheckbox
                    checked={allSelected}
                    indeterminate={someSelected}
                    onChange={toggleAll}
                    aria-label="Select all rows"
                  />
                </div>
              </th>
              {columns.map((column) => {
                const label = columnLabel(column);
                const sortable = column.sortValue != null && label != null;
                const direction =
                  sort?.id === column.id
                    ? sort.desc
                      ? "desc"
                      : "asc"
                    : false;

                return (
                  <th
                    key={column.id}
                    scope="col"
                    aria-sort={
                      direction === "asc"
                        ? "ascending"
                        : direction === "desc"
                          ? "descending"
                          : sortable
                            ? "none"
                            : undefined
                    }
                    className={cn(
                      "h-16 border-b border-border px-4 text-left align-middle text-sm font-medium leading-5 whitespace-nowrap text-muted-foreground",
                      column.className,
                      column.headerClassName,
                    )}
                  >
                    {sortable ? (
                      <DataTableSortHeader
                        title={label}
                        direction={direction}
                        onClick={() => toggleColumnSort(column)}
                      />
                    ) : (
                      column.header
                    )}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {pagedRows.length > 0 ? (
              pagedRows.map((row, rowIndex) => {
                const id = rowIds[rowIndex];
                const isSelected = selected.has(id);

                return (
                  <tr
                    key={id}
                    data-state={isSelected ? "selected" : undefined}
                    aria-selected={isSelected}
                    onClick={(event) => onRowClick(id, event)}
                    className="cursor-pointer transition-colors duration-150 hover:bg-accent data-[state=selected]:bg-muted data-[state=selected]:hover:bg-muted"
                  >
                    <td
                      className={cn(
                        "h-16 w-14 p-0 align-middle",
                        rowIndex > 0 && "border-t border-divider",
                      )}
                    >
                      <div className="flex h-16 items-center justify-center">
                        <DataTableCheckbox
                          checked={isSelected}
                          onChange={() => toggleRow(id)}
                          aria-label={`Select row ${rowIndex + 1}`}
                        />
                      </div>
                    </td>
                    {columns.map((column) => (
                      <td
                        key={column.id}
                        className={cn(
                          "h-16 px-4 align-middle text-sm leading-5 text-muted-foreground",
                          rowIndex > 0 && "border-t border-divider",
                          column.className,
                          column.cellClassName,
                        )}
                      >
                        {column.cell(row)}
                      </td>
                    ))}
                  </tr>
                );
              })
            ) : (
              <tr>
                <td
                  colSpan={colCount}
                  className="h-16 px-4 text-center text-sm text-muted-foreground"
                >
                  {empty ?? (data.length > 0 ? "No matching results." : "No results.")}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {paginate ? (
        <div className="flex min-h-16 items-center border-t border-border py-3">
          <TablePaginationBar
            total={visibleRows.length}
            page={safePage}
            pageSize={pageSize}
            pageSizes={resolvedPageSizes}
            onPageChange={setPage}
            onPageSizeChange={(size) => {
              setPageSize(size);
              setPage(1);
            }}
          />
        </div>
      ) : footer ? (
        <div className="flex h-16 items-center justify-center border-t border-border">
          {footer}
        </div>
      ) : null}
    </>
  );

  if (!framed) {
    return (
      <div
        ref={cardRef}
        className={cn("w-full", className)}
        style={cardMinHeight != null ? { minHeight: cardMinHeight } : undefined}
      >
        {table}
      </div>
    );
  }

  return (
    <div className={cn("w-full", className)}>
      <div
        ref={cardRef}
        className={cn(
          radius.lg,
          "overflow-hidden bg-card",
          cardShadowClass,
        )}
        style={cardMinHeight != null ? { minHeight: cardMinHeight } : undefined}
      >
        {table}
      </div>
    </div>
  );
}
