"use client";

import { useState, type FormEvent } from "react";
import { btnPrimary } from "@/features/marketing/lib/marketing-classes";
import "@/features/marketing/components/ContactForm.contact.css";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type FieldErrors = Record<string, boolean>;

export function ContactForm() {
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    const next: FieldErrors = {};

    if (!String(data.get("name") ?? "").trim()) next.name = true;
    if (!String(data.get("phone") ?? "").trim()) next.phone = true;
    if (!EMAIL_RE.test(String(data.get("email") ?? "").trim())) next.email = true;
    if (!String(data.get("relationship") ?? "").trim()) next.relationship = true;
    if (!String(data.get("message") ?? "").trim()) next.message = true;

    setErrors(next);
    if (Object.keys(next).length) {
      requestAnimationFrame(() => {
        const el = form.querySelector<HTMLElement>(
          Object.keys(next)
            .map((id) => `#${id}`)
            .join(", "),
        );
        el?.focus();
      });
      return;
    }

    // PLACEHOLDER: POST to backend / CRM when ready
    setSuccess(true);
  }

  return (
    <div className={`form-card${success ? " is-success" : ""}`}>
      <h2 id="form-title">Request a callback</h2>
      <p>
        Tell us a little about your situation. We&apos;ll get back to you to
        schedule an assessment.
      </p>

      <div
        id="form-success"
        className={`form-success${success ? " is-visible" : ""}`}
        tabIndex={-1}
        role="status"
      >
        <strong>Thank you — your request was received.</strong>
        <p>
          This is a front-end confirmation only. Wire the form submit handler to
          your real endpoint before launch.
        </p>
      </div>

      <form id="contact-form" className="contact-form" noValidate onSubmit={onSubmit}>
        <div className={`form-group${errors.name ? " has-error" : ""}`}>
          <label htmlFor="name">
            Name <span className="req" aria-hidden="true">*</span>
          </label>
          <input id="name" name="name" type="text" autoComplete="name" required />
          <p className="field-error">Please enter your name.</p>
        </div>
        <div className={`form-group${errors.phone ? " has-error" : ""}`}>
          <label htmlFor="phone">
            Phone <span className="req" aria-hidden="true">*</span>
          </label>
          <input id="phone" name="phone" type="tel" autoComplete="tel" required />
          <p className="field-error">Please enter a phone number.</p>
        </div>
        <div className={`form-group${errors.email ? " has-error" : ""}`}>
          <label htmlFor="email">
            Email <span className="req" aria-hidden="true">*</span>
          </label>
          <input id="email" name="email" type="email" autoComplete="email" required />
          <p className="field-error">Please enter a valid email address.</p>
        </div>
        <div className={`form-group${errors.relationship ? " has-error" : ""}`}>
          <label htmlFor="relationship">
            Relationship to the person needing care{" "}
            <span className="req" aria-hidden="true">*</span>
          </label>
          <select id="relationship" name="relationship" required>
            <option value="">Select one</option>
            <option value="son-daughter">Son / Daughter</option>
            <option value="spouse">Spouse / Partner</option>
            <option value="self">I&apos;m the person seeking care</option>
            <option value="other">Other family / caregiver</option>
          </select>
          <p className="field-error">Please select a relationship.</p>
        </div>
        <div className={`form-group${errors.message ? " has-error" : ""}`}>
          <label htmlFor="message">
            Message / preferred callback time{" "}
            <span className="req" aria-hidden="true">*</span>
          </label>
          <textarea
            id="message"
            name="message"
            required
            placeholder="Share a brief note and when it's best to call you."
          />
          <p className="field-error">Please add a short message or preferred time.</p>
        </div>
        <button type="submit" className={btnPrimary}>
          Submit request
        </button>
      </form>
    </div>
  );
}
