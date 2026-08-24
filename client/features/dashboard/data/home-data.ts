/**
 * Home dashboard data shape + mocks.
 *
 * Flip `USE_MOCK_FILLED` to `true` to preview the populated UI.
 * Replace `getHomeDashboardData()` with an API mapper later — keep this type.
 */
const USE_MOCK_FILLED = true;

export type IasAssessment = {
  overline: string;
  title: string;
  statusLabel: string;
  deltaLabel: string | null;
  description: string;
  lastUpdated: string;
  nextDue: string;
  score: number;
  maxScore: number;
};

export type VitalPoint = {
  label: string;
  value: number;
};

export type BloodPressureSeries = {
  label: string;
  systolic: number;
  diastolic: number;
  unit: string;
  updatedAgo: string;
  statusLabel: string;
  systolicSeries: VitalPoint[];
  diastolicSeries: VitalPoint[];
};

export type HeartRateSeries = {
  label: string;
  bpm: number;
  unit: string;
  series: VitalPoint[];
};

export type VitalsSnapshot = {
  bloodPressure: BloodPressureSeries;
  heartRate: HeartRateSeries;
};

export type HomeTask = {
  id: string;
  label: string;
  completed: boolean;
};

export type RiskAxis = {
  id: string;
  label: string;
  scorePct: number;
  risk: "Low" | "Moderate" | "High";
};

export type RiskStatus = {
  axes: RiskAxis[];
  highlightedAxisId: string;
};

export type HomeAppointment = {
  id: string;
  month: string;
  day: string;
  title: string;
  time: string;
  clinician: string;
};

export type CareTeamMember = {
  id: string;
  name: string;
  role: string;
  available: boolean;
  initials: string;
};

export type ActivityItem = {
  id: string;
  title: string;
  timestamp: string;
};

export type CarePlanAction = {
  id: string;
  action: string;
  owner: string;
  timeframe: string;
  status: "On Track" | "At Risk" | "Done";
};

export type CarePlanReferral = {
  id: string;
  label: string;
  status: "Scheduled" | "Pending";
  icon: "walking" | "nutrition";
};

export type CarePlanSnapshot = {
  actions: CarePlanAction[];
  referrals: CarePlanReferral[];
  callTriggers: string[];
};

export type HomeDashboardData = {
  greetingName: string;
  greetingSubtitle: string;
  notificationCount: number;
  assessment: IasAssessment | null;
  vitals: VitalsSnapshot | null;
  tasks: HomeTask[] | null;
  risk: RiskStatus | null;
  appointments: HomeAppointment[] | null;
  careTeam: CareTeamMember[] | null;
  activity: ActivityItem[] | null;
  carePlan: CarePlanSnapshot | null;
};

const EMPTY_HOME_DASHBOARD: HomeDashboardData = {
  greetingName: "Alex",
  greetingSubtitle: "Here's your care overview for today",
  notificationCount: 3,
  assessment: null,
  vitals: null,
  tasks: null,
  risk: null,
  appointments: null,
  careTeam: null,
  activity: null,
  carePlan: null,
};

