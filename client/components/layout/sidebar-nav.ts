import {
  Home12Icon,
  Audit01Icon,
  CheckListIcon,
  HeartPulseIcon,
  Plant01Icon,
  Medicine02Icon,
  Calendar03Icon,
  Archive02Icon,
  UserGroupIcon,
  BellIcon,
  Settings01Icon,
  Target02Icon,
  UserMultiple02Icon,
} from "@hugeicons/core-free-icons";
import type { IconSvgElement } from "@hugeicons/react";
import type { UserRole } from "@/lib/auth/roles";

export type NavItem = {
  label: string;
  icon: IconSvgElement;
  href: string;
};

export type NavSection = {
  label: string;
  items: NavItem[];
};

export type SidebarNavConfig = {
  homeHref: string;
  sections: NavSection[];
};

export const PATIENT_NAV: SidebarNavConfig = {
  homeHref: "/dashboard",
  sections: [
    {
      label: "OVERVIEW",
      items: [
        { label: "Home", icon: Home12Icon, href: "/dashboard" },
        { label: "Vitals", icon: HeartPulseIcon, href: "/health/vitals" },
        { label: "Assessments", icon: Audit01Icon, href: "/health/assessments" },
        { label: "Tasks", icon: CheckListIcon, href: "/care/tasks" },
      ],
    },
    {
      label: "CARE MANAGEMENT",
      items: [
        { label: "Care Plan", icon: Plant01Icon, href: "/care/plan" },
        { label: "Appointments", icon: Calendar03Icon, href: "/care/appointments" },
        { label: "Medications", icon: Medicine02Icon, href: "/care/medications" },
        { label: "Health Records", icon: Archive02Icon, href: "/health/records" },
      ],
    },
    {
      label: "MONITORING",
      items: [
        { label: "Care Team", icon: UserGroupIcon, href: "/care-team" },
        { label: "Notifications", icon: BellIcon, href: "/alerts" },
      ],
    },
    {
      label: "MORE",
      items: [{ label: "Settings", icon: Settings01Icon, href: "/settings" }],
    },
  ],
};

export const COORDINATOR_NAV: SidebarNavConfig = {
  homeHref: "/dashboard",
  sections: [
    {
      label: "OVERVIEW",
      items: [
        { label: "Home", icon: Home12Icon, href: "/dashboard" },
        { label: "Leads", icon: Target02Icon, href: "/leads" },
        { label: "Patients", icon: UserGroupIcon, href: "/patients" },
      ],
    },
    {
      label: "CARE MANAGEMENT",
      items: [
        { label: "Schedule", icon: Calendar03Icon, href: "/schedule" },
        { label: "Tasks", icon: CheckListIcon, href: "/care/tasks" },
        { label: "Staff", icon: UserMultiple02Icon, href: "/staff" },
      ],
    },
    {
      label: "MONITORING",
      items: [{ label: "Alerts", icon: BellIcon, href: "/alerts" }],
    },
    {
      label: "MORE",
      items: [{ label: "Settings", icon: Settings01Icon, href: "/settings" }],
    },
  ],
};

const NAV_CONFIGS: Record<UserRole, SidebarNavConfig> = {
  patient: PATIENT_NAV,
  caregiver: PATIENT_NAV,
  nurse: PATIENT_NAV,
  doctor: PATIENT_NAV,
  coordinator: COORDINATOR_NAV,
  admin: COORDINATOR_NAV,
};

export function getSidebarNavForRole(role: UserRole): SidebarNavConfig {
  return NAV_CONFIGS[role] ?? PATIENT_NAV;
}
