/**
 * ABAC Middleware — Attribute-Based Access Control for Patient-Scoped Routes
 *
 * Enforces that caregivers and patients can only access data
 * for patients they are linked to via caregiver_links.
 * Admin, coordinator, doctor, and nurse roles have broad access.
 */

import type { Context, Next } from 'hono';
import { AuthorizationError } from '../shared/errors.js';
import { logger } from '../shared/logger.js';

// Roles that have broad access to all patients
const BROAD_ACCESS_ROLES = ['admin', 'coordinator', 'doctor', 'nurse'];

/**
 * Middleware factory that checks if the requesting user has access to the patient
 * identified by the route parameter.
 *
 * @param paramName - The route parameter name containing the patient ID (default: 'id')
 */
export function requirePatientAccess(paramName: string = 'id') {
  return async (c: Context, next: Next) => {
    const user = c.get('user');
    if (!user) {
      throw new AuthorizationError('User context not available');
    }

    const patientId = c.req.param(paramName);
    if (!patientId) {
      throw new AuthorizationError('Patient ID not found in request');
    }

    // Broad access roles can access any patient
    const userRoles: string[] = user.roles || [];
    const hasBroadAccess = userRoles.some((role: string) => BROAD_ACCESS_ROLES.includes(role));

    if (hasBroadAccess) {
      await next();
      return;
    }

    // For caregiver/patient roles, check if they have a link to this patient
    const linkedPatientIds: string[] = user.linkedPatientIds || [];
    if (!linkedPatientIds.includes(patientId)) {
      logger.warn({
        userId: user.userId,
        patientId,
        roles: userRoles,
      }, 'ABAC: Patient access denied — no caregiver link');
      throw new AuthorizationError('You do not have access to this patient');
    }

    await next();
  };
}
