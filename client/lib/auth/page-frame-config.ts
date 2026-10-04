import { Add01Icon, CalendarAdd01Icon } from "@hugeicons/core-free-icons";
import type { IconSvgElement } from "@hugeicons/react";
import type { UserRole } from "@/lib/auth/roles";

export type PageFrameConfig = {
  searchPlaceholder: string;
  searchAriaLabel: string;
  enableSpotlight: boolean;
  primaryAction: {
    label: string;
    icon: IconSvgElement;
    action: "bookVisit" | "addPatient";
  };
};

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

const PAGE_FRAME_CONFIGS: Record<UserRole, PageFrameConfig> = {
  patient: DEFAULT_FRAME,
  caregiver: DEFAULT_FRAME,
  nurse: DEFAULT_FRAME,
  doctor: DEFAULT_FRAME,
  coordinator: COORDINATOR_FRAME,
  admin: COORDINATOR_FRAME,
};

export function getPageFrameConfig(role: UserRole): PageFrameConfig {
  return PAGE_FRAME_CONFIGS[role] ?? DEFAULT_FRAME;
}
