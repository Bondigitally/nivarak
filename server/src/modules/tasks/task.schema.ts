import { z } from 'zod';

export const createTaskSchema = z.object({
  patientId: z.string().uuid(),
  title: z.string().min(1).max(255),
  description: z.string().optional(),
  category: z.enum(['medication', 'follow_up', 'lab', 'visit', 'equipment', 'other']),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
  assignedTo: z.string().uuid().optional(),
  assignedRole: z.string().optional(),
  dueAt: z.string().datetime().optional(),
  sourceEncounterId: z.string().uuid().optional(),
  sourceAlertId: z.string().uuid().optional(),
});

export const completeTaskSchema = z.object({
  completionNote: z.string().optional(),
});

export const taskQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  patientId: z.string().uuid().optional(),
  assignee: z.string().optional(),
  status: z.string().optional(),
  priority: z.string().optional(),
  category: z.string().optional(),
});

export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type TaskQuery = z.infer<typeof taskQuerySchema>;
