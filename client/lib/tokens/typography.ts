/**
 * Typography tokens — maps 1:1 to design system/design.md type scale.
 * Font: Hanken Grotesk (via root layout)
 *
 * Color roles (design.md Text tokens):
 *   Text/Primary     → text-foreground
 *   Text/Secondary   → text-muted-foreground
 *   Text/Tertiary    → text-tertiary-foreground
 *   Text/Placeholder → text-placeholder
 *   Text/Link        → text-primary
 *   Error/Text       → text-destructive
 */
export const typo = {
  /** Display XL — 56px Bold / 72px · -0.02em */
  displayXl:
    'text-[56px] font-bold leading-[72px] tracking-[-0.02em] text-foreground',
  /** Display L — 42px Bold / 52px */
  displayL: 'text-[42px] font-bold leading-[52px] text-foreground',
  /** Heading XXL — 32px Bold / 40px — screen titles */
  headingXxl: 'text-[32px] font-bold leading-10 text-foreground',
  /** Heading XL — 24px Semibold / 32px */
  headingXl: 'text-2xl font-semibold leading-8 text-foreground',
  /** Heading L — 20px Semibold / 28px */
  headingL: 'text-xl font-semibold leading-7 text-foreground',
  /** Heading M — 18px Semibold / 28px */
  headingM: 'text-lg font-semibold leading-7 text-foreground',
  /** Heading S — 16px Semibold / 24px */
  headingS: 'text-base font-semibold leading-6 text-foreground',
  /** Body L — 16px Regular / 24px — supporting copy (Text/Secondary) */
  bodyL: 'text-base font-normal leading-6 text-muted-foreground',
  /** Body M — 14px Regular / 20px — default body (Text/Secondary) */
  bodyM: 'text-sm font-normal leading-5 text-muted-foreground',
  /** Body S — 13px Regular / 20px — helper / errors */
  bodyS: 'text-[13px] font-normal leading-5 text-muted-foreground',
  /** Caption — 12px Regular / 16px — OR divider, footnotes (Text/Tertiary) */
  caption: 'text-xs font-normal leading-4 text-tertiary-foreground',
  /** Label — 13px Medium / 20px — form labels (Text/Secondary) */
  label: 'text-[13px] font-medium leading-5 text-muted-foreground',
  /** Button — 14px Medium / 20px — all button labels */
  button: 'text-sm font-medium leading-5',
  /** Badge — 12px Semibold / 16px */
  badge: 'text-xs font-semibold leading-4',
  /** Overline — 11px Medium / 16px — uppercase only */
  overline:
    'text-[11px] font-medium uppercase leading-4 tracking-wide text-muted-foreground',
  /** Logo wordmark — Rounded Elegance */
  logo: 'font-logo text-base font-normal leading-6 tracking-[0.08em] text-foreground',
  /** Sidebar nav item (idle) — Body M Medium + Text/Secondary */
  sidebarItem: 'text-sm font-medium leading-5 text-muted-foreground',
  /** Sidebar nav item (active) — Body M Semibold + Brand/Primary */
  sidebarItemActive: 'text-sm font-semibold leading-5 text-primary',

  /**
   * Compositions (size token + color role from design.md)
   * Prefer these at call sites instead of inventing new sizes.
   */
  /** Input value — Body M + Text/Primary (Inputs & fields) */
  input: 'text-sm font-normal leading-5 text-foreground',
  /** OTP digit — Heading S + tabular (compact digit entry) */
  otpDigit: 'text-base font-semibold leading-6 tabular-nums text-foreground',
  /** Checkbox / remember-me row — Body M + Text/Primary */
  control: 'text-sm font-normal leading-5 text-foreground',
  /** Inline / footer link — Button + Text/Link · underline fades in on hover */
  link: [
    'relative inline-block text-sm font-medium leading-5 text-primary',
    'after:pointer-events-none after:absolute after:right-0 after:bottom-0 after:left-0 after:h-px after:bg-current after:opacity-0',
    'after:transition-opacity after:duration-200 after:ease-out',
    'hover:after:opacity-100 focus-visible:after:opacity-100',
  ].join(' '),
  /** Field error — Body S + Error/Text */
  error: 'text-[13px] font-normal leading-5 text-destructive',
} as const;

export type TypoToken = keyof typeof typo;
