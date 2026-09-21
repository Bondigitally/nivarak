"use client";

import { useEffect, useId, useState, type FormEvent, type ReactNode } from "react";
import Image from "next/image";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowDown01Icon,
  Calendar03Icon,
  UserIcon,
} from "@hugeicons/core-free-icons";
import { authInputClassName } from "@/features/auth/components/primitives/AuthField";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  dashboardCardClass,
  dashboardTwoColGridClass,
  dashboardTwoColSpanFullClass,
} from "@/features/dashboard/data/dashboard-styles";
import { typo } from "@/lib/tokens/typography";
import { cn } from "@/lib/utils";
import { SettingsSectionHeader } from "./SettingsSectionHeader";
import type { SettingsProfile } from "../data/settings-data";

const fieldLabelClass = "text-sm font-medium leading-5 text-muted-foreground";

function Field({
  id,
  label,
  children,
  className,
}: {
  id: string;
  label: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-2.5 pt-0.5", className)}>
      <label htmlFor={id} className={fieldLabelClass}>
        {label}
      </label>
      {children}
    </div>
  );
}

export function EditProfileSection({
  profile,
  languageOptions,
  className,
  onDiscard,
  onSave,
}: {
  profile: SettingsProfile;
  languageOptions: string[];
  className?: string;
  onDiscard?: () => void;
  onSave?: (values: SettingsProfile) => void | Promise<void>;
}) {
  const baseId = useId();
  const [draft, setDraft] = useState(profile);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const id = window.setTimeout(() => setDraft(profile), 0);
    return () => window.clearTimeout(id);
  }, [profile]);

  const isDirty =
    draft.fullName !== profile.fullName ||
    draft.dateOfBirth !== profile.dateOfBirth ||
    draft.preferredLanguage !== profile.preferredLanguage ||
    draft.contactNumber !== profile.contactNumber ||
    draft.residentialAddress !== profile.residentialAddress;

  function updateDraft<K extends keyof SettingsProfile>(
    key: K,
    value: SettingsProfile[K],
  ) {
    setDraft((current) => ({ ...current, [key]: value }));
  }

  function handleDiscard() {
    setDraft(profile);
    onDiscard?.();
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!isDirty || saving) return;
    setSaving(true);
    try {
      await onSave?.(draft);
    } finally {
      setSaving(false);
    }
  }

  return (
    <section
      className={cn(
        dashboardCardClass,
        "flex flex-col gap-5 p-6 shadow-[0_2px_5px_rgba(17,24,39,0.05)]",
        className,
      )}
      aria-labelledby={`${baseId}-title`}
    >
      <SettingsSectionHeader
        icon={UserIcon}
        title="Profile"
        className="[&_h2]:text-[24px] [&_h2]:leading-8"
      />
      <span id={`${baseId}-title`} className="sr-only">
        Edit profile
      </span>

      <div className="flex items-center">
        <div className="relative size-24 shrink-0 overflow-hidden rounded-md border-2 border-sidebar-accent">
          <Image
            src={draft.avatarSrc}
            alt={`${draft.fullName} profile photo`}
            fill
            sizes="96px"
            className="object-cover"
            priority
          />
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <div className={dashboardTwoColGridClass}>
          <Field id={`${baseId}-fullName`} label="Full Name">
            <input
              id={`${baseId}-fullName`}
              name="fullName"
              autoComplete="name"
              value={draft.fullName}
              onChange={(event) => updateDraft("fullName", event.target.value)}
              className={authInputClassName}
            />
          </Field>

          <Field id={`${baseId}-dob`} label="Date of Birth">
            <div className="relative">
              <input
                id={`${baseId}-dob`}
                name="dateOfBirth"
                inputMode="numeric"
                placeholder="DD/MM/YYYY"
                value={draft.dateOfBirth}
                onChange={(event) =>
                  updateDraft("dateOfBirth", event.target.value)
                }
                className={cn(authInputClassName, "pr-11")}
              />
              <span
                className="pointer-events-none absolute top-1/2 right-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden
              >
                <HugeiconsIcon
                  icon={Calendar03Icon}
                  size={19}
                  strokeWidth={1.5}
                  color="currentColor"
                  className="size-[19px]"
                absoluteStrokeWidth />
              </span>
            </div>
          </Field>

          <Field id={`${baseId}-language`} label="Preferred Language">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  id={`${baseId}-language`}
                  type="button"
                  className={cn(
                    authInputClassName,
                    "inline-flex items-center justify-between gap-2 text-left shadow-[0_2px_4px_rgba(17,24,39,0.05)]",
                  )}
                >
                  <span className={cn(typo.input, "truncate")}>
                    {draft.preferredLanguage}
                  </span>
                  <HugeiconsIcon
                    icon={ArrowDown01Icon}
                    size={19}
                    strokeWidth={1.5}
                    color="currentColor"
                    className="size-[19px] shrink-0 text-muted-foreground"
                  absoluteStrokeWidth />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="start"
                sideOffset={8}
                className="min-w-(--radix-dropdown-menu-trigger-width) rounded-md border-border bg-card p-1.5 shadow-md"
              >
                {languageOptions.map((option) => (
                  <DropdownMenuItem
                    key={option}
                    onSelect={() => updateDraft("preferredLanguage", option)}
                    className={cn(
                      "cursor-pointer rounded-sm px-3 py-2.5",
                      typo.input,
                      option === draft.preferredLanguage && "bg-background",
                    )}
                  >
                    {option}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </Field>

          <Field id={`${baseId}-phone`} label="Contact Number">
            <input
              id={`${baseId}-phone`}
              name="contactNumber"
              type="tel"
              autoComplete="tel"
              value={draft.contactNumber}
              onChange={(event) =>
                updateDraft("contactNumber", event.target.value)
              }
              className={authInputClassName}
            />
          </Field>

          <Field
            id={`${baseId}-address`}
            label="Residential Address"
            className={dashboardTwoColSpanFullClass}
          >
            <textarea
              id={`${baseId}-address`}
              name="residentialAddress"
              autoComplete="street-address"
              rows={2}
              value={draft.residentialAddress}
              onChange={(event) =>
                updateDraft("residentialAddress", event.target.value)
              }
              className={cn(
                authInputClassName,
                "h-auto min-h-11 resize-none py-3 leading-6 shadow-[0_2px_8px_rgba(17,24,39,0.05)]",
              )}
            />
          </Field>
        </div>

        <div className="flex flex-wrap items-center justify-end gap-4 py-4">
          <Button
            type="button"
            variant="secondary"
            onClick={handleDiscard}
            className="shadow-[0_1px_1px_rgba(17,24,39,0.04)]"
          >
            Discard Changes
          </Button>
          <Button
            type="submit"
            loading={saving}
            disabled={!isDirty}
            className="shadow-[0_8px_18px_rgba(108,49,142,0.15)]"
          >
            Save changes
          </Button>
        </div>
      </form>
    </section>
  );
}
