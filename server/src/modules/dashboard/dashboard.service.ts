import { queryClient } from '../../db/connection.js';

export async function getCoordinatorDashboard() {
  const [stats] = await queryClient`
    SELECT
      (SELECT COUNT(*) FROM tasks WHERE status NOT IN ('completed', 'cancelled') AND due_at <= NOW() + INTERVAL '24 hours') as tasks_due_today,
      (SELECT COUNT(*) FROM alerts WHERE status = 'open') as open_alerts,
      (SELECT COUNT(*) FROM alerts WHERE status = 'open' AND severity = 'critical') as critical_alerts,
      (SELECT COUNT(*) FROM patients WHERE is_active = true) as total_patients,
      (SELECT COUNT(*) FROM patients WHERE current_care_pathway = 'home_care' AND is_active = true) as home_care_count,
      (SELECT COUNT(*) FROM patients WHERE current_care_pathway = 'hybrid' AND is_active = true) as hybrid_count,
      (SELECT COUNT(*) FROM patients WHERE current_care_pathway = 'clinic' AND is_active = true) as clinic_count,
      (SELECT COUNT(*) FROM patients WHERE current_care_pathway = 'high_dependency' AND is_active = true) as high_dependency_count,
      (SELECT COUNT(*) FROM tasks WHERE status = 'escalated') as escalated_tasks
  `;

  return {
    tasksDueToday: Number(stats.tasks_due_today),
    openAlerts: Number(stats.open_alerts),
    criticalAlerts: Number(stats.critical_alerts),
    totalPatients: Number(stats.total_patients),
    patientsByPathway: {
      home_care: Number(stats.home_care_count),
      hybrid: Number(stats.hybrid_count),
      clinic: Number(stats.clinic_count),
      high_dependency: Number(stats.high_dependency_count),
    },
    escalatedTasks: Number(stats.escalated_tasks),
  };
}

export async function getDoctorDashboard(userId: string) {
  const [stats, recentPatients] = await Promise.all([
    queryClient`
      SELECT
        (SELECT COUNT(DISTINCT patient_id) FROM caregiver_links WHERE user_id = ${userId} AND revoked_at IS NULL) as my_patients,
        (SELECT COUNT(*) FROM encounters WHERE clinician_id = ${userId} AND created_at >= NOW() - INTERVAL '7 days') as recent_encounters,
        (SELECT COUNT(*) FROM tasks WHERE (assigned_to = ${userId} OR created_by = ${userId}) AND status NOT IN ('completed', 'cancelled')) as pending_tasks,
        (SELECT COUNT(*) FROM encounters WHERE clinician_id = ${userId} AND status = 'draft') as draft_encounters
    `.then((rows) => rows[0]),
    queryClient`
      SELECT p.id, p.full_name, p.current_care_pathway,
        (SELECT risk_band FROM aging_scores WHERE patient_id = p.id ORDER BY assessed_at DESC LIMIT 1) as risk_band,
        (SELECT ias_percentage FROM aging_scores WHERE patient_id = p.id ORDER BY assessed_at DESC LIMIT 1) as latest_score
      FROM patients p
      JOIN caregiver_links cl ON cl.patient_id = p.id
      WHERE cl.user_id = ${userId} AND cl.revoked_at IS NULL AND p.is_active = true
      ORDER BY p.updated_at DESC
      LIMIT 10
    `,
  ]);

  return {
    myPatients: Number(stats.my_patients),
    recentEncounters: Number(stats.recent_encounters),
    pendingTasks: Number(stats.pending_tasks),
    draftEncounters: Number(stats.draft_encounters),
    recentPatients,
  };
}

export async function getCaregiverDashboard(userId: string) {
  const patients = await queryClient`
    SELECT p.id, p.full_name, p.current_care_pathway,
      (SELECT risk_band FROM aging_scores WHERE patient_id = p.id ORDER BY assessed_at DESC LIMIT 1) as risk_band,
      (SELECT COUNT(*) FROM alerts WHERE patient_id = p.id AND status = 'open') as open_alerts,
      (SELECT COUNT(*) FROM tasks WHERE patient_id = p.id AND status NOT IN ('completed', 'cancelled')) as open_tasks
    FROM patients p
    JOIN caregiver_links cl ON cl.patient_id = p.id
    WHERE cl.user_id = ${userId} AND cl.revoked_at IS NULL AND p.is_active = true
  `;

  return { patients };
}

export async function getAdminDashboard() {
  const [stats] = await queryClient`
    SELECT
      (SELECT COUNT(*) FROM users WHERE is_active = true) as total_users,
      (SELECT COUNT(*) FROM users WHERE last_login_at >= NOW() - INTERVAL '24 hours') as active_today,
      (SELECT COUNT(*) FROM patients WHERE is_active = true) as total_patients,
      (SELECT COUNT(*) FROM encounters WHERE created_at >= NOW() - INTERVAL '7 days') as encounters_this_week,
      (SELECT COUNT(*) FROM tasks WHERE created_at >= NOW() - INTERVAL '7 days') as tasks_this_week,
      (SELECT COUNT(*) FROM alerts WHERE triggered_at >= NOW() - INTERVAL '24 hours') as alerts_today,
      (SELECT COUNT(*) FROM audit_logs WHERE occurred_at >= NOW() - INTERVAL '24 hours') as audit_entries_today,
      (SELECT COUNT(*) FROM documents) as total_documents
  `;

  return {
    totalUsers: Number(stats.total_users),
    activeToday: Number(stats.active_today),
    totalPatients: Number(stats.total_patients),
    encountersThisWeek: Number(stats.encounters_this_week),
    tasksThisWeek: Number(stats.tasks_this_week),
    alertsToday: Number(stats.alerts_today),
    auditEntriesToday: Number(stats.audit_entries_today),
    totalDocuments: Number(stats.total_documents),
  };
}
