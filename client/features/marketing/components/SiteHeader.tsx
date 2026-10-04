"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Call02Icon } from "@hugeicons/core-free-icons";
import { AppIcon } from "@/components/shared/AppIcon";
import { BrandLogo, brandLogoNavClassName } from "@/components/shared/BrandLogo";
import { marketingHomeHash } from "@/features/marketing/lib/home-hash";
import { MARKETING_SECTION_SCROLL_MARGIN_PX } from "@/features/marketing/lib/header-layout";
import {
  btnOutline,
  btnPrimary,
  wrap,
} from "@/features/marketing/lib/marketing-classes";
import {
  MARKETING_SECTION_NAV,
  type MarketingSectionId,
} from "@/features/marketing/lib/marketing-nav";
import { ICON_SIZE } from "@/lib/icons";
import { cn } from "@/lib/utils";
import "@/features/marketing/components/SiteHeader.glass.css";

const navLinkClass = cn(
  "block py-3 font-medium transition-colors duration-100",
  "text-[length:var(--type-body-m-size)] leading-[var(--type-body-m-line)]",
  "!text-[var(--color-text-secondary)] hover:!text-[var(--color-primary)]",
  "aria-[current=true]:!text-[var(--color-primary)]",
  "aria-[current=page]:!text-[var(--color-primary)]",
  "min-[1440px]:py-0",
);

