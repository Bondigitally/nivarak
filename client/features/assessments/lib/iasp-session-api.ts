import { apiFetch } from "@/lib/api";
import type { IaspAboutYouValues } from "../data/iasp-about-you-data";
import type { IaspFlowStep } from "../data/iasp-assessment-draft";

const SESSION_KEY = "nivarak:iasp-session-id";

export type IaspGuestSession = {
  sessionId: string;
  status: "in_progress" | "completed";
  aboutYou: IaspAboutYouValues;
  answers: Record<string, string>;
  redFlags: string[];
  flowStep: string | null;
  pageIndex: number;
  rawScore: number | null;
  maxScore: number | null;
  iasPercentage: number | null;
  riskBand: string | null;
  redFlagCount: number;
  redFlagUrgency: string | null;
  unlocked: boolean;
  detailedReportUnlockedAt: string | null;
  fullName?: string | null;
  phoneNumber?: string | null;
  email?: string | null;
  completedAt: string | null;
  expiresAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export function getStoredIaspSessionId(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(SESSION_KEY);
  } catch {
    return null;
  }
}

export function setStoredIaspSessionId(sessionId: string): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(SESSION_KEY, sessionId);
  } catch {
    // Ignore quota / private-mode failures.
  }
}

export function clearStoredIaspSessionId(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(SESSION_KEY);
  } catch {
    // Ignore storage failures.
  }
}

export async function ensureIaspSession(): Promise<IaspGuestSession> {
  const existingId = getStoredIaspSessionId();
  if (existingId) {
    try {
      return await apiFetch<IaspGuestSession>(`/iasp/sessions/${existingId}`);
    } catch {
      clearStoredIaspSessionId();
    }
  }

  const session = await apiFetch<IaspGuestSession>("/iasp/sessions", {
    method: "POST",
  });
  setStoredIaspSessionId(session.sessionId);
  return session;
}

export async function syncIaspSession(input: {
  aboutYou?: IaspAboutYouValues;
  answers?: Record<string, string>;
  redFlags?: string[];
  flowStep?: IaspFlowStep;
  pageIndex?: number;
}): Promise<IaspGuestSession | null> {
  const sessionId = getStoredIaspSessionId();
  if (!sessionId) return null;

  return apiFetch<IaspGuestSession>(`/iasp/sessions/${sessionId}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  }).catch(() => null);
}

export async function completeIaspSession(input: {
  aboutYou: IaspAboutYouValues;
  answers: Record<string, string>;
  redFlags: string[];
  rawScore: number;
  maxScore: number;
  iasPercentage: number;
}): Promise<IaspGuestSession> {
  const existingId = getStoredIaspSessionId();
  if (existingId) {
    try {
      const completed = await apiFetch<IaspGuestSession>(
        `/iasp/sessions/${existingId}/complete`,
        {
          method: "POST",
          body: JSON.stringify(input),
        },
      );
      setStoredIaspSessionId(completed.sessionId);
      return completed;
    } catch {
      clearStoredIaspSessionId();
    }
  }

  try {
    const session = await apiFetch<IaspGuestSession>(
      "/iasp/sessions/complete",
      {
        method: "POST",
        body: JSON.stringify(input),
      },
    );
    setStoredIaspSessionId(session.sessionId);
    return session;
  } catch {
    // Resilient fallback if atomic route is unavailable
    const fallback = await ensureIaspSession();
    const completed = await apiFetch<IaspGuestSession>(
      `/iasp/sessions/${fallback.sessionId}/complete`,
      {
        method: "POST",
        body: JSON.stringify(input),
      },
    );
    setStoredIaspSessionId(completed.sessionId);
    return completed;
  }
}

export async function fetchIaspSession(
  sessionId: string,
): Promise<IaspGuestSession> {
  return apiFetch<IaspGuestSession>(`/iasp/sessions/${sessionId}`);
}
