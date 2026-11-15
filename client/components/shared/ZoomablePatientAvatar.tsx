"use client";

import { useLayoutEffect, useState } from "react";
import Image from "next/image";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { Cancel01Icon } from "@hugeicons/core-free-icons";
import { AppIcon } from "@/components/shared/AppIcon";
import { PatientAvatar } from "@/components/shared/PatientAvatar";
import {
  Dialog,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  dialogCloseButtonClass,
  dialogContentMotionClass,
  dialogContentPositionClass,
} from "@/components/ui/dialog";
import type { RiskLevel } from "@/lib/domain";
import {
  getDashboardWorkspaceDrawerPanelContainer,
  useLockDashboardPageScroll,
} from "@/lib/dashboard-workspace-drawer";
import { BADGE_ICON_SIZE } from "@/lib/icons";
import { cn } from "@/lib/utils";

/** Absolute fill of the workspace portal host — not the full viewport. */
const workspaceLightboxOverlayClass =
  "pointer-events-auto absolute inset-0 z-[110] bg-black/55 backdrop-blur-[0.5px] data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0";

const workspaceLightboxContentClass =
  "pointer-events-auto absolute top-1/2 left-1/2 z-[110] -translate-x-1/2 -translate-y-1/2";

type ZoomablePatientAvatarProps = {
  initials: string;
  /** Used for accessible labels on the trigger and zoom dialog. */
  name: string;
  riskLevel?: RiskLevel;
  size?: "sm" | "md" | "lg";
  className?: string;
  /** When omitted, renders a non-interactive initials avatar. */
  src?: string;
};

/**
 * Patient avatar that opens a lightbox zoom when a photo `src` is present.
 * List/table avatars should keep using {@link PatientAvatar} directly.
 *
 * The lightbox portals into the dashboard workspace column
 * (`DASHBOARD_WORKSPACE_DRAWER_PANEL_ROOT_ID`) so the photo is centered in the
 * main content pane rather than the full viewport (sidebar excluded).
 */
export function ZoomablePatientAvatar({
  initials,
  name,
  riskLevel,
  size,
  className,
  src,
}: ZoomablePatientAvatarProps) {
  const [open, setOpen] = useState(false);
  const [workspaceRoot, setWorkspaceRoot] = useState<HTMLElement | null>(null);

  useLayoutEffect(() => {
    setWorkspaceRoot(getDashboardWorkspaceDrawerPanelContainer());
  }, []);

  const dockToWorkspace = Boolean(workspaceRoot);
  useLockDashboardPageScroll(open && dockToWorkspace);

  const avatar = (
    <PatientAvatar
      initials={initials}
      riskLevel={riskLevel}
      size={size}
      className={className}
      src={src}
    />
  );

  if (!src) {
    return avatar;
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn(
          "cursor-pointer rounded-full",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40",
        )}
        aria-label={`View ${name}'s profile photo`}
      >
        {avatar}
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogPortal container={workspaceRoot ?? undefined}>
          {dockToWorkspace ? (
            <DialogPrimitive.Overlay className={workspaceLightboxOverlayClass} />
          ) : (
            <DialogOverlay className="bg-black/55" />
          )}
          <DialogPrimitive.Content
            className={cn(
              dialogContentMotionClass,
              "flex w-auto max-w-[min(90%,22rem)] flex-col items-center border-0 bg-transparent p-0 shadow-none outline-none",
              dockToWorkspace
                ? workspaceLightboxContentClass
                : dialogContentPositionClass,
            )}
          >
            <DialogTitle className="sr-only">
              {name}&apos;s profile photo
            </DialogTitle>
            <div className="relative">
              <DialogPrimitive.Close
                className={cn(
                  "absolute -top-2 -right-2 z-10 inline-flex items-center justify-center bg-card",
                  dialogCloseButtonClass,
                )}
                aria-label="Close profile photo"
              >
                <AppIcon icon={Cancel01Icon} size={BADGE_ICON_SIZE} />
              </DialogPrimitive.Close>
              <div className="size-[min(20rem,calc(100vw-4rem))] overflow-hidden rounded-full border border-border bg-muted shadow-[0_12px_24px_-4px_rgba(17,24,39,0.24)]">
                <Image
                  src={src}
                  alt={`${name}'s profile photo`}
                  width={640}
                  height={640}
                  quality={90}
                  sizes="320px"
                  className="size-full object-cover"
                  priority
                />
              </div>
            </div>
          </DialogPrimitive.Content>
        </DialogPortal>
      </Dialog>
    </>
  );
}
