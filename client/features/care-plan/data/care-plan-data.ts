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

const MOCK_CARE_PLAN: CarePlanSnapshot = {
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
};

export function getCarePlanSnapshot(): CarePlanSnapshot | null {
  return MOCK_CARE_PLAN;
}
