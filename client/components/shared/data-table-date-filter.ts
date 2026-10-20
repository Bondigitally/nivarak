import type {
  DataTableCustomRange,
  DataTableFilterGroup,
  DataTableFilterOption,
} from "@/components/shared/data-table";

/** Shared filter group id — DataTable shows the custom range picker for this value. */
export const DATE_RANGE_FILTER_ID = "dateRange";

export const DATE_RANGE_FILTER_OPTIONS: DataTableFilterOption[] = [
  { value: "7d", label: "Last 7 days" },
  { value: "30d", label: "Last 30 days" },
  { value: "3m", label: "Last 3 months" },
  { value: "6m", label: "Last 6 months" },
  { value: "1y", label: "Last year" },
  { value: "custom", label: "Custom range" },
];

function startOfDay(ms: number) {
  const date = new Date(ms);
  date.setHours(0, 0, 0, 0);
  return date.getTime();
}

export function matchesDateRangeFilter(
  dateMs: number,
  selected: string[],
  custom?: DataTableCustomRange,
) {
  const preset = selected[0];
  if (!preset) return true;
  if (Number.isNaN(dateMs)) return true;

  const rowDay = startOfDay(dateMs);
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
            : preset === "1y"
              ? 365 * day
              : null;

  if (lookback == null) return true;
  return rowDay >= today - lookback && rowDay <= today;
}

/** Standard date/time-range filter used across tables. */
export function createDateRangeFilterGroup<T>(options: {
  label: string;
  getDateMs: (row: T) => number;
}): DataTableFilterGroup<T> {
  return {
    id: DATE_RANGE_FILTER_ID,
    label: options.label,
    mode: "single",
    options: DATE_RANGE_FILTER_OPTIONS,
    matches: (row, selected, custom) =>
      matchesDateRangeFilter(options.getDateMs(row), selected, custom),
  };
}
