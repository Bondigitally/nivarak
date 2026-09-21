import { BRAND_LOGO } from "@/lib/brand";

/** @deprecated Prefer `BRAND_LOGO` from `@/lib/brand`. */
export const AUTH_LOGO = BRAND_LOGO;

export const AUTH_SUCCESS_LOTTIE = "/images/success.lottie?v=burst";

/** 4K originals in /public — next/image serves responsive AVIF/WebP derivatives */
export const AUTH_HERO_SLIDES = [
  { src: "/images/img-1.jpg", width: 3840, height: 2560 },
  { src: "/images/img-2.jpg", width: 3840, height: 2560 },
  { src: "/images/img-3.jpg", width: 3840, height: 2560 },
] as const;

/** Desktop-only full-bleed panel (hidden below lg) */
export const AUTH_HERO_SIZES = "100vw";
export const AUTH_HERO_QUALITY = 90;
