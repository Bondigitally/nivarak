import { StrictMode, useEffect } from "react";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/api", () => ({
  apiFetch: vi.fn(),
  ApiError: class ApiError extends Error {
    code?: string;
    constructor(status: number, message: string, _data?: unknown, code?: string) {
      super(message);
      this.code = code;
    }
  },
}));

import { apiFetch } from "@/lib/api";
import {
  resetIaspSessionStartForTests,
  startIaspSession,
} from "./iasp-session-api";

const fetchMock = vi.mocked(apiFetch);

function session(id: string) {
  return {
    sessionId: id,
    status: "in_progress" as const,
    aboutYou: {
      relationship: null,
      age: "",
      location: null,
      visitFrequency: null,
      livingSituation: null,
      livingSituationOther: "",
    },
    answers: {},
    redFlags: [],
    flowStep: "intro",
    pageIndex: 0,
    rawScore: null,
    maxScore: null,
    iasPercentage: null,
    riskBand: null,
    redFlagCount: 0,
    redFlagUrgency: null,
    unlocked: false,
    detailedReportUnlockedAt: null,
    completedAt: null,
    expiresAt: null,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  };
}

function idempotencyKeyOf(callIndex: number): string {
  const init = fetchMock.mock.calls[callIndex]?.[1] as { body?: string } | undefined;
  const body = JSON.parse(init?.body ?? "{}") as { idempotencyKey?: string };
  return body.idempotencyKey ?? "";
}

describe("IAS-P session start", () => {
  beforeEach(() => {
    resetIaspSessionStartForTests();
    window.localStorage.clear();
    window.sessionStorage.clear();
    fetchMock.mockReset();
  });

  afterEach(() => {
    cleanup();
    resetIaspSessionStartForTests();
  });

  it("creates one session when an effect runs twice in Strict Mode", async () => {
    let release: (value: ReturnType<typeof session>) => void = () => {};
    fetchMock.mockImplementation(
      () =>
        new Promise((resolve) => {
          release = resolve;
        }),
    );

    function EffectStart() {
      useEffect(() => {
        void startIaspSession();
      }, []);
      return <p>ready</p>;
    }

    render(
      <StrictMode>
        <EffectStart />
      </StrictMode>,
    );

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));
    release(session("11111111-1111-4111-8111-111111111111"));
    await waitFor(() =>
      expect(window.localStorage.getItem("nivarak:iasp-session-id")).toBe(
        "11111111-1111-4111-8111-111111111111",
      ),
    );
  });

  it("creates one session when Start is clicked twice", async () => {
    let release: (value: ReturnType<typeof session>) => void = () => {};
    fetchMock.mockImplementation(
      () =>
        new Promise((resolve) => {
          release = resolve;
        }),
    );

    function StartButton() {
      return (
        <button type="button" onClick={() => void startIaspSession()}>
          Start Assessment
        </button>
      );
    }

    const user = userEvent.setup();
    render(<StartButton />);
    const button = screen.getByRole("button", { name: "Start Assessment" });
    await user.click(button);
    await user.click(button);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    release(session("22222222-2222-4222-8222-222222222222"));
    await waitFor(() =>
      expect(window.localStorage.getItem("nivarak:iasp-session-id")).toBe(
        "22222222-2222-4222-8222-222222222222",
      ),
    );
  });

  it("reuses the idempotency key after a failed request and issues a new key after success", async () => {
    fetchMock.mockRejectedValueOnce(new Error("network"));
    await expect(startIaspSession()).rejects.toThrow("network");
    const failedKey = idempotencyKeyOf(0);

    fetchMock.mockResolvedValueOnce(session("33333333-3333-4333-8333-333333333333"));
    await startIaspSession();
    expect(idempotencyKeyOf(1)).toBe(failedKey);

    fetchMock.mockResolvedValueOnce(session("44444444-4444-4444-8444-444444444444"));
    await startIaspSession();
    expect(idempotencyKeyOf(2)).not.toBe(failedKey);
  });
});
