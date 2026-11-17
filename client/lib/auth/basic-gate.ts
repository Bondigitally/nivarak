/**
 * TEMPORARY — remove when Cognito auth is fully set up.
 *
 * Grep: TEMPORARY(basic-auth-gate)
 * Delete this file and all call sites tagged the same way:
 * - app/api/basic-auth/**
 * - proxy.ts basic-gate imports + session checks
 * - LoginForm basic-auth fetch branch
 * - AuthScreen email default for basic gate
 * - SignOutDialog /api/basic-auth/logout call
 * - BASIC_AUTH_* / NEXT_PUBLIC_BASIC_AUTH_GATE env vars
 */

/** HttpOnly session cookie set by `/api/basic-auth/login`. TEMPORARY(basic-auth-gate) */
export const BASIC_AUTH_COOKIE = "nivarak_basic_auth";

/**
 * TEMPORARY(basic-auth-gate) — shared-gate credentials until Cognito is wired.
 * Prefer env overrides; defaults match the interim admin account.
 * Keep this module Edge-safe — `proxy.ts` imports it.
 */
const DEFAULT_EMAIL = "Admin@nivarak.com";
const DEFAULT_PASSWORD = "NVK_281_hzw1@";
const DEFAULT_SESSION_TOKEN = "nivarak-temp-basic-gate-v1";

/** TEMPORARY(basic-auth-gate) */
export function isBasicAuthGateEnabled(): boolean {
  if (process.env.BASIC_AUTH_ENABLED === "false") return false;
  if (process.env.NEXT_PUBLIC_BASIC_AUTH_GATE === "false") return false;
  // On by default while Cognito login is not the sole gate.
  return true;
}

/** TEMPORARY(basic-auth-gate) */
export function getBasicAuthCredentials() {
  return {
    email: (process.env.BASIC_AUTH_EMAIL ?? DEFAULT_EMAIL).trim().toLowerCase(),
    password: process.env.BASIC_AUTH_PASSWORD ?? DEFAULT_PASSWORD,
    sessionToken:
      process.env.BASIC_AUTH_SESSION_TOKEN ?? DEFAULT_SESSION_TOKEN,
  };
}

/** TEMPORARY(basic-auth-gate) */
export function credentialsMatch(email: string, password: string): boolean {
  const expected = getBasicAuthCredentials();
  const normalizedEmail = email.trim().toLowerCase();
  return (
    safeEqual(normalizedEmail, expected.email) &&
    safeEqual(password, expected.password)
  );
}

/** Constant-time-ish compare that works on Edge (no node:crypto). TEMPORARY(basic-auth-gate) */
function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let mismatch = 0;
  for (let i = 0; i < a.length; i += 1) {
    mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return mismatch === 0;
}
