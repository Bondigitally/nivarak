export type MedicalStaffMember = {
  id: string;
  name: string;
  role: string;
  email: string;
  phone: string;
  experienceYears: number;
  imageSrc: string;
};

export type FamilyCaregiver = {
  id: string;
  name: string;
  relationship: string;
  imageSrc: string;
};

export type CaregiverPermissionId =
  | "health-vitals"
  | "alerts"
  | "book-visits"
  | "approve-services";

export type CaregiverPermission = {
  id: CaregiverPermissionId;
  label: string;
  description: string;
  defaultEnabled: boolean;
};

export const CAREGIVER_RELATIONSHIPS = [
  "Daughter",
  "Son",
  "Spouse",
  "Sibling",
  "Parent",
  "Friend",
  "Other",
] as const;

export const CAREGIVER_PERMISSIONS: CaregiverPermission[] = [
  {
    id: "health-vitals",
    label: "Health & vitals",
    description: "Allow viewing of health metrics",
    defaultEnabled: true,
  },
  {
    id: "alerts",
    label: "Alerts",
    description: "Receive medical alerts",
    defaultEnabled: true,
  },
  {
    id: "book-visits",
    label: "Book visits",
    description: "Schedule appointments",
    defaultEnabled: true,
  },
  {
    id: "approve-services",
    label: "Approve services",
    description: "Authorize new care services",
    defaultEnabled: false,
  },
];

/** Sample payload matching the filled Figma Care Team screen (936:8425). */
export const MOCK_MEDICAL_STAFF: MedicalStaffMember[] = [
  {
    id: "ms-sarah",
    name: "Dr. Sarah Thorne",
    role: "Doctor",
    email: "s.thorne@clinic.com",
    phone: "(555) 123-4567",
    experienceYears: 18,
    imageSrc: "/images/care-team/dr-sarah-thorne.png",
  },
  {
    id: "ms-maria",
    name: "Maria Garcia",
    role: "Nurse",
    email: "m.garcia@clinic.com",
    phone: "(555) 234-5678",
    experienceYears: 7,
    imageSrc: "/images/care-team/maria-garcia.png",
  },
  {
    id: "ms-jason",
    name: "Jason Smith",
    role: "Coordinator",
    email: "j.smith@clinic.com",
    phone: "(555) 345-6789",
    experienceYears: 5,
    imageSrc: "/images/care-team/ashish-pawar.png",
  },
];

export const MOCK_FAMILY_CAREGIVERS: FamilyCaregiver[] = [
  {
    id: "fc-neha",
    name: "Neha Sharma",
    relationship: "Daughter",
    imageSrc: "/images/care-team/neha-sharma.png",
  },
];
