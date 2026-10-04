import type { Appointment } from "@/lib/domain";

export function getTodaySchedule(): Appointment[] {
  return [
    {
      id: "s1",
      time: "09:00 AM",
      endTime: "09:45 AM",
      patientName: "Margaret Chen",
      patientInitials: "MC",
      visitType: "Teleconsult",
      assignedTo: "Dr. Priya Sharma",
      status: "Completed",
    },
    {
      id: "s2",
      time: "10:00 AM",
      endTime: "10:30 AM",
      patientName: "Robert Nair",
      patientInitials: "RN",
      visitType: "Home Visit",
      assignedTo: "Nurse Anita Roy",
      status: "Scheduled",
    },
    {
      id: "s3",
      time: "11:30 AM",
      endTime: "12:00 PM",
      patientName: "Sunita Verma",
      patientInitials: "SV",
      visitType: "Teleconsult",
      assignedTo: "Dr. Priya Sharma",
      status: "Scheduled",
    },
    {
      id: "s4",
      time: "02:00 PM",
      endTime: "02:45 PM",
      patientName: "James Okonkwo",
      patientInitials: "JO",
      visitType: "Clinic",
      assignedTo: "Physiotherapist Raj",
      status: "Scheduled",
    },
    {
      id: "s5",
      time: "04:00 PM",
      endTime: "04:30 PM",
      patientName: "Patricia Lim",
      patientInitials: "PL",
      visitType: "Home Visit",
      assignedTo: "Nurse Anita Roy",
      status: "Scheduled",
    },
  ];
}
