"use client";

import { useState, type FormEvent } from "react";
import { PhoneField } from "@/features/auth/components/primitives/PhoneField";
import { Icon } from "@/features/marketing/components/Icon";
import {
  contactFormSchema,
  focusFirstField,
  validateWithSchema,
  type FieldErrors,
} from "@/features/marketing/lib/form-validation";
import { btnPrimary } from "@/features/marketing/lib/marketing-classes";
import "@/features/marketing/components/ContactForm.contact.css";

const FIELD_IDS: Record<string, string> = {
  name: "name",
  phone: "phone",
  email: "email",
  subject: "subject",
  message: "message",
};

export function ContactForm() {
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

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
        className={`form-success${success ? " is-visible" : ""}`}
        tabIndex={-1}
        role="status"
      >
        <div className="form-success-icon" aria-hidden="true">
          <Icon name="i-check-circle" />
        </div>
        <strong>Thank you. Your message was received.</strong>
        <p>We&apos;ll review it and get back to you shortly.</p>
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
