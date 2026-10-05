"use client";

import { useState } from "react";
import { Icon } from "@/features/marketing/components/Icon";
import "@/features/marketing/components/ContactForm.contact.css";

const FAQ_ITEMS = [
  {
    q: "What happens in the first assessment?",
    a: "We complete a whole-person evaluation across the domains that shape independence — movement, memory, mood, nutrition, sleep, and more. You'll leave with clarity on strengths, risks, and next steps, including an Independent Aging Score™.",
  },
  {
    q: "Is this a replacement for my parent's doctor?",
    a: "No. Nivarak works alongside your existing physicians. We provide continuous, preventive oversight and coordination — not a replacement for primary or specialty care.",
  },
  {
    q: "Who is Nivarak for?",
    a: "Older adults living independently or with family, and adult children who want a medically-led partner between doctor visits — especially when early changes feel hard to quantify.",
  },
  {
    q: "How often is the Aging Score updated?",
    a: "Scores are reassessed on a regular cadence as part of continuous monitoring. Your care team will share the schedule that fits your plan. [Confirm exact cadence with clinical team.]",
  },
  {
    q: "Can family members living abroad stay involved?",
    a: "Yes. Family-first communication is built into the model — so adult children can stay informed and reassured, wherever they are.",
  },
] as const;

export function FaqAccordion() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="faq-list">
      {FAQ_ITEMS.map((item, i) => {
        const open = openIndex === i;
        return (
          <div
            key={item.q}
            className="faq-item"
            data-open={open ? "true" : "false"}
          >
            <button
              type="button"
              className="faq-trigger"
              aria-expanded={open}
              onClick={() => setOpenIndex(open ? null : i)}
            >
              {item.q}
              <Icon name="i-chevron" />
            </button>
            <div className="faq-panel">
              <p>{item.a}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
