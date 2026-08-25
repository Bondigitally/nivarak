"use client";

import { useEffect, useState } from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowDown01Icon,
  Cancel01Icon,
  InformationCircleIcon,
} from "@hugeicons/core-free-icons";
import {
  Dialog,
  DialogClose,
  DialogDescription,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSidebar } from "@/components/layout/sidebar-context";
import { typo } from "@/lib/tokens/typography";
import { cn } from "@/lib/utils";
import {
  CAREGIVER_PERMISSIONS,
  CAREGIVER_RELATIONSHIPS,
  type CaregiverPermissionId,
} from "../data/care-team-data";

function PermissionSwitch({
  checked,
  onCheckedChange,
  id,
}: {
  id: string;
  checked: boolean;
  onCheckedChange: (next: boolean) => void;
}) {
  return (
    <button
      id={id}
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onCheckedChange(!checked)}
      className={cn(
        "relative h-6 w-12 shrink-0 rounded-full transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        checked ? "bg-primary" : "bg-[#D1D5DB]",
      )}
    >
      <span
        aria-hidden
        className={cn(
          "absolute top-0.5 size-5 rounded-[10px] bg-white shadow-[0_1px_2px_rgba(0,0,0,0.1)] transition-transform",
          checked ? "left-6.5" : "left-0.5",
        )}
      />
    </button>
  );
}

function FieldLabel({ htmlFor, children }: { htmlFor: string; children: string }) {
  return (
    <Label
      htmlFor={htmlFor}
      className={cn(typo.button, "font-semibold tracking-[0.14px] text-[#1F1A20]")}
    >
      {children}
    </Label>
  );
}

const fieldClassName = cn(
  "h-auto min-h-12 w-full rounded-[14px] border border-[#E9E0E8] bg-white px-4 py-3.5 text-base shadow-[0_1px_2px_rgba(17,24,39,0.04)]",
  "placeholder:text-[#7E7481] focus-visible:ring-1 focus-visible:ring-ring",
);

