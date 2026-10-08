"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Facebook02Icon,
  InstagramIcon,
  Linkedin02Icon,
} from "@hugeicons/core-free-icons";
import { AppIcon } from "@/components/shared/AppIcon";
import { BrandLogo } from "@/components/shared/BrandLogo";
import { marketingHomeHash } from "@/features/marketing/lib/home-hash";
import { wrap } from "@/features/marketing/lib/marketing-classes";
import { MARKETING_SECTION_NAV } from "@/features/marketing/lib/marketing-nav";
import { BADGE_ICON_SIZE } from "@/lib/icons";
import { cn } from "@/lib/utils";
import "@/features/marketing/components/SiteFooter.css";

const footerLink = cn(
  "!text-white/75 transition-colors duration-[var(--duration-fast)] ease-[var(--ease-out)]",
  "hover:!text-white",
);

const footerColTitle = cn(
  "text-[length:var(--type-overline-size)] font-[number:var(--type-overline-weight)]",
  "uppercase leading-[var(--type-overline-line)] tracking-[var(--type-overline-tracking)]",
  "!text-white",
);

const footerMuted = "!text-white/70";
/* Use column flex gap — marketing base.css zeros ul margins, so mt-* on lists is ignored. */
const footerList = "flex flex-col gap-3 text-left";
const footerItem =
  "text-[length:var(--type-body-m-size)] leading-[var(--type-body-m-line)] !text-white/75";
const footerCol = "flex min-w-0 flex-col gap-4 text-left";

export function SiteFooter() {
  const isHome = usePathname() === "/";
  return (
    <footer className="site-footer bg-[var(--color-neutral-950)] pb-6 pt-16 !text-white">
      <div className={wrap}>
        <div
          className={cn(
            "mb-12 flex flex-col gap-12",
            "min-[1440px]:flex-row min-[1440px]:items-start min-[1440px]:justify-between min-[1440px]:gap-16",
          )}
        >
          <div className="flex max-w-[18rem] shrink-0 flex-col items-start gap-4 text-left">
            <Link
              href="/"
              aria-label="Nivarak home"
              className="inline-flex shrink-0 !text-white no-underline"
            >
              <BrandLogo
                size="compact"
                className="!text-white [&_.brand-logo__wordmark]:!text-white"
              />
            </Link>
            <p
              className={cn(
                "w-full text-[length:var(--type-body-m-size)] leading-[var(--type-body-m-line)]",
                footerMuted,
              )}
            >
              Your partner in independent aging — medical expertise,
              personalized care, and continuous monitoring for older adults
              and the families who love them.
            </p>
            <div
              className="flex w-full items-center justify-start gap-2"
              aria-label="Social links"
            >
              {[
                { href: "#", label: "Facebook", icon: Facebook02Icon },
                { href: "#", label: "Instagram", icon: InstagramIcon },
                { href: "#", label: "LinkedIn", icon: Linkedin02Icon },
              ].map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  aria-label={item.label}
                  className={cn(
                    "grid size-[2.125rem] shrink-0 place-items-center rounded-full",
                    "bg-white/10 !text-white",
                    "transition-colors duration-[var(--duration-fast)] ease-[var(--ease-out)]",
                    "hover:bg-white/20",
                  )}
                >
                  <AppIcon
                    icon={item.icon}
                    size={BADGE_ICON_SIZE}
                    className="!text-white"
                  />
                </a>
              ))}
            </div>
          </div>

          <div
            className={cn(
              "grid grid-cols-2 gap-x-16 gap-y-10",
              "min-[744px]:grid-cols-4 min-[744px]:gap-x-20",
              "min-[1440px]:flex min-[1440px]:flex-nowrap min-[1440px]:gap-x-20",
            )}
          >
            <div className={footerCol}>
              <h2 className={footerColTitle}>Nivarak</h2>
              <ul className={footerList}>
                {MARKETING_SECTION_NAV.map((item) => (
                  <li key={item.id} className={footerItem}>
                    <Link
                      className={footerLink}
                      href={marketingHomeHash(item.hash, isHome)}
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
                <li className={footerItem}>
                  <Link className={footerLink} href="/about">
                    About Us
                  </Link>
                </li>
              </ul>
            </div>
            <div className={footerCol}>
              <h2 className={footerColTitle}>Care</h2>
              <ul className={footerList}>
                {[
                  "Health Assessment",
                  "Medical Monitoring",
                  "Care Coordination",
                  "Digital Records",
                ].map((label) => (
                  <li key={label} className={footerItem}>
                    <Link
                      className={footerLink}
                      href={marketingHomeHash("#care-ecosystem", isHome)}
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div className={footerCol}>
              <h2 className={footerColTitle}>Resources</h2>
              <ul className={footerList}>
                {[
                  { href: "/blog", label: "Blog" },
                  { href: "/contact#faq", label: "FAQs" },
                  { href: "/about#team", label: "Our Experts" },
                  { href: "/contact", label: "Contact" },
                ].map((item) => (
                  <li key={item.label} className={footerItem}>
                    <Link className={footerLink} href={item.href}>
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div className={footerCol}>
              <h2 className={footerColTitle}>Get in Touch</h2>
              <ul className={footerList}>
                <li className={footerItem}>
                  <Link className={footerLink} href="/contact#book">
                    Book an Assessment
                  </Link>
                </li>
                <li className={footerItem}>
                  <a className={footerLink} href="tel:+910000000000">
                    Helpline: [Insert Number]
                  </a>
                </li>
                <li className={footerItem}>
                  <a className={footerLink} href="mailto:meetali@nivarak.com">
                    meetali@nivarak.com
                  </a>
                </li>
                <li className={footerItem}>
                  56 Mayur Colony, Kothrud, Pune 411038
                </li>
              </ul>
            </div>
          </div>
        </div>
        <div
          className={cn(
            "flex flex-wrap items-center justify-between gap-3 border-t border-white/15 pt-6",
            "text-[length:var(--type-caption-size)] !text-white/65",
          )}
        >
          <p className="!text-white/65">&copy; 2026 Nivarak. All rights reserved.</p>
          <p>
            <Link
              className="ml-4 !text-white/75 hover:!text-white"
              href="/privacy"
            >
              Privacy Policy
            </Link>
            <Link
              className="ml-4 text-white/75! hover:text-white!"
              href="/terms"
            >
              Terms of Use
            </Link>
          </p>
        </div>
      </div>
    </footer>
  );
}
