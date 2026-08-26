import type { IconSvgElement } from "@hugeicons/react";
import {
  ActivityIcon,
  Image01Icon,
  FileEditIcon,
  MedicineSyrupIcon,
} from "@hugeicons/core-free-icons";

export type TabId = "all" | "recent" | "favorites" | "shared";
export type DocType = "lab" | "imaging" | "notes" | "medication";

export type DocumentRow = {
  id: string;
  name: string;
  date: string;
  size: string;
  type: DocType;
  favorite?: boolean;
  shared?: boolean;
  recent?: boolean;
};

export const TABS: { id: TabId; label: string }[] = [
  { id: "all", label: "All Files" },
  { id: "recent", label: "Recent" },
  { id: "favorites", label: "Favorites" },
  { id: "shared", label: "Shared" },
];

export const DOCUMENTS: DocumentRow[] = [
  {
    id: "d1",
    name: "Comprehensive Blood Panel",
    date: "Oct 24, 2023",
    size: "2.4 MB",
    type: "lab",
    recent: true,
    favorite: true,
  },
  {
    id: "d2",
    name: "MRI Scan - Lumbar Spine",
    date: "Oct 20, 2023",
    size: "18.7 MB",
    type: "imaging",
    recent: true,
    shared: true,
  },
  {
    id: "d3",
    name: "Cardiology Consultation Notes",
    date: "Oct 15, 2023",
    size: "1.1 MB",
    type: "notes",
    recent: true,
    favorite: true,
    shared: true,
  },
  {
    id: "d4",
    name: "Active Medication List",
    date: "Sep 28, 2023",
    size: "0.8 MB",
    type: "medication",
  },
];

export const CATEGORIES = [
  {
    label: "Lab Results",
    count: "24 files",
    updated: "Updated 2d ago",
    iconSrc: "/images/health-records/lab-results.png",
  },
  {
    label: "Prescriptions",
    count: "12 files",
    updated: "Updated 1w ago",
    iconSrc: "/images/health-records/prescriptions.png",
  },
  {
    label: "Imaging",
    count: "48 files",
    updated: "Updated 1m ago",
    iconSrc: "/images/health-records/imaging.png",
  },
  {
    label: "Other",
    count: "8 files",
    updated: "Updated 1m ago",
    iconSrc: "/images/health-records/other.png",
  },
];

export const DOC_ICON_MAP: Record<DocType, { icon: IconSvgElement; bg: string; color: string }> = {
  lab: { icon: ActivityIcon, bg: "bg-[#EFF6FF]", color: "#2563EB" },
  imaging: { icon: Image01Icon, bg: "bg-[#FFF7ED]", color: "#EA580C" },
  notes: { icon: FileEditIcon, bg: "bg-[#F5F3FF]", color: "#7C3AED" },
  medication: { icon: MedicineSyrupIcon, bg: "bg-[#F0FDF4]", color: "#16A34A" },
};
