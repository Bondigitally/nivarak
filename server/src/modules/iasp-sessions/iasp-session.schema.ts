import { z } from 'zod';

const aboutYouSchema = z.object({
  relationship: z.string().nullable(),
  age: z.string(),
  location: z.string().nullable(),
  visitFrequency: z.string().nullable(),
  livingSituation: z.string().nullable(),
  livingSituationOther: z.string(),
});

const flowStepSchema = z.enum([
  'intro',
  'about',
  'questions',
  'redFlags',
  'review',
  'results',
]);

export const patchIaspSessionSchema = z.object({
  aboutYou: aboutYouSchema.optional(),
  answers: z.record(z.string()).optional(),
  redFlags: z.array(z.string()).optional(),
  flowStep: flowStepSchema.optional(),
  pageIndex: z.number().int().min(0).optional(),
  privacyConsentAt: z.string().datetime().optional(),
});

export const completeIaspSessionSchema = z.object({
  aboutYou: aboutYouSchema,
  answers: z.record(z.string()),
  redFlags: z.array(z.string()),
  rawScore: z.number().int().min(0),
  maxScore: z.number().int().positive(),
  iasPercentage: z.number().min(0).max(100),
  privacyConsentAt: z.string().datetime().optional(),
});

export type PatchIaspSessionInput = z.infer<typeof patchIaspSessionSchema>;
export type CompleteIaspSessionInput = z.infer<typeof completeIaspSessionSchema>;
