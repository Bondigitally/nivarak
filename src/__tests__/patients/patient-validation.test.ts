/**
 * Patient Validation Schema — Unit Tests
 */
import { describe, it, expect } from 'vitest';
import {
  createPatientSchema,
  updatePatientSchema,
  linkCaregiverSchema,
  patientQuerySchema,
} from '../../modules/patients/patient.schema.js';

describe('Patient Schemas', () => {
  describe('createPatientSchema', () => {
    it('accepts valid patient data', () => {
      const data = {
        fullName: 'Meena Devi',
        dateOfBirth: '1950-05-15',
        gender: 'female',
      };
      expect(createPatientSchema.safeParse(data).success).toBe(true);
    });

    it('accepts patient with all optional fields', () => {
      const data = {
        fullName: 'Ramesh Patel',
        dateOfBirth: '1948-11-20',
        gender: 'male',
        bloodGroup: 'O+',
        primaryLanguage: 'hi',
        mrn: 'MRN-001',
        address: {
          line1: '123 Gandhi Nagar',
          city: 'Pune',
          state: 'Maharashtra',
          pin: '411001',
          coordinates: { lat: 18.5204, lng: 73.8567 },
        },
        medicalHistory: {
          conditions: ['Diabetes Type 2', 'Hypertension'],
          allergies: ['Penicillin'],
          medications: ['Metformin 500mg'],
        },
        emergencyContact: {
          name: 'Suresh Patel',
          phone: '+919876543210',
          relationship: 'Son',
        },
      };
      expect(createPatientSchema.safeParse(data).success).toBe(true);
    });

    it('rejects invalid DOB format', () => {
      const data = { fullName: 'Test', dateOfBirth: '15/05/1950', gender: 'male' };
      expect(createPatientSchema.safeParse(data).success).toBe(false);
    });

    it('rejects invalid gender', () => {
      const data = { fullName: 'Test', dateOfBirth: '1950-05-15', gender: 'unknown' };
      expect(createPatientSchema.safeParse(data).success).toBe(false);
    });

    it('rejects short fullName (< 2 chars)', () => {
      const data = { fullName: 'M', dateOfBirth: '1950-05-15', gender: 'female' };
      expect(createPatientSchema.safeParse(data).success).toBe(false);
    });

    it('accepts all valid genders', () => {
      for (const gender of ['male', 'female', 'other']) {
        const data = { fullName: 'Test User', dateOfBirth: '1950-01-01', gender };
        expect(createPatientSchema.safeParse(data).success).toBe(true);
      }
    });

    it('rejects missing required fields', () => {
      expect(createPatientSchema.safeParse({}).success).toBe(false);
      expect(createPatientSchema.safeParse({ fullName: 'Test' }).success).toBe(false);
    });
  });

  describe('updatePatientSchema', () => {
    it('accepts partial updates', () => {
      expect(updatePatientSchema.safeParse({ fullName: 'Updated Name' }).success).toBe(true);
      expect(updatePatientSchema.safeParse({ bloodGroup: 'AB+' }).success).toBe(true);
    });

    it('accepts empty object (no updates)', () => {
      expect(updatePatientSchema.safeParse({}).success).toBe(true);
    });
  });

  describe('linkCaregiverSchema', () => {
    it('accepts valid caregiver link', () => {
      const data = {
        userId: '550e8400-e29b-41d4-a716-446655440000',
        relationship: 'Son',
      };
      expect(linkCaregiverSchema.safeParse(data).success).toBe(true);
    });

    it('rejects invalid UUID', () => {
      const data = { userId: 'not-a-uuid', relationship: 'Son' };
      expect(linkCaregiverSchema.safeParse(data).success).toBe(false);
    });

    it('rejects empty relationship', () => {
      const data = { userId: '550e8400-e29b-41d4-a716-446655440000', relationship: '' };
      expect(linkCaregiverSchema.safeParse(data).success).toBe(false);
    });

    it('accepts optional accessScope and consentDocumented', () => {
      const data = {
        userId: '550e8400-e29b-41d4-a716-446655440000',
        relationship: 'Daughter',
        accessScope: ['vitals', 'visits'],
        consentDocumented: true,
      };
      expect(linkCaregiverSchema.safeParse(data).success).toBe(true);
    });
  });

  describe('patientQuerySchema', () => {
    it('accepts empty query (uses defaults)', () => {
      const result = patientQuerySchema.safeParse({});
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.page).toBe(1);
        expect(result.data.limit).toBe(20);
      }
    });

    it('accepts valid pagination', () => {
      const result = patientQuerySchema.safeParse({ page: '3', limit: '50' });
      expect(result.success).toBe(true);
    });

    it('enforces max limit of 100', () => {
      const result = patientQuerySchema.safeParse({ limit: '101' });
      expect(result.success).toBe(false);
    });
  });
});