/** Sample payload matching the filled Figma Home screen. */
const MOCK_HOME_DASHBOARD_FILLED: HomeDashboardData = {
  greetingName: "Alex",
  greetingSubtitle: "Here's your care overview for today",
  notificationCount: 3,
  assessment: {
    overline: "Latest assessment",
    title: "Your Independent Ageing Score:",
    statusLabel: "Independent",
    deltaLabel: "+3 pts since last assessment",
    description:
      "Your overall health score based on recent physical, cognitive, and nutritional assessments indicates a strong level of independence.",
    lastUpdated: "Last updated: Oct 24, 2023",
    nextDue: "Next due Jul 15, 2026",
    score: 38,
    maxScore: 48,
  },
  vitals: {
    bloodPressure: {
      label: "Blood Pressure",
      systolic: 120,
      diastolic: 80,
      unit: "mmHg",
      updatedAgo: "Updated 7 days ago",
      statusLabel: "Normal",
      systolicSeries: [
        { label: "Sun", value: 116 },
        { label: "Mon", value: 118 },
        { label: "Tue", value: 122 },
        { label: "Wed", value: 119 },
        { label: "Thu", value: 128 },
        { label: "Fri", value: 120 },
        { label: "Sat", value: 121 },
      ],
      diastolicSeries: [
        { label: "Sun", value: 74 },
        { label: "Mon", value: 76 },
        { label: "Tue", value: 82 },
        { label: "Wed", value: 78 },
        { label: "Thu", value: 84 },
        { label: "Fri", value: 80 },
        { label: "Sat", value: 79 },
      ],
    },
    heartRate: {
      label: "Heart Rate",
      bpm: 72,
      unit: "bpm",
      series: [
        { label: "Sun", value: 68 },
        { label: "Mon", value: 74 },
        { label: "Tue", value: 70 },
        { label: "Wed", value: 76 },
        { label: "Thu", value: 72 },
        { label: "Fri", value: 71 },
        { label: "Sat", value: 73 },
      ],
    },
  },
  tasks: [
    { id: "t1", label: "Take Morning Medication", completed: true },
    { id: "t2", label: "Morning Walk (15 mins)", completed: true },
    { id: "t3", label: "Drink 2L Water", completed: false },
    { id: "t4", label: "Cognitive Exercise (Sudoku)", completed: false },
    { id: "t5", label: "Take Night Medications", completed: false },
    { id: "t6", label: "Evening Walk (15 mins)", completed: false },
  ],
  risk: {
    highlightedAxisId: "mobility",
    axes: [
      { id: "self-care", label: "Self-Care", scorePct: 82, risk: "Low" },
      { id: "daily-life", label: "Daily Life", scorePct: 74, risk: "Low" },
      { id: "mobility", label: "Mobility", scorePct: 45, risk: "High" },
      { id: "thinking", label: "Thinking", scorePct: 70, risk: "Moderate" },
      { id: "nutrition", label: "Nutrition", scorePct: 78, risk: "Low" },
      { id: "social", label: "Social", scorePct: 66, risk: "Moderate" },
      { id: "safety", label: "Safety", scorePct: 80, risk: "Low" },
    ],
  },
  appointments: [
    {
      id: "ap1",
      month: "Jul",
      day: "15",
      title: "Home Visit",
      time: "10:00 AM - 11:30 AM",
      clinician: "Dr. Aris Mehta",
    },
    {
      id: "ap2",
      month: "Jul",
      day: "22",
      title: "Teleconsult",
      time: "02:30 PM - 03:00 PM",
      clinician: "Sarah Jenkins (Nurse)",
    },
  ],
  careTeam: [
    {
      id: "c1",
      name: "Dr. Sharma",
      role: "Primary physician",
      available: true,
      initials: "DS",
    },
    {
      id: "c2",
      name: "Priya",
      role: "Care Coordinator",
      available: true,
      initials: "P",
    },
    {
      id: "c3",
      name: "Anjali",
      role: "Home nurse",
      available: true,
      initials: "A",
    },
  ],
  activity: [
    {
      id: "act1",
      title: "Latest Visit",
      timestamp: "Apr 15, 2026 · 10:30 AM",
    },
    {
      id: "act2",
      title: "Assessment completed",
      timestamp: "Jan 12, 2026 · 02:15 PM",
    },
    {
      id: "act3",
      title: "Report uploaded",
      timestamp: "Mar 10, 2026 · 09:00 AM",
    },
    {
      id: "act4",
      title: "Care reminder",
      timestamp: "Feb 28, 2026 · 08:45 AM",
    },
  ],
  carePlan: {
    actions: [
      {
        id: "ca1",
        action: "30 min light walking",
        owner: "You",
        timeframe: "Daily",
        status: "On Track",
      },
      {
        id: "ca2",
        action: "Blood pressure check",
        owner: "Nurse",
        timeframe: "Weekly",
        status: "On Track",
      },
    ],
    referrals: [
      {
        id: "cr1",
        label: "Physical Therapy",
        status: "Scheduled",
        icon: "walking",
      },
      {
        id: "cr2",
        label: "Nutritionist",
        status: "Pending",
        icon: "nutrition",
      },
    ],
    callTriggers: [
      "Fever above 101°F",
      "Shortness of breath at rest",
      "Sudden weight gain (>2 lbs/day)",
    ],
  },
};

export function getHomeDashboardData(): HomeDashboardData {
  return USE_MOCK_FILLED ? MOCK_HOME_DASHBOARD_FILLED : EMPTY_HOME_DASHBOARD;
}
