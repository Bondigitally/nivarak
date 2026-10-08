"use client";

import { useState, type FormEvent } from "react";
import { PhoneField } from "@/features/auth/components/primitives/PhoneField";
import { FormSelect } from "@/components/ui/form-select";
import {
  contactFormSchema,
  focusFirstField,
  validateWithSchema,
  type FieldErrors,
} from "@/features/marketing/lib/form-validation";
import { btnPrimary } from "@/features/marketing/lib/marketing-classes";
import "@/features/marketing/components/ContactForm.contact.css";

const RELATIONSHIP_OPTIONS = [
  { value: "son-daughter", label: "Son / Daughter" },
  { value: "spouse", label: "Spouse / Partner" },
  { value: "self", label: "I'm the person seeking care" },
  { value: "other", label: "Other family / caregiver" },
] as const;

const FIELD_IDS: Record<string, string> = {
  name: "name",
  phone: "phone",
  email: "email",
  relationship: "relationship",
  message: "message",
};

export function ContactForm() {
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [relationship, setRelationship] = useState("");
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
      relationship,
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
      <h2 id="form-title">Book an assessment</h2>
      <p>
        Tell us a little about your situation. We&apos;ll call you back to
        schedule a clinical assessment at a time that works for you.
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
            required
          />
          <p className="field-error">{errors.name ?? "Please enter your name."}</p>
        </div>

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
          />
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
            required
          />
          <p className="field-error">
            {errors.email ?? "Please enter a valid email address."}
          </p>
        </div>

        <div className={`form-group${errors.relationship ? " has-error" : ""}`}>
          <label htmlFor="relationship">
            Relationship to the person needing care{" "}
            <span className="req" aria-hidden="true">*</span>
          </label>
          <FormSelect
            id="relationship"
            name="relationship"
            value={relationship}
            options={RELATIONSHIP_OPTIONS}
            onChange={(value) => {
              setRelationship(value);
              clearError("relationship");
            }}
            error={!!errors.relationship}
            aria-label="Relationship to the person needing care"
          />
          <p className="field-error">
            {errors.relationship ?? "Please select a relationship."}
          </p>
        </div>

        <div className={`form-group${errors.message ? " has-error" : ""}`}>
          <label htmlFor="message">
            Message / preferred callback time{" "}
            <span className="req" aria-hidden="true">*</span>
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
            required
            placeholder="Share a brief note and when it's best to call you."
          />
          <p className="field-error">
            {errors.message ?? "Please add a short message or preferred time."}
          </p>
        </div>

        <button type="submit" className={btnPrimary}>
          Request a callback
        </button>
      </form>
    </div>
  );
}
