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

const UserRoleContext = createContext<UserRoleContextValue>({
  role: "patient",
  roles: [],
  isLoading: true,
});

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

    return () => {
      active = false;
    };
  }, []);

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
