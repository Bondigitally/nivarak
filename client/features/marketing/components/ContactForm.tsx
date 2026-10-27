"use client";

import { useEffect, useState, type FormEvent } from "react";
import dynamic from "next/dynamic";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { PhoneField } from "@/features/auth/components/primitives/PhoneField";
import {
  contactFormSchema,
  focusFirstField,
  validateWithSchema,
  type FieldErrors,
} from "@/features/marketing/lib/form-validation";
import { marketingEase } from "@/features/marketing/lib/motion";
import { btnPrimary } from "@/features/marketing/lib/marketing-classes";
import "@/features/marketing/components/ContactForm.contact.css";

const DotLottieReact = dynamic(
  () => import("@lottiefiles/dotlottie-react").then((mod) => mod.DotLottieReact),
  { ssr: false },
);

/** Branded plane send animation — soft purple / primary from marketing tokens. */
const CONTACT_SUCCESS_LOTTIE = "/images/message-sent.lottie";

const FIELD_IDS: Record<string, string> = {
  name: "name",
  phone: "phone",
  email: "email",
  subject: "subject",
  message: "message",
};

const COPY_TRANSITION = {
  duration: 0.35,
  ease: marketingEase,
};

const COPY_ITEM_VARIANTS = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: COPY_TRANSITION },
};

export function ContactForm() {
  const reducedMotion = useReducedMotion();
  const [success, setSuccess] = useState(false);
  const [playCheck, setPlayCheck] = useState(false);
  const [showCopy, setShowCopy] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!success) {
      setPlayCheck(false);
      setShowCopy(false);
      return;
    }

    if (reducedMotion) {
      setPlayCheck(true);
      setShowCopy(true);
      return;
    }

    // Brief settle before Lottie mounts — same rhythm as auth success.
    const playTimer = window.setTimeout(() => setPlayCheck(true), 120);
    const fallbackTimer = window.setTimeout(() => setShowCopy(true), 3200);

    return () => {
      window.clearTimeout(playTimer);
      window.clearTimeout(fallbackTimer);
    };
  }, [success, reducedMotion]);

  function clearError(field: string) {
    if (!errors[field]) return;
    setErrors((current) => {
      const next = { ...current };
      delete next[field];
      return next;
    });
  }

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;

    const result = validateWithSchema(contactFormSchema, {
      name,
      phone,
      email,
      subject,
      message,
    });

    if (!result.success) {
      setErrors(result.errors);
      focusFirstField(form, FIELD_IDS, Object.keys(result.errors));
      return;
    }

    setErrors({});
    // PLACEHOLDER: POST to backend / CRM when ready
    setSuccess(true);
  }

  return (
    <div className={`form-card${success ? " is-success" : ""}`}>
      <header className="form-card-head">
        <h2 id="form-title">Send us a message</h2>
        <p>
          Have a question or want to learn more about Nivarak? Fill out the form
          and we&apos;ll get back to you soon.
        </p>
      </header>

      <div
        id="form-success"
        className={`form-success contact-success${success ? " is-visible" : ""}`}
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
                  dotLottie.addEventListener("complete", () => setShowCopy(true));
                }}
              />
            ) : null}
          </div>

          <AnimatePresence initial={false}>
            {showCopy ? (
              <motion.div
                key="contact-success-copy"
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
                    show: { transition: { staggerChildren: 0.04 } },
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
                    Thank you for reaching out to Nivarak. Our team will review
                    your message and get back to you shortly.
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
                    We&apos;ll follow up using the contact details you provided.
                  </p>
                </motion.div>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>
      </div>

      <form
        id="contact-form"
        className="contact-form"
        noValidate
        onSubmit={onSubmit}
      >
        <div className="form-row">
          <div className={`form-group${errors.name ? " has-error" : ""}`}>
            <label htmlFor="name">
              Name <span className="req" aria-hidden="true">*</span>
            </label>
            <input
              id="name"
              name="name"
              type="text"
              autoComplete="name"
              maxLength={80}
              value={name}
              onChange={(event) => {
                setName(event.target.value);
                clearError("name");
              }}
              aria-invalid={!!errors.name}
              aria-describedby={errors.name ? "name-error" : undefined}
              required
              placeholder="Your full name"
            />
            <p id="name-error" className="field-error">
              {errors.name ?? "Please enter your name."}
            </p>
          </div>

          <div className={`form-group${errors.email ? " has-error" : ""}`}>
            <label htmlFor="email">
              Email <span className="req" aria-hidden="true">*</span>
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              maxLength={254}
              value={email}
              onChange={(event) => {
                setEmail(event.target.value);
                clearError("email");
              }}
              aria-invalid={!!errors.email}
              aria-describedby={errors.email ? "email-error" : undefined}
              required
              placeholder="you@example.com"
            />
            <p id="email-error" className="field-error">
              {errors.email ?? "Please enter a valid email address."}
            </p>
          </div>
        </div>

        <div className="form-row">
          <div className={`form-group${errors.phone ? " has-error" : ""}`}>
            <PhoneField
              id="phone"
              label="Phone *"
              value={phone}
              onChange={(value) => {
                setPhone(value);
                clearError("phone");
              }}
              error={errors.phone}
              showError={false}
            />
            <p id="phone-error" className="field-error">
              {errors.phone ?? "Please enter a valid phone number."}
            </p>
          </div>

          <div className={`form-group${errors.subject ? " has-error" : ""}`}>
            <label htmlFor="subject">Subject</label>
            <input
              id="subject"
              name="subject"
              type="text"
              maxLength={120}
              value={subject}
              onChange={(event) => {
                setSubject(event.target.value);
                clearError("subject");
              }}
              aria-invalid={!!errors.subject}
              aria-describedby={errors.subject ? "subject-error" : undefined}
              placeholder="What is this about?"
            />
            <p id="subject-error" className="field-error">
              {errors.subject ?? "Please enter a shorter subject."}
            </p>
          </div>
        </div>

        <div className={`form-group${errors.message ? " has-error" : ""}`}>
          <label htmlFor="message">
            Message <span className="req" aria-hidden="true">*</span>
          </label>
          <textarea
            id="message"
            name="message"
            maxLength={1000}
            value={message}
            onChange={(event) => {
              setMessage(event.target.value);
              clearError("message");
            }}
            aria-invalid={!!errors.message}
            aria-describedby={errors.message ? "message-error" : undefined}
            required
            placeholder="How can we help?"
            rows={5}
          />
          <p id="message-error" className="field-error">
            {errors.message ?? "Please add a short message."}
          </p>
        </div>

        <div className="form-actions">
          <button type="submit" className={btnPrimary}>
            Send message
          </button>
        </div>
      </form>
    </div>
  );
}
