"use client";

import type { ReactNode } from "react";
import Image from "next/image";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowDown01Icon, Calendar03Icon, UserIcon } from "@hugeicons/core-free-icons";
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

export function ProfileSettingsCard({
  profile,
  languageOptions,
  language,
  onLanguageChange,
  onEditProfile,
}: {
  profile: SettingsProfile;
  languageOptions: string[];
  language: string;
  onLanguageChange: (value: string) => void;
  onEditProfile?: () => void;
}) {
  return (
    <section className={cn(dashboardCardClass, "flex flex-col gap-5 p-6")}>
      <SettingsSectionHeader icon={UserIcon} title="Profile" />

      <div className="flex items-center justify-between gap-4">
        <div className="relative size-24 shrink-0 overflow-hidden rounded-md border-2 border-sidebar-accent">
          <Image
            src={profile.avatarSrc}
            alt={`${profile.fullName} profile photo`}
            fill
            sizes="96px"
            className="object-cover"
            priority
          />
        </div>
        <Button
          type="button"
          variant="primary-outline"
          onClick={onEditProfile}
        >
          Edit Profile
        </Button>
      </div>

      <div className={dashboardTwoColGridClass}>
        <Field id="settings-full-name" label="Full Name">
          <input
            id="settings-full-name"
            readOnly
            value={profile.fullName}
            className={authInputClassName}
          />
        </Field>

        <Field id="settings-dob" label="Date of Birth">
          <div className="relative">
            <input
              id="settings-dob"
              readOnly
              value={profile.dateOfBirth}
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

        <Field id="settings-language" label="Preferred Language">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                id="settings-language"
                type="button"
                className={cn(
                  authInputClassName,
                  "inline-flex items-center justify-between gap-2 text-left shadow-[0_2px_4px_rgba(17,24,39,0.05)]",
                )}
              >
                <span className={cn(typo.input, "truncate")}>{language}</span>
                <HugeiconsIcon
                  icon={ArrowDown01Icon}
                  size={19}
                  strokeWidth={1.5}
                  color="currentColor"
                  className="size-[19px] shrink-0 text-muted-foreground"
                absoluteStrokeWidth />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="min-w-(--radix-dropdown-menu-trigger-width)">
              {languageOptions.map((option) => (
                <DropdownMenuItem
                  key={option}
                  onSelect={() => onLanguageChange(option)}
                  className={cn(option === language && "bg-accent text-primary")}
                >
                  {option}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </Field>

        <Field id="settings-phone" label="Contact Number">
          <input
            id="settings-phone"
            readOnly
            value={profile.contactNumber}
            className={authInputClassName}
          />
        </Field>

        <Field
          id="settings-address"
          label="Residential Address"
          className={dashboardTwoColSpanFullClass}
        >
          <textarea
            id="settings-address"
            readOnly
            rows={2}
            value={profile.residentialAddress}
            className={cn(
              authInputClassName,
              "h-auto min-h-11 resize-none py-3 leading-6",
            )}
          />
        </Field>
      </div>
    </section>
  );
}
