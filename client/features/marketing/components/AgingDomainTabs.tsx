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
import {
  AGING_SAMPLE_DOMAINS,
  getAgingDomainsNeedingAttention,
} from "@/features/marketing/data/aging-score-sample";
import { BADGE_ICON_SIZE, ICON_SIZE } from "@/lib/icons";
import "@/features/marketing/components/sections/score.css";

const DOMAIN_ICONS: Record<string, IconSvgElement> = {
  mobility: WalkingIcon,
  cognitive: AiBrain01Icon,
  nutrition: SpoonAndForkIcon,
  medical: HealthIcon,
  social: UserMultiple02Icon,
  functional: HouseHeartIcon,
};

export function AgingDomainTabs() {
  const [domain, setDomain] = useState("all");
  const needsAttention = getAgingDomainsNeedingAttention();

  return (
    <>
      <div className="aging-tabs" role="tablist" aria-label="Aging domains">
        <button
          type="button"
          className={`aging-tab${domain === "all" ? " is-active" : ""}`}
          role="tab"
          aria-selected={domain === "all"}
          data-domain="all"
          onClick={() => setDomain("all")}
        >
          All Domains
        </button>
        {AGING_SAMPLE_DOMAINS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            className={`aging-tab${domain === tab.id ? " is-active" : ""}`}
            role="tab"
            aria-selected={domain === tab.id}
            data-domain={tab.id}
            onClick={() => setDomain(tab.id)}
          >
            {tab.tabLabel}
            {tab.status !== "ok" ? (
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
        <p>
          {needsAttention.length === 1
            ? "1 domain needs attention"
            : `${needsAttention.length} domains need attention`}
        </p>
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
        {AGING_SAMPLE_DOMAINS.map((card) => {
          const hidden = domain !== "all" && card.id !== domain;
          return (
            <article
              key={card.id}
              className="aging-domain-card"
              data-domain={card.id}
              data-status={card.status}
              hidden={hidden}
            >
              <div className="aging-domain-icon" aria-hidden="true">
                <AppIcon icon={DOMAIN_ICONS[card.id]} size={ICON_SIZE} />
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
