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

export const createIaspSessionSchema = z.object({
  idempotencyKey: z.string().uuid(),
  accessToken: z.string().min(32).max(128),
  supersedeSessionId: z.string().uuid().optional(),
});

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
  /** Accepted for older clients and ignored: the server scores the answers itself. */
  rawScore: z.number().optional(),
  maxScore: z.number().optional(),
  iasPercentage: z.number().optional(),
  privacyConsentAt: z.string().datetime().optional(),
});

export type CreateIaspSessionInput = z.infer<typeof createIaspSessionSchema> & {
  supersedeAccessToken?: string;
};
export type PatchIaspSessionInput = z.infer<typeof patchIaspSessionSchema>;
export type CompleteIaspSessionInput = z.infer<typeof completeIaspSessionSchema>;
