import { z } from 'zod';

export const recordVitalSchema = z.object({
  parameterType: z.string().min(1),
  value: z.number(),
  unit: z.string().min(1),
  recordedAt: z.string().datetime(),
  encounterId: z.string().uuid().optional(),
  source: z.enum(['manual', 'device', 'imported']).default('manual'),
  notes: z.string().optional(),
});

export type RecordVitalInput = z.infer<typeof recordVitalSchema>;

export const VITAL_BOUNDS: Record<string, { min: number; max: number; unit: string }> = {
  bp_systolic: { min: 50, max: 300, unit: 'mmHg' },
  bp_diastolic: { min: 20, max: 200, unit: 'mmHg' },
  hr: { min: 20, max: 300, unit: 'bpm' },
  spo2: { min: 0, max: 100, unit: '%' },
  temp: { min: 30, max: 45, unit: '°C' },
  weight: { min: 10, max: 300, unit: 'kg' },
  blood_glucose: { min: 20, max: 600, unit: 'mg/dL' },
  respiratory_rate: { min: 5, max: 60, unit: 'breaths/min' },
};

export const REFERENCE_RANGES: Record<string, { min: number; max: number }> = {
  bp_systolic: { min: 90, max: 140 },
  bp_diastolic: { min: 60, max: 90 },
  hr: { min: 60, max: 100 },
  spo2: { min: 95, max: 100 },
  temp: { min: 36.1, max: 37.2 },
  blood_glucose: { min: 70, max: 140 },
  respiratory_rate: { min: 12, max: 20 },
};
