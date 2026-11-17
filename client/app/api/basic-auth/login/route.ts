/**
 * TEMPORARY(basic-auth-gate) — remove this route when Cognito auth is fully set up.
 * See `lib/auth/basic-gate.ts` for the full removal checklist.
 */
import { NextResponse } from "next/server";
import {
  BASIC_AUTH_COOKIE,
  credentialsMatch,
  getBasicAuthCredentials,
  isBasicAuthGateEnabled,
} from "@/lib/auth/basic-gate";

export async function POST(request: Request) {
  // TEMPORARY(basic-auth-gate)
  if (!isBasicAuthGateEnabled()) {
    return NextResponse.json(
      { ok: false, error: "Basic auth gate is disabled." },
      { status: 503 },
    );
  }

  let body: { email?: string; password?: string };
  try {
    body = (await request.json()) as { email?: string; password?: string };
  } catch {
    return NextResponse.json(
      { ok: false, error: "Invalid request body." },
      { status: 400 },
    );
  }

  const email = typeof body.email === "string" ? body.email : "";
  const password = typeof body.password === "string" ? body.password : "";

  if (!credentialsMatch(email, password)) {
    return NextResponse.json(
      { ok: false, error: "Incorrect email or password" },
      { status: 401 },
    );
  }

  const { sessionToken } = getBasicAuthCredentials();
  const response = NextResponse.json({ ok: true });
  response.cookies.set({
    name: BASIC_AUTH_COOKIE,
    value: sessionToken,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 14, // 14 days
  });
  return response;
}
