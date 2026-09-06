import type { UserRole } from "@/lib/auth/roles";

/** Routes restricted to specific roles. All other protected routes are open to any authenticated role. */
export const ROUTE_ROLE_ACCESS: Record<string, UserRole[]> = {
  "/leads": ["coordinator", "admin"],
  "/patients": ["coordinator", "admin", "doctor", "nurse"],
  "/schedule": ["coordinator", "admin", "doctor", "nurse"],
  "/staff": ["coordinator", "admin"],
};

export function getAllowedRolesForPath(pathname: string): UserRole[] | null {
  if (pathname in ROUTE_ROLE_ACCESS) {
    return ROUTE_ROLE_ACCESS[pathname];
  }

  if (pathname.startsWith("/patients/")) {
    return ROUTE_ROLE_ACCESS["/patients"];
  }

  return null;
}

export function isRoleAllowedForPath(role: UserRole, pathname: string): boolean {
  const allowed = getAllowedRolesForPath(pathname);
  if (!allowed) return true;
  return allowed.includes(role);
}
