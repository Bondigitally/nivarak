/**
 * TEMPORARY(basic-auth-gate) — remove this route when Cognito auth is fully set up.
 * See `lib/auth/basic-gate.ts` for the full removal checklist.
 */
import { NextResponse } from "next/server";
import { BASIC_AUTH_COOKIE } from "@/lib/auth/basic-gate";

export async function POST() {
  // TEMPORARY(basic-auth-gate)
  const response = NextResponse.json({ ok: true });
  response.cookies.set({
    name: BASIC_AUTH_COOKIE,
    value: "",
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
  return response;
}
