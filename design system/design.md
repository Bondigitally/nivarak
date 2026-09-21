---
name: Nivarak
description: A calm, clinical healthcare platform for elderly independence assessment and care management
colors:
  brand-purple: "#6C318E"
  brand-purple-hover: "#5F2B7D"
  brand-purple-active: "#52256C"
  brand-purple-disabled: "#CDB6D9"
  focus-ring: "#A66BCF"
  focus-lilac: "#B98BD0"
  cool-gray-canvas: "#F7F7F8"
  surface-white: "#FFFFFF"
  surface-secondary: "#F9F9FA"
  surface-hover: "#F2F2F3"
  surface-table-header: "#F1F1F2"
  border-cool-gray: "#E4E4E7"
  border-divider: "#ECECEE"
  ink: "#1A1A1A"
  slate-text: "#5F6368"
  mist-text: "#6B6B6B"
  placeholder-gray: "#8A8A8A"
  success-green: "#10B981"
  success-tint: "#ECFDF5"
  warning-amber: "#CA8A04"
  warning-tint: "#FEFCE8"
  error-red: "#DC2626"
  error-tint: "#FCECEC"
  info-blue: "#2563EB"
  info-tint: "#E7EFF8"
  risk-orange: "#F97316"
  risk-critical: "#DC2626"
typography:
  display:
    fontFamily: "Hanken Grotesk, sans-serif"
    fontSize: "56px"
    fontWeight: 700
    lineHeight: "72px"
    letterSpacing: "-0.02em"
  headline:
    fontFamily: "Hanken Grotesk, sans-serif"
    fontSize: "32px"
    fontWeight: 700
    lineHeight: "40px"
  page-title:
    fontFamily: "Hanken Grotesk, sans-serif"
    fontSize: "24px"
    fontWeight: 600
    lineHeight: "30px"
    note: "Heading XL with 30px line-height — PageHeader / HomeGreeting"
  card-title:
    fontFamily: "Hanken Grotesk, sans-serif"
    fontSize: "18px"
    fontWeight: 600
    lineHeight: "24px"
    note: "cardTitleClass — all dashboard card / section titles"
  title:
    fontFamily: "Hanken Grotesk, sans-serif"
    fontSize: "20px"
    fontWeight: 600
    lineHeight: "28px"
  body:
    fontFamily: "Hanken Grotesk, sans-serif"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: "20px"
  label:
    fontFamily: "Hanken Grotesk, sans-serif"
    fontSize: "13px"
    fontWeight: 500
    lineHeight: "20px"
rounded:
  none: "0px"
  xs: "6px"
  sm: "8px"
  md: "12px"
  lg: "16px"
  xl: "20px"
  full: "9999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "32px"
  2xl: "48px"
components:
  button-primary:
    backgroundColor: "{colors.brand-purple}"
    textColor: "{colors.surface-white}"
    rounded: "{rounded.full}"
    padding: "12px 20px"
    height: "44px"
    fontWeight: 500
  button-primary-hover:
    backgroundColor: "{colors.brand-purple-hover}"
  button-primary-pressed:
    backgroundColor: "{colors.brand-purple-active}"
  button-primary-disabled:
    backgroundColor: "{colors.brand-purple-disabled}"
  button-secondary:
    backgroundColor: "{colors.surface-white}"
    textColor: "{colors.ink}"
    borderColor: "{colors.border-cool-gray}"
    rounded: "{rounded.full}"
    padding: "12px 20px"
    height: "44px"
    fontWeight: 500
  button-secondary-hover:
    backgroundColor: "{colors.surface-hover}"
  button-cta:
    backgroundColor: "{colors.brand-purple}"
    textColor: "{colors.surface-white}"
    rounded: "{rounded.full}"
    padding: "12px 20px"
    height: "48px"
    fontWeight: 500
  button-auth:
    rounded: "{rounded.full}"
    note: "Auth module — all button variants use Radius/Full; primary (filled) and Brand Outline method switch both use size CTA (48px)"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.slate-text}"
    rounded: "{rounded.full}"
    padding: "12px 20px"
    height: "44px"
    fontWeight: 500
  button-ghost-hover:
    backgroundColor: "{colors.surface-hover}"
  button-link:
    backgroundColor: "transparent"
    textColor: "{colors.brand-purple}"
    fontWeight: 500
  button-destructive:
    backgroundColor: "{colors.error-red}"
    textColor: "{colors.surface-white}"
    rounded: "{rounded.full}"
    padding: "12px 20px"
    height: "44px"
    fontWeight: 500
  button-destructive-outline:
    backgroundColor: "{colors.surface-white}"
    textColor: "{colors.error-red}"
    borderColor: "{colors.error-red}"
    rounded: "{rounded.full}"
    padding: "12px 20px"
    height: "44px"
    fontWeight: 500
  button-icon:
    size: "44px"
    padding: "14px"
    rounded: "{rounded.full}"
    iconSize: "16px"
  input:
    backgroundColor: "{colors.surface-white}"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    padding: "12px 16px"
    height: "44px"
  card:
    backgroundColor: "{colors.surface-white}"
    textColor: "{colors.ink}"
    rounded: "{rounded.lg}"
    padding: "24px"
  card-hero:
    backgroundColor: "{colors.surface-white}"
    rounded: "{rounded.xl}"
    padding: "32px"
  badge:
    backgroundColor: "{colors.surface-secondary}"
    textColor: "{colors.brand-purple}"
    rounded: "{rounded.full}"
    padding: "2px 8px"
    height: "20px"
  segmented-control:
    trackBackground: "{colors.table-header}"
    trackBackgroundOnCard: "{colors.cool-gray-canvas}"
    trackHeight: "40px"
    trackRounded: "{rounded.md}"
    height: "44px"
    heightToken: "h-dash-control"
    segmentPadding: "12px 20px"
    segmentRounded: "{rounded.md}"
    selectedBackground: "{colors.surface-white}"
    selectedBorder: "{colors.border-cool-gray}"
    selectedText: "{colors.brand-purple-active}"
    selectedShadow: "0 1px 2px rgba(17,24,39,0.06)"
    inactiveText: "{colors.slate-text}"
    labelFontSize: "14px"
    labelLineHeight: "20px"
    iconSize: "16px"
    iconGap: "8px"
---

# Nivarak Design System

Canonical source for all UI work in this repo. When implementing screens, prefer **semantic tokens** from this doc over ad-hoc hex values or default shadcn neutrals.

---

## For AI agents

**Read order:** Overview → Screen Patterns (if building a page) → Colors/Tokens → Components → Rules.

**When implementing UI:**

1. Map all colors to tokens in the tables below — do not invent new hues.
2. Button hierarchy (all modules): **Filled brand** → one Primary per section · **Neutral outline** → default Secondary · **Ghost / Link** → tertiary / navigation. **Brand outline** is **auth-only** (method switch). Never invent screen-specific button components.
3. Wizards: single **672px** centered hero card, one step per screen, Back + Continue footer.
3b. Auth: **one unified login** for every entity (Patient, Caregiver, Nurse, Doctor, Care Coordinator, Admin, and any other role). Page chrome = **Split** (full-bleed photo + **720px Auth Card**) for everyone — **no** role-specific centered auth, **no** subdomain portals (`admin.*`, `care.*`, etc.). Buttons follow **Rule 1** (always pill); primary auth actions **and** method switch (Continue with Email / Phone) both use size **CTA** (48px) — filled brand vs **Brand Outline**. Form fields stay **Rule 2** (`rounded-md` / 12px).
3c. Errors follow their control: left fields → left errors; centered OTP → centered errors under the OTP cluster.
4. Assessment scoring: use **Selectable Option Cards** with emerald / amber / rose selected states.
5. Load **Hanken Grotesk** in the root layout; apply `tabular-nums` to all structured numbers.
6. Prefer **borders** over shadows; hero cards are the only borderless elevated surfaces.
7. Public/assessment pages = spacious; dashboards/tables = comfortable–compact density.
8. If a spec conflicts with an existing component, update the component to match this doc.
9. Radius: **Rule 1** Button = pill · **Rule 2** form controls = `rounded-md` (12px) · **Rule 3** nav chrome = `rounded-md` (12px). Cards = `rounded-lg` (16px). Dialogs/auth = `rounded-xl` (20px). Nested children step down one tier. Never pill inputs or nav; never give Button corner radius.

**Token naming in code:** Use CSS variables or Tailwind theme keys that mirror the `Token` column (e.g. `--background` → `Background/Primary`, `--primary` → `Brand/Primary/Default`). Import `cssVar` / `chartHex` from `@/lib/tokens/colors` when TypeScript needs chart or brand colors. The YAML frontmatter above is for design-tool import; the markdown body is the human/agent spec.

