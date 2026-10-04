"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { MARKETING_SECTION_SCROLL_MARGIN_PX } from "@/features/marketing/lib/header-layout";
import { resolveMarketingSectionId } from "@/features/marketing/lib/marketing-nav";

function scrollToId(id: string, behavior: ScrollBehavior = "smooth") {
  const resolved = resolveMarketingSectionId(id) ?? id;
  const el = document.getElementById(resolved);
  if (!el) return;

  const top =
    el.getBoundingClientRect().top +
    window.scrollY -
    MARKETING_SECTION_SCROLL_MARGIN_PX;

  window.scrollTo({ top: Math.max(0, top), behavior });
}

/**
 * Smooth-scrolls to in-page section hashes (nav / footer / deep links),
 * clearing the fixed marketing header. Resolves legacy hash aliases.
 */
export function MarketingHashScroll() {
  const pathname = usePathname();

  useEffect(() => {
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const behavior: ScrollBehavior = reduceMotion ? "auto" : "smooth";

    const runFromLocation = () => {
      if (!window.location.hash) return;
      scrollToId(window.location.hash, behavior);
    };

    const frame = requestAnimationFrame(() => runFromLocation());
    const timeout = window.setTimeout(() => runFromLocation(), 120);

    const onHashChange = () => runFromLocation();
    window.addEventListener("hashchange", onHashChange);

    const onClick = (event: MouseEvent) => {
      const target = event.target;
      if (!(target instanceof Element)) return;
      const anchor = target.closest("a[href]");
      if (!(anchor instanceof HTMLAnchorElement)) return;

      const hrefAttr = anchor.getAttribute("href");
      if (!hrefAttr || !hrefAttr.includes("#")) return;

      let url: URL;
      try {
        url = new URL(anchor.href, window.location.origin);
      } catch {
        return;
      }

      if (!url.hash || url.hash === "#") return;

      const onHome =
        url.pathname === "/" ||
        url.pathname === "" ||
        (pathname === "/" && hrefAttr.startsWith("#"));

      if (!onHome && url.pathname !== pathname) return;
      if (url.pathname !== "/" && !hrefAttr.startsWith("#")) return;

      const resolved = resolveMarketingSectionId(url.hash);
      const targetId = resolved ?? url.hash.slice(1);
      if (!document.getElementById(targetId)) return;

      event.preventDefault();
      const nextHash = `#${targetId}`;
      if (window.location.hash !== nextHash) {
        history.pushState(null, "", nextHash);
      }
      scrollToId(targetId, behavior);
    };

    document.addEventListener("click", onClick);

    return () => {
      cancelAnimationFrame(frame);
      window.clearTimeout(timeout);
      window.removeEventListener("hashchange", onHashChange);
      document.removeEventListener("click", onClick);
    };
  }, [pathname]);

  return null;
}
