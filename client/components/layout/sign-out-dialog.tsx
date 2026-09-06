"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { Alert02Icon } from "@hugeicons/core-free-icons";
import { signOut } from "aws-amplify/auth";
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
import { useSidebar } from "@/components/layout/sidebar-context";
import { typo } from "@/lib/tokens/typography";
import { cn } from "@/lib/utils";

export function SignOutDialog() {
  const { signOutOpen, setSignOutOpen } = useSidebar();
  const [signingOut, setSigningOut] = useState(false);
  const router = useRouter();

  async function handleSignOut() {
    setSigningOut(true);
    try {
      await signOut();
    } catch {
      // Auth is optional while the dashboard is open without a session.
    }
    router.replace("/login");
  }

  return (
    <Dialog
      open={signOutOpen}
      onOpenChange={(open) => {
        if (signingOut) return;
        setSignOutOpen(open);
      }}
    >
      <DialogPortal>
        <DialogOverlay />
        <DialogPrimitive.Content
          className={dialogPrimitiveContentClass("max-w-md")}
        >
          <div className={cn(dialogHeaderShellClass, "border-b-0")}>
            <div className="min-w-0">
              <DialogTitle
                className={cn(
                  typo.headingXl,
                  "flex items-center gap-2 text-foreground",
                )}
              >
                <AppIcon icon={Alert02Icon} className="size-6 text-destructive" />
                Sign out?
              </DialogTitle>
              <DialogDescription className={cn(typo.bodyM, "mt-1 text-muted-foreground")}>
                You’ll need to sign in again to access your dashboard.
              </DialogDescription>
            </div>
          </div>
          <div
            className={cn(
              dialogFooterShellClass,
              "flex-row items-center justify-end gap-3 border-t-0 py-4 sm:py-4",
            )}
          >
            <Button
              type="button"
              variant="secondary"
              disabled={signingOut}
              onClick={() => setSignOutOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              loading={signingOut}
              onClick={() => void handleSignOut()}
            >
              Sign out
            </Button>
          </div>
        </DialogPrimitive.Content>
      </DialogPortal>
    </Dialog>
  );
}
