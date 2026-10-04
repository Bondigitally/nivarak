import type { PriorityPatient } from "@/lib/domain";

export function getPriorityPatients(): PriorityPatient[] {
  return [
    {
      id: "p1",
      name: "Margaret Chen",
      age: 78,
      condition: "Hypertension, Diabetes",
      riskLevel: "critical",
      lastActivity: "Missed medication check-in",
      pendingTasks: 3,
      initials: "MC",
    },
    {
      id: "p2",
      name: "Robert Nair",
      age: 82,
      condition: "CHF, Arthritis",
      riskLevel: "high",
      lastActivity: "Abnormal vitals — 2h ago",
      pendingTasks: 2,
      initials: "RN",
    },
    {
      id: "p3",
      name: "Sunita Verma",
      age: 74,
      condition: "Dementia, Hypertension",
      riskLevel: "high",
      lastActivity: "Missed appointment",
      pendingTasks: 1,
      initials: "SV",
    },
    {
      id: "p4",
      name: "James Okonkwo",
      age: 69,
      condition: "COPD, Osteoporosis",
      riskLevel: "medium",
      lastActivity: "Care plan updated — 1d ago",
      pendingTasks: 2,
      initials: "JO",
    },
    {
      id: "p5",
      name: "Patricia Lim",
      age: 77,
      condition: "Stroke recovery",
      riskLevel: "medium",
      lastActivity: "Assessment due",
      pendingTasks: 1,
      initials: "PL",
    },
  ];
}
