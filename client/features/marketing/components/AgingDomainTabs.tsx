"use client";

import { useState } from "react";
import {
  AiBrain01Icon,
  Alert02Icon,
  FilterIcon,
  HealthIcon,
  HouseHeartIcon,
  SpoonAndForkIcon,
  UserMultiple02Icon,
  WalkingIcon,
} from "@hugeicons/core-free-icons";
import type { IconSvgElement } from "@hugeicons/react";
import { AppIcon } from "@/components/shared/AppIcon";
import { BADGE_ICON_SIZE, ICON_SIZE } from "@/lib/icons";
import "@/features/marketing/components/sections/score.css";

const DOMAINS: {
  domain: string;
  icon: IconSvgElement;
  title: string;
  status: "ok" | "watch" | "alert";
  statusLabel: string;
  body: string;
}[] = [
  {
    domain: "mobility",
    icon: WalkingIcon,
    title: "Mobility & Balance",
    status: "watch",
    statusLabel: "Watch",
    body: "Gait speed and balance checks suggest a rising fall risk if left unaddressed.",
  },
  {
    domain: "cognitive",
    icon: AiBrain01Icon,
    title: "Cognitive Health",
    status: "ok",
    statusLabel: "On track",
    body: "Memory and attention markers remain strong for everyday independence.",
  },
  {
    domain: "nutrition",
    icon: SpoonAndForkIcon,
    title: "Nutrition",
    status: "alert",
    statusLabel: "Needs focus",
    body: "Appetite and protein intake need a closer look in the care plan.",
  },
  {
    domain: "medical",
    icon: HealthIcon,
    title: "Medical Health",
    status: "ok",
    statusLabel: "On track",
    body: "Rest patterns support daytime energy and recovery.",
  },
  {
    domain: "social",
    icon: UserMultiple02Icon,
    title: "Social Function",
    status: "watch",
    statusLabel: "Watch",
    body: "Vitals are largely stable; a few readings warrant continued monitoring.",
  },
  {
    domain: "functional",
    icon: HouseHeartIcon,
    title: "Functional Independence",
    status: "ok",
    statusLabel: "On track",
    body: "Daily living activities remain manageable with current support.",
  },
];

const TABS = [
  { id: "all", label: "All Domains" },
  { id: "mobility", label: "Mobility", warn: true },
  { id: "cognitive", label: "Cognitive" },
  { id: "nutrition", label: "Nutrition", warn: true },
  { id: "medical", label: "Medical Health" },
] as const;

export function AgingDomainTabs() {
  const [domain, setDomain] = useState("all");

  return (
    <>
      <div className="aging-tabs" role="tablist" aria-label="Aging domains">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            className={`aging-tab${domain === tab.id ? " is-active" : ""}`}
            role="tab"
            aria-selected={domain === tab.id}
            data-domain={tab.id}
            onClick={() => setDomain(tab.id)}
          >
            {tab.label}
            {"warn" in tab && tab.warn ? (
              <AppIcon
                icon={Alert02Icon}
                size={BADGE_ICON_SIZE}
                className="aging-tab-warn"
              />
            ) : null}
          </button>
        ))}
      </div>

      <div className="aging-attention-bar">
        <p>3 domains need attention</p>
        <button
          type="button"
          className="aging-filter-btn"
          aria-label="Filter domains"
        >
          <AppIcon icon={FilterIcon} size={BADGE_ICON_SIZE} />
          Filter
        </button>
      </div>

      <div className="aging-domain-list">
        {DOMAINS.map((card, i) => {
          const hidden = domain !== "all" && card.domain !== domain;
          return (
            <article
              key={`${card.title}-${i}`}
              className="aging-domain-card"
              data-domain={card.domain}
              data-status={card.status}
              hidden={hidden}
            >
              <div className="aging-domain-icon" aria-hidden="true">
                <AppIcon icon={card.icon} size={ICON_SIZE} />
              </div>
              <div className="aging-domain-body">
                <div className="aging-domain-top">
                  <h4>{card.title}</h4>
                  <span className={`aging-status aging-status-${card.status}`}>
                    {card.statusLabel}
                  </span>
                </div>
                <p>{card.body}</p>
              </div>
            </article>
          );
        })}
      </div>
    </>
  );
}
