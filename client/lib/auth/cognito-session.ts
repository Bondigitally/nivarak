import { fetchAuthSession } from "aws-amplify/auth";
import { decodeJwtPayload, getRolesFromJwtPayload } from "@/lib/auth/jwt";

/**
 * Returns the raw Cognito access token string, or null when unauthenticated.
 * Callers must treat null as "not signed in" — this function never throws.
 */
export async function getCognitoAccessToken(): Promise<string | null> {
  try {
    const session = await fetchAuthSession();
    return session.tokens?.accessToken?.toString() ?? null;
  } catch {
    return null;
  }
}

/**
 * Derives the user's role list from the access token payload.
 * Roles are embedded in the JWT claims — no separate API call is made.
 * Returns an empty array when unauthenticated or when the token has no roles.
 */
export async function getCognitoAuthRoles(): Promise<string[]> {
  const accessToken = await getCognitoAccessToken();
  if (!accessToken) return [];
  return getRolesFromJwtPayload(decodeJwtPayload(accessToken));
}