### Documentation status (not final source of truth)

The following files under `docs/` are **reference / working drafts only**. They are **not** the final source of truth for product, data, or architecture decisions. Prefer this design system and current product direction when they conflict:

- `docs/Nivarak Frontend Architecture.pdf`
- `docs/Nivarak_5Domain_DataFieldSpec.docx` / `docs/Nivarak_5Domain_DataFieldSpec.txt`
- `docs/Nivarak_CGA_BGS.docx` / `docs/Nivarak_CGA_BGS.txt`
- `docs/nivarak_hld_lld.html`

In particular: **do not** implement multi-auth via subdomains (`admin.nivarak.com`, `care.nivarak.com` / `team.nivarak.com`, etc.) from older architecture notes — auth is a **single unified split login** for all roles.

---

## Overview — "Nivarak - Unifying Eldercare"

Nivarak helps families assess an elderly person's independence and clinicians manage resulting care. The UI is clinical but not cold, premium but not ornamental — a cool-gray canvas with plum reserved for brand, generous whitespace on public flows, and higher density in clinical tables and dashboards.

**Foundations:** 8pt grid · **Rule 1** buttons pill · **Rule 2** form controls 12px (`md`) · **Rule 3** nav 12px (`md`) · cards 16px (`lg`) / dialogs 20px (`xl`) · brand `#6C318E` · Hanken Grotesk only

**Layout defaults:** wizards in a centered **672px** card · dashboards max **1280px** · auth uses a **720px Auth Card** in a **unified Split** layout (photo + card) for **all** roles

### Design principles

- Use one visual system across the product — no one-off styling.
- Prefer clarity over decoration; hierarchy must be obvious at a glance.
- Optimize for accessibility (WCAG AA) and fast scanning of clinical data.
- Structure comes from spacing and borders, not ornament, gradients, or heavy shadows.
- Public and assessment pages stay calm and trustworthy — never feel like a marketing site.
- Density is contextual: open on wizards/landing, compact on tables and dashboards.

### Brand direction

**Should feel:** clinical but not cold · premium but not ornamental · dense where needed, open where possible · trustworthy, calm, functional

**Avoid:** playful or neon visuals · heavy shadows · unnecessary gradients · decorative font switching · glassmorphism · 3D illustrations · mascots around health data

---

## Screen patterns

Use these as templates when building or reviewing pages.

### Public assessment landing

