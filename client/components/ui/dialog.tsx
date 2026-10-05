"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

const Dialog = DialogPrimitive.Root;

const DialogTrigger = DialogPrimitive.Trigger;

const DialogPortal = DialogPrimitive.Portal;

const DialogClose = DialogPrimitive.Close;

/** Shared overlay — matches Book a visit / invite caregiver modals. */
export const dialogOverlayClass =
  "fixed inset-0 z-100 bg-black/40 backdrop-blur-[1px] data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0";

/** White card shell shared by app modals. */
export const dialogShellClass =
  "flex flex-col gap-0 overflow-hidden rounded-xl border border-border bg-card p-0 shadow-[0_12px_24px_-4px_rgba(17,24,39,0.12)] outline-none";

export const dialogContentPositionClass =
  "fixed top-1/2 left-1/2 z-100 w-[calc(100%-2rem)] -translate-x-1/2 -translate-y-1/2";

export const dialogContentMotionClass =
  "duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95";

export const dialogHeaderShellClass =
  "flex shrink-0 flex-row items-center justify-between gap-4 space-y-0 rounded-none border-b border-border bg-card px-dash-pad-x py-5 text-left sm:px-8 sm:py-6";

export const dialogBodyShellClass =
  "flex min-h-0 flex-1 flex-col gap-6 overflow-x-hidden overflow-y-auto overscroll-contain bg-card px-dash-pad-x py-6 sm:gap-8 sm:px-8 sm:py-7";

export const dialogFooterShellClass =
  "flex shrink-0 flex-col gap-3 rounded-none border-t border-border bg-card px-dash-pad-x py-5 sm:px-8 sm:py-6";

export const dialogCloseButtonClass =
  "size-10 shrink-0 rounded-full text-muted-foreground shadow-[0_1px_1px_rgba(17,24,39,0.04)] hover:text-foreground";

export function dialogPrimitiveContentClass(maxWidthClass = "max-w-lg") {
  return cn(
    dialogContentPositionClass,
    dialogShellClass,
    dialogContentMotionClass,
    maxWidthClass,
  );
}

const DialogOverlay = React.forwardRef<
  React.ComponentRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(dialogOverlayClass, className)}
    {...props}
  />
));
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName;

const DialogContent = React.forwardRef<
  React.ComponentRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> & {
    showCloseButton?: boolean;
  }
>(({ className, children, showCloseButton = true, ...props }, ref) => (
  <DialogPortal>
    <DialogOverlay />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        dialogContentPositionClass,
        "z-50 flex w-full max-w-lg flex-col gap-4 border border-border bg-card px-dash-pad-x py-6 sm:p-6 shadow-[0_12px_24px_-4px_rgba(17,24,39,0.12)]",
        dialogContentMotionClass,
        className,
      )}
      {...props}
    >
      {children}
      {showCloseButton ? (
        <DialogPrimitive.Close
          className={cn(
            "absolute right-4 top-4 rounded-full opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none",
            dialogCloseButtonClass,
          )}
        >
          <X className="size-4" />
          <span className="sr-only">Close</span>
        </DialogPrimitive.Close>
      ) : null}
    </DialogPrimitive.Content>
  </DialogPortal>
));
DialogContent.displayName = DialogPrimitive.Content.displayName;

const DialogHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("flex flex-col space-y-1.5 text-center sm:text-left", className)} {...props} />
);
DialogHeader.displayName = "DialogHeader";

const DialogFooter = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn("flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2", className)}
    {...props}
  />
);
DialogFooter.displayName = "DialogFooter";

const DialogTitle = React.forwardRef<
  React.ComponentRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn("text-lg font-semibold leading-none tracking-tight", className)}
    {...props}
  />
));
DialogTitle.displayName = DialogPrimitive.Title.displayName;

const DialogDescription = React.forwardRef<
  React.ComponentRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
));
DialogDescription.displayName = DialogPrimitive.Description.displayName;

export {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogTrigger,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  DialogPrimitive,
};
