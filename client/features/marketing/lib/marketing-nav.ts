/** Home section anchors in page scroll order — keep nav / footer / sections in sync. */
export const MARKETING_SECTION_NAV = [
  { label: "Why Nivarak", hash: "#why-nivarak", id: "why-nivarak" },
  { label: "Care Ecosystem", hash: "#care-ecosystem", id: "care-ecosystem" },
  { label: "Aging Score", hash: "#aging-score", id: "aging-score" },
  { label: "How It Works", hash: "#how-it-works", id: "how-it-works" },
  { label: "Experts", hash: "#experts", id: "experts" },
] as const;

export type MarketingSectionId = (typeof MARKETING_SECTION_NAV)[number]["id"];

/** Legacy hashes → current section ids (bookmarks / old links). */
export const MARKETING_SECTION_HASH_ALIASES: Record<string, MarketingSectionId> =
  {
    challenge: "why-nivarak",
    ecosystem: "care-ecosystem",
    what: "care-ecosystem",
    score: "aging-score",
    how: "how-it-works",
    experts: "experts",
  };

export function resolveMarketingSectionId(
  hashOrId: string,
): MarketingSectionId | null {
  const id = hashOrId.replace(/^#/, "").trim();
  if (!id) return null;
  if (MARKETING_SECTION_NAV.some((item) => item.id === id)) {
    return id as MarketingSectionId;
  }
  return MARKETING_SECTION_HASH_ALIASES[id] ?? null;
}
