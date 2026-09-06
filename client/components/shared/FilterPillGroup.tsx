"use client";

import { cn } from "@/lib/utils";

export type FilterPillOption<T extends string> = {
  id: T;
  label: string;
  count?: number;
};

type FilterPillGroupProps<T extends string> = {
  options: FilterPillOption<T>[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
};

export function FilterPillGroup<T extends string>({
  options,
  value,
  onChange,
  className,
}: FilterPillGroupProps<T>) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-1 rounded-full border border-border bg-card p-1 w-fit",
        className,
      )}
    >
      {options.map((option) => (
        <button
          key={option.id}
          type="button"
          onClick={() => onChange(option.id)}
          className={cn(
            "rounded-full px-4 py-1.5 text-sm font-medium capitalize transition-colors duration-150",
            value === option.id
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          {option.label}
          {option.count !== undefined && (
            <span className={value === option.id ? "opacity-70" : "opacity-50"}>
              {" "}({option.count})
            </span>
          )}
        </button>
      ))}
    </div>
  );
}
