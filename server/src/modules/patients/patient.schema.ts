import { z } from 'zod';

export const createPatientSchema = z.object({
  fullName: z.string().min(2).max(255),
  dateOfBirth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be YYYY-MM-DD format'),
  gender: z.enum(['male', 'female', 'other']),
  bloodGroup: z.string().max(10).optional(),
  primaryLanguage: z.string().max(10).default('en'),
  mrn: z.string().min(1).max(50).optional(), // Auto-generated if not provided
  address: z.object({
    line1: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    pin: z.string().optional(),
    coordinates: z.object({ lat: z.number(), lng: z.number() }).optional(),
  }).optional(),
  medicalHistory: z.object({
    conditions: z.array(z.string()).optional(),
    allergies: z.array(z.string()).optional(),
    medications: z.array(z.string()).optional(),
  }).optional(),
  emergencyContact: z.object({
    name: z.string().optional(),
    phone: z.string().optional(),
    relationship: z.string().optional(),
  }).optional(),
});

export const updatePatientSchema = createPatientSchema.partial();

export const linkCaregiverSchema = z.object({
  userId: z.string().uuid('Must be a valid user ID'),
  relationship: z.string().min(1).max(50),
  accessScope: z.array(z.string()).default([]),
  consentDocumented: z.boolean().default(false),
});

export const patientQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  search: z.string().optional(),
  carePathway: z.string().optional(),
  isActive: z.coerce.boolean().optional(),
});
