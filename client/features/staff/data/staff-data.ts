import type { StaffMember } from "@/lib/domain";

export function getStaffMembers(): StaffMember[] {
  return [
    {
      id: "st1",
      name: "Dr. Priya Sharma",
      role: "Doctor",
      specialization: "Geriatrics",
      patientsAssigned: 12,
      availability: "available",
      initials: "PS",
      phone: "+91 98765 43210",
    },
    {
      id: "st2",
      name: "Nurse Anita Roy",
      role: "Nurse",
      specialization: "Elder Care",
      patientsAssigned: 8,
      availability: "busy",
      initials: "AR",
      phone: "+91 98765 43211",
    },
    {
      id: "st3",
      name: "Raj Pillai",
      role: "Physiotherapist",
      specialization: "Orthopedics",
      patientsAssigned: 6,
      availability: "available",
      initials: "RP",
      phone: "+91 98765 43212",
    },
    {
      id: "st4",
      name: "Meena Iyer",
      role: "Social Worker",
      specialization: "Family Support",
      patientsAssigned: 10,
      availability: "off-duty",
      initials: "MI",
      phone: "+91 98765 43213",
    },
    {
      id: "st5",
      name: "Dr. Suresh Babu",
      role: "Doctor",
      specialization: "Cardiology",
      patientsAssigned: 9,
      availability: "busy",
      initials: "SB",
      phone: "+91 98765 43214",
    },
  ];
}
