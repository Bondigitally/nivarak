export type UserRole =
  | 'patient'
  | 'caregiver'
  | 'nurse'
  | 'doctor'
  | 'coordinator'
  | 'admin';

/**
 * All roles land on /dashboard; content is gated by JWT RBAC/ABAC server-side.
 * A single entry point avoids role-specific redirects that would expose UX
 * differences before the session is verified.
 */
const HOME_PATH = '/dashboard';

/**
 * Resolves a single effective role when a JWT contains multiple.
 * Priority order reflects increasing privilege — admin beats coordinator, which
 * beats clinical staff, which beats caregivers and patients.
 * Returns null only if no known role is present in the token.
 */
export function getPrimaryRole(roles: string[]): UserRole | null {
  const priority: UserRole[] = [
    'admin',
    'coordinator',
    'doctor',
    'nurse',
    'caregiver',
    'patient',
  ];

  for (const role of priority) {
    if (roles.includes(role)) return role;
  }

  return null;
}

/** Same-origin home after login; dashboard content is gated by JWT RBAC/ABAC. */
export function getHomeUrlForRoles(roles: string[]): string {
  void roles;
  return HOME_PATH;
}
