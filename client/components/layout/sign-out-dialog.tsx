"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { signOut } from "aws-amplify/auth";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogDescription,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
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
        <DialogOverlay className="z-100" />
        <DialogPrimitive.Content
          className={cn(
            "fixed top-1/2 left-1/2 z-100 flex w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 flex-col gap-0 overflow-hidden rounded-[20px] border border-border bg-background p-0 shadow-lg outline-none",
            "duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out",
            "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
            "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
          )}
        >
          <div className="gap-2 space-y-0 border-b border-border px-6 py-5 text-left">
            <DialogTitle className={cn(typo.headingXl, "text-foreground")}>
              Sign out?
            </DialogTitle>
            <DialogDescription className={cn(typo.bodyM, "text-muted-foreground")}>
              You’ll need to sign in again to access your dashboard.
            </DialogDescription>
          </div>
          <div className="flex flex-row justify-end gap-3 px-6 py-4">
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
