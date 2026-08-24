export const AUTH_LOGO = {
  src: '/images/nivarak-logo-with-text.png',
  alt: 'Nivarak',
  /** Intrinsic source dimensions — original kept; next/image serves smaller AVIF/WebP */
  width: 1024,
  height: 1024,
  displayWidth: 72,
  displayHeight: 72,
  /** High quality for sharp mark + wordmark at small display size */
  quality: 90,
} as const;

/** 4K originals in /public — next/image serves responsive AVIF/WebP derivatives */
export const AUTH_HERO_SLIDES = [
  { src: '/images/img-1.jpg', width: 3840, height: 2560 },
  { src: '/images/img-2.jpg', width: 3840, height: 2560 },
  { src: '/images/img-3.jpg', width: 3840, height: 2560 },
] as const;

/** Desktop-only full-bleed panel (hidden below lg) */
export const AUTH_HERO_SIZES = '100vw';
export const AUTH_HERO_QUALITY = 90;
