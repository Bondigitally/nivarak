import type { Metadata } from "next";
import { ContactForm } from "@/features/marketing/components/ContactForm";
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
  visuallyHidden,
  wrap,
} from "@/features/marketing/lib/marketing-classes";
import { cn } from "@/lib/utils";
import "@/features/marketing/components/sections/what-is.css";
import "@/features/marketing/components/sections/challenge.css";

export const metadata: Metadata = {
  title: "Contact Us",
  description:
    "Contact Nivarak by phone, email, or the form on this page with questions about independent aging care.",
};

const CONTACT_OPTIONS = [
  {
    icon: "i-phone",
    title: "Call the Helpline",
    body: (
      <p>
        <a href="tel:+919371090980">+91 93710 90980</a>
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
    icon: "i-clock",
    title: "Our Working Hours",
    body: <p>Mon–Sat, 10:00 AM – 6:00 PM IST</p>,
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
        body="Whether you have a question about a parent's care or want to learn more about Nivarak, reach out. We'll respond with clarity and care."
      />

      <section className={cn(section, "what-is")} aria-labelledby="options-title">
        <div className={wrap}>
          <h2 id="options-title" className={visuallyHidden}>
            Contact options
          </h2>
          <MarketingStagger className="contact-options" stagger={0.1}>
            {CONTACT_OPTIONS.map((option) => (
              <MarketingStaggerItem key={option.title} as="article">
                {/*
                  Hover lift lives on an inner shell so it doesn’t fight the
                  stagger item’s motion transform.
                */}
                <div className="contact-option">
                  <div
                    className="card-icon card-icon-soft contact-option-icon"
                    aria-hidden="true"
                  >
                    <Icon name={option.icon} />
                  </div>
                  <h3>{option.title}</h3>
                  {option.body}
                </div>
              </MarketingStaggerItem>
            ))}
          </MarketingStagger>
        </div>
      </section>

      <section
        className={cn(section, "challenge")}
        id="contact"
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
    </main>
  );
}
