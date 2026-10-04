type JwtPayload = Record<string, unknown>;

export function decodeJwtPayload(token: string): JwtPayload | null {
  try {
    const parts = token.split(".");
    if (parts.length < 2) return null;
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
