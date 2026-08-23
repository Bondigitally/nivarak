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

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...init?.headers },
    ...init,
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

export interface AuthUser {
  id: string;
  fullName: string;
  roles: string[];
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  user: AuthUser;
}

export interface VerifyOtpResult {
  accessToken?: string;
  refreshToken?: string;
  registrationRequired?: boolean;
  user?: AuthUser;
}

export async function requestOtp(phone: string): Promise<{ message: string; otp?: string }> {
  return apiFetch('/auth/request-otp', {
    method: 'POST',
    body: JSON.stringify({ phone }),
  });
}

export async function verifyOtp(phone: string, otp: string): Promise<VerifyOtpResult> {
  return apiFetch('/auth/verify-otp', {
    method: 'POST',
    body: JSON.stringify({ phone, otp }),
  });
}

export async function loginWithPassword(
  phone: string,
  password: string,
): Promise<AuthTokens> {
  return apiFetch('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ phone, password }),
  });
}

export async function registerUser(payload: {
  phone: string;
  fullName: string;
  password: string;
  email?: string;
  preferredLanguage?: string;
}): Promise<{ id: string; fullName: string }> {
  return apiFetch('/auth/register', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function forgotPassword(
  email: string,
): Promise<{ message: string; code?: string }> {
  return apiFetch('/auth/forgot-password', {
    method: 'POST',
    body: JSON.stringify({ email }),
  });
}

export async function verifyResetCode(
  email: string,
  code: string,
): Promise<{ valid: boolean }> {
  return apiFetch('/auth/verify-reset-code', {
    method: 'POST',
    body: JSON.stringify({ email, code }),
  });
}

export async function resetPassword(payload: {
  email: string;
  code: string;
  newPassword: string;
}): Promise<{ message: string }> {
  return apiFetch('/auth/reset-password', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}
