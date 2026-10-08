"use client";

import { useState, type FormEvent } from "react";
import { PhoneField } from "@/features/auth/components/primitives/PhoneField";
import { FormSelect } from "@/components/ui/form-select";
import { Icon } from "@/features/marketing/components/Icon";
import { MarketingReveal } from "@/features/marketing/components/MarketingReveal";
import {
  focusFirstField,
  scoreCheckFormSchema,
  validateWithSchema,
  type FieldErrors,
} from "@/features/marketing/lib/form-validation";
import "@/features/marketing/components/ScoreCheckForm.check-score.css";
import "@/features/marketing/components/ContactForm.contact.css";
import {
  btnPrimary,
  eyebrow,
  section,
  sectionHeadBody,
  sectionHeadTitle,
  wrap,
} from "@/features/marketing/lib/marketing-classes";
import { cn } from "@/lib/utils";

const SCORE_FOR_OPTIONS = [
  { value: "self", label: "Myself" },
  { value: "parent", label: "A parent" },
  { value: "spouse", label: "Spouse / partner" },
  { value: "other", label: "Someone else I care for" },
] as const;

const FIELD_IDS: Record<string, string> = {
  name: "score-name",
  phone: "score-phone",
  email: "score-email",
  scoreFor: "score-for",
  age: "score-age",
  city: "score-city",
  message: "score-message",
};

export function ScoreCheckForm() {
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [scoreFor, setScoreFor] = useState("");
  const [age, setAge] = useState("");
  const [city, setCity] = useState("");
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

    const result = validateWithSchema(scoreCheckFormSchema, {
      name,
      phone,
      email,
      scoreFor,
      age,
      city,
      message,
    });

    if (!result.success) {
      setErrors(result.errors);
      focusFirstField(form, FIELD_IDS, Object.keys(result.errors));
      return;
    }

    setErrors({});
    setSuccess(true);
  }

  return (
    <div className={`form-card check-score-card${success ? " is-success" : ""}`}>
      <h3>Request a score check</h3>
      <p>Takes about a minute. We&apos;ll confirm next steps by phone or email.</p>

      <div
        id="score-form-success"
        className={`form-success${success ? " is-visible" : ""}`}
        tabIndex={-1}
        role="status"
      >
        <strong>Thank you — your request was received.</strong>
        <p>
          This is a front-end confirmation only. Connect the form to your real
          endpoint before launch.
        </p>
      </div>

      <form
        id="score-check-form"
        className="contact-form"
        noValidate
        onSubmit={onSubmit}
      >
        <div className={`form-group${errors.name ? " has-error" : ""}`}>
          <label htmlFor="score-name">
            Your name <span className="req" aria-hidden="true">*</span>
          </label>
          <input
            id="score-name"
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
            id="score-phone"
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
          <label htmlFor="score-email">
            Email <span className="req" aria-hidden="true">*</span>
          </label>
          <input
            id="score-email"
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

        <div className={`form-group${errors.scoreFor ? " has-error" : ""}`}>
          <label htmlFor="score-for">
            Who is this score for?{" "}
            <span className="req" aria-hidden="true">*</span>
          </label>
          <FormSelect
            id="score-for"
            name="score_for"
            value={scoreFor}
            options={SCORE_FOR_OPTIONS}
            onChange={(value) => {
              setScoreFor(value);
              clearError("scoreFor");
            }}
            error={!!errors.scoreFor}
            aria-label="Who is this score for?"
          />
          <p className="field-error">
            {errors.scoreFor ?? "Please tell us who this is for."}
          </p>
        </div>

        <div className={`form-group${errors.age ? " has-error" : ""}`}>
          <label htmlFor="score-age">
            Age of the person <span className="req" aria-hidden="true">*</span>
          </label>
          <input
            id="score-age"
            name="age"
            type="number"
            min={40}
            max={120}
            step={1}
            inputMode="numeric"
            value={age}
            onChange={(event) => {
              setAge(event.target.value);
              clearError("age");
            }}
            aria-invalid={!!errors.age}
            required
          />
          <p className="field-error">
            {errors.age ?? "Please enter an age between 40 and 120."}
          </p>
        </div>

        <div className={`form-group${errors.city ? " has-error" : ""}`}>
          <label htmlFor="score-city">City / area</label>
          <input
            id="score-city"
            name="city"
            type="text"
            autoComplete="address-level2"
            maxLength={80}
            value={city}
            onChange={(event) => {
              setCity(event.target.value);
              clearError("city");
            }}
            aria-invalid={!!errors.city}
            placeholder="[City]"
          />
          <p className="field-error">{errors.city ?? "Please enter a valid city name."}</p>
        </div>

        <div className={`form-group${errors.message ? " has-error" : ""}`}>
          <label htmlFor="score-message">Anything we should know?</label>
          <textarea
            id="score-message"
            name="message"
            maxLength={1000}
            value={message}
            onChange={(event) => {
              setMessage(event.target.value);
              clearError("message");
            }}
            aria-invalid={!!errors.message}
            placeholder="Preferred callback time, concerns, or questions"
          />
          <p className="field-error">{errors.message ?? "Message is too long."}</p>
        </div>

        <button type="submit" className={btnPrimary}>
          Check my score
        </button>
      </form>
    </div>
  );
}

export function CheckScoreSection() {
  return (
    <section
      className={cn(section, "check-score")}
      id="check-score"
      aria-labelledby="check-score-title"
    >
      <div className={cn(wrap, "check-score-layout")}>
        <MarketingReveal className="check-score-intro" direction="left">
          <p className={eyebrow}>Get started</p>
          <h2 id="check-score-title" className={sectionHeadTitle}>
            Want to check your score?
          </h2>
          <p className={sectionHeadBody}>
            Share a few details and we&apos;ll reach out to schedule an
            Independent Aging Score assessment for you or a loved one.
          </p>
          <ul className="check-score-points">
            <li>
              <Icon name="i-check-circle" /> Whole-person check across key aging
              domains
            </li>
            <li>
              <Icon name="i-check-circle" /> One clear score families can
              understand
            </li>
            <li>
              <Icon name="i-check-circle" /> No commitment to book until
              you&apos;re ready
            </li>
          </ul>
        </MarketingReveal>
        <MarketingReveal delay={0.12} direction="right" offset={32}>
          <ScoreCheckForm />
        </MarketingReveal>
      </div>
    </section>
  );
}
