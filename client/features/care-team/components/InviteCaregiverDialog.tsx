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
  dialogBodyShellClass,
  dialogCloseButtonClass,
  dialogFooterShellClass,
  dialogHeaderShellClass,
  dialogPrimitiveContentClass,
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
import { BADGE_ICON_SIZE, ICON_SIZE, ICON_STROKE } from "@/lib/icons";
import { cn } from "@/lib/utils";
import { ToggleSwitch } from "@/components/ui/toggle-switch";
import {
  CAREGIVER_PERMISSIONS,
  CAREGIVER_RELATIONSHIPS,
  type CaregiverPermissionId,
} from "../data/care-team-data";

function FieldLabel({ htmlFor, children }: { htmlFor: string; children: string }) {
  return (
    <Label
      htmlFor={htmlFor}
      className={cn(typo.button, "font-semibold tracking-[0.14px] text-foreground")}
    >
      {children}
    </Label>
  );
}

const fieldClassName = cn(
  "h-auto min-h-12 w-full rounded-md border border-border bg-card px-4 py-3.5 text-base shadow-[0_1px_2px_rgba(17,24,39,0.04)]",
  "placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-ring",
);

export function InviteCaregiverDialog() {
  const { inviteCaregiverOpen, setInviteCaregiverOpen } = useSidebar();
  const [fullName, setFullName] = useState("");
  const [relationship, setRelationship] = useState<string | null>(null);
  const [mobile, setMobile] = useState("");
  const [email, setEmail] = useState("");
  // Default permission state is driven by CAREGIVER_PERMISSIONS.defaultEnabled
  // — product-defined baseline per permission type (not all enabled by default).
  const [permissions, setPermissions] = useState<Record<CaregiverPermissionId, boolean>>(
    () =>
      Object.fromEntries(
        CAREGIVER_PERMISSIONS.map((item) => [item.id, item.defaultEnabled]),
      ) as Record<CaregiverPermissionId, boolean>,
  );

  // Reset form each time the dialog opens so stale data from a previous
  // session is never shown. Deferred via setTimeout(0) to avoid calling
  // setState during the render that triggered this effect.
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

  /**
   * TODO: wire to invite API — POST caregiver details + selected permissions.
   * For now, closes the dialog only.
   */
  function handleSendInvitation() {
    setInviteCaregiverOpen(false);
  }

  return (
    <Dialog open={inviteCaregiverOpen} onOpenChange={setInviteCaregiverOpen}>
      <DialogPortal>
        <DialogOverlay />
        <DialogPrimitive.Content
          className={cn(
            dialogPrimitiveContentClass("max-w-160 sm:max-w-160"),
            "max-h-[min(92vh,900px)]",
          )}
          onOpenAutoFocus={(event) => {
            event.preventDefault();
            (event.currentTarget as HTMLElement).focus();
          }}
        >
        <div className={dialogHeaderShellClass}>
          <div className="min-w-0 pr-2">
            <DialogTitle className={cn(typo.headingXl, "text-foreground")}>
              Invite a family caregiver
            </DialogTitle>
            <DialogDescription className="sr-only">
              Enter caregiver details and choose which permissions to grant.
            </DialogDescription>
          </div>
          <DialogClose asChild>
            <button
              type="button"
              aria-label="Close"
              className={cn(
                "inline-flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                dialogCloseButtonClass,
              )}
            >
              <HugeiconsIcon icon={Cancel01Icon} size={ICON_SIZE} strokeWidth={ICON_STROKE} color="currentColor" absoluteStrokeWidth />
            </button>
          </DialogClose>
        </div>

        <div className={cn(dialogBodyShellClass, "gap-8 pt-0 sm:pt-0")}>
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
                      "flex items-center text-left outline-none transition-colors hover:bg-background",
                      "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                    )}
                  >
                    <span
                      className={cn(
                        "min-w-0 flex-1 text-base leading-6",
                        relationship ? "text-foreground" : "text-foreground",
                      )}
                    >
                      {relationship ?? "Select relationship"}
                    </span>
                    <HugeiconsIcon
                      icon={ArrowDown01Icon}
                      size={ICON_SIZE}
                      strokeWidth={ICON_STROKE}
                      color="currentColor"
                      className="shrink-0 text-muted-foreground"
                    absoluteStrokeWidth />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="start"
                  sideOffset={8}
                  className="w-(--radix-dropdown-menu-trigger-width) rounded-md border-border bg-card p-1.5 shadow-md"
                >
                  {CAREGIVER_RELATIONSHIPS.map((item) => (
                    <DropdownMenuItem
                      key={item}
                      onSelect={() => setRelationship(item)}
                      className={cn(
                        "cursor-pointer rounded-sm px-3 py-2.5 text-base",
                        relationship === item && "bg-background",
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
              <div className="flex overflow-hidden rounded-md border border-border bg-card shadow-[0_2px_8px_rgba(17,24,39,0.05)]">
                <span className="inline-flex shrink-0 items-center border-r border-border bg-background px-4 text-base leading-6 text-muted-foreground">
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
                  className="h-auto min-h-12 flex-1 rounded-none border-0 bg-transparent px-4 py-3.5 text-base shadow-none placeholder:text-muted-foreground focus-visible:ring-0"
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

          <div className="h-px w-full bg-border" />

          <section className="flex flex-col gap-4 pb-2">
            <h3 className={cn(typo.button, "font-semibold tracking-[0.14px] text-foreground")}>
              Permissions
            </h3>
            <div className="flex flex-col gap-4 rounded-md border border-border bg-background p-6">
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
                        className="block text-base leading-6 text-foreground"
                      >
                        {permission.label}
                      </label>
                      <p className={cn(typo.caption, "text-muted-foreground")}>
                        {permission.description}
                      </p>
                    </div>
                    <ToggleSwitch
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

        <div className={dialogFooterShellClass}>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="secondary"
              className="h-11 flex-1 font-semibold tracking-[0.14px] text-muted-foreground"
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
            <span className="inline-flex size-4 shrink-0 text-info" aria-hidden>
              <HugeiconsIcon
                icon={InformationCircleIcon}
                size={BADGE_ICON_SIZE}
                strokeWidth={ICON_STROKE}
                absoluteStrokeWidth
                color="currentColor"
              />
            </span>
            <p className={cn(typo.caption, "text-center text-muted-foreground")}>
              An invitation will be sent via SMS and email to the caregiver.
            </p>
          </div>
        </div>
        </DialogPrimitive.Content>
      </DialogPortal>
    </Dialog>
  );
}
