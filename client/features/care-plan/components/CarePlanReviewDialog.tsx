"use client";

import { useState } from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { Cancel01Icon } from "@hugeicons/core-free-icons";
import { AppIcon } from "@/components/shared/AppIcon";
import { Button } from "@/components/ui/button";
import {
  Dialog,
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
import { fieldTextareaClassName } from "@/components/ui/input";
import { BADGE_ICON_SIZE } from "@/lib/icons";
import { typo } from "@/lib/tokens/typography";
import { cn } from "@/lib/utils";

export function CarePlanReviewDialog({
  open,
  onOpenChange,
  patientName,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patientName: string;
}) {
  const [note, setNote] = useState("");
  const [result, setResult] = useState<"idle" | "approved" | "changes">(
    "idle",
  );

  function handleApprove() {
    setResult("approved");
    onOpenChange(false);
  }

  function handleRequestChanges() {
    setResult("changes");
    onOpenChange(false);
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogPortal>
          <DialogOverlay />
          <DialogPrimitive.Content
            className={dialogPrimitiveContentClass("max-w-lg")}
          >
            <div className={dialogHeaderShellClass}>
              <div className="min-w-0">
                <DialogTitle className={cn(typo.headingXl, "text-foreground")}>
                  Review care plan
                </DialogTitle>
                <DialogDescription
                  className={cn(typo.bodyM, "mt-1 text-muted-foreground")}
                >
                  Approve or request changes for {patientName}&apos;s care plan.
                </DialogDescription>
              </div>
              <DialogPrimitive.Close
                className={cn(
                  "inline-flex items-center justify-center",
                  dialogCloseButtonClass,
                )}
                aria-label="Close"
              >
                <AppIcon icon={Cancel01Icon} size={BADGE_ICON_SIZE} />
              </DialogPrimitive.Close>
            </div>

            <div className={dialogBodyShellClass}>
              <div className="flex flex-col gap-2">
                <label htmlFor="review-note" className={typo.headingS}>
                  Reviewer notes
                </label>
                <textarea
                  id="review-note"
                  rows={4}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Optional feedback for the care team…"
                  className={fieldTextareaClassName}
                />
              </div>
            </div>

            <div
              className={cn(
                dialogFooterShellClass,
                "flex-col-reverse sm:flex-row sm:justify-end",
              )}
            >
              <Button
                type="button"
                variant="primary-outline"
                size="cta"
                onClick={handleRequestChanges}
              >
                Request changes
              </Button>
              <Button type="button" size="cta" onClick={handleApprove}>
                Approve &amp; publish
              </Button>
            </div>
          </DialogPrimitive.Content>
        </DialogPortal>
      </Dialog>

      {result !== "idle" ? (
        <p className="sr-only" role="status">
          {result === "approved"
            ? "Care plan approved"
            : "Changes requested on care plan"}
        </p>
      ) : null}
    </>
  );
}
