import { apiFetch, ApiError } from "@/lib/api";
import {
  EMPTY_IASP_ABOUT_YOU,
  type IaspAboutYouValues,
} from "../data/iasp-about-you-data";
import {
  INITIAL_IASP_FLOW_STATE,
  type IaspFlowState,
  type IaspFlowStep,
} from "../data/iasp-assessment-draft";

const SESSION_KEY = "nivarak:iasp-session-id";
/** @deprecated Removed: tokens live in HttpOnly cookies. Cleared on read. */
const LEGACY_TOKEN_MAP_KEY = "nivarak:iasp-session-tokens";
const PENDING_START_KEY = "nivarak:iasp-session-start";

export type IaspSessionStatus =
  | "in_progress"
  | "completed"
  | "abandoned"
  | "superseded"
  | "expired";

export type IaspGuestSession = {
  sessionId: string;
  status: IaspSessionStatus;
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

type PendingStart = {
  idempotencyKey: string;
  accessToken: string;
  supersedeSessionId: string | null;
};

/** Tab-local id. localStorage can change from another tab; this one does not. */
let boundSessionId: string | null = null;
let boundSessionReady = false;
let inFlightStart: Promise<IaspGuestSession> | null = null;
const sessionListeners = new Set<() => void>();

export function bindActiveIaspSession(sessionId: string | null): void {
  boundSessionReady = true;
  if (boundSessionId === sessionId) return;
  boundSessionId = sessionId;
  for (const listener of sessionListeners) listener();
}

export function subscribeActiveIaspSession(listener: () => void): () => void {
  sessionListeners.add(listener);
  return () => {
    sessionListeners.delete(listener);
  };
}

/**
 * Client snapshot for the active session. Adopts the stored id once per tab
 * without notifying, so a render can read it without an effect.
 */
export function getActiveIaspSessionSnapshot(): string | null {
  if (!boundSessionReady && typeof window !== "undefined") {
    boundSessionReady = true;
    boundSessionId = getStoredIaspSessionId();
  }
  return boundSessionId;
}

export function getServerIaspSessionSnapshot(): null {
  return null;
}

export function getBoundIaspSessionId(): string | null {
  return getActiveIaspSessionSnapshot();
}

export function getStoredIaspSessionId(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(SESSION_KEY);
  } catch {
    return null;
  }
}

function readLegacyTokenMap(): Record<string, string> {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(LEGACY_TOKEN_MAP_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== "object") return {};
    return parsed as Record<string, string>;
  } catch {
    return {};
  }
}

function writeLegacyTokenMap(map: Record<string, string>): void {
  if (Object.keys(map).length === 0) {
    window.localStorage.removeItem(LEGACY_TOKEN_MAP_KEY);
    return;
  }
  window.localStorage.setItem(LEGACY_TOKEN_MAP_KEY, JSON.stringify(map));
}

/**
 * One-time migration: older builds kept tokens in localStorage. Send the
 * header until the server mirrors it into an HttpOnly cookie, then drop it.
 */
export function iaspAccessHeaders(sessionId: string | null): HeadersInit {
  if (!sessionId) return {};
  const token = readLegacyTokenMap()[sessionId];
  return token ? { "X-Iasp-Access-Token": token } : {};
}

export function forgetLegacyIaspAccessToken(sessionId: string): void {
  if (typeof window === "undefined") return;
  try {
    const map = readLegacyTokenMap();
    if (!(sessionId in map)) return;
    delete map[sessionId];
    writeLegacyTokenMap(map);
  } catch {
    // Ignore storage failures.
  }
}

export function rememberIaspSession(sessionId: string): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(SESSION_KEY, sessionId);
    bindActiveIaspSession(sessionId);
  } catch {
    bindActiveIaspSession(sessionId);
  }
}

/**
 * Drops the active session pointer. HttpOnly access cookies stay until the
 * server clears them (e.g. abandon) or they expire — that keeps a paid report
 * openable after the active id moves on.
 */
export function clearStoredIaspSessionId(sessionId?: string | null): void {
  if (typeof window === "undefined") return;
  try {
    const activeId = window.localStorage.getItem(SESSION_KEY);
    const target = sessionId ?? activeId;
    if (activeId && target === activeId) {
      window.localStorage.removeItem(SESSION_KEY);
    }
    if (target) forgetLegacyIaspAccessToken(target);
  } catch {
    // Ignore storage failures.
  }
  if (!sessionId || sessionId === boundSessionId) {
    bindActiveIaspSession(null);
  }
}

function readPendingStart(): PendingStart | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.sessionStorage.getItem(PENDING_START_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<PendingStart>;
    if (!parsed.idempotencyKey || !parsed.accessToken) return null;
    return {
      idempotencyKey: parsed.idempotencyKey,
      accessToken: parsed.accessToken,
      supersedeSessionId: parsed.supersedeSessionId ?? null,
    };
  } catch {
    return null;
  }
}

function writePendingStart(pending: PendingStart): void {
  window.sessionStorage.setItem(PENDING_START_KEY, JSON.stringify(pending));
}

function clearPendingStart(): void {
  try {
    window.sessionStorage.removeItem(PENDING_START_KEY);
  } catch {
    // Ignore storage failures.
  }
}

