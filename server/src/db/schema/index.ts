/**
 * Drizzle schema barrel — tables live in domain files; relations stay here
 * so every table is defined before any relation is declared.
 */

export { users, roles, userRoles } from './users.js';
export { patients, caregiverLinks } from './patients.js';
export {
  encounters,
  encounterMedical,
  encounterMobility,
  encounterSocial,
  encounterNutritional,
  encounterCognitive,
} from './encounters.js';
export { vitals } from './vitals.js';
export { agingScores } from './scoring.js';
export { tasks } from './tasks.js';
export { alerts, alertRules } from './alerts.js';
export { documents } from './documents.js';
export { notifications } from './notifications.js';
export { auditLogs } from './audit.js';

import { relations } from 'drizzle-orm';
import { users, userRoles } from './users.js';
import { patients, caregiverLinks } from './patients.js';
import {
  encounters,
  encounterMedical,
  encounterMobility,
  encounterSocial,
  encounterNutritional,
  encounterCognitive,
} from './encounters.js';
import { vitals } from './vitals.js';
import { agingScores } from './scoring.js';
import { tasks } from './tasks.js';
import { alerts } from './alerts.js';
import { documents } from './documents.js';

export const usersRelations = relations(users, ({ many }) => ({
  userRoles: many(userRoles),
  caregiverLinks: many(caregiverLinks),
  encounters: many(encounters),
}));

export const patientsRelations = relations(patients, ({ one, many }) => ({
  createdByUser: one(users, { fields: [patients.createdBy], references: [users.id] }),
  caregiverLinks: many(caregiverLinks),
  encounters: many(encounters),
  vitals: many(vitals),
  agingScores: many(agingScores),
  tasks: many(tasks),
  alerts: many(alerts),
  documents: many(documents),
}));

export const encountersRelations = relations(encounters, ({ one, many }) => ({
  patient: one(patients, { fields: [encounters.patientId], references: [patients.id] }),
  clinician: one(users, { fields: [encounters.clinicianId], references: [users.id] }),
  medical: one(encounterMedical),
  mobility: one(encounterMobility),
  social: one(encounterSocial),
  nutritional: one(encounterNutritional),
  cognitive: one(encounterCognitive),
  vitals: many(vitals),
  agingScores: many(agingScores),
}));

export const encounterMedicalRelations = relations(encounterMedical, ({ one }) => ({
  encounter: one(encounters, { fields: [encounterMedical.encounterId], references: [encounters.id] }),
}));

export const encounterMobilityRelations = relations(encounterMobility, ({ one }) => ({
  encounter: one(encounters, { fields: [encounterMobility.encounterId], references: [encounters.id] }),
}));

export const encounterSocialRelations = relations(encounterSocial, ({ one }) => ({
  encounter: one(encounters, { fields: [encounterSocial.encounterId], references: [encounters.id] }),
}));

export const encounterNutritionalRelations = relations(encounterNutritional, ({ one }) => ({
  encounter: one(encounters, { fields: [encounterNutritional.encounterId], references: [encounters.id] }),
}));

export const encounterCognitiveRelations = relations(encounterCognitive, ({ one }) => ({
  encounter: one(encounters, { fields: [encounterCognitive.encounterId], references: [encounters.id] }),
}));

export const vitalsRelations = relations(vitals, ({ one }) => ({
  patient: one(patients, { fields: [vitals.patientId], references: [patients.id] }),
  encounter: one(encounters, { fields: [vitals.encounterId], references: [encounters.id] }),
  recordedByUser: one(users, { fields: [vitals.recordedBy], references: [users.id] }),
}));

export const tasksRelations = relations(tasks, ({ one }) => ({
  patient: one(patients, { fields: [tasks.patientId], references: [patients.id] }),
  assignedToUser: one(users, { fields: [tasks.assignedTo], references: [users.id] }),
  createdByUser: one(users, { fields: [tasks.createdBy], references: [users.id] }),
  sourceEncounter: one(encounters, { fields: [tasks.sourceEncounterId], references: [encounters.id] }),
}));

export const alertsRelations = relations(alerts, ({ one }) => ({
  patient: one(patients, { fields: [alerts.patientId], references: [patients.id] }),
}));

export const documentsRelations = relations(documents, ({ one }) => ({
  patient: one(patients, { fields: [documents.patientId], references: [patients.id] }),
  encounter: one(encounters, { fields: [documents.encounterId], references: [encounters.id] }),
  uploadedByUser: one(users, { fields: [documents.uploadedBy], references: [users.id] }),
}));
