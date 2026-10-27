"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import {
  Calendar03Icon,
  Cancel01Icon,
} from "@hugeicons/core-free-icons";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
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
import { fieldTextareaClassName, Input } from "@/components/ui/input";
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
import { submitBookingInquiry } from "@/features/marketing/lib/booking-api";
import { marketingEase } from "@/features/marketing/lib/motion";
import { ApiError } from "@/lib/api";
import { typo } from "@/lib/tokens/typography";
import { cn } from "@/lib/utils";
import "@/features/marketing/components/ContactForm.contact.css";

const DotLottieReact = dynamic(
  () => import("@lottiefiles/dotlottie-react").then((mod) => mod.DotLottieReact),
  { ssr: false },
);

const CONTACT_SUCCESS_LOTTIE = "/images/message-sent.lottie";

const COPY_ITEM_VARIANTS = {
  hidden: { opacity: 0, y: 10 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: marketingEase },
  },
};

type ConsultFormErrors = IaspUnlockFormErrors & {
  message?: string;
};

type IaspBookConsultationModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

function ConsultFormField({
  id,
  label,
  error,
  required = true,
  children,
}: {
  id: string;
  label: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-auth-field">
      <label htmlFor={id} className={cn(typo.label, "text-foreground")}>
        {label}
        {required ? <span className="text-destructive"> *</span> : null}
      </label>
      {children}
      <FieldErrorMessage error={error} />
    </div>
  );
}

