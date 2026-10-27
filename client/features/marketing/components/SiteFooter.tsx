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

const COMPANY_LINKS = [
  { href: "/about", label: "About Us" },
  { href: "/blog", label: "Blog" },
  { href: "/faq", label: "FAQs" },
  { href: "/contact", label: "Contact Us" },
] as const;

const LEGAL_LINKS = [
  { href: "/privacy", label: "Privacy Policy" },
  { href: "/terms", label: "Terms of Use" },
] as const;

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
              <BrandLogo size="compact" />
            </Link>
            <p
              className={cn(
                "w-full text-[length:var(--type-body-m-size)] leading-[var(--type-body-m-line)]",
                footerMuted,
              )}
            >
              Your partner in independent aging: medical expertise,
              personalized care, and continuous monitoring for older adults
              and the families who love them.
            </p>
            <div
              className="flex w-full items-center justify-start gap-2"
              aria-label="Social links"
            >
              {[
                {
                  href: "https://www.facebook.com/people/Nivarak-Eldercare/pfbid032B2FMHfvPkdccn65d2VMCVsTvCmw9rrYCKSFLKqExWQnZGvrVVNYc3bMmfbx7kggl/",
                  label: "Facebook",
                  icon: Facebook02Icon,
                },
                {
                  href: "https://www.instagram.com/drmeetali",
                  label: "Instagram",
                  icon: InstagramIcon,
                },
                {
                  href: "https://www.linkedin.com/in/meetali-kolhatkar-bidaye-89800733",
                  label: "LinkedIn",
                  icon: Linkedin02Icon,
                },
              ].map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
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
              "grid grid-cols-2 gap-x-8 gap-y-10",
              "min-[744px]:grid-cols-3 min-[744px]:gap-x-16",
              "min-[1440px]:flex min-[1440px]:flex-nowrap min-[1440px]:gap-x-20",
            )}
          >
            <div className={footerCol}>
              <h2 className={footerColTitle}>Explore</h2>
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
              </ul>
            </div>

            <div className={footerCol}>
              <h2 className={footerColTitle}>Company</h2>
              <ul className={footerList}>
                {COMPANY_LINKS.map((item) => (
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
                  <Link className={footerLink} href="/contact#contact">
                    Send a Message
                  </Link>
                </li>
                <li className={footerItem}>
                  <a className={footerLink} href="tel:+919371090980">
                    +91 93710 90980
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
            "flex flex-col items-center justify-center gap-3 border-t border-white/15 pt-6 text-center",
            "text-[length:var(--type-caption-size)] !text-white/65",
          )}
        >
          <p className="!text-white/65">
            &copy; 2026 Nivarak. All rights reserved.
          </p>
          <p className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1">
            {LEGAL_LINKS.map((item) => (
              <Link
                key={item.href}
                className="!text-white/75 hover:!text-white"
                href={item.href}
              >
                {item.label}
              </Link>
            ))}
          </p>
        </div>
      </div>
    </footer>
  );
}
