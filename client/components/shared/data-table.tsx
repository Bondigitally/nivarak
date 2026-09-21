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
  FilterHorizontalIcon,
  Sorting01Icon,
} from "@hugeicons/core-free-icons";
import { parseDate, type DateValue } from "@internationalized/date";
import type { RangeValue } from "react-aria-components";
import { AppIcon } from "@/components/shared/AppIcon";
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
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
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
  /** Sort + Filter buttons. Default true. */
  toolbar?: boolean;
  /** Optional controls before Sort / Filter (e.g. search). */
  tools?: ReactNode;
  /** Row below the toolbar (e.g. segmented tabs). */
  subheader?: ReactNode;
  /** Explicit Filter menu groups. When set, replaces column-derived filters. */
  filterGroups?: DataTableFilterGroup<T>[];
  /** Flat Sort menu choices. When set, replaces nested column sort. */
  sortChoices?: DataTableSortChoice<T>[];
};

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

function sortDirectionLabel(kind: "text" | "date" | "number", desc: boolean) {
  if (kind === "date") return desc ? "Newest first" : "Oldest first";
  if (kind === "number") return desc ? "High to low" : "Low to high";
  return desc ? "Z to A" : "A to Z";
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
        radius.full,
        "inline-flex max-w-full items-center gap-0.5 bg-muted py-1 pr-1 pl-2.5 text-xs font-medium leading-4 text-primary",
      )}
    >
      <span className="truncate">{label}</span>
      <button
        type="button"
        aria-label={`Remove ${label}`}
        onClick={onRemove}
        className="flex size-5 shrink-0 items-center justify-center rounded-full text-primary hover:text-ring hover:bg-ring/10"
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
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-1.5 text-sm font-medium leading-5 text-muted-foreground select-none hover:text-foreground"
    >
      {title}
      <span className="inline-flex flex-col gap-px text-tertiary-foreground">
        <svg width="8" height="5" viewBox="0 0 8 5" fill="currentColor" aria-hidden className={cn(direction === "asc" ? "opacity-100" : "opacity-25")}>
          <path d="M4 0L7.46 4.5H.54L4 0Z" />
        </svg>
        <svg width="8" height="5" viewBox="0 0 8 5" fill="currentColor" aria-hidden className={cn(direction === "desc" ? "opacity-100" : "opacity-25")}>
          <path d="M4 5L.54.5H7.46L4 5Z" />
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
  icon: typeof Sorting01Icon;
  label: string;
  active?: boolean;
}) {
  return (
    <Button
      type="button"
      variant="secondary"
      className={cn(
        "h-11 shrink-0",
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
}: DataTableProps<T>) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [sort, setSort] = useState<SortState>(null);
  const [sortChoiceId, setSortChoiceId] = useState<string | null>(null);
  const [filters, setFilters] = useState<Record<string, string[]>>({});
  const [customRange, setCustomRange] = useState<DataTableCustomRange>({
    from: "",
    to: "",
  });
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

  const sortableColumns = useMemo(
    () =>
      columns.filter(
        (column) => column.sortValue != null && columnLabel(column) != null,
      ),
    [columns],
  );
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

  const rowIds = useMemo(
    () =>
      visibleRows.map(
        (row, index) => getRowId?.(row, index) ?? String(index),
      ),
    [visibleRows, getRowId],
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
      groupId === "dateCompleted" &&
      value === "custom" &&
      mode === "single" &&
      filters.dateCompleted?.[0] === "custom";

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
          const isCustomDate =
            group.id === "dateCompleted" && value === "custom";
          const rangeLabel =
            isCustomDate && customRange.from && customRange.to
              ? `${customRange.from} – ${customRange.to}`
              : null;

          return {
            groupId: group.id,
            value,
            label: rangeLabel ?? optionLabel,
            mode: group.mode ?? "multi",
          };
        }),
      );
    }

    return filterableColumns.flatMap((column) =>
      (filters[column.id] ?? []).map((value) => ({
        groupId: column.id,
        value,
        label: value,
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

  const sortChipLabel = useMemo(() => {
    if (useCustomSort && sortChoiceId) {
      const choice = sortChoices!.find((item) => item.id === sortChoiceId);
      if (!choice) return null;
      return choice.group
        ? `${choice.group} — ${choice.label}`
        : choice.label;
    }
    if (!sort) return null;
    const column = columns.find((item) => item.id === sort.id);
    if (!column) return null;
    return `${columnLabel(column) ?? column.id} · ${sortDirectionLabel(resolveSortKind(column), sort.desc)}`;
  }, [columns, sort, sortChoiceId, sortChoices, useCustomSort]);

  const sortChoiceGroups = useMemo(() => {
    if (!useCustomSort) return [];
    const groups: { label: string; options: DataTableSortChoice<T>[] }[] = [];
    const indexByLabel = new Map<string, number>();

    for (const choice of sortChoices!) {
      const label = choice.group ?? "";
      if (!label) {
        groups.push({ label: "", options: [choice] });
        continue;
      }
      const existing = indexByLabel.get(label);
      if (existing == null) {
        indexByLabel.set(label, groups.length);
        groups.push({ label, options: [choice] });
      } else {
        groups[existing].options.push(choice);
      }
    }
    return groups;
  }, [sortChoices, useCustomSort]);

  const showCustomRange =
    useCustomFilters && (filters.dateCompleted ?? []).includes("custom");
  const hasChips = activeFilterChips.length > 0 || sortChipLabel != null;
  const sortMenuActive = useCustomSort
    ? sortChoiceId != null
    : sort != null;
  const showSortMenu = useCustomSort || sortableColumns.length > 0;
  const showFilterMenu = useCustomFilters || filterableColumns.length > 0;

  const colCount = columns.length + 1;
  const showToolbar = toolbar && (showSortMenu || showFilterMenu);
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
  }, [visibleRows.length, hasChips, filters, sort, sortChoiceId, customRange, cardMinHeight]);

  function clearAll() {
    captureToolbarAnchor();
    setFilters({});
    setSort(null);
    setSortChoiceId(null);
    setCustomRange({ from: "", to: "" });
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
                    <>
                  {showSortMenu ? (
                    <DropdownMenu
                      modal={false}
                      onOpenChange={onToolbarMenuOpenChange}
                    >
                      <DropdownMenuTrigger asChild>
                        <span>
                          <ToolbarButton
                            icon={Sorting01Icon}
                            label="Sort"
                            active={sortMenuActive}
                          />
                        </span>
                      </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="end"
                      className="w-64 rounded-md border border-border bg-card p-1 shadow-lg"
                      onCloseAutoFocus={(event) => event.preventDefault()}
                    >
                      <DropdownMenuLabel className="text-xs font-medium text-muted-foreground">
                        Sort by
                      </DropdownMenuLabel>
                      {useCustomSort ? (
                        sortChoiceGroups.map((group) => {
                          if (!group.label) {
                            return (
                              <div key={group.options[0]?.id ?? "ungrouped"}>
                                {group.options.map((choice) => (
                                  <DropdownMenuItem
                                    key={choice.id}
                                    onClick={() => {
                                      captureToolbarAnchor();
                                      setSortChoiceId(choice.id);
                                    }}
                                    onSelect={(event) => event.preventDefault()}
                                    className={cn(
                                      "cursor-pointer px-3 py-2 text-muted-foreground hover:bg-background hover:text-primary",
                                      sortChoiceId === choice.id && "text-primary",
                                    )}
                                  >
                                    {choice.label}
                                  </DropdownMenuItem>
                                ))}
                              </div>
                            );
                          }

                          const activeChoice = group.options.find(
                            (option) => option.id === sortChoiceId,
                          );
                          return (
                            <DropdownMenuSub key={group.label}>
                              <DropdownMenuSubTrigger className="cursor-pointer px-3 py-2 text-muted-foreground focus:bg-background focus:text-primary data-[state=open]:bg-background data-[state=open]:text-primary">
                                <span className="min-w-0 flex-1 truncate">
                                  {group.label}
                                </span>
                                {activeChoice ? (
                                  <span className="mr-1 shrink-0 text-xs text-primary">
                                    {activeChoice.label}
                                  </span>
                                ) : null}
                              </DropdownMenuSubTrigger>
                              <DropdownMenuSubContent className="w-48 rounded-md border border-border bg-card p-1 shadow-lg">
                                <DropdownMenuRadioGroup
                                  value={activeChoice?.id ?? ""}
                                  onValueChange={(value) => {
                                    captureToolbarAnchor();
                                    setSortChoiceId(value);
                                  }}
                                >
                                  {group.options.map((choice) => (
                                    <DropdownMenuRadioItem
                                      key={choice.id}
                                      value={choice.id}
                                      onSelect={(event) => event.preventDefault()}
                                      className="cursor-pointer text-muted-foreground"
                                    >
                                      {choice.label}
                                    </DropdownMenuRadioItem>
                                  ))}
                                </DropdownMenuRadioGroup>
                              </DropdownMenuSubContent>
                            </DropdownMenuSub>
                          );
                        })
                      ) : (
                        sortableColumns.map((column) => {
                          const label = columnLabel(column);
                          if (!label || column.sortValue == null) return null;
                          const kind = resolveSortKind(column);
                          const preferred = preferredSortDesc(kind);
                          const active = sort?.id === column.id;
                          return (
                            <DropdownMenuSub key={column.id}>
                              <DropdownMenuSubTrigger className="cursor-pointer px-3 py-2 text-muted-foreground focus:bg-background focus:text-primary data-[state=open]:bg-background data-[state=open]:text-primary">
                                <span className="min-w-0 flex-1 truncate">{label}</span>
                                {active ? (
                                  <span className="mr-1 shrink-0 text-xs text-primary">
                                    {sortDirectionLabel(kind, sort.desc)}
                                  </span>
                                ) : null}
                              </DropdownMenuSubTrigger>
                              <DropdownMenuSubContent className="w-44 rounded-md border border-border bg-card p-1 shadow-lg">
                                <DropdownMenuRadioGroup
                                  value={active ? (sort.desc ? "desc" : "asc") : ""}
                                  onValueChange={(value) => {
                                    captureToolbarAnchor();
                                    setSort({
                                      id: column.id,
                                      desc: value === "desc",
                                    });
                                  }}
                                >
                                  <DropdownMenuRadioItem
                                    value={preferred ? "desc" : "asc"}
                                    onSelect={(event) => event.preventDefault()}
                                    className="cursor-pointer text-muted-foreground"
                                  >
                                    {sortDirectionLabel(kind, preferred)}
                                  </DropdownMenuRadioItem>
                                  <DropdownMenuRadioItem
                                    value={preferred ? "asc" : "desc"}
                                    onSelect={(event) => event.preventDefault()}
                                    className="cursor-pointer text-muted-foreground"
                                  >
                                    {sortDirectionLabel(kind, !preferred)}
                                  </DropdownMenuRadioItem>
                                </DropdownMenuRadioGroup>
                              </DropdownMenuSubContent>
                            </DropdownMenuSub>
                          );
                        })
                      )}
                      {sortMenuActive ? (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => {
                              captureToolbarAnchor();
                              setSort(null);
                              setSortChoiceId(null);
                            }}
                            className="cursor-pointer px-3 py-2 text-muted-foreground hover:bg-background hover:text-primary"
                          >
                            Clear sort
                          </DropdownMenuItem>
                        </>
                      ) : null}
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : null}

                {showFilterMenu ? (
                  <DropdownMenu
                    modal={false}
                    onOpenChange={onToolbarMenuOpenChange}
                  >
                    <DropdownMenuTrigger asChild>
                      <span>
                        <ToolbarButton
                          icon={FilterHorizontalIcon}
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
                                  setCustomRange({ from: "", to: "" });
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
                    </>
                  ) : null}
                </div>
              ) : null}
            </div>
          </div>

          {showSubheader ? <div className="min-w-0">{subheader}</div> : null}

          {hasChips ? (
            <div className="flex flex-col gap-2 [overflow-anchor:none]">
              <div className="flex flex-wrap items-center gap-2">
                {sortChipLabel ? (
                  <DataTableChip
                    label={sortChipLabel}
                    onRemove={() => {
                      captureToolbarAnchor();
                      setSort(null);
                      setSortChoiceId(null);
                    }}
                  />
                ) : null}
                {activeFilterChips.map((chip) => (
                  <DataTableChip
                    key={`${chip.groupId}-${chip.value}`}
                    label={chip.label}
                    onRemove={() =>
                      toggleFilterValue(chip.groupId, chip.value, chip.mode)
                    }
                  />
                ))}
                {activeFilterChips.length > 1 ||
                (sortChipLabel != null && activeFilterChips.length > 0) ? (
                  <button
                    type="button"
                    onClick={clearAll}
                    className="text-xs font-medium leading-4 text-muted-foreground outline-none hover:text-primary"
                  >
                    Clear all
                  </button>
                ) : null}
              </div>
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
              {columns.map((column) => (
                <th
                  key={column.id}
                  scope="col"
                  className={cn(
                    "h-16 border-b border-border px-4 text-left align-middle text-sm font-medium leading-5 whitespace-nowrap text-muted-foreground",
                    column.className,
                    column.headerClassName,
                  )}
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {visibleRows.length > 0 ? (
              visibleRows.map((row, rowIndex) => {
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
      {footer ? (
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
