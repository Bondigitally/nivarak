"use client";

import {
  createContext,
  useContext,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { ArrowLeft01Icon, Cancel01Icon } from "@hugeicons/core-free-icons";
import { AppIcon } from "@/components/shared/AppIcon";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogFooter,
  DialogOverlay,
  DialogPortal,
  dialogCloseButtonClass,
  dialogPrimitiveContentClass,
} from "@/components/ui/dialog";
import { Sheet, SheetClose, SheetContent } from "@/components/ui/sheet";
import {
  iaspDrawerShellLayoutClass,
  iaspModalShellLayoutClass,
  iaspModalShellWidthClass,
  iaspProgressFillClass,
  iaspProgressTrackClass,
  iaspStepNavFooterClass,
} from "@/features/assessments/data/iasp-assessment-styles";
import { cn } from "@/lib/utils";

/** Matches assessment `sm:` breakpoint — drawer below, modal from `sm` up. */
const IASP_DESKTOP_MEDIA = "(min-width: 640px)";

function subscribeDesktop(onChange: () => void) {
  const mq = window.matchMedia(IASP_DESKTOP_MEDIA);
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
}

function getDesktopSnapshot() {
  return window.matchMedia(IASP_DESKTOP_MEDIA).matches;
}

function useIaspMobileDrawer() {
  return !useSyncExternalStore(subscribeDesktop, getDesktopSnapshot, () => false);
}

const IaspShellContext = createContext({ useDrawer: false });

function useIaspShell() {
  return useContext(IaspShellContext);
}

function handleShellOpenAutoFocus(event: Event) {
  event.preventDefault();
  (event.currentTarget as HTMLElement).focus();
}

/** Sheet on mobile, Dialog on desktop — single entry for the assessment flow. */
export function IaspAssessmentRoot({
  open,
  onOpenChange,
  children,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: ReactNode;
}) {
  const useDrawer = useIaspMobileDrawer();
  const shell = useMemo(() => ({ useDrawer }), [useDrawer]);

  if (useDrawer) {
    return (
      <IaspShellContext.Provider value={shell}>
        <Sheet open={open} onOpenChange={onOpenChange}>{children}</Sheet>
      </IaspShellContext.Provider>
    );
  }

  return (
    <IaspShellContext.Provider value={shell}>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogPortal>{children}</DialogPortal>
      </Dialog>
    </IaspShellContext.Provider>
  );
}

export function IaspProgressBar({
  value,
  label,
}: {
  value: number;
  label: string;
}) {
  const clamped = Math.min(100, Math.max(0, value));

  return (
    <div
      className={iaspProgressTrackClass}
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={clamped}
      aria-label={label}
    >
      <div
        className={iaspProgressFillClass}
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
}

export function IaspModalShell({
  children,
  className,
  onEscapeKeyDown,
}: {
  children: ReactNode;
  className?: string;
  onEscapeKeyDown?: (event: KeyboardEvent) => void;
}) {
  const { useDrawer } = useIaspShell();

  if (useDrawer) {
    return (
      <SheetContent
        side="bottom"
        showCloseButton={false}
        className={cn(iaspDrawerShellLayoutClass, className)}
        onOpenAutoFocus={handleShellOpenAutoFocus}
        onEscapeKeyDown={onEscapeKeyDown}
      >
        {children}
      </SheetContent>
    );
  }

  return (
    <>
      <DialogOverlay />
      <DialogPrimitive.Content
        className={cn(
          dialogPrimitiveContentClass(iaspModalShellWidthClass),
          iaspModalShellLayoutClass,
          className,
        )}
        onOpenAutoFocus={handleShellOpenAutoFocus}
        onEscapeKeyDown={onEscapeKeyDown}
      >
        {children}
      </DialogPrimitive.Content>
    </>
  );
}

export function IaspModalCloseButton() {
  const { useDrawer } = useIaspShell();
  const Close = useDrawer ? SheetClose : DialogClose;

  return (
    <Close asChild>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        aria-label="Close"
        className={dialogCloseButtonClass}
      >
        <AppIcon icon={Cancel01Icon} />
      </Button>
    </Close>
  );
}

/** Shared back + next/submit footer used across closing steps. */
export function IaspStepNavFooter({
  onBack,
  children,
}: {
  onBack: () => void;
  children: ReactNode;
}) {
  return (
    <DialogFooter className={iaspStepNavFooterClass}>
      <Button type="button" variant="secondary" onClick={onBack}>
        <AppIcon icon={ArrowLeft01Icon} />
        Back
      </Button>
      {children}
    </DialogFooter>
  );
}