export function InviteCaregiverDialog() {
  const { inviteCaregiverOpen, setInviteCaregiverOpen } = useSidebar();
  const [fullName, setFullName] = useState("");
  const [relationship, setRelationship] = useState<string | null>(null);
  const [mobile, setMobile] = useState("");
  const [email, setEmail] = useState("");
  const [permissions, setPermissions] = useState<Record<CaregiverPermissionId, boolean>>(
    () =>
      Object.fromEntries(
        CAREGIVER_PERMISSIONS.map((item) => [item.id, item.defaultEnabled]),
      ) as Record<CaregiverPermissionId, boolean>,
  );

  useEffect(() => {
    if (!inviteCaregiverOpen) return;
    const id = window.setTimeout(() => {
      setFullName("");
      setRelationship(null);
      setMobile("");
      setEmail("");
      setPermissions(
        Object.fromEntries(
          CAREGIVER_PERMISSIONS.map((item) => [item.id, item.defaultEnabled]),
        ) as Record<CaregiverPermissionId, boolean>,
      );
    }, 0);
    return () => window.clearTimeout(id);
  }, [inviteCaregiverOpen]);

  function handleSendInvitation() {
    setInviteCaregiverOpen(false);
  }

  return (
    <Dialog open={inviteCaregiverOpen} onOpenChange={setInviteCaregiverOpen}>
      <DialogPortal>
        <DialogOverlay className="z-100" />
        <DialogPrimitive.Content
          className={cn(
            "fixed top-1/2 left-1/2 z-100 flex max-h-[min(92vh,900px)] w-[calc(100%-2rem)] max-w-160 -translate-x-1/2 -translate-y-1/2 flex-col gap-0 overflow-hidden rounded-[20px] border border-[#E9E0E8] bg-white p-0 shadow-[0_12px_24px_-4px_rgba(17,24,39,0.12)] outline-none sm:max-w-160",
            "duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out",
            "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
            "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
          )}
          onOpenAutoFocus={(event) => {
            event.preventDefault();
            (event.currentTarget as HTMLElement).focus();
          }}
        >
        <div className="flex shrink-0 items-center justify-between border-b border-[#E9E0E8] px-8 pb-4.25 pt-6">
          <DialogTitle className={cn(typo.headingXl, "text-[#1F1A20]")}>
            Invite a family caregiver
          </DialogTitle>
          <DialogDescription className="sr-only">
            Enter caregiver details and choose which permissions to grant.
          </DialogDescription>
          <DialogClose asChild>
            <button
              type="button"
              aria-label="Close"
              className="inline-flex size-8 items-center justify-center rounded-full text-[#4D4450] shadow-[0_1px_1px_rgba(17,24,39,0.04)] transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <HugeiconsIcon icon={Cancel01Icon} size={16} strokeWidth={1.75} color="currentColor" />
            </button>
          </DialogClose>
        </div>

        <div className="flex min-h-0 flex-1 flex-col gap-8 overflow-y-auto px-8 pt-8">
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-1">
              <FieldLabel htmlFor="caregiver-full-name">Full name</FieldLabel>
              <Input
                id="caregiver-full-name"
                value={fullName}
                onChange={(event) => setFullName(event.target.value)}
                placeholder="Enter caregiver's full name"
                className={fieldClassName}
              />
            </div>

            <div className="flex flex-col gap-1">
              <FieldLabel htmlFor="caregiver-relationship">Relationship</FieldLabel>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    id="caregiver-relationship"
                    type="button"
                    className={cn(
                      fieldClassName,
                      "flex items-center text-left outline-none transition-colors hover:bg-[#F8F5FA]",
                      "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                    )}
                  >
                    <span
                      className={cn(
                        "min-w-0 flex-1 text-base leading-6",
                        relationship ? "text-[#1F1A20]" : "text-[#1F1A20]",
                      )}
                    >
                      {relationship ?? "Select relationship"}
                    </span>
                    <HugeiconsIcon
                      icon={ArrowDown01Icon}
                      size={16}
                      strokeWidth={1.75}
                      color="currentColor"
                      className="shrink-0 text-[#4D4450]"
                    />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="start"
                  sideOffset={8}
                  className="w-(--radix-dropdown-menu-trigger-width) rounded-[14px] border-border bg-card p-1.5 shadow-md"
                >
                  {CAREGIVER_RELATIONSHIPS.map((item) => (
                    <DropdownMenuItem
                      key={item}
                      onSelect={() => setRelationship(item)}
                      className={cn(
                        "cursor-pointer rounded-[10px] px-3 py-2.5 text-base",
                        relationship === item && "bg-[#F8F5FA]",
                      )}
                    >
                      {item}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div className="flex flex-col gap-1">
              <FieldLabel htmlFor="caregiver-mobile">Mobile number</FieldLabel>
              <div className="flex overflow-hidden rounded-[14px] border border-[#E9E0E8] bg-white shadow-[0_2px_8px_rgba(17,24,39,0.05)]">
                <span className="inline-flex shrink-0 items-center border-r border-[#E9E0E8] bg-[#F8F5FA] px-4 text-base leading-6 text-[#4D4450]">
                  +91
                </span>
                <Input
                  id="caregiver-mobile"
                  type="tel"
                  inputMode="numeric"
                  value={mobile}
                  onChange={(event) =>
                    setMobile(event.target.value.replace(/\D/g, "").slice(0, 10))
                  }
                  placeholder="00000 00000"
                  className="h-auto min-h-12 flex-1 rounded-none border-0 bg-transparent px-4 py-3.5 text-base shadow-none placeholder:text-[#7E7481] focus-visible:ring-0"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <FieldLabel htmlFor="caregiver-email">Email address</FieldLabel>
              <Input
                id="caregiver-email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="caregiver@example.com"
                className={fieldClassName}
              />
            </div>
          </div>

          <div className="h-px w-full bg-[#E9E0E8]" />

          <section className="flex flex-col gap-4 pb-2">
            <h3 className={cn(typo.button, "font-semibold tracking-[0.14px] text-[#1F1A20]")}>
              Permissions
            </h3>
            <div className="flex flex-col gap-4 rounded-[14px] border border-[#E9E0E8] bg-[#F8F5FA] p-6">
              {CAREGIVER_PERMISSIONS.map((permission) => {
                const switchId = `permission-${permission.id}`;
                return (
                  <div
                    key={permission.id}
                    className="flex items-center justify-between gap-4"
                  >
                    <div className="min-w-0 flex-1">
                      <label
                        htmlFor={switchId}
                        className="block text-base leading-6 text-[#1F1A20]"
                      >
                        {permission.label}
                      </label>
                      <p className={cn(typo.caption, "text-[#4D4450]")}>
                        {permission.description}
                      </p>
                    </div>
                    <PermissionSwitch
                      id={switchId}
                      checked={permissions[permission.id]}
                      onCheckedChange={(next) =>
                        setPermissions((current) => ({
                          ...current,
                          [permission.id]: next,
                        }))
                      }
                    />
                  </div>
                );
              })}
            </div>
          </section>
        </div>

        <div className="flex shrink-0 flex-col gap-3 border-t border-[#E9E0E8] px-8 pb-5 pt-5.25">
          <div className="flex gap-2">
            <Button
              type="button"
              variant="secondary"
              className="h-11 flex-1 font-semibold tracking-[0.14px] text-[#5F6368]"
              onClick={() => setInviteCaregiverOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              className="h-11 flex-1 font-semibold tracking-[0.14px]"
              onClick={handleSendInvitation}
            >
              Send invitation
            </Button>
          </div>
          <div className="flex items-center justify-center gap-2 pt-1">
            <span className="inline-flex size-4 shrink-0 text-[#2563EB]" aria-hidden>
              <HugeiconsIcon
                icon={InformationCircleIcon}
                size={16}
                strokeWidth={1.75}
                color="currentColor"
              />
            </span>
            <p className={cn(typo.caption, "text-center text-[#6B7280]")}>
              An invitation will be sent via SMS and email to the caregiver.
            </p>
          </div>
        </div>
        </DialogPrimitive.Content>
      </DialogPortal>
    </Dialog>
  );
}
