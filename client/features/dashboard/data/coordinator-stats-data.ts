import type { CoordinatorStats } from "@/lib/domain";

export function getCoordinatorStats(): CoordinatorStats {
  return {
    activePatients: 24,
    patientsDelta: 2,
    tasksDueToday: 7,
    tasksOverdue: 3,
    appointmentsToday: 5,
    nextAppointmentTime: "10:00 AM",
    unreadAlerts: 2,
    criticalAlerts: 1,
  };
}
