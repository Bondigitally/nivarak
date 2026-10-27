"use client";

import { useState } from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import {
  Cancel01Icon,
  CheckmarkCircle02Icon,
  SquareLock02Icon,
} from "@hugeicons/core-free-icons";
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
  useDialogPortalContainer,
} from "@/components/ui/dialog";
import { FieldErrorMessage } from "@/components/ui/field-error-message";
import { Input } from "@/components/ui/input";
import { PhoneField } from "@/features/auth/components/primitives/PhoneField";
import { getDefaultCountry } from "@/features/auth/lib/country-codes";
import {
  iaspStackedDialogContentClass,
  iaspStackedDialogOverlayClass,
  iaspStackedDropdownZClass,
  iaspUnlockReportModalBodyClass,
  iaspUnlockReportModalShellClass,
} from "@/features/assessments/data/iasp-assessment-styles";
import {
  validateIaspUnlockForm,
  type IaspUnlockFormErrors,
} from "@/features/assessments/lib/iasp-unlock-validation";
import { typo } from "@/lib/tokens/typography";
import { cn } from "@/lib/utils";
import type { IaspReportUserDetails } from "../lib/razorpay-checkout";

interface IaspUnlockReportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  loading?: boolean;
  onSubmit: (details: IaspReportUserDetails) => Promise<void>;
}

function UnlockFormField({
  id,
  label,
  error,
  children,
}: {
  id: string;
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-auth-field">
      <label htmlFor={id} className={cn(typo.label, "text-foreground")}>
        {label} <span className="text-destructive">*</span>
      </label>
      {children}
      <FieldErrorMessage error={error} />
    </div>
  );
}

