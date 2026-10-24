"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
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
  iaspRazorpayCheckoutShellClass,
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

type IaspShellContextValue = {
  useDrawer: boolean;
  razorpayCheckoutActive: boolean;
  setRazorpayCheckoutActive: (active: boolean) => void;
};

const IaspShellContext = createContext<IaspShellContextValue>({
  useDrawer: false,
  razorpayCheckoutActive: false,
  setRazorpayCheckoutActive: () => {},
});

function useIaspShell() {
  return useContext(IaspShellContext);
}

/** Lets payment flow release Radix modal pointer guards before Razorpay opens. */
export function useIaspRazorpayCheckoutSuspend() {
  return useIaspShell().setRazorpayCheckoutActive;
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
  const [razorpayCheckoutActive, setRazorpayCheckoutActive] = useState(false);
  const setCheckoutActive = useCallback((active: boolean) => {
    setRazorpayCheckoutActive(active);
  }, []);
  const shell = useMemo(
    () => ({
      useDrawer,
      razorpayCheckoutActive,
      setRazorpayCheckoutActive: setCheckoutActive,
    }),
    [useDrawer, razorpayCheckoutActive, setCheckoutActive],
  );
  const modal = !razorpayCheckoutActive;

  if (useDrawer) {
    return (
      <IaspShellContext.Provider value={shell}>
        <Sheet open={open} onOpenChange={onOpenChange} modal={modal}>
          {children}
        </Sheet>
      </IaspShellContext.Provider>
    );
  }

  return (
    <IaspShellContext.Provider value={shell}>
      <Dialog open={open} onOpenChange={onOpenChange} modal={modal}>
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
  const { useDrawer, razorpayCheckoutActive } = useIaspShell();
  const checkoutShellClass = razorpayCheckoutActive
    ? iaspRazorpayCheckoutShellClass
    : undefined;

  if (useDrawer) {
    return (
      <SheetContent
        side="bottom"
        showCloseButton={false}
        overlayClassName={checkoutShellClass}
        className={cn(
          iaspDrawerShellLayoutClass,
          checkoutShellClass,
          className,
        )}
        onOpenAutoFocus={handleShellOpenAutoFocus}
        onEscapeKeyDown={onEscapeKeyDown}
      >
        {children}
      </SheetContent>
    );
  }

  return (
    <>
      <DialogOverlay
        data-iasp-assessment-shell=""
        className={checkoutShellClass}
      />
      <DialogPrimitive.Content
        data-iasp-assessment-shell=""
        className={cn(
          dialogPrimitiveContentClass(iaspModalShellWidthClass),
          iaspModalShellLayoutClass,
          checkoutShellClass,
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
