import type { ComponentType } from "react";
import type { UserRole } from "@/lib/auth/roles";

/**
 * Resolves a role-specific view component from a partial map.
 * Falls back to `defaultView` when no entry exists for the role.
 */
export function resolveViewForRole<TProps extends object>(
  role: UserRole,
  viewMap: Partial<Record<UserRole, ComponentType<TProps>>>,
  defaultView: ComponentType<TProps>,
): ComponentType<TProps> {
  return viewMap[role] ?? defaultView;
}
