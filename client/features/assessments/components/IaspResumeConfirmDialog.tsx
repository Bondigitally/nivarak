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

export function IaspResumeConfirmDialog({
  open,
  onContinue,
  onStartNew,
}: {
  open: boolean;
  onContinue: () => void;
  onStartNew: () => void;
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
                Resume assessment?
              </DialogTitle>
              <DialogDescription
                className={cn(typo.bodyM, "mt-2 text-muted-foreground")}
              >
                Would you like to continue with your previous responses or start
                a new assessment?
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
              onClick={onContinue}
            >
              Continue Previous Responses
            </Button>
            <Button
              type="button"
              variant="secondary"
              size="cta"
              className="w-full"
              onClick={onStartNew}
            >
              Start New Assessment
            </Button>
          </div>
        </DialogPrimitive.Content>
      </DialogPortal>
    </Dialog>
  );
}
