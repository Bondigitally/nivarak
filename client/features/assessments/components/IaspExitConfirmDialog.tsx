"use client";

import * as DialogPrimitive from "@radix-ui/react-dialog";
import { InformationCircleIcon } from "@hugeicons/core-free-icons";
import { AppIcon } from "@/components/shared/AppIcon";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogDescription,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  dialogFooterShellClass,
  dialogHeaderShellClass,
  dialogPrimitiveContentClass,
} from "@/components/ui/dialog";
import { typo } from "@/lib/tokens/typography";
import { cn } from "@/lib/utils";

export function IaspExitConfirmDialog({
  open,
  onContinue,
  onCloseAssessment,
}: {
  open: boolean;
  onContinue: () => void;
  onCloseAssessment: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogPortal>
        <DialogOverlay className="z-110" />
        <DialogPrimitive.Content
          className={cn(dialogPrimitiveContentClass("max-w-md"), "z-110")}
          onEscapeKeyDown={(event) => event.preventDefault()}
          onPointerDownOutside={(event) => event.preventDefault()}
          onInteractOutside={(event) => event.preventDefault()}
        >
          <div className={cn(dialogHeaderShellClass, "border-b-0")}>
            <div className="min-w-0">
              <DialogTitle
                className={cn(
                  typo.headingXl,
                  "flex items-center gap-2 text-foreground",
                )}
              >
                <AppIcon
                  icon={InformationCircleIcon}
                  className="size-6 text-primary"
                />
                Close assessment?
              </DialogTitle>
              <DialogDescription
                className={cn(typo.bodyM, "mt-2 text-muted-foreground")}
              >
                Your progress is saved automatically. Would you like to continue
                the assessment or close it for now?
              </DialogDescription>
            </div>
          </div>
          <div
            className={cn(
              dialogFooterShellClass,
              "flex-col items-stretch gap-3 border-t-0 py-4 sm:flex-col sm:py-4",
            )}
          >
            <Button
              type="button"
              size="cta"
              className="w-full"
              onPointerDown={(event) => event.stopPropagation()}
              onClick={(event) => {
                event.stopPropagation();
                onContinue();
              }}
            >
              Continue Assessment
            </Button>
            <Button
              type="button"
              variant="secondary"
              size="cta"
              className="w-full"
              onPointerDown={(event) => event.stopPropagation()}
              onClick={(event) => {
                event.stopPropagation();
                onCloseAssessment();
              }}
            >
              Close Assessment
            </Button>
          </div>
        </DialogPrimitive.Content>
      </DialogPortal>
    </Dialog>
  );
}
