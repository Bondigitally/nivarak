import { getCognitoAccessToken } from '@/lib/auth/cognito-session';

/** Resolved from NEXT_PUBLIC_API_URL; falls back to local dev server. */
const API_ROOT = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

/** All requests are versioned under /api/v1. */
export const API_BASE = `${API_ROOT.replace(/\/$/, '')}/api/v1`;

/**
 * Thrown when the server returns a non-2xx status or `{ success: false }`.
 * Callers can check `status` for HTTP code and `data` for the raw envelope.
 */
export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly data?: unknown,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * Every backend response is wrapped in this shape.
 * `data` is null on errors; `error.message` carries the human-readable reason.
 */
interface ApiEnvelope<T> {
  success: boolean;
  data: T | null;
  error?: { message?: string } | null;
}

/**
 * Authenticated fetch wrapper for all API calls.
 * - Injects the Cognito access token as a Bearer header (omitted if not signed in).
 * - Defaults Content-Type to JSON unless the caller overrides it.
 * - Unwraps the `{ success, data }` envelope and throws `ApiError` on failure.
 */
export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const token = await getCognitoAccessToken();
  const headers = new Headers(init?.headers);

  if (!headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers,
  });
  const json = (await res.json().catch(() => null)) as ApiEnvelope<T> | null;
  if (!res.ok || !json?.success) {
    throw new ApiError(
      res.status,
      json?.error?.message ?? 'Request failed',
      json,
    );
  }
  return json.data as T;
}
