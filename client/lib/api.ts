import { getCognitoAccessToken } from '@/lib/auth/cognito-session';

const API_ROOT = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';
export const API_BASE = `${API_ROOT.replace(/\/$/, '')}/api/v1`;

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

interface ApiEnvelope<T> {
  success: boolean;
  data: T | null;
  error?: { message?: string } | null;
}

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
