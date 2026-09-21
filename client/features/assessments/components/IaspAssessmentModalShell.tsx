"use client";

import * as DialogPrimitive from "@radix-ui/react-dialog";
import { Cancel01Icon } from "@hugeicons/core-free-icons";
import { AppIcon } from "@/components/shared/AppIcon";
import { Button } from "@/components/ui/button";
import {
  DialogClose,
  DialogOverlay,
  dialogCloseButtonClass,
  dialogPrimitiveContentClass,
} from "@/components/ui/dialog";
import {
  iaspModalShellWidthClass,
  iaspProgressFillClass,
  iaspProgressTrackClass,
} from "@/features/assessments/data/iasp-assessment-styles";
import { cn } from "@/lib/utils";

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
  children: React.ReactNode;
  className?: string;
  onEscapeKeyDown?: (event: KeyboardEvent) => void;
}) {
  return (
    <>
      <DialogOverlay />
      <DialogPrimitive.Content
        className={cn(
          dialogPrimitiveContentClass(iaspModalShellWidthClass),
          "flex w-full max-h-[min(92vh,880px)] flex-col items-stretch",
          className,
        )}
        onOpenAutoFocus={(event) => {
          event.preventDefault();
          (event.currentTarget as HTMLElement).focus();
        }}
        onEscapeKeyDown={onEscapeKeyDown}
      >
        {children}
      </DialogPrimitive.Content>
    </>
  );
}

export function IaspModalCloseButton() {
  return (
    <DialogClose asChild>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        aria-label="Close"
        className={dialogCloseButtonClass}
      >
        <AppIcon icon={Cancel01Icon} />
      </Button>
    </DialogClose>
  );
}
