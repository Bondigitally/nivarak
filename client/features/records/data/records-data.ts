import type { IconSvgElement } from "@hugeicons/react";
import {
  ActivityIcon,
  Image01Icon,
  FileEditIcon,
  MedicineSyrupIcon,
} from "@hugeicons/core-free-icons";

export type DocType = "lab" | "imaging" | "notes" | "medication";
export type CategoryId = "all" | DocType;

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

export type DocumentCategory = {
  id: CategoryId;
  label: string;
  updated: string;
  iconSrc: string;
};

const DOC_SEEDS: Omit<DocumentRow, "id">[] = [
  {
    name: "Comprehensive Blood Panel",
    date: "Oct 24, 2023",
    size: "2.4 MB",
    type: "lab",
    recent: true,
    favorite: true,
  },
  {
    name: "MRI Scan - Lumbar Spine",
    date: "Oct 20, 2023",
    size: "18.7 MB",
    type: "imaging",
    recent: true,
    shared: true,
  },
  {
    name: "Cardiology Consultation Notes",
    date: "Oct 15, 2023",
    size: "1.1 MB",
    type: "notes",
    recent: true,
    favorite: true,
    shared: true,
  },
  {
    name: "Active Medication List",
    date: "Sep 28, 2023",
    size: "0.8 MB",
    type: "medication",
  },
  {
    name: "Lipid Profile",
    date: "Sep 12, 2023",
    size: "1.6 MB",
    type: "lab",
  },
  {
    name: "Chest X-Ray",
    date: "Aug 30, 2023",
    size: "9.2 MB",
    type: "imaging",
  },
  {
    name: "Discharge Summary",
    date: "Aug 18, 2023",
    size: "0.9 MB",
    type: "notes",
  },
  {
    name: "Insulin Prescription",
    date: "Aug 02, 2023",
    size: "0.4 MB",
    type: "medication",
  },
];

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
] as const;

function formatDocDate(date: Date) {
  const month = MONTHS[date.getMonth()]!;
  const day = String(date.getDate()).padStart(2, "0");
  return `${month} ${day}, ${date.getFullYear()}`;
}

function buildDocuments(total: number): DocumentRow[] {
  const now = Date.now();
  const dayMs = 24 * 60 * 60 * 1000;

  return Array.from({ length: total }, (_, index) => {
    const seed = DOC_SEEDS[index % DOC_SEEDS.length]!;
    // Spread across ~18 months so date-range filters have matching rows
    const daysAgo = Math.floor((index * 3.4) % 540);
    const date = new Date(now - daysAgo * dayMs);
    const sizeMb = ((index % 20) + 0.3).toFixed(1);

    return {
      ...seed,
      id: `d${index + 1}`,
      name: index < DOC_SEEDS.length ? seed.name : `${seed.name} #${index + 1}`,
      date: formatDocDate(date),
      size: `${sizeMb} MB`,
      recent: daysAgo <= 14,
      favorite: index % 7 === 0,
      shared: index % 5 === 0,
    };
  });
}

export const DOCUMENTS: DocumentRow[] = buildDocuments(157);

export const CATEGORIES: DocumentCategory[] = [
  {
    id: "all",
    label: "All Documents",
    updated: "Updated 2d ago",
    iconSrc: "/images/health-records/all-documents.png",
  },
  {
    id: "lab",
    label: "Lab Results",
    updated: "Updated 2d ago",
    iconSrc: "/images/health-records/lab-results.png",
  },
  {
    id: "medication",
    label: "Prescriptions",
    updated: "Updated 1w ago",
    iconSrc: "/images/health-records/prescriptions.png",
  },
  {
    id: "imaging",
    label: "Imaging",
    updated: "Updated 1m ago",
    iconSrc: "/images/health-records/imaging.png",
  },
  {
    id: "notes",
    label: "Other",
    updated: "Updated 1m ago",
    iconSrc: "/images/health-records/other.png",
  },
];

export function categoryDocumentCount(categoryId: CategoryId) {
  if (categoryId === "all") return DOCUMENTS.length;
  return DOCUMENTS.filter((doc) => doc.type === categoryId).length;
}

export const DOC_ICON_MAP: Record<
  DocType,
  { icon: IconSvgElement; bg: string; color: string }
> = {
  lab: { icon: ActivityIcon, bg: "bg-info-muted", color: "var(--info)" },
  imaging: {
    icon: Image01Icon,
    bg: "bg-warning-muted",
    color: "var(--chart-7)",
  },
  notes: { icon: FileEditIcon, bg: "bg-muted", color: "var(--primary)" },
  medication: {
    icon: MedicineSyrupIcon,
    bg: "bg-success-muted",
    color: "var(--success)",
  },
};
