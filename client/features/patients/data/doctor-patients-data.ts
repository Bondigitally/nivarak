import { loadStoredDoctorNotes } from "@/features/clinical-notes/data/clinical-notes-store";
import type {
  DoctorAssessmentRow,
  DoctorCarePlanRow,
  DoctorNoteRow,
  DoctorPatientRow,
  DoctorVitalMonitorRow,
} from "@/lib/domain/doctor";
import type { RiskLevel } from "@/lib/domain";

const AVATAR_QS = "w=400&h=400&fit=crop&crop=faces&auto=format&q=90";

export function getDoctorPatients(): DoctorPatientRow[] {
  return [
    {
      id: "pt-eleanor",
      name: "Eleanor Vance",
      code: "NVK-0004921",
      age: 78,
      gender: "F",
      riskLevel: "low",
      lastVisit: "Oct 24, 2023",
      carePlanStatus: "Active",
      assignedNurse: "Nurse K. Lin",
      initials: "EV",
      avatarUrl: `https://images.unsplash.com/photo-1581579438747-1dc8d17bbce4?${AVATAR_QS}`,
    },
    {
      id: "pt-arthur",
      name: "Arthur Pendelton",
      code: "NVK-0003382",
      age: 82,
      gender: "M",
      riskLevel: "high",
      lastVisit: "Oct 26, 2023",
      carePlanStatus: "Draft",
      assignedNurse: "Nurse K. Lin",
      initials: "AP",
      avatarUrl: `https://images.unsplash.com/photo-1566616213894-2d4e1baee5d8?${AVATAR_QS}`,
    },
    {
      id: "pt-margaret",
      name: "Margaret Sterling",
      code: "NVK-0008810",
      age: 74,
      gender: "F",
      riskLevel: "high",
      lastVisit: "Oct 21, 2023",
      carePlanStatus: "Active",
      assignedNurse: "Anita Roy",
      initials: "MS",
      avatarUrl: `https://images.unsplash.com/photo-1551836022-d5d88e9218df?${AVATAR_QS}`,
    },
    {
      id: "pt-thomas",
      name: "Thomas Reed",
      code: "NVK-0001045",
      age: 69,
      gender: "M",
      riskLevel: "low",
      lastVisit: "Oct 28, 2023",
      carePlanStatus: "Pending Review",
      assignedNurse: "Raj Pillai",
      initials: "TR",
      avatarUrl: `https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?${AVATAR_QS}`,
    },
    {
      id: "pt-beatrice",
      name: "Beatrice Cole",
      code: "NVK-0007732",
      age: 81,
      gender: "F",
      riskLevel: "medium",
      lastVisit: "Oct 15, 2023",
      carePlanStatus: "Active",
      assignedNurse: "Nurse K. Lin",
      initials: "BC",
      avatarUrl: `https://images.unsplash.com/photo-1544005313-94ddf0286df2?${AVATAR_QS}`,
    },
    {
      id: "pt-martha",
      name: "Martha Sullivan",
      code: "NVK-0002201",
      age: 76,
      gender: "F",
      riskLevel: "medium",
      lastVisit: "Oct 27, 2023",
      carePlanStatus: "Pending Review",
      assignedNurse: "Anita Roy",
      initials: "MS",
      avatarUrl: `https://images.unsplash.com/photo-1438761681033-6461ffad8d80?${AVATAR_QS}`,
    },
    {
      id: "pt-janet",
      name: "Janet Park",
      code: "NVK-0005510",
      age: 71,
      gender: "F",
      riskLevel: "low",
      lastVisit: "Oct 20, 2023",
      carePlanStatus: "None",
      assignedNurse: "Raj Pillai",
      initials: "JP",
      avatarUrl: `https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?${AVATAR_QS}`,
    },
  ];
}

export function getDoctorPatientById(id: string): DoctorPatientRow | undefined {
  return getDoctorPatients().find((p) => p.id === id);
}

export function getDoctorAssessments(): DoctorAssessmentRow[] {
  return [
    {
      id: "cga-1",
      patientId: "pt-eleanor",
      patientName: "Eleanor Vance",
      patientCode: "NVK-0004921",
      type: "CGA",
      scoreLabel: "36 / 48",
      status: "Signed",
      riskLevel: "low",
      date: "Oct 24, 2023",
      clinician: "Dr. M. Aris",
    },
    {
      id: "iasp-1",
      patientId: "pt-arthur",
      patientName: "Arthur Pendelton",
      patientCode: "NVK-0003382",
      type: "IAS-P",
      scoreLabel: "12 / 20 sections",
      status: "Draft",
      date: "Oct 26, 2023",
      clinician: "Nurse K. Lin",
    },
    {
      id: "cga-2",
      patientId: "pt-margaret",
      patientName: "Margaret Sterling",
      patientCode: "NVK-0008810",
      type: "CGA",
      scoreLabel: "42 / 48",
      status: "Signed",
      riskLevel: "high",
      date: "Oct 21, 2023",
      clinician: "Dr. M. Aris",
    },
    {
      id: "cga-3",
      patientId: "pt-thomas",
      patientName: "Thomas Reed",
      patientCode: "NVK-0001045",
      type: "CGA",
      scoreLabel: "48 / 48",
      status: "Needs review",
      riskLevel: "low",
      date: "Oct 28, 2023",
      clinician: "Dr. S. Patel",
    },
    {
      id: "iasp-2",
      patientId: "pt-beatrice",
      patientName: "Beatrice Cole",
      patientCode: "NVK-0007732",
      type: "IAS-P",
      scoreLabel: "20 / 20 sections",
      status: "Signed",
      date: "Oct 15, 2023",
      clinician: "Nurse K. Lin",
    },
  ];
}