function generateAccessToken(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

function claimPendingStart(supersedeSessionId: string | null): PendingStart {
  const existing = readPendingStart();
  if (existing && existing.supersedeSessionId === (supersedeSessionId ?? null)) {
    return existing;
  }
  const pending: PendingStart = {
    idempotencyKey: crypto.randomUUID(),
    accessToken: generateAccessToken(),
    supersedeSessionId: supersedeSessionId ?? null,
  };
  writePendingStart(pending);
  return pending;
}

/**
 * One start action, including a double click or a Strict Mode replay, shares
 * one idempotency key. A later action after this promise settles gets a new key.
 */
export function startIaspSession(options?: {
  supersedeSessionId?: string | null;
}): Promise<IaspGuestSession> {
  if (inFlightStart) return inFlightStart;
  const supersedeSessionId = options?.supersedeSessionId ?? null;
  inFlightStart = performStart(supersedeSessionId).finally(() => {
    inFlightStart = null;
  });
  return inFlightStart;
}

async function performStart(supersedeSessionId: string | null): Promise<IaspGuestSession> {
  const pending = claimPendingStart(supersedeSessionId);
  const session = await apiFetch<IaspGuestSession>("/iasp/sessions", {
    method: "POST",
    // Prefer the previous session's HttpOnly cookie; legacy header is a fallback.
    headers: iaspAccessHeaders(supersedeSessionId),
    body: JSON.stringify({
      idempotencyKey: pending.idempotencyKey,
      accessToken: pending.accessToken,
      supersedeSessionId: supersedeSessionId ?? undefined,
    }),
  });
  // Server Set-Cookie binds the token; only the session id stays in localStorage.
  rememberIaspSession(session.sessionId);
  if (supersedeSessionId) forgetLegacyIaspAccessToken(supersedeSessionId);
  clearPendingStart();
  return session;
}

export function resetIaspSessionStartForTests(): void {
  inFlightStart = null;
  boundSessionId = null;
  boundSessionReady = false;
  sessionListeners.clear();
  clearPendingStart();
}

export async function syncIaspSession(input: {
  aboutYou?: IaspAboutYouValues;
  answers?: Record<string, string>;
  redFlags?: string[];
  flowStep?: IaspFlowStep;
  pageIndex?: number;
}): Promise<IaspGuestSession | null> {
  const sessionId = getBoundIaspSessionId();
  if (!sessionId) return null;

  const session = await apiFetch<IaspGuestSession>(`/iasp/sessions/${sessionId}`, {
    method: "PATCH",
    headers: iaspAccessHeaders(sessionId),
    body: JSON.stringify(input),
  });
  forgetLegacyIaspAccessToken(sessionId);
  return session;
}

export async function completeIaspSession(input: {
  aboutYou: IaspAboutYouValues;
  answers: Record<string, string>;
  redFlags: string[];
  rawScore: number;
  maxScore: number;
  iasPercentage: number;
}): Promise<IaspGuestSession> {
  const sessionId = getBoundIaspSessionId();
  if (!sessionId) {
    throw new Error("Start the assessment before submitting.");
  }

  const session = await apiFetch<IaspGuestSession>(`/iasp/sessions/${sessionId}/complete`, {
    method: "POST",
    headers: iaspAccessHeaders(sessionId),
    body: JSON.stringify(input),
  });
  forgetLegacyIaspAccessToken(sessionId);
  return session;
}

export async function abandonIaspSession(sessionId: string): Promise<IaspGuestSession> {
  const session = await apiFetch<IaspGuestSession>(`/iasp/sessions/${sessionId}/abandon`, {
    method: "POST",
    headers: iaspAccessHeaders(sessionId),
  });
  forgetLegacyIaspAccessToken(sessionId);
  return session;
}

export async function fetchIaspSession(sessionId: string): Promise<IaspGuestSession> {
  const session = await apiFetch<IaspGuestSession>(`/iasp/sessions/${sessionId}`, {
    headers: iaspAccessHeaders(sessionId),
  });
  forgetLegacyIaspAccessToken(sessionId);
  return session;
}

function isFlowStep(value: string | null): value is IaspFlowStep {
  return (
    value === "intro" ||
    value === "about" ||
    value === "questions" ||
    value === "redFlags" ||
    value === "review" ||
    value === "results"
  );
}

export function iaspSessionToFlowState(session: IaspGuestSession): IaspFlowState {
  const step = isFlowStep(session.flowStep)
    ? session.flowStep
    : session.status === "completed"
      ? "results"
      : "intro";
  return {
    ...INITIAL_IASP_FLOW_STATE,
    step,
    aboutYou: { ...EMPTY_IASP_ABOUT_YOU, ...(session.aboutYou ?? {}) },
    pageIndex: session.pageIndex ?? 0,
    answers: { ...(session.answers ?? {}) } as IaspFlowState["answers"],
    redFlags: session.redFlags as IaspFlowState["redFlags"],
  };
}

export function isTerminalIaspSession(status: IaspSessionStatus): boolean {
  return status === "abandoned" || status === "superseded" || status === "expired";
}

export { ApiError };
