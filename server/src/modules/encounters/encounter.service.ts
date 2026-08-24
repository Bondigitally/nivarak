import { eq, and, desc, count } from 'drizzle-orm';
import { db, queryClient } from '../../db/connection.js';
import {
  encounters,
  encounterMedical,
  encounterMobility,
  encounterSocial,
  encounterNutritional,
  encounterCognitive,
} from '../../db/schema/index.js';
import { eventBus } from '../../shared/event-bus.js';
import { logger } from '../../shared/logger.js';
import { NotFoundError, BusinessRuleError } from '../../shared/errors.js';
import type { CreateEncounterInput } from './encounter.schema.js';

class EncounterService {
  async createEncounter(
    patientId: string,
    data: CreateEncounterInput,
    clinicianId: string,
    clinicianRole: string
  ) {
    const [encounter] = await db.insert(encounters).values({
      patientId,
      encounterDate: new Date(data.encounterDate),
      encounterType: data.encounterType,
      clinicianId,
      clinicianRole: data.clinicianRole || clinicianRole,
      primaryReason: data.primaryReason,
      primaryReasonNotes: data.primaryReasonNotes,
      overallClinicalImpression: data.overallClinicalImpression,
      nextVisitDate: data.nextVisitDate,
      nextVisitFrequency: data.nextVisitFrequency,
      status: 'draft',
    }).returning();

    await Promise.all([
      db.insert(encounterMedical).values({ encounterId: encounter.id, ...data.medical }),
      db.insert(encounterMobility).values({ encounterId: encounter.id, ...data.mobility }),
      db.insert(encounterSocial).values({ encounterId: encounter.id, ...data.social }),
      db.insert(encounterNutritional).values({
        encounterId: encounter.id,
        ...data.nutritional,
        weightValue: data.nutritional.weightValue?.toString(),
      }),
      db.insert(encounterCognitive).values({
        encounterId: encounter.id,
        ...data.cognitive,
        formalScreenScore: data.cognitive.formalScreenScore?.toString(),
      }),
    ]);

    await this.computeCrossFlags(encounter.id, data);

    logger.info({ encounterId: encounter.id, patientId }, 'Encounter created (draft)');
    return encounter;
  }

  async getEncounter(patientId: string, encounterId: string) {
    const [encounter] = await db.select().from(encounters)
      .where(and(eq(encounters.id, encounterId), eq(encounters.patientId, patientId)))
      .limit(1);
    if (!encounter) throw new NotFoundError('Encounter', encounterId);

    const [medicalRows, mobilityRows, socialRows, nutritionalRows, cognitiveRows] = await Promise.all([
      db.select().from(encounterMedical).where(eq(encounterMedical.encounterId, encounterId)),
      db.select().from(encounterMobility).where(eq(encounterMobility.encounterId, encounterId)),
      db.select().from(encounterSocial).where(eq(encounterSocial.encounterId, encounterId)),
      db.select().from(encounterNutritional).where(eq(encounterNutritional.encounterId, encounterId)),
      db.select().from(encounterCognitive).where(eq(encounterCognitive.encounterId, encounterId)),
    ]);

    return {
      ...encounter,
      medical: medicalRows[0],
      mobility: mobilityRows[0],
      social: socialRows[0],
      nutritional: nutritionalRows[0],
      cognitive: cognitiveRows[0],
    };
  }

  async listEncounters(patientId: string, page: number, limit: number) {
    const offset = (page - 1) * limit;
    const [totalResult] = await db.select({ count: count() }).from(encounters)
      .where(eq(encounters.patientId, patientId));
    const data = await db.select().from(encounters)
      .where(eq(encounters.patientId, patientId))
      .orderBy(desc(encounters.encounterDate))
      .limit(limit).offset(offset);
    return { data, total: totalResult.count };
  }

  async completeEncounter(patientId: string, encounterId: string, completedBy: string) {
    const encounter = await this.getEncounter(patientId, encounterId);
    if (encounter.status !== 'draft') {
      throw new BusinessRuleError('Encounter is already completed or amended');
    }
    const [completed] = await db.update(encounters).set({
      status: 'completed',
      completedAt: new Date(),
      completedBy,
      updatedAt: new Date(),
    }).where(eq(encounters.id, encounterId)).returning();

    eventBus.emit('encounter.completed', { encounterId, patientId, completedBy });
    logger.info({ encounterId, patientId }, 'Encounter completed and locked');
    return completed;
  }

  async amendEncounter(
    patientId: string,
    originalId: string,
    data: CreateEncounterInput,
    clinicianId: string,
    clinicianRole: string,
    amendmentReason: string
  ) {
    const original = await this.getEncounter(patientId, originalId);
    if (original.status !== 'completed') {
      throw new BusinessRuleError('Only completed encounters can be amended');
    }
    await db.update(encounters).set({ status: 'amended', updatedAt: new Date() })
      .where(eq(encounters.id, originalId));

    const [amended] = await db.insert(encounters).values({
      patientId,
      encounterDate: new Date(data.encounterDate),
      encounterType: data.encounterType,
      clinicianId,
      clinicianRole: data.clinicianRole || clinicianRole,
      primaryReason: data.primaryReason,
      primaryReasonNotes: data.primaryReasonNotes,
      overallClinicalImpression: data.overallClinicalImpression,
      nextVisitDate: data.nextVisitDate,
      nextVisitFrequency: data.nextVisitFrequency,
      status: 'completed',
      version: (original.version || 1) + 1,
      amendmentOf: originalId,
      amendmentReason,
      completedAt: new Date(),
      completedBy: clinicianId,
    }).returning();

    await Promise.all([
      db.insert(encounterMedical).values({ encounterId: amended.id, ...data.medical }),
      db.insert(encounterMobility).values({ encounterId: amended.id, ...data.mobility }),
      db.insert(encounterSocial).values({ encounterId: amended.id, ...data.social }),
      db.insert(encounterNutritional).values({
        encounterId: amended.id,
        ...data.nutritional,
        weightValue: data.nutritional.weightValue?.toString(),
      }),
      db.insert(encounterCognitive).values({
        encounterId: amended.id,
        ...data.cognitive,
        formalScreenScore: data.cognitive.formalScreenScore?.toString(),
      }),
    ]);

    await this.computeCrossFlags(amended.id, data);

    eventBus.emit('encounter.amended', { encounterId: amended.id, originalId, patientId });
    logger.info({ encounterId: amended.id, originalId, patientId }, 'Encounter amended');
    return amended;
  }

  private async computeCrossFlags(encounterId: string, data: CreateEncounterInput) {
    const cogDecline = ['possible_decline', 'clear_decline'].includes(data.cognitive.cognitiveStatus);
    const nutDecline = data.nutritional.nutritionalStatus === 'concern_noted';
    const medNonAdherence = data.medical.medicationAdherence &&
      ['partial', 'not_taking'].includes(data.medical.medicationAdherence);

    const updates: Promise<unknown>[] = [];
    if (cogDecline && nutDecline) {
      updates.push(queryClient`UPDATE encounter_nutritional SET cross_flag_cognitive_nutritional = true WHERE encounter_id = ${encounterId}`);
      updates.push(queryClient`UPDATE encounter_cognitive SET cross_flag_cognitive_nutritional = true WHERE encounter_id = ${encounterId}`);
    }
    if (cogDecline && medNonAdherence) {
      updates.push(queryClient`UPDATE encounter_cognitive SET cross_flag_cognitive_medicines = true WHERE encounter_id = ${encounterId}`);
    }
    if (updates.length) await Promise.all(updates);
  }
}

export const encounterService = new EncounterService();
