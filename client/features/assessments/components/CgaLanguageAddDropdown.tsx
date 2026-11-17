"use client";

import { CgaSelect } from "@/features/assessments/components/CgaSelect";

export type CgaLanguageAddDropdownProps = {
  id?: string;
  options: readonly { value: string; label: string }[];
  onAdd: (languageId: string) => void;
  disabled?: boolean;
  placeholder?: string;
  /** Inline chip-row trigger (default). */
  compact?: boolean;
};

export function CgaLanguageAddDropdown({
  id,
  options,
  onAdd,
  disabled = false,
  placeholder = "Add…",
  compact = true,
}: CgaLanguageAddDropdownProps) {
  const noOptions = options.length === 0;

  return (
    <CgaSelect
      id={id}
      compact={compact}
      aria-label="Add language"
      value=""
      placeholder={placeholder}
      options={options}
      disabled={disabled || noOptions}
      onChange={(next) => {
        if (next) onAdd(next);
      }}
    />
  );
}