export function SiteHeader() {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const isBlog = pathname === "/blog" || pathname.startsWith("/blog/");
  const [scrolled, setScrolled] = useState(false);
  const [navOpen, setNavOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<MarketingSectionId | null>(
    null,
  );

  useEffect(() => {
    setNavOpen(false);
  }, [pathname]);

  useEffect(() => {
    const syncChrome = () => {
      const nextScrolled = window.scrollY > 24;
      setScrolled((prev) => (prev === nextScrolled ? prev : nextScrolled));

      if (!isHome) {
        setActiveSection((prev) => (prev === null ? prev : null));
        return;
      }

      const marker = window.scrollY + MARKETING_SECTION_SCROLL_MARGIN_PX + 24;
      let current: MarketingSectionId | null = null;

      for (const item of MARKETING_SECTION_NAV) {
        const el = document.getElementById(item.id);
        if (!el) continue;
        const top = el.getBoundingClientRect().top + window.scrollY;
        if (top <= marker) current = item.id;
      }

      setActiveSection((prev) => (prev === current ? prev : current));
    };

    syncChrome();
    window.addEventListener("scroll", syncChrome, { passive: true });
    window.addEventListener("resize", syncChrome);
    return () => {
      window.removeEventListener("scroll", syncChrome);
      window.removeEventListener("resize", syncChrome);
    };
  }, [isHome]);

  const closeNav = () => setNavOpen(false);
  const floating = scrolled;
  const glassActive = scrolled || navOpen;

  return (
    <>
      <div
        className={cn(
          "site-header-shell fixed z-30 transition-[inset,padding] duration-300 ease-out",
          floating
            ? "inset-x-3 top-3 min-[744px]:inset-x-4 min-[744px]:top-4 min-[1440px]:inset-x-[max(1.5rem,calc((100%-var(--page-max))/2))]"
            : "inset-x-0 top-0",
        )}
      >
        <div
          className={cn(
            "site-header-float relative",
            floating && "is-floating",
            glassActive && "is-glass-active",
          )}
        >
          <div className="site-header-frost" aria-hidden>
            <div className="site-header-frost-blur" />
            <div className="site-header-frost-tint" />
          </div>

          <header id="site-header" className="relative z-10 bg-transparent">
            <div
              className={cn(
                floating ? "px-4 min-[744px]:px-5 min-[1440px]:px-6" : wrap,
                "relative flex items-center gap-4 transition-[min-height,padding] duration-300 ease-out",
                floating ? "min-h-14 py-2" : "min-h-[5.5rem] py-3",
              )}
            >
              <Link
                className="inline-flex shrink-0 items-center text-inherit no-underline [&_span]:!text-[var(--color-text-primary)]"
                href="/"
                aria-label="Nivarak home"
              >
                <BrandLogo className={brandLogoNavClassName} />
              </Link>

              <button
                type="button"
                className={cn(
                  "ml-auto inline-flex size-11 cursor-pointer flex-col items-center justify-center gap-[5px] border-0 bg-transparent p-0",
                  "max-[1439px]:order-3 max-[1439px]:ml-0",
                  "min-[1440px]:hidden",
                )}
                aria-expanded={navOpen}
                aria-controls="primary-nav"
                aria-label={navOpen ? "Close menu" : "Open menu"}
                onClick={() => setNavOpen((open) => !open)}
              >
                <span
                  aria-hidden
                  className={cn(
                    "mx-auto block h-0.5 w-5 rounded-full bg-[var(--color-text-primary)] transition duration-200 ease-out",
                    navOpen && "translate-y-[7px] rotate-45",
                  )}
                />
                <span
                  aria-hidden
                  className={cn(
                    "mx-auto block h-0.5 w-5 rounded-full bg-[var(--color-text-primary)] transition duration-100 ease-out",
                    navOpen && "opacity-0",
                  )}
                />
                <span
                  aria-hidden
                  className={cn(
                    "mx-auto block h-0.5 w-5 rounded-full bg-[var(--color-text-primary)] transition duration-200 ease-out",
                    navOpen && "-translate-y-[7px] -rotate-45",
                  )}
                />
              </button>

              <nav
                id="primary-nav"
                aria-label="Primary"
                className={cn(
                  "max-[1439px]:absolute max-[1439px]:inset-x-0 max-[1439px]:top-full max-[1439px]:m-0",
                  floating
                    ? "max-[1439px]:mt-2 max-[1439px]:rounded-[var(--radius-squircle)] max-[1439px]:[corner-shape:squircle] max-[1439px]:border max-[1439px]:border-[var(--color-border-divider)] max-[1439px]:bg-[var(--color-surface-raised)]/95 max-[1439px]:shadow-[var(--shadow-m)] max-[1439px]:backdrop-blur-md"
                    : "max-[1439px]:border-b max-[1439px]:border-[var(--color-border-divider)] max-[1439px]:bg-[var(--color-surface-raised)] max-[1439px]:shadow-[var(--shadow-m)]",
                  navOpen ? "max-[1439px]:block" : "max-[1439px]:hidden",
                  "min-[1440px]:ml-8",
                )}
              >
                <ul
                  className={cn(
                    "flex flex-col items-stretch gap-0 py-2 pb-4",
                    floating ? "px-4" : "px-[var(--gutter-mobile)]",
                    "min-[1440px]:flex-row min-[1440px]:items-center min-[1440px]:gap-6 min-[1440px]:p-0",
                  )}
                >
                  {MARKETING_SECTION_NAV.map((item) => (
                    <li key={item.id}>
                      <Link
                        className={navLinkClass}
                        href={marketingHomeHash(item.hash, isHome)}
                        aria-current={
                          isHome && activeSection === item.id ? true : undefined
                        }
                        onClick={closeNav}
                      >
                        {item.label}
                      </Link>
                    </li>
                  ))}
                  <li>
                    <Link
                      className={navLinkClass}
                      href="/blog"
                      aria-current={isBlog ? "page" : undefined}
                      onClick={closeNav}
                    >
                      Blog
                    </Link>
                  </li>
                  <li className="flex flex-col gap-2 pt-2 min-[1440px]:hidden">
                    <Link
                      className={cn(btnOutline, "w-full")}
                      href="/login"
                      onClick={closeNav}
                    >
                      Log in
                    </Link>
                    <Link
                      className={cn(btnPrimary, "w-full")}
                      href="/contact#book"
                      onClick={closeNav}
                    >
                      Book an Assessment
                    </Link>
                  </li>
                </ul>
              </nav>

              <div
                className={cn(
                  "ml-auto flex items-center gap-3",
                  "max-[1439px]:order-2",
                )}
              >
                <a
                  className={cn(
                    "hidden items-center gap-2 whitespace-nowrap font-medium",
                    "text-[length:var(--type-body-m-size)] leading-[var(--type-body-m-line)]",
                    "!text-[var(--color-text-link)]",
                    "min-[1440px]:inline-flex",
                  )}
                  href="tel:+910000000000"
                >
                  <AppIcon icon={Call02Icon} size={ICON_SIZE} />
                  <span>[+91 Helpline]</span>
                </a>
                <Link
                  className={cn(btnOutline, "hidden min-[1440px]:inline-flex")}
                  href="/login"
                >
                  Log in
                </Link>
                <Link
                  className={cn(
                    btnPrimary,
                    "max-[1439px]:min-h-10 max-[1439px]:px-4 max-[1439px]:text-[length:var(--type-caption-size)]",
                  )}
                  href="/contact#book"
                >
                  Book an Assessment
                </Link>
              </div>
            </div>
          </header>
        </div>
      </div>
      <div aria-hidden className="h-[5.5rem] shrink-0" />
    </>
  );
}
