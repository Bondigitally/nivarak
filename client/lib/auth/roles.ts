import type { Portal } from '@/types/auth';

export type UserRole =
  | 'patient'
  | 'caregiver'
  | 'nurse'
  | 'doctor'
  | 'coordinator'
  | 'admin';

const ROLE_PORTAL: Record<UserRole, Portal> = {
  patient: 'consumer',
  caregiver: 'consumer',
  nurse: 'care-team',
  doctor: 'care-team',
  coordinator: 'care-team',
  admin: 'admin',
};

const ROLE_HOME_PATH: Record<UserRole, string> = {
  patient: '/dashboard',
  caregiver: '/dashboard',
  nurse: '/dashboard',
  doctor: '/dashboard',
  coordinator: '/dashboard',
  admin: '/dashboard',
};

const PORTAL_ORIGINS: Record<Portal, string> = {
  consumer: process.env.NEXT_PUBLIC_CONSUMER_URL ?? 'http://localhost:3000',
  'care-team': process.env.NEXT_PUBLIC_CARE_URL ?? 'http://care.localhost:3000',
  admin: process.env.NEXT_PUBLIC_ADMIN_URL ?? 'http://admin.localhost:3000',
};

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

export function getPortalForRole(role: UserRole): Portal {
  return ROLE_PORTAL[role];
}

export function getHomeUrlForRole(role: UserRole): string {
  const origin = PORTAL_ORIGINS[ROLE_PORTAL[role]];
  const path = ROLE_HOME_PATH[role];
  return `${origin.replace(/\/$/, '')}${path}`;
}

export function getHomeUrlForRoles(roles: string[]): string {
  const primary = getPrimaryRole(roles);
  if (!primary) return PORTAL_ORIGINS.consumer;
  return getHomeUrlForRole(primary);
}

export function isRoleAllowedOnPortal(role: UserRole, portal: Portal): boolean {
  return ROLE_PORTAL[role] === portal;
}
