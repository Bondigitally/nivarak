import type { Context } from 'hono';
import { deleteCookie, getCookie, setCookie } from 'hono/cookie';

/**
 * Per-session HttpOnly cookie that replaces the browser-visible access-token
 * map. Name includes the session id so a paid report for an older session can
 * keep working after a newer assessment starts.
 *
 * SameSite=None + Secure is required because the web app and API are on
 * different origins (including localhost:3000 → localhost:3001). Chromium
 * treats http://localhost as a secure context for Secure cookies.
 */
const COOKIE_PREFIX = 'nivarak_iasp_';
const COOKIE_MAX_AGE_SEC = 90 * 24 * 60 * 60;

export function iaspAccessCookieName(sessionId: string): string {
  return `${COOKIE_PREFIX}${sessionId}`;
}

export function readIaspAccessToken(
  c: Context,
  sessionId: string,
): string | undefined {
  const fromCookie = getCookie(c, iaspAccessCookieName(sessionId));
  if (fromCookie && fromCookie.length > 0) return fromCookie;

  // Legacy: older clients stored the token in localStorage and sent this header.
  const header = c.req.header('x-iasp-access-token');
  return header && header.length > 0 ? header : undefined;
}

export function setIaspAccessCookie(
  c: Context,
  sessionId: string,
  accessToken: string,
): void {
  setCookie(c, iaspAccessCookieName(sessionId), accessToken, {
    path: '/',
    httpOnly: true,
    secure: true,
    sameSite: 'None',
    maxAge: COOKIE_MAX_AGE_SEC,
  });
}

export function clearIaspAccessCookie(c: Context, sessionId: string): void {
  deleteCookie(c, iaspAccessCookieName(sessionId), {
    path: '/',
    secure: true,
    sameSite: 'None',
  });
}
