"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { getCognitoAuthRoles } from "@/lib/auth/cognito-session";
import { getPrimaryRole, type UserRole } from "@/lib/auth/roles";

type UserRoleContextValue = {
  role: UserRole;
  roles: string[];
  isLoading: boolean;
};

/**
 * Default context while the role is still being resolved from Cognito.
 * `isLoading: true` lets consumers show skeletons before the role is known.
 * `role: "patient"` is the safest default — shows the least-privileged UI.
 */
const UserRoleContext = createContext<UserRoleContextValue>({
  role: "patient",
  roles: [],
  isLoading: true,
});

/**
 * Reads NEXT_PUBLIC_DEV_USER_ROLE to override the Cognito role during local development.
 * Takes precedence over the actual JWT so any role can be tested without a real account.
 * Set to empty/unset in production builds.
 */
function resolveDevRole(): UserRole | null {
  const devRole = process.env.NEXT_PUBLIC_DEV_USER_ROLE;
  if (
    devRole === "patient" ||
    devRole === "caregiver" ||
    devRole === "nurse" ||
    devRole === "doctor" ||
    devRole === "coordinator" ||
    devRole === "admin"
  ) {
    return devRole;
  }
  return null;
}

/**
 * Returns the user's roles from either the dev override or the live Cognito session.
 * Dev override is checked first so role switching in dev doesn't require sign-in.
 */
async function readAuthRoles(): Promise<string[]> {
  const devRole = resolveDevRole();
  if (devRole) return [devRole];

  return getCognitoAuthRoles();
}

export function UserRoleProvider({ children }: { children: ReactNode }) {
  const [roles, setRoles] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;

    void readAuthRoles().then((nextRoles) => {
      if (!active) return;
      setRoles(nextRoles);
      setIsLoading(false);
    });

    // Prevent stale setState if the component unmounts before the async resolves.
    return () => {
      active = false;
    };
  }, []);

  // Unauthenticated or unrecognised users fall back to the patient UX.
  const role = getPrimaryRole(roles) ?? "patient";

  return (
    <UserRoleContext.Provider value={{ role, roles, isLoading }}>
      {children}
    </UserRoleContext.Provider>
  );
}

export function useUserRole() {
  return useContext(UserRoleContext);
}
