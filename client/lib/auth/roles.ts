export type UserRole =
  | 'patient'
  | 'caregiver'
  | 'nurse'
  | 'doctor'
  | 'coordinator'
  | 'admin';

const HOME_PATH = '/dashboard';

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
export function getHomeUrlForRoles(_roles: string[]): string {
  return HOME_PATH;
}
