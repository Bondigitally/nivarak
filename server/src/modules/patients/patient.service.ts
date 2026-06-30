/**
 * PatientModule — Service Layer
 *
 * Patient CRUD, caregiver linking, consent management.
 */

import { eq, and, like, sql, isNull, desc, count } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';
import { db, queryClient } from '../../db/connection.js';
import { patients, caregiverLinks, users } from '../../db/schema/index.js';
import { eventBus } from '../../shared/event-bus.js';
import { logger } from '../../shared/logger.js';
import { NotFoundError, ConflictError, AuthorizationError } from '../../shared/errors.js';
import type { AuthUser } from '../../middleware/auth.js';

export class PatientService {
  /**
   * Create a new patient record.
   */
  async createPatient(
    data: {
      fullName: string;
      dateOfBirth: string;
      gender: string;
      bloodGroup?: string;
      primaryLanguage?: string;
      mrn?: string;
      address?: any;
      medicalHistory?: any;
      emergencyContact?: any;
    },
    createdBy: string
  ) {
    const mrn = data.mrn || `NVK-${Date.now().toString(36).toUpperCase()}`;

    // Check MRN uniqueness
    const existing = await db.select().from(patients).where(eq(patients.mrn, mrn)).limit(1);
    if (existing.length > 0) {
      throw new ConflictError(`Patient with MRN ${mrn} already exists`);
    }

    const [patient] = await db
      .insert(patients)
      .values({
        fullName: data.fullName,
        dateOfBirth: data.dateOfBirth,
        gender: data.gender,
        bloodGroup: data.bloodGroup,
        primaryLanguage: data.primaryLanguage || 'en',
        mrn,
        address: data.address,
        medicalHistory: data.medicalHistory,
        emergencyContact: data.emergencyContact,
        createdBy,
      })
      .returning();

    eventBus.emit('patient.created', { patientId: patient.id, createdBy });
    logger.info({ patientId: patient.id, mrn }, 'Patient created');

    return patient;
  }

  /**
   * Get a patient by ID — with ABAC check.
   */
  async getPatient(patientId: string, authUser: AuthUser) {
    const [patient] = await db
      .select()
      .from(patients)
      .where(eq(patients.id, patientId))
      .limit(1);

    if (!patient) throw new NotFoundError('Patient', patientId);

    // ABAC: caregivers/patients can only see linked patients
    if (
      (authUser.roles.includes('caregiver') || authUser.roles.includes('patient')) &&
      !authUser.linkedPatientIds.includes(patientId)
    ) {
      throw new AuthorizationError('You do not have access to this patient');
    }

    return patient;
  }

  /**
   * List patients with pagination and filtering.
   */
  async listPatients(
    authUser: AuthUser,
    query: { page: number; limit: number; search?: string; carePathway?: string }
  ) {
    const offset = (query.page - 1) * query.limit;

    let conditions = [eq(patients.isActive, true)];

    // ABAC: caregivers/patients can only see linked patients
    if (authUser.roles.includes('caregiver') || authUser.roles.includes('patient')) {
      if (authUser.linkedPatientIds.length === 0) {
        return { data: [], total: 0 };
      }
      conditions.push(
        sql`${patients.id} = ANY(${authUser.linkedPatientIds})`
      );
    }

    if (query.carePathway) {
      conditions.push(eq(patients.currentCarePathway, query.carePathway));
    }

    if (query.search) {
      conditions.push(
        sql`${patients.fullName} ILIKE ${'%' + query.search + '%'}`
      );
    }

    const whereClause = and(...conditions);

    const [totalResult] = await db
      .select({ count: count() })
      .from(patients)
      .where(whereClause);

    const data = await db
      .select()
      .from(patients)
      .where(whereClause)
      .orderBy(desc(patients.createdAt))
      .limit(query.limit)
      .offset(offset);

    return { data, total: totalResult.count };
  }

  /**
   * Update a patient profile.
   */
  async updatePatient(patientId: string, data: Record<string, any>, updatedBy: string) {
    const existing = await db.select().from(patients).where(eq(patients.id, patientId)).limit(1);
    if (existing.length === 0) throw new NotFoundError('Patient', patientId);

    const [updated] = await db
      .update(patients)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(patients.id, patientId))
      .returning();

