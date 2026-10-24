/**
 * Sample Aging Score report — single source for ring, callouts, and domain list.
 * Six domains; counts must stay in sync with the donut.
 */
export type AgingDomainStatus = "ok" | "watch" | "alert";

export type AgingSampleDomain = {
  id: string;
  tabLabel: string;
  title: string;
  status: AgingDomainStatus;
  statusLabel: string;
  body: string;
  /** Domain score used by the shared DonutChart (doctor portal ring). */
  score: number;
  max: number;
  /** Segment color — same palette language as the doctor IAS-P ring. */
  color: string;
};

export const AGING_SCORE_SAMPLE = {
  score: 86,
  maxScore: 100,
  memberLabel: "[Sample Member]",
} as const;

export const AGING_SAMPLE_DOMAINS: readonly AgingSampleDomain[] = [
  {
    id: "mobility",
    tabLabel: "Mobility",
    title: "Mobility & Balance",
    status: "watch",
    statusLabel: "Watch",
    body: "Gait speed and balance checks suggest a rising fall risk if left unaddressed.",
    score: 12,
    max: 20,
    color: "#2e8b57",
  },
  {
    id: "cognitive",
    tabLabel: "Cognitive",
    title: "Cognitive Health",
    status: "ok",
    statusLabel: "On track",
    body: "Memory and attention markers remain strong for everyday independence.",
    score: 18,
    max: 20,
    color: "#7932ba",
  },
  {
    id: "nutrition",
    tabLabel: "Nutrition",
    title: "Nutrition",
    status: "alert",
    statusLabel: "Needs focus",
    body: "Appetite and protein intake need a closer look in the care plan.",
    score: 6,
    max: 16,
    color: "#ea4335",
  },
  {
    id: "medical",
    tabLabel: "Medical",
    title: "Medical Health",
    status: "ok",
    statusLabel: "On track",
    body: "Medications and vitals are largely stable with routine follow-up.",
    score: 16,
    max: 18,
    color: "#147AD6",
  },
  {
    id: "social",
    tabLabel: "Social",
    title: "Social Function",
    status: "watch",
    statusLabel: "Watch",
    body: "Weekly contact is thinner than usual — worth checking in more often.",
    score: 10,
    max: 14,
    color: "#F59E0B",
  },
  {
    id: "functional",
    tabLabel: "Functional",
    title: "Functional Independence",
    status: "ok",
    statusLabel: "On track",
    body: "Daily living activities remain manageable with current support.",
    score: 14,
    max: 16,
    color: "#0d9488",
  },
] as const;

export const AGING_DOMAIN_STATUS_META = {
  ok: { label: "on track", callout: "on track" },
  watch: { label: "watch", callout: "watch" },
  alert: { label: "needs focus", callout: "needs focus" },
} as const;

export function getAgingDomainStatusCounts(
  domains: readonly AgingSampleDomain[] = AGING_SAMPLE_DOMAINS,
) {
  const counts = { ok: 0, watch: 0, alert: 0 };
  for (const domain of domains) {
    counts[domain.status] += 1;
  }
  return counts;
}

export function getAgingDomainsNeedingAttention(
  domains: readonly AgingSampleDomain[] = AGING_SAMPLE_DOMAINS,
) {
  return domains.filter((d) => d.status !== "ok");
}
