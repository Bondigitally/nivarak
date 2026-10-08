import type { Metadata } from "next";
import { ContactForm } from "@/features/marketing/components/ContactForm";
import { FaqAccordion } from "@/features/marketing/components/FaqAccordion";
import { Icon } from "@/features/marketing/components/Icon";
import { MarketingPageHero } from "@/features/marketing/components/MarketingPageHero";
import { MarketingReveal } from "@/features/marketing/components/MarketingReveal";
import {
  MarketingStagger,
  MarketingStaggerItem,
} from "@/features/marketing/components/MarketingStagger";
import {
  eyebrow,
  section,
  sectionHead,
  visuallyHidden,
  wrap,
} from "@/features/marketing/lib/marketing-classes";
import { cn } from "@/lib/utils";
import "@/features/marketing/components/sections/what-is.css";
import "@/features/marketing/components/sections/challenge.css";

export const metadata: Metadata = {
  title: "Contact Us",
  description:
    "Contact Nivarak to book an assessment, call the helpline, or ask a question about independent aging care.",
};

const CONTACT_OPTIONS = [
  {
    icon: "i-phone",
    title: "Call the Helpline",
    body: (
      <>
        <p>
          <a href="tel:+910000000000">[+91 Helpline Number]</a>
        </p>
        <p>[Hours of operation]</p>
      </>
    ),
  },
  {
    icon: "i-calendar",
    title: "Book an Assessment",
    body: (
      <p>
        <a href="#book">Use the form below</a> and we&apos;ll call you back to
        schedule a clinical assessment.
      </p>
    ),
  },
  {
    icon: "i-mail",
    title: "Email Us",
    body: (
      <p>
        <a href="mailto:meetali@nivarak.com">meetali@nivarak.com</a>
      </p>
    ),
  },
  {
    icon: "i-map",
    title: "Visit Us",
    body: <p>56 Mayur Colony, Kothrud, Pune 411038</p>,
  },
] as const;

export default function ContactPage() {
  return (
    <main id="main">
      <MarketingPageHero
        eyebrowText="Contact Us"
        titleId="contact-hero"
        title="We're Here to Help."
        body="Whether you're ready to book an assessment or just have a question about a parent's care — reach out. We'll respond with clarity and care."
      />

      <section className={cn(section, "what-is")} aria-labelledby="options-title">
        <div className={wrap}>
          <h2 id="options-title" className={visuallyHidden}>
            Contact options
          </h2>
          <MarketingStagger className="contact-options" stagger={0.1}>
            {CONTACT_OPTIONS.map((option) => (
              <MarketingStaggerItem
                key={option.title}
                as="article"
                className="contact-option"
              >
                <div className="card-icon card-icon-soft" aria-hidden="true">
                  <Icon name={option.icon} />
                </div>
                <h3>{option.title}</h3>
                {option.body}
              </MarketingStaggerItem>
            ))}
          </MarketingStagger>
        </div>
      </section>

      <section
        className={cn(section, "challenge")}
        id="book"
        aria-labelledby="form-title"
      >
        <div className={cn(wrap, "contact-layout")}>
          <MarketingReveal direction="left">
            <ContactForm />
          </MarketingReveal>
          <MarketingReveal delay={0.12} direction="right">
            <aside className="areas-aside">
              <p className={eyebrow}>Areas We Serve</p>
              <h2 className="areas-heading">Where we currently care</h2>
              <p className="areas-intro">
                Our clinic is located in Kothrud, Pune. We serve families
                across the city and surrounding neighbourhoods.
              </p>
              <div className="areas-card">
                <Icon name="i-map" /> Pune
              </div>
            </aside>
          </MarketingReveal>
        </div>
      </section>

      <section
        className={cn(section, "what-is")}
        id="faq"
        aria-labelledby="faq-title"
      >
        <div className={wrap}>
          <MarketingReveal className={sectionHead}>
            <p className={eyebrow}>FAQ</p>
            <h2 id="faq-title">Common questions</h2>
          </MarketingReveal>
          <MarketingReveal delay={0.1}>
            <FaqAccordion />
          </MarketingReveal>
        </div>
      </section>
    </main>
  );
}
