import { queryClient } from './connection.js';
import { logger } from '../shared/logger.js';

/**
 * Seed default roles into the database.
 * Safe to run multiple times (upsert pattern).
 */
const defaultRoles = [
  {
    name: 'patient',
    description: 'Elderly individual receiving care',
    permissions: ['profile.view_own', 'vitals.view', 'visits.view', 'scores.view', 'documents.view', 'alerts.view_own'],
  },
  {
    name: 'caregiver',
    description: 'Remote or local family caregiver',
    permissions: [
      'profile.view_own', 'patients.view_linked', 'vitals.view', 'visits.view',
      'scores.view', 'documents.view', 'documents.upload', 'alerts.view',
      'tasks.complete_own',
    ],
  },
  {
    name: 'nurse',
    description: 'Field or clinic-based nurse / care staff',
    permissions: [
      'profile.view_own', 'patients.view', 'patients.edit', 'visits.create', 'visits.edit',
      'vitals.record', 'vitals.view', 'scores.submit', 'scores.view', 'tasks.create',
      'tasks.complete', 'documents.upload', 'documents.view', 'alerts.view',
    ],
  },
  {
    name: 'doctor',
    description: 'Consulting or treating physician',
    permissions: [
      'profile.view_own', 'patients.create', 'patients.view', 'patients.edit',
      'patients.link_caregiver', 'visits.create', 'visits.edit', 'visits.complete',
      'vitals.record', 'vitals.view', 'scores.submit', 'scores.view',
      'tasks.create', 'tasks.assign', 'tasks.complete', 'documents.upload',
      'documents.view', 'alerts.view', 'alert_rules.configure',
    ],
  },
  {
    name: 'coordinator',
    description: 'Organizational care manager / coordinator',
    permissions: [
      'profile.view_own', 'patients.create', 'patients.view', 'patients.edit',
      'patients.link_caregiver', 'vitals.view', 'scores.view', 'visits.view',
      'tasks.create', 'tasks.assign', 'tasks.complete', 'documents.upload',
      'documents.view', 'alerts.view', 'alert_rules.configure',
    ],
  },
  {
    name: 'admin',
    description: 'Platform admin / Nivarak ops',
    permissions: [
      'profile.view_own', 'patients.create', 'patients.view', 'patients.edit',
      'patients.link_caregiver', 'visits.view', 'vitals.view', 'scores.view',
      'tasks.create', 'tasks.assign', 'tasks.complete', 'documents.upload',
      'documents.view', 'alerts.view', 'alert_rules.configure',
      'users.manage', 'audit_logs.view', 'system.configure',
    ],
  },
];

export async function seedRoles(): Promise<void> {
  logger.info('Seeding roles...');

  for (const role of defaultRoles) {
    await queryClient`
      INSERT INTO roles (name, description, permissions)
      VALUES (${role.name}, ${role.description}, ${JSON.stringify(role.permissions)})
      ON CONFLICT (name) DO UPDATE SET
        description = ${role.description},
        permissions = ${JSON.stringify(role.permissions)}
    `;
  }

  logger.info(`✓ ${defaultRoles.length} roles seeded`);
}