- **Background:** `Background/Primary` (#F7F7F8), full viewport
- **Layout:** Split or stacked — headline + primary CTA left, hero photo right (`rounded-lg` card or full-bleed on mobile)
- **Type:** Display XL or L for headline (e.g. "Let's start with your quick Health Assessment")
- **CTA:** Primary CTA button, 48px tall, **full pill**, full-width up to ~553px
- **Header:** Minimal — logo only, or logo + ghost links + one purple "Start Assessment"

### Assessment / CGA wizard

- **Background:** cool-gray canvas
- **Container:** Single centered **672px** wizard card (20px radius, borderless, `cardShadowClass`, 32px padding)
- **Progress:** Wizard Progress signature component at top of card
- **Content:** One step per screen — never multiple sections on one step
- **Footer:** Neutral outline Secondary "Back" (left) + Primary "Continue" (right); loading state on submit — not Brand Outline
- **Scored steps:** Selectable Option Cards for Independent / Some support / Dependent

### Auth (login / register)

**One unified auth experience** for every entity — Patient, Caregiver, Nurse, Doctor, Care Coordinator, Admin, and any other role. Same Split page chrome and same **720px Auth Card**. Do **not** branch layout by role. Do **not** use subdomain-based portals (`admin.*`, `care.*`, `team.*`, etc.) for multi-auth.

#### Page layout (all roles)

| **Layout** | **Roles** | **Desktop (1440)** |
| ---------- | --------- | ------------------ |
| **Split auth** | **All roles** (Patient, Caregiver, Nurse, Doctor, Care Coordinator, Admin, …) | Full-bleed photo left (~50%) + **720px Auth Card** right (inset / form column) |

- **Do not** use a centered-only / cool-gray-only auth chrome for staff or clinical roles.
- **Do not** ship separate auth apps or hostnames per role for login/register.
- Invite / error / success screens use the **same Split auth** chrome as login.

#### Auth Card (all roles)

- **Width:** fixed **720px** on 1440 desktop
- **Chrome:** **20px** radius (`rounded-xl`), soft shadow, white surface
- **Padding / gap:** **64px** padding · **32px** vertical item spacing
- **Nested Auto Layout (required structure — do not flatten):**
  ```
  Auth Card (V, pad 64, gap 32)
  ├── Logo (80×80)
  ├── Header (V, gap 8) — Title + Subtitle
  ├── Form (V, gap 24) — field groups / OTP / remember row / inline error callout
      (within each field group: Label → 8px → input)
  ├── Login Button
  ├── Alternate method (V, gap 24) — OR divider + Continue with Email / Phone (no SSO)
  └── Footer (V or H, gap 8) — links / resend / change email
  ```
- **Logo:** single shared Nivarak mark (**72×72**), identical for every role — never a different crop or size per role
- **Type:** Heading XXL (32px Bold) for auth titles ("Welcome Back", "Enter Verification Code"); Body L (16px Regular) for supporting copy; Label for form labels
- **Primary action:** Filled brand `Button` size **CTA** (48px) — disable until the form is valid; **not** generic blue; **Rule 1** full pill
- **Method switch (after OR):** **Brand Outline** `Button` size **CTA** (48px) — same height as primary; e.g. Continue with Email / Continue with Phone Number; stays enabled while primary may be disabled. **Auth only** — do not use 48px Brand Outline outside auth.
- **All auth buttons:** same composable `Button` (Primary / Brand Outline / Secondary / Ghost / Link) — **Rule 1** pill; do not create a separate AuthButton. Do **not** use Brand Outline outside auth method switch.
- **No SSO / social login** — do not add Google, Microsoft, or other identity-provider buttons on auth screens
- **Inputs:** 44–48px tall, **Rule 2** `rounded-md` (12px), cool-gray border, Focus Lilac ring
- **OTP:** digit boxes fixed size (40–48px) · fixed gap **16px** · cluster **centered** in the Form (do not stretch boxes with space-between / FILL across full form width)
- **Error alignment follows the control it belongs to:**
  - Field is left → error is left (under the input / left-aligned callout in the Form)
  - OTP cluster is centered → error is centered with it (same vertical stack / column as the OTP — not a full-width left banner under centered digits)

### Authenticated dashboard

- **Background:** cool-gray canvas (`Background/Primary` #F7F7F8) — flat, no lavender gradient
- **Container:** max **1280px** centered
- **Nav:** White left sidebar; active item = neutral `Surface/Secondary` fill + **brand icon only** (label stays primary text)
- **Content:** Multi-column card grid on desktop; tables use fluid width
- **Density:** Comfortable (48px rows) for cards; Compact (40px) for data tables
- **Page titles:** Heading XL at **24px / Semibold / 30px** (`PageHeader`, `HomeGreeting`)
- **Card / section titles:** **18px / Semibold / 24px** via `cardTitleClass` — one size across all dashboard cards

### Result / risk display

- **Score hero:** Heading XXL or Display, Bold, tabular numerals (e.g. 72px score)
- **Risk band:** Full-width callout using band tint + border + foreground from Risk section
- **Supporting metrics:** Table or stat row with tabular numerals

---

## Colors

### Usage rules

| **Category** | **Use for** | **Do not use for** |
| ------------ | ----------- | ------------------- |
| Brand purple | Primary buttons, auth Brand Outline method switch, links, active tabs / selected segmented label, selected nav, progress fill, focus rings | Backgrounds, body text, decoration; default Secondary borders (use Neutral) |
| Neutral      | Backgrounds, surfaces, borders, text hierarchy, tables | Semantic meaning |
| Semantic     | Success, warning, error, info, risk states only | Making the UI "colorful" |

**One Voice Rule:** Purple on well under 10% of any screen.

**Feedback recipe (always all four):** pale tint background · soft border (two shades deeper) · dark same-hue foreground text · mid-tone icon

### Brand

| **Token**               | **Alias**             | **Value** | **Use Case**                                                   |
| ----------------------- | --------------------- | --------- | -------------------------------------------------------------- |
| Brand/Primary/Default   | brand-purple          | #6C318E   | Primary button, active tab, selected nav, links, progress      |
| Brand/Primary/Hover     | brand-purple-hover    | #5F2B7D   | Hover on primary actions                                       |
| Brand/Primary/Active    | brand-purple-active   | #52256C   | Pressed / active state                                         |
| Brand/Primary/Disabled  | brand-purple-disabled | #CDB6D9   | Disabled primary button                                        |
| Brand/Primary/FocusRing | focus-ring            | #A66BCF   | Focus ring on buttons and interactive controls                 |

### Neutral scale

Use for charts, legacy components, or when a true gray ramp is needed outside the cool-gray semantic surfaces.

| **Token**   | **Value** | **Token**   | **Value** |
| ----------- | --------- | ----------- | --------- |
| Neutral/50  | #F9F9FA   | Neutral/600 | #6B6B6B   |
| Neutral/100 | #F7F7F8   | Neutral/700 | #5F6368   |
| Neutral/200 | #F1F1F2   | Neutral/800 | #3C3C3C   |
| Neutral/300 | #E4E4E7   | Neutral/900 | #1A1A1A   |
| Neutral/400 | #ECECEE   | Neutral/950 | #111111   |
| Neutral/500 | #8A8A8A   |             |           |

### Background & surface

| **Token**            | **Alias**             | **Value** | **Use Case**                                         |
| -------------------- | --------------------- | --------- | ---------------------------------------------------- |
| Background/Primary   | cool-gray-canvas      | #F7F7F8   | Entire app background                                |
| Background/Inverse   | —                     | #1A1A1A   | Dark tooltip, toast, dark layouts                    |
| Surface/Primary      | surface-white         | #FFFFFF   | Cards, tables, forms, login panel                      |
| Surface/Secondary    | surface-secondary     | #F9F9FA   | Grouped sections, filter bars, muted wells           |
| Surface/Elevated     | surface-white         | #FFFFFF   | Dialogs, dropdowns, popovers                       |
| Surface/Hover        | surface-hover         | #F2F2F3   | Hovered cards, rows, outline button hover            |
| Surface/TableHeader  | surface-table-header  | #F1F1F2   | Table header rows, segmented-control track, search shortcut chip |

### Border

| **Token**       | **Alias**         | **Value** | **Use Case**                  |
| --------------- | ----------------- | --------- | ----------------------------- |
| Border/Primary  | border-cool-gray  | #E4E4E7   | Default 1px on inputs, cards, tables |
| Border/Focus    | focus-lilac       | #B98BD0   | Focused input/button (with 2px ring) |
| Border/Divider  | border-divider    | #ECECEE   | Section separators, subtle dividers |
| Border/Disabled | —                 | #EFEFEF   | Disabled control borders      |

### Text

| **Token**        | **Alias**        | **Value** | **Use Case**                                      |
| ---------------- | ---------------- | --------- | ------------------------------------------------- |
| Text/Primary     | ink              | #1A1A1A   | Page titles, card titles, input values, headers |
| Text/Secondary   | slate-text       | #5F6368   | Labels, body copy, inactive tabs, icons           |
| Text/Tertiary    | mist-text        | #6B6B6B   | Captions, timestamps, metadata                    |
| Text/Disabled    | —                | #A1A1AA   | Disabled buttons, labels, fields                  |
| Text/Placeholder | placeholder-gray | #8A8A8A   | Placeholder text only — never for real content  |
| Text/Inverse     | surface-white    | #FFFFFF   | Text on purple buttons, dark surfaces           |
| Text/Link        | brand-purple     | #6C318E   | "Forgot Password", "View Details", inline links |

### Feedback

| **Category** | **Token**  | **Value** | **Use Case**                              |
| ------------ | ---------- | --------- | ----------------------------------------- |
| **Success**  | Text       | #10B981   | Success icon, badge dot                   |
|              | Background | #ECFDF5   | Success alert / toast background          |
|              | Border     | #A7F3D0   | Success alert border                      |
|              | Hover      | #0D665F   | Success message text, hover emphasis      |
| **Warning**  | Text       | #CA8A04   | Warning icon, badge                       |
|              | Background | #FEFCE8   | Warning callout (e.g. red-flag preamble)  |
|              | Border     | #F0E2AA   | Warning callout border                    |
|              | Hover      | #C56A05   | Warning message text, hover emphasis      |
| **Error**    | Text       | #DC2626   | Error icon, destructive button            |
|              | Background | #FCECEC   | Error alert, invalid field tint           |
|              | Border     | #FECACA   | Error input border                        |
|              | Hover      | #C52222   | Error helper text, hover emphasis         |
| **Info**     | Text       | #2563EB   | Info icon                                 |
|              | Background | #E7EFF8   | Info callout (e.g. "Who should complete this?") |
|              | Border     | #BFDBFE   | Info callout border                       |
|              | Hover      | #1D4ED8   | Info message text, hover emphasis         |

### Risk

**Assessment result bands** — render as full-width callout cards:

| **Band**                   | **Background** | **Border** | **Foreground** | **Accent** |
| -------------------------- | -------------- | ---------- | ---------------- | ---------- |
| Strongly Independent       | #ECFDF5        | #A7F3D0    | #0D665F          | #10B981    |
| Independent but Vulnerable | #ECFDF5        | #A7F3D0    | #0D665F          | #10B981    |
| Supported Independence     | #FEFCE8        | #F0E2AA    | #C56A05          | #CA8A04    |
| Limited Independence       | #FFF7ED        | #FDBA74    | #C2410C          | #F97316    |
| High Dependence            | #FCECEC        | #FECACA    | #C52222          | #DC2626    |

**Per-question scoring (Selectable Option Cards):**

| **Score**      | **Label**     | **Selected background** | **Selected border** | **Selected text** |
| -------------- | ------------- | ----------------------- | ------------------- | ----------------- |
| Independent    | Independent   | emerald-50 / #ECFDF5      | emerald-500         | emerald-800       |
| Some support   | Some support  | amber-50 / #FEFCE8        | amber-500           | amber-800         |
| Dependent      | Dependent     | rose-50                   | rose-500            | rose-800          |

**Dashboard / clinical risk tokens:**

| **Token**     | **Value** | **Use Case**       |
| ------------- | --------- | ------------------ |
| Risk/Low      | #10B981   | Healthy patient    |
| Risk/Medium   | #CA8A04   | Observation needed |
| Risk/High     | #F97316   | Needs attention    |
| Risk/Critical | #DC2626   | Emergency          |

### Charts & overlays

Healthcare-specific chart palette — use semantic vitals tokens in clinical dashboards; do not substitute generic Chart/01–08.

| **Token**              | **Value**                          | **Use Case**                    |
| ---------------------- | ---------------------------------- | ------------------------------- |
| Chart/Brand Linear     | #6C318E → #1E0E28 (gradient)       | Round widget, brand trend line  |
| Chart/BP Systolic      | #FA4B42                            | Bar, legend & line              |
| Chart/BP Diastolic     | #147AD6                            | Bar, legend & line              |
| Chart/Heart Rate       | #7086FD                            | Line                            |
| Chart/SpO₂             | #0EA5B1                            | Scatter dots                    |
| Chart/Blood Glucose    | #5B8DEF                            | Line                            |
| Chart/Temperature      | #F97316                            | Amber line                      |
| Overlay/Light          | rgba(17,24,39,0.08)                | Hover overlay                   |
| Overlay/Medium         | rgba(17,24,39,0.20)                | Drawer backdrop                 |
| Overlay/Dark           | rgba(17,24,39,0.48)                | Modal/dialog backdrop           |

---

## Typography

**Font:** `Hanken Grotesk, sans-serif` — load in root layout; fallback to system sans-serif.

**Hierarchy:** size first · weight second · never font switching.

**Character:** Warm geometric sans — human at body sizes, confident at display sizes.

### Type scale

| **Style**   | **Size** | **Weight**     | **Line** | **Example use**                                           |
| ----------- | -------: | -------------- | -------: | --------------------------------------------------------- |
| Display XL  |     56px | Bold (700)     |    72px  | "Know how independently your parent is ageing" (-0.02em)  |
| Display L   |     42px | Bold (700)     |    52px  | Public assessment landing title                           |
| Heading XXL |     32px | Bold (700)     |    40px  | Auth screen titles ("Welcome Back", "Enter Verification Code"), IAS result score, dashboard KPIs |
| Heading XL  |     24px | Semibold (600) |    32px  | Token default; page titles use **30px** line-height in product (`PageHeader`, `HomeGreeting`) |
| Heading L   |     20px | Semibold (600) |    28px  | Wizard step title, modal title                |
| Heading M   |     18px | Semibold (600) |    28px  | Token default (18 / 28)                       |
| Heading S   |     16px | Semibold (600) |    24px  | Names, form group titles, dense list titles   |
| **Card title** | **18px** | **Semibold (600)** | **24px** | **All dashboard card / section titles** — code: `cardTitleClass` (`headingS` + size override) |
| Body L      |     16px | Regular (400)  |    24px  | Intro paragraphs, auth supporting copy, input values, assessment questions |
| Body M      |     14px | Regular (400)  |    20px  | Default body, page subtitles, table rows, sidebar items, lists            |
| Body S      |     13px | Regular (400)  |    20px  | Helper text, supporting copy, empty states                |
| Caption     |     12px | Regular (400)  |    16px  | Timestamps, chart labels, footnotes                       |
| Label       |     13px | Medium (500)   |    20px  | Form labels, filter labels                                |
| Button      |     14px | Medium (500)   |    20px  | All button labels                                         |
| Badge       |     12px | Semibold (600) |    16px  | Status chips, risk badges, role pills                     |
| Overline    |     11px | Medium (500)   |    16px  | KPI labels, categories — uppercase only                   |

### Typography rules

- **Four weights:** 400 Regular · 500 Medium · 600 Semibold · 700 Bold. Medium is for Label, Button, Overline, and selected chrome only.
- **Page titles:** Heading XL size (24px) with **30px** line-height — do not invent a separate page-title token in `typography.ts`.
- **Card / section titles:** always **18px / Semibold / 24px** via `cardTitleClass` — never mix 16 / 20 / 22px card headers.
- Heading L (20px) steps down to Heading S (16px) for names and dense form groups; card chrome uses the Card title composition above.
- Body never below 14px on any breakpoint.
- Line-height: generous for paragraphs (24px on 16px body); compact for controls (20px on 14px).
- Links use `Text/Link` color; underline optional — color alone is sufficient when styled as link.

### Tabular numerals

Apply `font-variant-numeric: tabular-nums` (Tailwind: `tabular-nums`) to:

- Patient IDs · assessment scores · risk percentages · step counters ("Step 3 of 11")
- Vitals: blood pressure, pulse, temperature, weight, height
- Dashboard KPIs · numeric table columns · result score hero (Bold + tabular)

---

## Spacing (8pt grid)

All margins, padding, and gaps must land on this scale.

| **Token** | **Alias** | **Value** | **Typical use**                          |
| --------- | --------- | --------- | ---------------------------------------- |
| Space/0   | —         | 0px       | Reset                                    |
| Space/2   | —         | 2px       | Hairline adjustments                     |
| Space/4   | xs        | 4px       | Icon ↔ label gap                         |
| Space/8   | sm        | 8px       | Label ↔ input; inside button/chip; gap between options |
| Space/12  | —         | 12px      | Option card padding; callout vertical pad |
| Space/16  | md        | 16px      | Input horizontal padding                 |
| Space/20  | —         | 20px      | —                                        |
| Space/24  | lg        | 24px      | Card padding; gap between form fields (field groups) |
| Space/32  | xl        | 32px      | Hero/dialog padding; section gaps        |
| Space/40  | —         | 40px      | —                                        |
| Space/48  | 2xl       | 48px      | Gap between page sections                |
| Space/56  | —         | 56px      | —                                        |
| Space/64  | —         | 64px      | Major layout separation                  |
| Space/80  | —         | 80px      | Large section breaks                     |
| Space/96  | —         | 96px      | —                                        |
| Space/128 | —         | 128px     | Hero vertical rhythm                     |

**Spacing habits by context:** 8px label ↔ input (and inside controls) · 16px inside inputs · 24px between form fields and inside standard cards · 32px inside hero/wizard/dialog · 48px+ between page sections.

**Form field stack:** Label → **8px** → input box · **24px** between field groups (e.g. Email block → Password block).

---

## Radius, shadows & elevation

Flat by default. The cool-gray canvas plus 1px cool-gray borders create separation; shadows are ambient cues only.

### Radius

#### Interactive rules (memorize these)

| **Rule** | **Family** | **Token** | **Applies to** |
| -------- | ---------- | --------- | -------------- |
| **1. Buttons are pill** | Actions | `rounded-full` | Every `Button` variant and size. Auth included. |
| **2. Form controls are md** | Data entry | `rounded-md` (12px) | Input, Search, Select, Dropdown trigger, Combobox, Date Picker, Textarea, OTP digit boxes |
| **3. Navigation is md** | Wayfinding | `rounded-md` (12px) | Sidebar active item, Tabs / Segmented Control, Pagination |

**Read as:** Pill = “do something” · `md` = “enter / navigate” · `lg` = surfaces · `xl` = overlays.

Do **not** pill form controls or nav chrome. Do **not** apply corner radius to the `Button` component. Clickable list rows and option cards are **not** Button — they use `sm` inside `lg` surfaces, not Rule 1.

#### Semantic radius scale

| **Token** | **Tailwind** | **Value** | **Use case** |
| --------- | ------------ | --------- | ------------ |
| Radius/None | `rounded-none` | 0px | Flush edges, square utilities |
| Radius/XS | `rounded-xs` | 6px | Chart markers, checkboxes, tiny wells |
| Radius/SM | `rounded-sm` | 8px | Menu items, list hovers, nested tiles |
| Radius/MD | `rounded-md` | 12px | Form controls (Rule 2), nav chrome (Rule 3), inner panels |
| Radius/LG | `rounded-lg` | 16px | Cards, tables, popovers, standard containers |
| Radius/XL | `rounded-xl` | 20px | Dialogs, drawers, auth cards, wizard shells |
| Radius/Full | `rounded-full` | pill | Buttons (Rule 1), badges, chips, avatars, top-bar search chrome |

**Nesting:** When a child’s curve shares the parent’s inner edge, step down one token (e.g. `lg` card → `md` callout → `sm` row hover). Pill actions ignore nesting.

Use only these tokens via `lib/tokens/radius.ts` or Tailwind utilities. Do not use `rounded-[Npx]` or legacy shadcn scale steps.

### Shadows & elevation

Flat by default. Cool-gray canvas + borders create most separation; shadows are soft ambient cues only.

**Canonical code:** `client/lib/tokens/elevation.ts`. Import named exports — do not invent ad-hoc `shadow-[…]` stacks for cards.

Recipe: **neutral hairline ring** (`0 0 0 1px rgba(17,24,39,α)`) + stacked ambient lifts. The hairline replaces a CSS `border` on elevated cards (do not also add `border-border` on the same surface).

| **Export** | **Kind** | **CSS / behavior** | **Use case** |
| ---------- | -------- | ------------------ | ------------ |
| `cardShadowClass` | Tailwind class | `0 0 0 1px rgba(17,24,39,0.06), 0 1px 2px rgba(17,24,39,0.04), 0 2px 6px rgba(17,24,39,0.04)` | Resting cards — `dashboardCardClass`, `Card`, auth card, tables, assessment shells |
| `cardShadowHoverClass` | Tailwind class | Hover: hairline `0.08` + `0 1px 3px / 0.055` + `0 4px 10px / 0.055` | Default card hover (pair with `cardShadowClass`) |
| `cardShadowCss` | Inline / Framer | Same stack as `cardShadowClass` | Motion / `style.boxShadow` (e.g. care-team cards) |
| `cardShadowHoverCss` | Inline / Framer | Same stack as `cardShadowHoverClass` | Motion hover counterpart |
| `cardElevatedHoverShadowClass` | Tailwind class | Hover: hairline `0.09` + `0 4px 8px / 0.06` + `0 12px 24px / 0.08` | List rows / appointment items — elevated hover **without** translate |
| `cardLiftTransitionClass` | Tailwind class | GPU transform + `0.22s` cubic-bezier on transform / box-shadow | Interactive tiles before lift |
| `cardLiftHoverClass` | Tailwind class | `hover:-translate-y-1.5` + `cardElevatedHoverShadowClass` | CategoryCard, vitals KPIs — snappy lift |
| `cardLiftActiveClass` | Tailwind class | `active:-translate-y-0.5` + resting `cardShadow` stack | Press feedback on lift tiles |
| `cardLiftHoverWashClass` | Tailwind class | Absolute brand wash (`from-primary/6 via-muted`) fades in on `group-hover` | Pair with `group relative isolate overflow-hidden` on the tile |

**Micro-shadow (controls only, not in `elevation.ts`):** segmented-control selected segment uses `0 1px 2px rgba(17,24,39,0.06)` — keep that local; do not promote it into the card kit.

**Shadow rules:**

- Prefer borders over shadows on flat chrome; elevated cards use the hairline-in-shadow recipe above.
- Never nest an elevated card inside another elevated card.
- Never combine `cardShadow*` with a separate `1px` CSS border on the same surface.
- Auth / wizard / dialog shells: `cardShadowClass` (borderless), not a heavier one-off stack.
- If it looks like a 2014 app, the shadow is too dark.

---

## Stroke, blur, opacity & motion

### Stroke

| **Token**       | **Value** | **Use case**                    |
| --------------- | --------- | ------------------------------- |
| Stroke/Hairline | 0.5px     | Subtle dividers                 |
| Stroke/Thin     | 1px       | Default borders (most common)   |
| Stroke/Medium   | 2px       | Selectable option cards, charts |
| Stroke/Thick    | 4px       | Decorative graphics only        |

### Blur

| **Token** | **Value** | **Use case**                              |
| --------- | --------- | ----------------------------------------- |
| Blur/XS   | 4px       | Small tooltip backdrop                    |
| Blur/SM   | 8px       | Dropdown backdrop                         |
| Blur/MD   | 16px      | Dialog backdrop (prefer Overlay/Dark)     |
| Blur/LG   | 24px      | Do not use — no glassmorphism in product  |

### Opacity

| **Token**    | **Value** | **Use case**                |
| ------------ | --------- | --------------------------- |
| Opacity/5%   | 5%        | Very subtle overlays        |
| Opacity/10%  | 10%       | Hover overlays              |
| Opacity/20%  | 20%       | Selected state backgrounds  |
| Opacity/40%  | 40%       | Disabled icons              |
| Opacity/60%  | 60%       | Secondary illustrations     |
| Opacity/80%  | 80%       | Image overlays              |
| Opacity/100% | 100%      | Normal content              |

### Motion

| **Token**     | **Duration** | **Use case**                              |
| ------------- | ------------ | ----------------------------------------- |
| Motion/Fast   | 150ms        | Hover, press, checkbox, option selection  |
| Motion/Normal | 200–250ms    | Buttons, tabs, dropdowns, accordions      |
| Motion/Slow   | 300–350ms    | Dialogs, drawers, page transitions        |
| Motion/Fill   | 500–700ms    | Progress bar and score bar fill (ease-out)|

**Easing:** Standard · Accelerate · Decelerate · Emphasized. No entrance choreography or bounce.

---

## Icons

- **Library:** Hugeicons only — never mix Lucide, Heroicons, Phosphor, etc.
- **Stroke:** 1.5px · rounded joins · outline style (not filled, unless semantic checkbox)

| **Token** | **Size** | **Use case**                    |
| --------- | -------- | ------------------------------- |
| XS        | 12px     | Inline with caption text        |
| SM        | 16px     | Inside buttons, inputs, badges  |
| MD        | 20px     | Navigation, callout leading icon|
| LG        | 24px     | Card headers, empty state icons |
| XL        | 32px     | Empty states, feature icons     |

---

## Layout

### Grid

| **Breakpoint** | **Min width** | **Columns** | **Page padding** | **Gutter** |
| -------------- | ------------- | ----------- | ---------------- | ---------- |
| Mobile         | 0px           | 4           | 16px each side   | 16px       |
| Tablet         | 744px         | 8           | 16px each side   | 24px       |
| Desktop        | 1440px        | 12          | 24px each side   | 24px       |
| Wide           | 1920px+       | 12          | 32px each side   | 24px       |

**Page inset (`--dash-pad-x`):** **16px per horizontal edge** below `lg` (1024px); **24px per edge** from `lg` (1024px) up. Applied via `px-dash-pad-x` on the page shell, top bar, and modal chrome. Values in the table above are per side, not total.

### Containers

Grid defines alignment; containers cap readable width. **Pick by content type — never one width for the whole app.**

| **Layout**       | **Max width** | **Pages / examples**                                      |
| ---------------- | ------------- | --------------------------------------------------------- |
| Split auth       | Full viewport | **All roles** — photo panel + **720px Auth Card** (unified login) |
| Auth Card        | **720px**     | The form card itself (login, OTP, invite, errors, success) — always inside Split auth |
| Narrow           | 720px         | Alias of Auth Card width for forgot / success / confirmation |
| Wizard Card      | 672px         | IAS-P assessment wizard, CGA wizard (centered hero card)  |
| Form             | 480–960px     | Settings, profile, patient edit                           |
| Dashboard        | 1280px        | Coordinator dashboard, patient overview, reports          |
| Fluid            | None          | Data tables, analytics, audit logs                        |
| Long-form text   | 60–75 chars   | Prose blocks, consent copy                                |

**Container rules:**

- Wizards: single centered **672px** hero card on cool-gray canvas.
- **Auth page chrome:** **Split auth for every role** (photo + **720px Auth Card**). No centered-only staff auth; no subdomain multi-auth.
- **Auth Card** is always **720px** with nested Logo → Header → Form → Button → Alternate method (OR + email/phone switch) → Footer Auto Layout. No SSO / social login.
- Dashboards: ≤ **1280px** unless the view is explicitly data-heavy (then fluid tables inside).
- Tables and analytics: **Fluid** — use full available width.
- Maintain **consistent horizontal page padding** at every breakpoint — **16px each side** below `lg`, **24px each side** from `lg` up (see Grid table).

### Responsive behavior

| **Component**     | **Desktop**           | **Tablet**          | **Mobile**                |
| ----------------- | --------------------- | ------------------- | ------------------------- |
| Sidebar           | Expanded, fixed       | Collapsible         | Drawer or bottom nav      |
| Tables            | Full columns          | Horizontal scroll   | Stacked card rows         |
| Forms             | Multi-column          | Two-column          | Single-column stack       |
| Dialogs           | Centered modal        | Centered modal      | Full-width bottom sheet   |
| Dashboard cards   | 2–3 column grid       | 2 columns           | Single column             |
| Assessment wizard | Centered 672px card   | Centered card       | Full-width, edge padding  |
| Split auth (all roles) | Photo left + 720 Auth Card right | Stack: photo optional / card full width | Auth Card full-width, edge padding |

**Mobile rules:** Stack rather than shrink · 44×44px minimum touch targets · body text never below 14px · prioritize readability over information density.

### Density

| **Mode**    | **Row / control height** | **Use case**                   |
| ----------- | ------------------------ | ------------------------------ |
| Compact     | 40px                     | Data tables, long lists        |
| Comfortable | 48px                     | Forms, standard cards          |
| Spacious    | 56px                     | Wizards, landing pages, CTAs   |

---

## Components

**Global component rules:**

- One purple primary action per view.
- Use semantic design tokens — avoid hardcoded hex in new code (map to theme variables).
- Keep data tables fluid width.
- One assessment question **section** per wizard screen.
- Prefer borders over shadows on standard cards.

### Buttons

#### Button philosophy

The Nivarak button system is **composable**, not screen-specific. Every button is built from four dimensions:

- **Variant**
- **Size**
- **Content**
- **State**

Never create separate button components for actions such as Save, Continue, Start Assessment, View Report, View All, Forgot Password, Approve, Decline, Add Medication, Add Diagnosis, View History, or View Details. Those are compositions of the same `Button` using different variants, sizes, icons, and states.

#### Sizes

| **Token** | **Height** | **Padding (V × H)** | **Radius** | **Font** | **Icon** | **Gap** | **Use for** |
| --------- | ---------- | ------------------- | ---------- | -------- | -------- | ------- | ----------- |
| **Default** (~95% of UI) | 44px | 12 × 20 | **Full pill** (`Radius/Full` / 9999px) | 14px Medium (500), LH 20px | 16px | 8px | Forms, tables, dialogs, cards, dashboard actions, CRUD, filters, standard app actions |
| **CTA** | 48px | 12 × 20 | **Full pill** (`Radius/Full` / 9999px) | 14px Medium (500), LH 20px | 16px | 8px | High-emphasis page-level actions; auth primary **and** auth Brand Outline method switch |
| **Icon Only** | 44 × 44 | 14px all sides | **Full pill** (`Radius/Full` / 9999px) | — | 16 × 16 | — | Standalone icon actions; icon perfectly centered |

**CTA usage (in-app):** Start Assessment, Complete Assessment, Submit Assessment, and other hero / page-level primaries. Within authenticated modules, CTA appears only in hero sections or major page-level actions — everywhere else use Default (same pill radius, 44px height).

**CTA usage (in-app):** Start Assessment, Complete Assessment, Submit Assessment, and other hero / page-level primaries. Within authenticated modules, CTA appears only in hero sections or major page-level actions — everywhere else use Default (same pill radius, 44px height).

**Auth module:** Every button in Auth (login, register, OTP, forgot/reset, invite, success) uses the same full-pill `Button`. Primary auth actions (Sign In, Send OTP, Verify OTP, Create Account, Reset Password, Complete Registration) use size **CTA** (48px height) **filled brand**, and stay **disabled until the form is valid**. Auth **method switch** (Continue with Email / Continue with Phone Number) uses **Brand Outline** at the **same CTA height (48px)** and stays enabled while primary may be disabled. Hierarchy comes from fill vs outline, not from size. Footer / nav actions (Forgot password, Sign Up, Back to Login) use **Link**. Never create a separate AuthButton. Do **not** reuse Brand Outline (or 48px outline) as the default Secondary outside auth — neutral Secondary stays Default (44px) in other modules.

#### Variants

| **Variant** | **Background** | **Text** | **Border** | **Hover** | **Notes** |
| ----------- | -------------- | -------- | ---------- | --------- | --------- |
| **Primary** | Brand/Primary | White | None | Brand/Primary/Hover | Filled brand — highest-priority action; **one per section / card / dialog / page** |
| **Brand Outline** | Surface/Primary | Brand/Primary | 1px Brand/Primary | Brand/Primary tint (e.g. 5% fill) | **Auth method switch only** (Continue with Email / Phone). Same brand hue as Primary, outlined; **same CTA height (48px)** as the filled primary. Do **not** use as default Secondary in other modules |
| **Secondary** | Surface/Primary | Text/Primary | 1px Border/Primary | Surface/Hover | **Neutral outline** — default alternative / secondary actions across all modules (Cancel, Back, Export, dialog secondary, etc.) |
| **Ghost** | Transparent | Text/Secondary | None | Surface/Hover | Tertiary actions |
| **Link** | Transparent | Brand/Primary | None | Underline | Navigational actions; optional underline, leading/trailing icon. Examples: Forgot Password, View All, View History, Privacy Policy, Terms, Sign Up, Back to Login |
| **Destructive** | Error/Default | White | None | — | Irreversible only (Delete, Remove, Archive) |
| **Destructive Outline** | Surface/Primary | Error/Default | 1px Error/Default | — | Destructive secondary actions |

#### Hierarchy (memorize)

| **Look** | **Variant** | **Use for** | **Scope** |
| -------- | ----------- | ----------- | --------- |
| **Filled brand** | Primary | One primary action per section | All modules |
| **Brand outline** | Brand Outline | Auth method switch (email ↔ phone); **48px CTA** matched to primary | **Auth only** |
| **Neutral outline** | Secondary | Default secondary / alternative actions; **44px Default** | All modules |
| **Ghost / Link** | Ghost · Link | Tertiary actions · navigation | All modules |

#### States

Every variant supports: **Default · Hover · Pressed · Focused · Disabled · Loading**.

| **State** | **Behavior** |
| --------- | ------------ |
| **Hover** | Primary → Brand/Primary/Hover; Brand Outline → light brand tint; Secondary / Ghost → Surface/Hover; Link → underline |
| **Pressed** | Primary → Brand/Primary/Active; scale **98%**; transition **150ms** |
| **Focus** | 2px focus ring using Brand/Primary/FocusRing (`#A66BCF`) — keyboard accessible |
| **Disabled** | Primary → Brand/Primary/Disabled fill, white text at **70%** opacity; Brand Outline / Secondary → Border/Disabled + Text/Disabled. No hover response |
| **Loading** | Spinner beside label (e.g. Saving…, Creating…, Submitting…, Verifying…). **Button width must not change** while loading |

#### Content layouts

Compositions — not separate components:

- Text only
- Leading icon + text
- Text + trailing icon
- Icon only

#### Width

Three width behaviors: **Hug content** · **Fill container** · **Fixed width**.

#### Compound pattern — Trailing circular icon

Reusable composition (not a new variant) for premium CTAs that need extra emphasis.

| **Part** | **Spec** |
| -------- | -------- |
| Base | Variant Primary · Size CTA |
| Trailing slot | Circular white icon container **40 × 40**, full circle · icon **16 × 16** · padding **12px** all sides (hug) |
| Button padding | Left **20px** · Right **4px** · Top/Bottom **12px** |

Examples: View Report, Start Assessment, Book Consultation, Explore Dashboard.

#### Radius summary

**Rule 1:** Every `Button` variant and size is **full pill** (`Radius/Full`) — Primary, Brand Outline, Secondary, Ghost, Link (boxed), Destructive, Destructive Outline, Icon Button; Default / CTA / Icon Only; Auth included.

Form controls and nav are **not** buttons — see **Rule 2** and **Rule 3** in Radius.

#### Usage rules

- **Filled brand (Primary):** only one within a section, card, dialog, or page.
- **Brand outline:** auth method switch only (Continue with Email / Phone), size **CTA (48px)** — matched to the filled primary. Do not use as default Secondary in dashboards, wizards, or dialogs.
- **Neutral outline (Secondary):** default alternative actions across all modules at **Default (44px)**.
- **Ghost** for tertiary; **Link** for navigation (Forgot password, Sign Up, Back to Login, View All, etc.).
- Auth primary stays **disabled until valid input**; Brand Outline method switch may remain enabled. In auth, both stacked actions are **48px** — hierarchy is fill vs outline, not height.
- Destructive only for irreversible actions.
- Never create screen-specific button components.
- Always pill (`Radius/Full`) — never corner radius on the Button component.

#### Component rule

If a new button differs only by text, icon, underline, width, loading, or disabled state, it is **not** a new component or variant — reuse `Button`. Introduce a new variant only when visual hierarchy or semantic meaning changes (e.g. Primary vs Destructive), never because the button appears on a different screen or has different label text.

### Cards

| **Type**   | **Radius** | **Border**        | **Shadow**   | **Padding** | **Notes**                                |
| ---------- | ---------- | ----------------- | ------------ | ----------- | ---------------------------------------- |
| Standard   | 16px (`lg`) | none (hairline in shadow) | `cardShadowClass` + `cardShadowHoverClass` | 24px  | White on cool-gray canvas · title **18px / 600 / 24px** (`cardTitleClass` / `dashboardCardClass`) |
| Large      | 20px (`xl`) | none              | `cardShadowClass` | 32px        | Dialog, wizard card, auth card — borderless only |
| Interactive tile | 16px (`lg`) | none | `cardShadowClass` + lift / wash exports | 24px | CategoryCard, vitals KPIs — `cardLift*` |

Do not nest a shadowed card inside another shadowed card.

### Inputs & fields

**Rule 2 — all form controls use `rounded-md` (12px):** Input, Search, Select, Dropdown, Combobox, Date Picker, Textarea, OTP digit boxes. Never pill form controls.

| **Property**   | **Value**                                              |
| -------------- | ------------------------------------------------------ |
| Background     | Surface/Primary                                        |
| Border         | 1px Border/Primary                                     |
| Radius         | **`rounded-md` (12px)** — Rule 2                   |
| Height         | 44px (standard) · 48px (hero/auth forms)               |
| Padding        | 12px vertical · 16px horizontal                        |
| Text           | Body M (14px), Text/Primary                            |
| Placeholder    | Text/Placeholder                                       |
| Label          | Label (13px Medium), Text/Secondary; required = red *  |
| Label ↔ input  | **8px** (Space/8) — e.g. “Email” label to the input box |
| Field ↔ field  | **24px** (Space/24) — between field groups in a form     |
| Focus          | Border/Focus + 2px Focus Lilac ring                    |
| Error          | Error border + Error/Foreground helper below field     |
| Disabled       | Border/Disabled + Text/Disabled                          |

**Form spacing:** Label sits **8px** above its input. Stacked fields (Email → Password, etc.) are separated by **24px**. Do not use 24px between a label and its own input.

**Error alignment:** follows the control — left-aligned fields get left-aligned errors; centered OTP clusters get centered errors under the OTP (see Auth Card). Never mix (e.g. full-width left error under centered OTP).

Tables, popovers, and other standard surfaces use `rounded-lg` (16px). Dialog containers use `rounded-xl` (20px). Dropdown **menus / list panels** use `rounded-md` with `rounded-sm` items.

### Selectable option cards *(signature — assessment scoring)*

Used for IAS-P item scores and similar single/multi-select patterns.

**Structure:** full-width `<button>` or tappable row · 2px border · `rounded-md` (12px) · min 12px padding · Body M label

| **State**    | **Background**     | **Border**       | **Text**        |
| ------------ | ------------------ | ---------------- | --------------- |
| Default      | white              | Border/Primary   | Text/Primary    |
| Hover        | Surface/Hover      | Border/Primary   | Text/Primary    |
| Independent  | emerald-50         | emerald-500 2px  | emerald-800     |
| Some support | amber-50           | amber-500 2px    | amber-800       |
| Dependent    | rose-50            | rose-500 2px     | rose-800        |
| Red flag     | Error/Background     | Error/Default 2px| Error/Foreground + filled red check square |

Always show selection via **border + fill + text** — never color alone (accessibility). These are not Button components — radius stays **`rounded-md` (12px)** (card / option), not Rule 1 pill.

### Wizard progress *(signature)*

| **Element**      | **Spec**                                                                 |
| ---------------- | ------------------------------------------------------------------------ |
| Track            | 8px height · full width · Surface/Secondary bg · full radius             |
| Fill             | Brand/Primary/Default · width = step/total · Motion/Fill ease-out        |
| Label (left)     | Current step name · Body M Semibold                                      |
| Counter (right)  | "Step {n} of 11" · Caption · tabular-nums · Text/Tertiary              |
| Dot indicators   | Row below track · past = purple 12px pill · current = 24px pill · future = muted 12px |

### Callouts

Rounded banner for inline guidance — not a toast.

| **Property** | **Value**                                                       |
| ------------ | --------------------------------------------------------------- |
| Radius       | 12px (`rounded-md`)                                                            |
| Padding      | 12px vertical · 16px horizontal                                 |
| Structure    | Optional 20px leading icon + Body M message                     |
| Variants     | Info / Warning / Error / Success / Risk band (use Feedback or Risk tables) |

**Examples:** Info — "Who should complete this? A family member who regularly interacts with the elderly person." · Warning — red-flag preamble before checkbox list.

### Badges

| **Property** | **Value**                                          |
| ------------ | -------------------------------------------------- |
| Shape        | 9999px (`Radius/Full`) pill                        |
| Height       | 20px                                               |
| Text         | 12px Semibold                                      |
| Padding      | 2px vertical · 8px horizontal                      |
| Brand        | Surface/Secondary (`bg-muted`) + brand-purple text |
| Semantic     | Matching tint bg + darker same-hue text             |

### Navigation

**Rule 3 — navigation defines its own shape.** Nivarak nav chrome uses **`rounded-md` (12px)** — not pill. Do not style sidebar items, tabs, segmented controls, or pagination as Button pills.

| **Nav control** | **Radius** |
| --------------- | ---------- |
| Sidebar active item | **12px** (`md`) |
| Tabs / Segmented Control (track + selected thumb) | **12px** (`md`) |
| Pagination controls | **12px** (`md`) |

#### Segmented Control (segmented tabs)

Figma source: [Nivarak UI — Segmented Control](https://www.figma.com/design/lqlKcyJm2scWXXuJSKYZCr/Nivarak-UI?node-id=936-2874). Canonical in-content filter / view switcher (e.g. All Files · Recent · Favorites · Shared). **Not** a `Button` — follows Rule 3.

**Size:** One size only — tabs use **Button Default / `--spacing-dash-control`** (`h-dash-control`, **44px**, `px-5`). Do **not** add sm/cta variants.

**Proud tab:** Like a floating selected chip over a shorter track — track **40px** (`h-10`), tab/thumb **44px** (~2px overhang top and bottom). Radius stays **`rounded-md` (12px)** — Rule 3; never pill.

**Structure**

| **Part** | **Spec** |
| -------- | -------- |
| Track | Absolute bar centered behind tabs · **40px** (`h-10`) · fill by surface (see below) · **12px** radius (`md`) · **no border** · **no shadow** · full list width |
| Segment (each) | **44px** tall · `px-5` (**20**) · Body M 14/20 · center-aligned label · optional leading icon · transparent when inactive |
| Selected thumb | Same **44px** as segment (proud of track) · `Surface/Primary` (#FFFFFF) · **1px** `Border/Primary` (#E4E4E7) · light shadow · **12px** radius (`md`) |

**Track surface** — same *perceived* contrast, not the same hex. `#F1F1F2` on canvas looks lighter than the same swatch on a white card.

| **Control sits on** | **`surface` prop** | **Track fill** |
| ------------------- | ------------------ | -------------- |
| Page canvas | `canvas` (default) | `Surface/TableHeader` (#F1F1F2) — Notifications, Appointments |
| White card / dialog | `card` | `Background/Primary` (#F7F7F8) — lighter so it matches Notifications visually (Vitals, Records, in-dialog tabs) |

**Typography & color**

| **State** | **Label** | **Color** | **Weight** |
| --------- | --------- | --------- | ---------- |
| Selected | Button / Body M · 14px / 20px | `Text/Primary` (#1A1A1A) | Semibold (600) |
| Inactive | Button / Body M · 14px / 20px | `Text/Secondary` (#5F6368) | Medium (500) |

**Icons (optional)**

- Size **16px** (Icon/SM) · outline style · **8px** gap before label
- Inactive: inherit `Text/Secondary` · Selected: inherit `Text/Primary`
- Use only when the label alone is ambiguous (e.g. Favorites, Shared); text-only segments are fine

**Behavior**

- Single selection only — one thumb active at a time
- Selected state = white raised thumb + Active purple text (not a brand-tint fill — that pattern is for sidebar / list rows)
- Motion/Normal (200–250ms) on thumb position / state change
- Keyboard: arrow keys move focus between segments; Enter/Space activates; visible focus ring uses `Brand/Primary/FocusRing`
- Do **not** use Rule 1 pill radius on segments or track
- Do **not** use primary purple fill for the selected thumb — keep white surface + thin border + light shadow

**Authenticated app:**

- White left sidebar · Body M (14px) nav items · Icon/MD (20px, 1.5px stroke) leading icon per item
- Active: neutral `Surface/Secondary` fill + thin border · **brand icon only** on selected item · primary text label · **12px** radius (`md`, Rule 3)
- Desktop: expanded · Tablet: collapsible · Mobile: drawer or bottom navigation

**Public app:**

- Minimal top header: logo left · optional ghost / link actions · one purple CTA right (CTA is Rule 1 pill)

**Dialogs:**

- Desktop/tablet: centered modal, 20px `rounded-xl`, `cardShadowClass` (or dialog chrome equivalent), Overlay/Dark backdrop
- Mobile: full-width bottom sheet with 20px top-corner `rounded-xl`

### Component padding reference

| **Component** | **Vertical** | **Horizontal** |
| ------------- | ------------ | -------------- |
| Cards, forms  | 24px         | 24px           |
| Dialogs       | 32px         | 32px           |
| Inputs        | 12px         | 16px           |
| Segmented Control (44px tab / 40px track) | — | 20px (segments) |
| Table cells   | 12px         | 16px           |
| Page headers  | 32px         | 24px           |

---

## Z-index scale

| **Token** | **Value** | **Use case**        |
| --------- | --------- | ------------------- |
| Base      | 0         | Normal page content |
| Sticky    | 10        | Sticky table headers, subnav |
| Dropdown  | 20        | Dropdown menus      |
| Popover   | 30        | Popovers, context menus |
| Drawer    | 40        | Mobile nav drawer   |
| Modal     | 50        | Dialogs             |
| Toast     | 60        | Toast notifications |
| Tooltip   | 70        | Tooltips (topmost)  |

---

## Implementation notes (codebase)

When wiring `client/app/globals.css`, `@theme inline`, and shadcn theme — **keep in sync with this doc**. For TypeScript that needs literal hex (SVG lerp, gradients), import from `@/lib/tokens/colors` (`chartHex`, `cssVar`).

### CSS variable mapping

| **Design token** | **CSS variable** | **Tailwind** | **Value** |
| ---------------- | ---------------- | ------------ | --------- |
| Background/Primary | `--background` | `bg-background` | #F7F7F8 |
| Text/Primary | `--foreground` | `text-foreground` | #1A1A1A |
| Surface/Primary | `--card` | `bg-card` | #FFFFFF |
| Brand/Primary/Default | `--primary` | `bg-primary`, `text-primary` | #6C318E |
| Brand/Primary/Hover | `--primary-hover` | — | #5F2B7D |
| Brand/Primary/Active | `--primary-active` | `text-primary-active` | #52256C |
| Brand/Primary/Disabled | `--primary-disabled` | — | #CDB6D9 |
| Text/Inverse | `--primary-foreground` | `text-primary-foreground` | #FFFFFF |
| Surface/Secondary | `--muted`, `--secondary` | `bg-muted` | #F9F9FA |
| Text/Secondary | `--muted-foreground` | `text-muted-foreground` | #5F6368 |
| Text/Tertiary | `--tertiary-foreground` | `text-tertiary-foreground` | #6B6B6B |
| Text/Placeholder | `--placeholder` | `text-placeholder` | #8A8A8A |
| Surface/Hover | `--accent` | `bg-accent` | #F2F2F3 |
| Surface/TableHeader | `--table-header`, `--search-shortcut-key` | `bg-table-header`, `bg-search-shortcut-key` | #F1F1F2 |
| Border/Primary | `--border`, `--input` | `border-border` | #E4E4E7 |
| Border/Divider | `--divider` | `border-divider`, `bg-divider` | #ECECEE |
| Border/Focus | `--border-focus` | `border-border-focus` | #B98BD0 |
| Brand/Primary/FocusRing | `--ring`, `--sidebar-ring` | `ring-ring` | #A66BCF |
| Border/Disabled | `--border-disabled` | — | #EFEFEF |
| Text/Disabled | `--text-disabled` | — | #A1A1AA |
| Error/Text | `--destructive` | `text-destructive` | #DC2626 |
| Error/Tint | `--destructive-muted` | `bg-destructive-muted` | #FCECEC |
| Success/Text | `--success` | `text-success` | #10B981 |
| Success/Tint | `--success-muted` | `bg-success-muted` | #ECFDF5 |
| Warning/Text | `--warning` | `text-warning` | #CA8A04 |
| Warning/Tint | `--warning-muted` | `bg-warning-muted` | #FEFCE8 |
| Limited Independence accent | `--attention` | `text-attention` | #F97316 |
| Limited Independence tint | `--attention-muted` | `bg-attention-muted` | #FFF7ED |
| Info/Text | `--info` | `text-info` | #2563EB |
| Info/Tint | `--info-muted` | `bg-info-muted` | #E7EFF8 |
| Chart/Brand start | `--chart-1` | — | #6C318E |
| Chart/BP Systolic | `--chart-2` | — | #FA4B42 |
| Chart/BP Diastolic | `--chart-3` | — | #147AD6 |
| Chart/Heart Rate | `--chart-4` | — | #7086FD |
| Chart/SpO₂ | `--chart-5` | — | #0EA5B1 |
| Chart/Blood Glucose | `--chart-6` | — | #5B8DEF |
| Chart/Temperature | `--chart-7` | — | #F97316 |
| Chart/Brand end | `--chart-8` | — | #1E0E28 |
| Segmented track (canvas) | `--segmented-track` | `bg-segmented-track` | #F1F1F2 |
| Segmented track (card) | `--segmented-track-on-card` | `bg-segmented-track-on-card` | #F7F7F8 |
| Sidebar surface | `--sidebar` | `bg-sidebar` | #FFFFFF |
| Sidebar hover | `--sidebar-hover` | `hover:bg-sidebar-hover` | #F2F2F3 |
| Sidebar active row | `--muted` | `bg-muted` | #F9F9FA |

```css
/* Target mapping — keep in sync with client/app/globals.css :root */
:root {
  --background: #F7F7F8;
  --foreground: #1A1A1A;
  --card: #FFFFFF;
  --primary: #6C318E;
  --primary-hover: #5F2B7D;
  --primary-active: #52256C;
  --primary-disabled: #CDB6D9;
  --primary-foreground: #FFFFFF;
  --secondary: #F9F9FA;
  --muted: #F9F9FA;
  --muted-foreground: #5F6368;
  --tertiary-foreground: #6B6B6B;
  --placeholder: #8A8A8A;
  --accent: #F2F2F3;
  --table-header: #F1F1F2;
  --search-shortcut-key: #F1F1F2;
  --destructive: #DC2626;
  --destructive-muted: #FCECEC;
  --success: #10B981;
  --success-muted: #ECFDF5;
  --warning: #CA8A04;
  --warning-muted: #FEFCE8;
  --attention: #F97316;
  --attention-muted: #FFF7ED;
  --attention-foreground: #C2410C;
  --info: #2563EB;
  --info-muted: #E7EFF8;
  --border: #E4E4E7;
  --divider: #ECECEE;
  --border-disabled: #EFEFEF;
  --text-disabled: #A1A1AA;
  --input: #E4E4E7;
  --ring: #A66BCF;
  --border-focus: #B98BD0;
  --chart-1: #6C318E;
  --chart-2: #FA4B42;
  --chart-3: #147AD6;
  --chart-4: #7086FD;
  --chart-5: #0EA5B1;
  --chart-6: #5B8DEF;
  --chart-7: #F97316;
  --chart-8: #1E0E28;
  --sidebar: #FFFFFF;
  --sidebar-hover: #F2F2F3;
  --segmented-track: #F1F1F2;
  --segmented-track-on-card: #F7F7F8;
  --radius-none: 0;
  --radius-xs: 0.375rem;
  --radius-sm: 0.5rem;
  --radius-md: 0.75rem;
  --radius-lg: 1rem;
  --radius-xl: 1.25rem;
  --radius-full: 9999px;
}
```

**Typography compositions (product overrides — do not add named tokens to `typography.ts`):**

| **Role** | **Size / weight / LH** | **Code** |
| -------- | ---------------------- | -------- |
| Page title | 24px / Semibold / **30px** | `typo.headingXl` + `leading-[30px]` |
| Card / section title | **18px** / Semibold / **24px** | `cardTitleClass` in `dashboard-styles.ts` |
| KPI / large numbers | Heading XXL or local size | vitals summary uses 30px; IAS ring uses 42px |

**Font setup (Next.js layout):**

```tsx
import { Hanken_Grotesk } from "next/font/google";
const hanken = Hanken_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-hanken",
});
// Apply hanken.variable to <html> and font-sans to body
```

**Tailwind conventions:**

- Prefer theme tokens: `bg-background`, `text-foreground`, `border-border`, `bg-primary`
- Radius: import from `@/lib/tokens/radius` or use Tailwind `rounded-xs` … `rounded-xl` · **Rule 1** `rounded-full` for buttons/badges · **Rule 2 / 3** `rounded-md` for controls and nav · `rounded-lg` for cards · `rounded-xl` for dialogs/auth · nested children step down (`lg` → `md` → `sm`)
- Elevation: import from `@/lib/tokens/elevation` (`cardShadowClass`, lift / wash helpers) — do not invent card shadow stacks
- Card titles: import `cardTitleClass` — do not hardcode mixed sizes
- When theme is not yet wired, use token hex from this doc — not arbitrary Tailwind grays or `blue-600`

---

## Rules

### Do

- Keep all spacing on the 8pt grid.
- One filled brand Primary per section; neutral outline Secondary elsewhere; Ghost / Link for tertiary / navigation; Brand Outline only for auth method switch.
- **Rule 1 / 2 / 3:** Button = pill · form controls = `md` (12px) · nav = `md` (12px) · cards = `lg` (16px).
- Build every feedback surface with the full tint recipe (background + border + foreground + icon).
- Use Hugeicons at 16px inside controls, 20px in navigation.
- Apply tabular numerals to every score, vital, ID, and metric.
- Show one wizard step per screen with Back / Continue.
- Stack content on mobile; prioritize readability over density.
- Keep data tables fluid width.
- Use semantic tokens in new components; migrate hardcoded hex when touching a file.
- Keep canvas/borders cool gray; reserve plum for brand actions and icons.
- Use one card-title size (`cardTitleClass`) across all dashboard cards.

### Don't

- Gradients, glassmorphism, neon, heavy shadows, or marketing-site visuals around health data.
- Decorative use of green, amber, red, or blue.
- A second typeface or mixed icon libraries.
- Body text below 14px or touch targets below 44×44px.
- Nested shadowed cards, or `cardShadow*` plus a separate CSS border on the same surface.
- Multiple assessment sections on one wizard step.
- Default shadcn blue primary — brand purple is `#6C318E`.
- Lavender (or other tinted) canvas / borders / wells for app chrome — use cool gray; plum for brand actions and icons only.
- Mixed card-title sizes (16 / 20 / 22px) — always `cardTitleClass` (18 / 24).
- Pill radius on inputs, select, or nav chrome — or corner radius on the Button component.
- Ad-hoc `rounded-[Npx]` or legacy Tailwind steps (`rounded-2xl`, etc.) outside the semantic scale.
- Role-specific auth layouts (centered staff vs split patient) or subdomain multi-auth portals.
- SSO / social identity-provider login buttons on auth screens.
- Brand Outline outside auth method switch (use neutral Secondary instead).

### Most used tokens (80% of UI)

`Background/Primary` · `Surface/Primary` · `Text/Primary` · `Text/Secondary` · `Border/Primary` · `Brand/Primary/Default` · `Radius/MD` (12px) · `Radius/LG` (16px) · `Radius/XL` (20px) · `Radius/Full` · `cardShadowClass` · `Space/16` · `Space/24` · `Space/32`

### Final rule

If a choice makes the UI look "designed" but reduces clarity, remove it. Nivarak should be systematic, calm, and easy to scan. That matters more than visual novelty.