export function IaspUnlockReportModal({
  open,
  onOpenChange,
  loading = false,
  onSubmit,
}: IaspUnlockReportModalProps) {
  const [fullName, setFullName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState(
    () => getDefaultCountry().dialCode,
  );
  const [email, setEmail] = useState("");
  const [errors, setErrors] = useState<IaspUnlockFormErrors>({});
  const { contentRef, portalContainer } = useDialogPortalContainer();

  function clearError(field: keyof IaspUnlockFormErrors) {
    setErrors((prev) =>
      prev[field] ? { ...prev, [field]: undefined } : prev,
    );
  }

  function validate() {
    const result = validateIaspUnlockForm({ fullName, phoneNumber, email });
    if (!result.success) {
      setErrors(result.errors);
      return false;
    }
    setErrors({});
    return true;
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (loading) return;
    if (!validate()) return;

    await onSubmit({
      fullName: fullName.trim(),
      phoneNumber,
      email: email.trim(),
    });
  }

  function handleOpenChange(nextOpen: boolean) {
    if (loading && !nextOpen) return;
    onOpenChange(nextOpen);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogPortal>
        <DialogOverlay className={iaspStackedDialogOverlayClass} />
        <DialogPrimitive.Content
          ref={contentRef}
          className={cn(
            dialogPrimitiveContentClass("max-w-lg"),
            iaspStackedDialogContentClass,
            iaspUnlockReportModalShellClass,
          )}
          onEscapeKeyDown={(e) => {
            if (loading) e.preventDefault();
          }}
          onPointerDownOutside={(e) => {
            e.preventDefault();
          }}
        >
          <form
            onSubmit={handleSubmit}
            noValidate
            className="flex min-h-0 flex-1 flex-col"
          >
            <div
              className={cn(
                dialogHeaderShellClass,
                "relative shrink-0 border-b-0 pb-0 sm:pb-0",
              )}
            >
              <button
                type="button"
                disabled={loading}
                onClick={() => handleOpenChange(false)}
                className="absolute top-5 right-5 rounded-sm opacity-70 transition-opacity hover:opacity-100 focus:outline-none disabled:pointer-events-none sm:top-6 sm:right-8"
                aria-label="Close"
              >
                <AppIcon
                  icon={Cancel01Icon}
                  className="size-5 text-muted-foreground"
                />
              </button>
              <div className="min-w-0 pr-8">
                <div className="flex items-center gap-3 text-primary">
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
                    <AppIcon icon={SquareLock02Icon} className="size-5" />
                  </span>
                  <DialogTitle className={cn(typo.headingXl, "text-foreground")}>
                    Unlock Detailed Report
                  </DialogTitle>
                </div>
                <DialogDescription
                  className={cn(typo.bodyM, "mt-3 max-w-prose text-muted-foreground")}
                >
                  Please provide your contact information to receive and unlock
                  your personalized IAS-P assessment report.
                </DialogDescription>
              </div>
            </div>

            <div className={iaspUnlockReportModalBodyClass}>
              <div className="flex flex-col gap-1">
                <UnlockFormField
                  id="iasp-unlock-fullname"
                  label="Full Name"
                  error={errors.fullName}
                >
                  <Input
                    id="iasp-unlock-fullname"
                    type="text"
                    disabled={loading}
                    placeholder="e.g. Rahul Sharma"
                    value={fullName}
                    aria-invalid={Boolean(errors.fullName)}
                    onChange={(e) => {
                      setFullName(e.target.value);
                      clearError("fullName");
                    }}
                  />
                </UnlockFormField>

                <UnlockFormField
                  id="iasp-unlock-phone"
                  label="Phone Number"
                  error={errors.phoneNumber}
                >
                  <PhoneField
                    id="iasp-unlock-phone"
                    showLabel={false}
                    showError={false}
                    countryMenuInDialog={{
                      portalContainer,
                      contentClassName: iaspStackedDropdownZClass,
                    }}
                    value={phoneNumber}
                    disabled={loading}
                    error={errors.phoneNumber}
                    placeholder="9876543210"
                    onChange={(val) => {
                      setPhoneNumber(val);
                      clearError("phoneNumber");
                    }}
                  />
                </UnlockFormField>

                <UnlockFormField
                  id="iasp-unlock-email"
                  label="Email Address"
                  error={errors.email}
                >
                  <Input
                    id="iasp-unlock-email"
                    type="email"
                    disabled={loading}
                    placeholder="e.g. rahul@example.com"
                    value={email}
                    aria-invalid={Boolean(errors.email)}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      clearError("email");
                    }}
                  />
                </UnlockFormField>
              </div>

              <div className="rounded-lg border border-primary/20 bg-primary/5 p-4 sm:p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className={cn(typo.button, "font-semibold text-foreground")}>
                      IAS-P Comprehensive Report
                    </p>
                    <p className={cn(typo.caption, "mt-1 text-muted-foreground")}>
                      One-time assessment unlock fee
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <span className={cn(typo.headingXl, "font-bold text-primary")}>
                      ₹1
                    </span>
                  </div>
                </div>

                <ul className="mt-4 space-y-2.5 border-t border-primary/10 pt-4 text-xs text-muted-foreground">
                  <li className="flex items-start gap-2.5">
                    <AppIcon
                      icon={CheckmarkCircle02Icon}
                      className="mt-0.5 size-4 shrink-0 text-primary"
                    />
                    <span>Detailed scores across all 8 functional domains</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <AppIcon
                      icon={CheckmarkCircle02Icon}
                      className="mt-0.5 size-4 shrink-0 text-primary"
                    />
                    <span>
                      Red flag clinical urgency &amp; care pathway recommendations
                    </span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <AppIcon
                      icon={CheckmarkCircle02Icon}
                      className="mt-0.5 size-4 shrink-0 text-primary"
                    />
                    <span>Immediate report view and automatic PDF download</span>
                  </li>
                </ul>
              </div>
            </div>

            <div
              className={cn(
                dialogFooterShellClass,
                "mt-auto shrink-0 flex-row flex-wrap items-center justify-end gap-3 border-t bg-card py-4 sm:py-5",
              )}
            >
              <Button
                type="button"
                variant="outline"
                disabled={loading}
                onClick={() => handleOpenChange(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="cta"
                loading={loading}
                disabled={loading}
                className="min-w-[10.5rem]"
              >
                {loading ? "Opening Payment…" : "Complete Payment"}
              </Button>
            </div>
          </form>
        </DialogPrimitive.Content>
      </DialogPortal>
    </Dialog>
  );
}
