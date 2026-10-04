"use client";

import { useState, type FormEvent } from "react";
import { Icon } from "@/features/marketing/components/Icon";
import { MarketingReveal } from "@/features/marketing/components/MarketingReveal";
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

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type FieldErrors = Record<string, boolean>;

export function ScoreCheckForm() {
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    const next: FieldErrors = {};

    if (!String(data.get("name") ?? "").trim()) next["score-name"] = true;
    if (!String(data.get("phone") ?? "").trim()) next["score-phone"] = true;
    if (!EMAIL_RE.test(String(data.get("email") ?? "").trim())) {
      next["score-email"] = true;
    }
    if (!String(data.get("score_for") ?? "").trim()) next["score-for"] = true;
    const age = Number(data.get("age"));
    if (
      String(data.get("age") ?? "").trim() === "" ||
      Number.isNaN(age) ||
      age < 40 ||
      age > 120
    ) {
      next["score-age"] = true;
    }

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
        <div className={`form-group${errors["score-name"] ? " has-error" : ""}`}>
          <label htmlFor="score-name">
            Your name <span className="req" aria-hidden="true">*</span>
          </label>
          <input
            id="score-name"
            name="name"
            type="text"
            autoComplete="name"
            required
          />
          <p className="field-error">Please enter your name.</p>
        </div>
        <div className={`form-group${errors["score-phone"] ? " has-error" : ""}`}>
          <label htmlFor="score-phone">
            Phone <span className="req" aria-hidden="true">*</span>
          </label>
          <input
            id="score-phone"
            name="phone"
            type="tel"
            autoComplete="tel"
            required
          />
          <p className="field-error">Please enter a phone number.</p>
        </div>
        <div className={`form-group${errors["score-email"] ? " has-error" : ""}`}>
          <label htmlFor="score-email">
            Email <span className="req" aria-hidden="true">*</span>
          </label>
          <input
            id="score-email"
            name="email"
            type="email"
            autoComplete="email"
            required
          />
          <p className="field-error">Please enter a valid email address.</p>
        </div>
        <div className={`form-group${errors["score-for"] ? " has-error" : ""}`}>
          <label htmlFor="score-for">
            Who is this score for?{" "}
            <span className="req" aria-hidden="true">*</span>
          </label>
          <select id="score-for" name="score_for" required>
            <option value="">Select one</option>
            <option value="self">Myself</option>
            <option value="parent">A parent</option>
            <option value="spouse">Spouse / partner</option>
            <option value="other">Someone else I care for</option>
          </select>
          <p className="field-error">Please tell us who this is for.</p>
        </div>
        <div className={`form-group${errors["score-age"] ? " has-error" : ""}`}>
          <label htmlFor="score-age">
            Age of the person <span className="req" aria-hidden="true">*</span>
          </label>
          <input
            id="score-age"
            name="age"
            type="number"
            min={40}
            max={120}
            inputMode="numeric"
            required
          />
          <p className="field-error">Please enter an age.</p>
        </div>
        <div className="form-group">
          <label htmlFor="score-city">City / area</label>
          <input
            id="score-city"
            name="city"
            type="text"
            autoComplete="address-level2"
            placeholder="[City]"
          />
        </div>
        <div className="form-group">
          <label htmlFor="score-message">Anything we should know?</label>
          <textarea
            id="score-message"
            name="message"
            placeholder="Preferred callback time, concerns, or questions"
          />
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