export function getDoctorAssessmentById(
  id: string,
): DoctorAssessmentRow | undefined {
  return getDoctorAssessments().find((a) => a.id === id);
}

export function getDoctorVitalsMonitor(): DoctorVitalMonitorRow[] {
  return [
    {
      id: "vm-1",
      patientId: "pt-arthur",
      patientName: "Arthur Pendelton",
      patientCode: "NVK-0003382",
      metric: "Heart Rate",
      value: "108 bpm",
      status: "Critical",
      recordedAt: "Today, 9:42 AM",
      trend: "up",
    },
    {
      id: "vm-2",
      patientId: "pt-margaret",
      patientName: "Margaret Sterling",
      patientCode: "NVK-0008810",
      metric: "Blood Pressure",
      value: "158/94",
      status: "Warning",
      recordedAt: "Today, 8:15 AM",
      trend: "up",
    },
    {
      id: "vm-3",
      patientId: "pt-eleanor",
      patientName: "Eleanor Vance",
      patientCode: "NVK-0004921",
      metric: "SpO₂",
      value: "97%",
      status: "Normal",
      recordedAt: "Yesterday, 6:00 PM",
      trend: "flat",
    },
    {
      id: "vm-4",
      patientId: "pt-thomas",
      patientName: "Thomas Reed",
      patientCode: "NVK-0001045",
      metric: "Weight",
      value: "72.4 kg",
      status: "Normal",
      recordedAt: "Oct 27, 2023",
      trend: "down",
    },
  ];
}

export function getDoctorCarePlans(): DoctorCarePlanRow[] {
  return [
    {
      id: "cp-1",
      patientId: "pt-eleanor",
      patientName: "Eleanor Vance",
      patientCode: "NVK-0004921",
      status: "Active",
      goalsCount: 4,
      lastUpdated: "Oct 24, 2023",
      owner: "Dr. M. Aris",
    },
    {
      id: "cp-2",
      patientId: "pt-arthur",
      patientName: "Arthur Pendelton",
      patientCode: "NVK-0003382",
      status: "Draft",
      goalsCount: 2,
      lastUpdated: "Oct 26, 2023",
      owner: "Dr. Mehta",
    },
    {
      id: "cp-3",
      patientId: "pt-thomas",
      patientName: "Thomas Reed",
      patientCode: "NVK-0001045",
      status: "Pending Review",
      goalsCount: 5,
      lastUpdated: "Oct 28, 2023",
      owner: "Dr. S. Patel",
    },
    {
      id: "cp-4",
      patientId: "pt-margaret",
      patientName: "Margaret Sterling",
      patientCode: "NVK-0008810",
      status: "Active",
      goalsCount: 3,
      lastUpdated: "Oct 21, 2023",
      owner: "Dr. M. Aris",
    },
  ];
}

const FIXTURE_DOCTOR_NOTES: DoctorNoteRow[] = [
  {
    id: "note-1",
    patientId: "pt-eleanor",
    patientName: "Eleanor Vance",
    patientCode: "NVK-0004921",
    type: "SOAP",
    title: "Follow-up after CGA",
    status: "Signed",
    date: "Oct 24, 2023",
    author: "Dr. Mehta",
  },
  {
    id: "note-2",
    patientId: "pt-arthur",
    patientName: "Arthur Pendelton",
    patientCode: "NVK-0003382",
    type: "Progress",
    title: "Cardiac observation",
    status: "Draft",
    date: "Oct 26, 2023",
    author: "Dr. Mehta",
  },
  {
    id: "note-3",
    patientId: "pt-martha",
    patientName: "Martha Sullivan",
    patientCode: "NVK-0002201",
    type: "Consult",
    title: "Post-op wound review",
    status: "Signed",
    date: "Oct 27, 2023",
    author: "Dr. Mehta",
  },
];

/** Fixture notes plus doctor-authored notes stored in localStorage. */
export function getDoctorNotes(): DoctorNoteRow[] {
  const stored = loadStoredDoctorNotes();
  const fixtureIds = new Set(FIXTURE_DOCTOR_NOTES.map((n) => n.id));
  const extras = stored.filter((n) => !fixtureIds.has(n.id));
  return [...extras, ...FIXTURE_DOCTOR_NOTES];
}

export function getDoctorNoteById(id: string): DoctorNoteRow | undefined {
  return getDoctorNotes().find((n) => n.id === id);
}

export function getDoctorNotesForPatient(patientId: string): DoctorNoteRow[] {
  return getDoctorNotes().filter((n) => n.patientId === patientId);
}

export function getDoctorAssessmentsForPatient(
  patientId: string,
): DoctorAssessmentRow[] {
  return getDoctorAssessments().filter((a) => a.patientId === patientId);
}

export function getDoctorCarePlanForPatient(
  patientId: string,
): DoctorCarePlanRow | undefined {
  return getDoctorCarePlans().find((c) => c.patientId === patientId);
}

export function riskToBadgeLevel(level: RiskLevel | "mid"): RiskLevel {
  if (level === "mid") return "medium";
  return level;
}
