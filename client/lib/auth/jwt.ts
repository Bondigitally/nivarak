/** Untyped Cognito/custom claim bag — decoded in-place, not validated. */
type JwtPayload = Record<string, unknown>;

/**
 * Decodes a JWT payload without verifying the signature.
 * Uses `atob` in the browser and `Buffer` on the server (Node) so the same
 * code path works for both client components and middleware.
 * Returns null for malformed tokens instead of throwing.
 */
export function decodeJwtPayload(token: string): JwtPayload | null {
  try {
    const parts = token.split(".");
    if (parts.length < 2) return null;
    // JWT uses base64url encoding — normalize to standard base64 before decoding.
    const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const json =
      typeof window !== "undefined"
        ? atob(base64)
        : Buffer.from(base64, "base64").toString("utf8");
    return JSON.parse(json) as JwtPayload;
  } catch {
    return null;
  }
}

/**
 * Extracts role strings from a decoded JWT payload.
 * Checks `roles` first (custom Nivarak claim), then `cognito:groups` as a
 * fallback for pools that use the standard Cognito groups claim.
 */
export function getRolesFromJwtPayload(payload: JwtPayload | null): string[] {
  if (!payload) return [];

  const roles = payload.roles;
  if (Array.isArray(roles)) {
    return roles.filter((role): role is string => typeof role === "string");
  }

  const groups = payload["cognito:groups"];
  if (Array.isArray(groups)) {
    return groups.filter((group): group is string => typeof group === "string");
  }

  return [];
}
