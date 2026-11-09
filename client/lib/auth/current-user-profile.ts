import type { UserRole } from "@/lib/auth/roles";

/**
 * Signed-in user chrome for sidebar + clinician-scoped forms.
 * Mock profiles until Cognito attributes are wired end-to-end.
 */
export type CurrentUserProfile = {
  displayName: string;
  email: string;
  initials: string;
  /** Profile photo URL — replace with Cognito / API when wired. */
  avatarUrl: string;
  /** Clinical title used on CGA / notes (doctors & nurses). */
  designation?: string;
};

const PROFILES: Record<UserRole, CurrentUserProfile> = {
  doctor: {
    displayName: "Dr. Mehta",
    email: "dr.mehta@nivarak.clinic",
    initials: "DM",
    avatarUrl:
      "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&h=400&fit=crop&crop=faces&auto=format&q=90",
    designation: "Geriatrician",
  },
  nurse: {
    displayName: "Nurse K. Lin",
    email: "k.lin@nivarak.clinic",
    initials: "KL",
    avatarUrl:
      "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&h=400&fit=crop&crop=faces&auto=format&q=90",
    designation: "Home Nurse",
  },
  coordinator: {
    displayName: "Priya Shah",
    email: "p.shah@nivarak.clinic",
    initials: "PS",
    avatarUrl:
      "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=400&fit=crop&crop=faces&auto=format&q=90",
  },
  admin: {
    displayName: "Admin",
    email: "admin@nivarak.clinic",
    initials: "AD",
    avatarUrl:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=faces&auto=format&q=90",
  },
  patient: {
    displayName: "Alex",
    email: "alex@example.com",
    initials: "A",
    avatarUrl:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=faces&auto=format&q=90",
  },
  caregiver: {
    displayName: "Alex",
    email: "alex@example.com",
    initials: "A",
    avatarUrl:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=faces&auto=format&q=90",
  },
};

export function getCurrentUserProfile(role: UserRole): CurrentUserProfile {
  return PROFILES[role] ?? PROFILES.patient;
}