    logger.info({ patientId, updatedBy }, 'Patient updated');
    return updated;
  }

  /**
   * Link a caregiver to a patient (consent record).
   */
  async linkCaregiver(
    patientId: string,
    data: {
      userId: string;
      relationship: string;
      accessScope: string[];
      consentDocumented: boolean;
    },
    grantedBy: string
  ) {
    // Verify patient exists
    const patientExists = await db.select().from(patients).where(eq(patients.id, patientId)).limit(1);
    if (patientExists.length === 0) throw new NotFoundError('Patient', patientId);

    // Verify user exists
    const userExists = await db.select().from(users).where(eq(users.id, data.userId)).limit(1);
    if (userExists.length === 0) throw new NotFoundError('User', data.userId);

    // Check if already linked
    const existingLink = await db
      .select()
      .from(caregiverLinks)
      .where(
        and(
          eq(caregiverLinks.patientId, patientId),
          eq(caregiverLinks.userId, data.userId),
          isNull(caregiverLinks.revokedAt)
        )
      )
      .limit(1);

    if (existingLink.length > 0) {
      throw new ConflictError('Caregiver is already linked to this patient');
    }

    const [link] = await db
      .insert(caregiverLinks)
      .values({
        patientId,
        userId: data.userId,
        relationship: data.relationship,
        accessScope: data.accessScope,
        consentDocumented: data.consentDocumented,
        grantedBy,
      })
      .returning();

    eventBus.emit('caregiver.linked', { patientId, caregiverId: data.userId, grantedBy });
    logger.info({ patientId, caregiverId: data.userId }, 'Caregiver linked');

    return link;
  }

  /**
   * Unlink a caregiver (soft revoke).
   */
  async unlinkCaregiver(patientId: string, userId: string) {
    const result = await queryClient`
      UPDATE caregiver_links
      SET revoked_at = NOW()
      WHERE patient_id = ${patientId} AND user_id = ${userId} AND revoked_at IS NULL
      RETURNING id
    `;

    if (result.length === 0) {
      throw new NotFoundError('Active caregiver link');
    }

    logger.info({ patientId, userId }, 'Caregiver unlinked');
  }

  /**
   * List caregivers linked to a patient.
   */
  async listCaregivers(patientId: string) {
    const links = await db
      .select({
        linkId: caregiverLinks.id,
        userId: caregiverLinks.userId,
        relationship: caregiverLinks.relationship,
        accessScope: caregiverLinks.accessScope,
        grantedAt: caregiverLinks.grantedAt,
        consentDocumented: caregiverLinks.consentDocumented,
        userName: users.fullName,
        userPhone: users.phone,
      })
      .from(caregiverLinks)
      .innerJoin(users, eq(caregiverLinks.userId, users.id))
      .where(
        and(
          eq(caregiverLinks.patientId, patientId),
          isNull(caregiverLinks.revokedAt)
        )
      );

    return links;
  }

  /**
   * Get patient dashboard summary card.
   */
  async getPatientSummary(patientId: string, authUser: AuthUser) {
    const patient = await this.getPatient(patientId, authUser);

    // Count linked caregivers, recent visits, open tasks, open alerts
    const [stats] = await queryClient`
      SELECT
        (SELECT COUNT(*) FROM caregiver_links WHERE patient_id = ${patientId} AND revoked_at IS NULL) as caregiver_count,
        (SELECT COUNT(*) FROM visits WHERE patient_id = ${patientId} AND status = 'completed') as visit_count,
        (SELECT COUNT(*) FROM tasks WHERE patient_id = ${patientId} AND status NOT IN ('completed', 'cancelled')) as open_task_count,
        (SELECT COUNT(*) FROM alerts WHERE patient_id = ${patientId} AND status = 'open') as open_alert_count,
        (SELECT total_score FROM aging_scores WHERE patient_id = ${patientId} ORDER BY assessed_at DESC LIMIT 1) as latest_score,
        (SELECT risk_band FROM aging_scores WHERE patient_id = ${patientId} ORDER BY assessed_at DESC LIMIT 1) as latest_risk_band
    `;

    return {
      ...patient,
      summary: {
        caregiverCount: Number(stats.caregiver_count),
        visitCount: Number(stats.visit_count),
        openTaskCount: Number(stats.open_task_count),
        openAlertCount: Number(stats.open_alert_count),
        latestScore: stats.latest_score ? Number(stats.latest_score) : null,
        latestRiskBand: stats.latest_risk_band || null,
      },
    };
  }
}

export const patientService = new PatientService();
