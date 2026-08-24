import { queryClient } from './connection.js';
import { logger } from '../shared/logger.js';
import { ROLE_PERMISSIONS } from '../shared/permissions.js';

const ROLE_DESCRIPTIONS: Record<string, string> = {
  patient: 'Elderly individual receiving care',
  caregiver: 'Remote or local family caregiver',
  nurse: 'Field or clinic-based nurse / care staff',
  doctor: 'Consulting or treating physician',
  coordinator: 'Organizational care manager / coordinator',
  admin: 'Platform admin / Nivarak ops',
};

export async function seedRoles(): Promise<void> {
  logger.info('Seeding roles...');

  for (const [name, permissions] of Object.entries(ROLE_PERMISSIONS)) {
    const description = ROLE_DESCRIPTIONS[name] ?? name;
    await queryClient`
      INSERT INTO roles (name, description, permissions)
      VALUES (${name}, ${description}, ${JSON.stringify(permissions)})
      ON CONFLICT (name) DO UPDATE SET
        description = ${description},
        permissions = ${JSON.stringify(permissions)}
    `;
  }

  logger.info(`✓ ${Object.keys(ROLE_PERMISSIONS).length} roles seeded`);
}
