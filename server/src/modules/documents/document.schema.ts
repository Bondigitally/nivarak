import { z } from 'zod';

export const ALLOWED_MIMES = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'] as const;

export const createDocumentSchema = z.object({
  title: z.string().min(1).max(255),
  category: z.enum(['lab', 'imaging', 'prescription', 'discharge', 'other']),
  reportDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  storagePath: z.string().min(1),
  fileSizeBytes: z.number().int().positive().max(50 * 1024 * 1024),
  mimeType: z.string().refine((v) => (ALLOWED_MIMES as readonly string[]).includes(v), 'Unsupported file type'),
  encounterId: z.string().uuid().optional(),
});

export type CreateDocumentInput = z.infer<typeof createDocumentSchema>;