export function IaspBookConsultationModal({
  open,
  onOpenChange,
}: IaspBookConsultationModalProps) {
  const reducedMotion = useReducedMotion();
  const { contentRef, portalContainer } = useDialogPortalContainer();

  const [fullName, setFullName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState(
    () => getDefaultCountry().dialCode,
  );
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState<ConsultFormErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [timedPlay, setTimedPlay] = useState(false);
  const [timedShowCopy, setTimedShowCopy] = useState(false);

  const playCheck = success && (Boolean(reducedMotion) || timedPlay);
  const showCopy = success && (Boolean(reducedMotion) || timedShowCopy);

  useEffect(() => {
    if (!open) return;
    const id = window.setTimeout(() => {
      setFullName("");
      setPhoneNumber(getDefaultCountry().dialCode);
      setEmail("");
      setMessage("");
      setErrors({});
      setFormError(null);
      setSubmitting(false);
      setSuccess(false);
      setTimedPlay(false);
      setTimedShowCopy(false);
    }, 0);
    return () => window.clearTimeout(id);
  }, [open]);

  useEffect(() => {
    if (!success || reducedMotion) return;
    const playTimer = window.setTimeout(() => setTimedPlay(true), 120);
    const fallbackTimer = window.setTimeout(() => setTimedShowCopy(true), 3200);
    return () => {
      window.clearTimeout(playTimer);
      window.clearTimeout(fallbackTimer);
    };
  }, [success, reducedMotion]);

  function clearError(field: keyof ConsultFormErrors) {
    setErrors((prev) => (prev[field] ? { ...prev, [field]: undefined } : prev));
  }

  function validate(): boolean {
    const unlock = validateIaspUnlockForm({ fullName, phoneNumber, email });
    const next: ConsultFormErrors = unlock.success ? {} : { ...unlock.errors };
    const trimmedMessage = message.trim();
    if (trimmedMessage.length < 10) {
      next.message = "Please add a short message (at least 10 characters)";
    } else if (trimmedMessage.length > 1000) {
      next.message = "Message is too long";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (submitting || success) return;
    if (!validate()) return;

    setFormError(null);
    setSubmitting(true);
    try {
      await submitBookingInquiry({
        name: fullName.trim(),
        email: email.trim(),
        phone: phoneNumber,
        message: message.trim(),
      });
      setSuccess(true);
    } catch (error) {
      setFormError(
        error instanceof ApiError
          ? error.message
          : "Something went wrong. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  function handleOpenChange(nextOpen: boolean) {
    if (submitting && !nextOpen) return;
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
            if (submitting) e.preventDefault();
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
                disabled={submitting}
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
                    <AppIcon icon={Calendar03Icon} className="size-5" />
                  </span>
                  <DialogTitle className={cn(typo.headingXl, "text-foreground")}>
                    Book Consultation
                  </DialogTitle>
                </div>
                <DialogDescription
                  className={cn(
                    typo.bodyM,
                    "mt-3 max-w-prose text-muted-foreground",
                  )}
                >
                  Share your details and a short note about what you need. Our
                  care team will follow up to schedule a consultation.
                </DialogDescription>
              </div>
            </div>

            <div className={iaspUnlockReportModalBodyClass}>
              {success ? (
                <div
                  className="form-success contact-success is-visible"
                  tabIndex={-1}
                  role="status"
                >
                  <div className="contact-success-body">
                    <div className="contact-success-check" aria-hidden="true">
                      {playCheck ? (
                        <DotLottieReact
                          src={CONTACT_SUCCESS_LOTTIE}
                          autoplay
                          loop={false}
                          speed={1.15}
                          useFrameInterpolation={!reducedMotion}
                          className="contact-success-lottie"
                          dotLottieRefCallback={(dotLottie) => {
                            if (!dotLottie) return;
                            dotLottie.addEventListener("complete", () =>
                              setTimedShowCopy(true),
                            );
                          }}
                        />
                      ) : null}
                    </div>

                    <AnimatePresence initial={false}>
                      {showCopy ? (
                        <motion.div
                          key="consult-success-copy"
                          className="contact-success-copy-block"
                          initial={reducedMotion ? false : "hidden"}
                          animate="show"
                          variants={{
                            hidden: {},
                            show: {
                              transition: { staggerChildren: 0.06 },
                            },
                          }}
                        >
                          <motion.div
                            className="contact-success-main"
                            variants={{
                              hidden: {},
                              show: {
                                transition: { staggerChildren: 0.04 },
                              },
                            }}
                          >
                            <motion.h3
                              className="contact-success-title"
                              variants={COPY_ITEM_VARIANTS}
                            >
                              Your message is in good hands.
                            </motion.h3>
                            <motion.p
                              className="contact-success-copy"
                              variants={COPY_ITEM_VARIANTS}
                            >
                              Thank you for reaching out to Nivarak. Our team
                              will review your request and get back to you
                              shortly.
                            </motion.p>
                          </motion.div>

                          <motion.div
                            className="contact-success-next"
                            variants={COPY_ITEM_VARIANTS}
                          >
                            <strong className="contact-success-next-title">
                              What&apos;s next
                            </strong>
                            <p className="contact-success-next-copy">
                              We&apos;ll follow up using the contact details you
                              provided.
                            </p>
                          </motion.div>
                        </motion.div>
                      ) : null}
                    </AnimatePresence>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-1">
                  <ConsultFormField
                    id="iasp-consult-fullname"
                    label="Full Name"
                    error={errors.fullName}
                  >
                    <Input
                      id="iasp-consult-fullname"
                      type="text"
                      disabled={submitting}
                      placeholder="e.g. Rahul Sharma"
                      value={fullName}
                      aria-invalid={Boolean(errors.fullName)}
                      onChange={(e) => {
                        setFullName(e.target.value);
                        clearError("fullName");
                      }}
                    />
                  </ConsultFormField>

                  <ConsultFormField
                    id="iasp-consult-phone"
                    label="Phone Number"
                    error={errors.phoneNumber}
                  >
                    <PhoneField
                      id="iasp-consult-phone"
                      showLabel={false}
                      showError={false}
                      countryMenuInDialog={{
                        portalContainer,
                        contentClassName: iaspStackedDropdownZClass,
                      }}
                      value={phoneNumber}
                      disabled={submitting}
                      error={errors.phoneNumber}
                      placeholder="9876543210"
                      onChange={(val) => {
                        setPhoneNumber(val);
                        clearError("phoneNumber");
                      }}
                    />
                  </ConsultFormField>

                  <ConsultFormField
                    id="iasp-consult-email"
                    label="Email Address"
                    error={errors.email}
                  >
                    <Input
                      id="iasp-consult-email"
                      type="email"
                      disabled={submitting}
                      placeholder="e.g. rahul@example.com"
                      value={email}
                      aria-invalid={Boolean(errors.email)}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        clearError("email");
                      }}
                    />
                  </ConsultFormField>

                  <ConsultFormField
                    id="iasp-consult-message"
                    label="Message"
                    error={errors.message}
                  >
                    <textarea
                      id="iasp-consult-message"
                      disabled={submitting}
                      placeholder="How can we help?"
                      rows={4}
                      maxLength={1000}
                      value={message}
                      aria-invalid={Boolean(errors.message)}
                      className={cn(
                        fieldTextareaClassName,
                        "aria-invalid:border-destructive aria-invalid:ring-destructive/30",
                      )}
                      onChange={(e) => {
                        setMessage(e.target.value);
                        clearError("message");
                      }}
                    />
                  </ConsultFormField>

                  {formError ? (
                    <p className={cn(typo.bodyS, "text-destructive")} role="alert">
                      {formError}
                    </p>
                  ) : null}
                </div>
              )}
            </div>

            <div
              className={cn(
                dialogFooterShellClass,
                "mt-auto shrink-0 flex-row flex-wrap items-center justify-end gap-3 border-t bg-card py-4 sm:py-5",
              )}
            >
              {success ? (
                <Button
                  type="button"
                  size="cta"
                  onClick={() => handleOpenChange(false)}
                >
                  Close
                </Button>
              ) : (
                <>
                  <Button
                    type="button"
                    variant="outline"
                    disabled={submitting}
                    onClick={() => handleOpenChange(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    size="cta"
                    loading={submitting}
                    disabled={submitting}
                    className="min-w-[10.5rem]"
                  >
                    {submitting ? "Sending…" : "Request consultation"}
                  </Button>
                </>
              )}
            </div>
          </form>
        </DialogPrimitive.Content>
      </DialogPortal>
    </Dialog>
  );
}
