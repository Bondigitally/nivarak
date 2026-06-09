/**
 * DashboardModule — Role-specific dashboard queries
 */

import { Hono } from 'hono';
import { queryClient } from '../../db/connection.js';
import { authMiddleware, requireRoles } from '../../middleware/auth.js';
import { successResponse } from '../../shared/response.js';

// ─── Routes ─────────────────────────────────────────────
export const dashboardRoutes = new Hono();
dashboardRoutes.use('*', authMiddleware);

// GET /dashboard/coordinator
dashboardRoutes.get('/coordinator', requireRoles('coordinator', 'admin'), async (c) => {
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

  return c.json(successResponse({
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
  }));
});

// GET /dashboard/doctor
dashboardRoutes.get('/doctor', requireRoles('doctor', 'admin'), async (c) => {
  const user = c.get('user');

  const [stats] = await queryClient`
    SELECT
      (SELECT COUNT(DISTINCT patient_id) FROM caregiver_links WHERE user_id = ${user.userId} AND revoked_at IS NULL) as my_patients,
      (SELECT COUNT(*) FROM visits WHERE created_by = ${user.userId} AND created_at >= NOW() - INTERVAL '7 days') as recent_visits,
      (SELECT COUNT(*) FROM tasks WHERE (assigned_to = ${user.userId} OR created_by = ${user.userId}) AND status NOT IN ('completed', 'cancelled')) as pending_tasks,
      (SELECT COUNT(*) FROM visits WHERE created_by = ${user.userId} AND status = 'draft') as draft_visits
  `;

  // Recent patients with risk bands
  const recentPatients = await queryClient`
    SELECT p.id, p.full_name, p.current_care_pathway,
      (SELECT risk_band FROM aging_scores WHERE patient_id = p.id ORDER BY assessed_at DESC LIMIT 1) as risk_band,
      (SELECT total_score FROM aging_scores WHERE patient_id = p.id ORDER BY assessed_at DESC LIMIT 1) as latest_score
    FROM patients p
    JOIN caregiver_links cl ON cl.patient_id = p.id
    WHERE cl.user_id = ${user.userId} AND cl.revoked_at IS NULL AND p.is_active = true
    ORDER BY p.updated_at DESC
    LIMIT 10
  `;

  return c.json(successResponse({
    myPatients: Number(stats.my_patients),
    recentVisits: Number(stats.recent_visits),
    pendingTasks: Number(stats.pending_tasks),
    draftVisits: Number(stats.draft_visits),
    recentPatients,
  }));
});

// GET /dashboard/caregiver
dashboardRoutes.get('/caregiver', requireRoles('caregiver'), async (c) => {
  const user = c.get('user');

  const linkedPatients = await queryClient`
    SELECT p.id, p.full_name, p.current_care_pathway,
      (SELECT risk_band FROM aging_scores WHERE patient_id = p.id ORDER BY assessed_at DESC LIMIT 1) as risk_band,
      (SELECT COUNT(*) FROM alerts WHERE patient_id = p.id AND status = 'open') as open_alerts,
      (SELECT COUNT(*) FROM tasks WHERE patient_id = p.id AND status NOT IN ('completed', 'cancelled')) as open_tasks
    FROM patients p
    JOIN caregiver_links cl ON cl.patient_id = p.id
    WHERE cl.user_id = ${user.userId} AND cl.revoked_at IS NULL AND p.is_active = true
  `;

  return c.json(successResponse({ patients: linkedPatients }));
});

// GET /dashboard/admin
dashboardRoutes.get('/admin', requireRoles('admin'), async (c) => {
  const [stats] = await queryClient`
    SELECT
      (SELECT COUNT(*) FROM users WHERE is_active = true) as total_users,
      (SELECT COUNT(*) FROM users WHERE last_login_at >= NOW() - INTERVAL '24 hours') as active_today,
      (SELECT COUNT(*) FROM patients WHERE is_active = true) as total_patients,
      (SELECT COUNT(*) FROM visits WHERE created_at >= NOW() - INTERVAL '7 days') as visits_this_week,
      (SELECT COUNT(*) FROM tasks WHERE created_at >= NOW() - INTERVAL '7 days') as tasks_this_week,
      (SELECT COUNT(*) FROM alerts WHERE triggered_at >= NOW() - INTERVAL '24 hours') as alerts_today,
      (SELECT COUNT(*) FROM audit_logs WHERE occurred_at >= NOW() - INTERVAL '24 hours') as audit_entries_today,
      (SELECT COUNT(*) FROM documents) as total_documents
  `;

  return c.json(successResponse({
    totalUsers: Number(stats.total_users),
    activeToday: Number(stats.active_today),
    totalPatients: Number(stats.total_patients),
    visitsThisWeek: Number(stats.visits_this_week),
    tasksThisWeek: Number(stats.tasks_this_week),
    alertsToday: Number(stats.alerts_today),
    auditEntriesToday: Number(stats.audit_entries_today),
    totalDocuments: Number(stats.total_documents),
  }));
});
