import { Add01Icon, CalendarAdd01Icon } from "@hugeicons/core-free-icons";
import type { IconSvgElement } from "@hugeicons/react";
import type { UserRole } from "@/lib/auth/roles";

/** Top-bar search and primary action configuration per role. */
export type PageFrameConfig = {
  searchPlaceholder: string;
  searchAriaLabel: string;
  /** When true, ⌘K opens the spotlight modal; coordinators use table search instead. */
  enableSpotlight: boolean;
  primaryAction: {
    label: string;
    icon: IconSvgElement;
    action: "bookVisit" | "addPatient";
  };
};

/**
 * Coordinator/admin frame: patient-centric search, no spotlight,
 * and "Add Patient" as the primary action (not booking).
 */
const COORDINATOR_FRAME: PageFrameConfig = {
  searchPlaceholder: "Search patients, tasks, alerts…",
  searchAriaLabel: "Search patients, tasks, alerts",
  enableSpotlight: false,
  primaryAction: {
    label: "Add Patient",
    icon: Add01Icon,
    action: "addPatient",
  },
};

/**
 * Default frame for all clinical and patient roles.
 * Spotlight is enabled; "Book Appointment" is the primary action.
 */
const DEFAULT_FRAME: PageFrameConfig = {
  searchPlaceholder: "Search patients, vitals, reports…",
  searchAriaLabel: "Search patients, vitals, reports",
  enableSpotlight: true,
  primaryAction: {
    label: "Book Appointment",
    icon: CalendarAdd01Icon,
    action: "bookVisit",
  },
};

/**
 * Clinical staff (nurse, doctor, caregiver) use the same patient-facing frame —
 * they interact on behalf of patients rather than managing the patient roster.
 * Coordinators and admins get the management-facing frame.
 */
const PAGE_FRAME_CONFIGS: Record<UserRole, PageFrameConfig> = {
  patient: DEFAULT_FRAME,
  caregiver: DEFAULT_FRAME,
  nurse: DEFAULT_FRAME,
  doctor: DEFAULT_FRAME,
  coordinator: COORDINATOR_FRAME,
  admin: COORDINATOR_FRAME,
};

/** Falls back to DEFAULT_FRAME for unrecognised roles. */
export function getPageFrameConfig(role: UserRole): PageFrameConfig {
  return PAGE_FRAME_CONFIGS[role] ?? DEFAULT_FRAME;
}
