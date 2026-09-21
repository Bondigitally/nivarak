import type { Lead } from "@/lib/domain";

export function getLeads(): Lead[] {
  return [
    {
      id: "l1",
      name: "Arjun Mehta",
      age: 72,
      referralSource: "Dr. K. Subramanian",
      status: "assessing",
      dateReceived: "Sep 1, 2026",
      notes: "Post-surgery follow-up care needed",
      initials: "AM",
    },
    {
      id: "l2",
      name: "Kamala Rajan",
      age: 80,
      referralSource: "Family referral",
      status: "contacted",
      dateReceived: "Sep 2, 2026",
      notes: "Needs daily care support",
      initials: "KR",
    },
    {
      id: "l3",
      name: "Thomas George",
      age: 68,
      referralSource: "Apollo Hospital discharge",
      status: "new",
      dateReceived: "Sep 3, 2026",
      notes: "Recovering from hip fracture",
      initials: "TG",
    },
    {
      id: "l4",
      name: "Radha Krishnamurthy",
      age: 75,
      referralSource: "NGO partner",
      status: "enrolled",
      dateReceived: "Aug 28, 2026",
      notes: "Full eldercare package",
      initials: "RK",
    },
    {
      id: "l5",
      name: "Samuel D'Souza",
      age: 77,
      referralSource: "Online inquiry",
      status: "new",
      dateReceived: "Sep 3, 2026",
      notes: "Wants palliative care assessment",
      initials: "SD",
    },
  ];
}

/** New leads awaiting first contact — sidebar badge count. */
export function getNewLeadsCount(leads: Lead[] = getLeads()): number {
  return leads.filter((lead) => lead.status === "new").length;
}
