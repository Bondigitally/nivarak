"use client";

import { Cancel01Icon } from "@hugeicons/core-free-icons";

import { AppIcon } from "@/components/shared/AppIcon";
import { fieldInputClassName } from "@/components/ui/input";
import { CgaLanguageAddDropdown } from "@/features/assessments/components/CgaLanguageAddDropdown";
import { CGA_LANGUAGE_OPTIONS } from "@/features/assessments/data/cga-sections-data";
import { radius } from "@/lib/tokens/radius";
import { BADGE_ICON_SIZE } from "@/lib/icons";
import { cn } from "@/lib/utils";

export function CgaVisitDetailsLanguageField({
  value,
  onChange,
}: {
  value: string[];
  onChange: (next: string[]) => void;
}) {
  const available = CGA_LANGUAGE_OPTIONS.filter((opt) => !value.includes(opt.id));

  function addLanguage(id: string) {
    if (!id || value.includes(id)) return;
    onChange([...value, id]);
  }

  function removeLanguage(id: string) {
    onChange(value.filter((v) => v !== id));
  }

  const addOptions = available.map((opt) => ({
    value: opt.id,
    label: opt.label,
  }));
  const allLanguagesAdded = addOptions.length === 0;

  return (
    <div className="flex min-w-0 items-start gap-2">
      <div
        className={cn(
          fieldInputClassName,
          "thin-hover-scroll flex h-11 min-w-0 flex-1 flex-nowrap items-center gap-2 overflow-x-auto overflow-y-hidden overscroll-contain px-2 py-1.5",
        )}
      >
        {value.length === 0 ? (
          <span className="text-sm text-placeholder">No languages added</span>
        ) : (
          value.map((id) => {
            const label =
              CGA_LANGUAGE_OPTIONS.find((opt) => opt.id === id)?.label ?? id;
            return (
              <span
                key={id}
                className={cn(
                  radius.md,
                  "inline-flex shrink-0 items-center gap-1 bg-muted px-2 py-1 text-xs font-medium text-foreground",
                )}
              >
                {label}
                <button
                  type="button"
                  data-cga-edit-only=""
                  aria-label={`Remove ${label}`}
                  onClick={() => removeLanguage(id)}
                  className="text-muted-foreground transition-colors hover:text-foreground"
                >
                  <AppIcon icon={Cancel01Icon} size={BADGE_ICON_SIZE} />
                </button>
              </span>
            );
          })
        )}
      </div>
      <div data-cga-edit-only="" className="h-11 w-[7.5rem] shrink-0">
        <CgaLanguageAddDropdown
          id="cga-language-add"
          compact={false}
          placeholder={allLanguagesAdded ? "All added" : "Add…"}
          options={addOptions}
          disabled={allLanguagesAdded}
          onAdd={addLanguage}
        />
      </div>
    </div>
  );
}