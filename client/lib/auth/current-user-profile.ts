import type { UserRole } from "@/lib/auth/roles";

/**
 * Signed-in user chrome for sidebar + clinician-scoped forms.
 * Mock profiles until Cognito attributes are wired end-to-end.
 */
export type CurrentUserProfile = {
  displayName: string;
  email: string;
  initials: string;
  /** Clinical title used on CGA / notes (doctors & nurses). */
  designation?: string;
};

const PROFILES: Record<UserRole, CurrentUserProfile> = {
  doctor: {
    displayName: "Dr. Mehta",
    email: "dr.mehta@nivarak.clinic",
    initials: "DM",
    designation: "Geriatrician",
  },
  nurse: {
    displayName: "Nurse K. Lin",
    email: "k.lin@nivarak.clinic",
    initials: "KL",
    designation: "Home Nurse",
  },
  coordinator: {
    displayName: "Priya Shah",
    email: "p.shah@nivarak.clinic",
    initials: "PS",
  },
  admin: {
    displayName: "Admin",
    email: "admin@nivarak.clinic",
    initials: "AD",
  },
  patient: {
    displayName: "Alex",
    email: "alex@example.com",
    initials: "A",
  },
  caregiver: {
    displayName: "Alex",
    email: "alex@example.com",
    initials: "A",
  },
};

export function getCurrentUserProfile(role: UserRole): CurrentUserProfile {
  return PROFILES[role] ?? PROFILES.patient;
}
