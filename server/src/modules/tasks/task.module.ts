/**
 * TaskModule — Service + Routes
 * Task lifecycle, assignment, reminders, escalation, closure.
 */

import { Hono } from 'hono';
import { z } from 'zod';
import { eq, and, desc, count, sql, or } from 'drizzle-orm';
import { db, queryClient } from '../../db/connection.js';
import { tasks } from '../../db/schema/index.js';
import { eventBus } from '../../shared/event-bus.js';
import { logger } from '../../shared/logger.js';
import { NotFoundError, BusinessRuleError, ValidationError } from '../../shared/errors.js';
import { authMiddleware, requirePermission } from '../../middleware/auth.js';
import { successResponse, paginatedResponse } from '../../shared/response.js';

// ─── Schemas ────────────────────────────────────────────
const createTaskSchema = z.object({
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

const completeTaskSchema = z.object({
  completionNote: z.string().optional(),
});

const taskQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  patientId: z.string().uuid().optional(),
  assignee: z.string().optional(), // 'me' or UUID
  status: z.string().optional(),
  priority: z.string().optional(),
  category: z.string().optional(),
});

// ─── Service ────────────────────────────────────────────
class TaskService {
  async createTask(data: z.infer<typeof createTaskSchema>, createdBy: string) {
    const status = data.assignedTo ? 'assigned' : 'created';

    const [task] = await db.insert(tasks).values({
      patientId: data.patientId,
      title: data.title,
      description: data.description,
      category: data.category,
      priority: data.priority,
      status,
      assignedTo: data.assignedTo,
      assignedRole: data.assignedRole,
      dueAt: data.dueAt ? new Date(data.dueAt) : undefined,
      createdBy,
      sourceEncounterId: data.sourceEncounterId,
      sourceAlertId: data.sourceAlertId,
    }).returning();

    eventBus.emit('task.created', {
      taskId: task.id,
      patientId: data.patientId,
      assignedTo: data.assignedTo || null,
      createdBy,
    });

    logger.info({ taskId: task.id, patientId: data.patientId, category: data.category }, 'Task created');
    return task;
  }

  async getTask(taskId: string) {
    const [task] = await db.select().from(tasks).where(eq(tasks.id, taskId)).limit(1);
    if (!task) throw new NotFoundError('Task', taskId);
    return task;
  }

  async listTasks(userId: string, query: z.infer<typeof taskQuerySchema>) {
    const offset = (query.page - 1) * query.limit;
    let conditions: any[] = [];

    if (query.patientId) conditions.push(eq(tasks.patientId, query.patientId));
    if (query.status) conditions.push(eq(tasks.status, query.status));
    if (query.priority) conditions.push(eq(tasks.priority, query.priority));
    if (query.category) conditions.push(eq(tasks.category, query.category));

    if (query.assignee === 'me') {
      conditions.push(eq(tasks.assignedTo, userId));
    } else if (query.assignee) {
      conditions.push(eq(tasks.assignedTo, query.assignee));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const [totalResult] = await db.select({ count: count() }).from(tasks).where(whereClause);
    const data = await db.select().from(tasks).where(whereClause)
      .orderBy(desc(tasks.createdAt)).limit(query.limit).offset(offset);

    return { data, total: totalResult.count };
  }

  async assignTask(taskId: string, assignedTo: string) {
    const task = await this.getTask(taskId);
    if (task.status === 'completed' || task.status === 'cancelled') {
      throw new BusinessRuleError('Cannot assign a completed or cancelled task');
    }

    const [updated] = await db.update(tasks).set({
      assignedTo,
      status: 'assigned',
    }).where(eq(tasks.id, taskId)).returning();

    return updated;
  }

  async completeTask(taskId: string, completedBy: string, note?: string) {
    const task = await this.getTask(taskId);
    if (task.status === 'completed' || task.status === 'cancelled') {
      throw new BusinessRuleError('Task is already completed or cancelled');
    }

    const [completed] = await db.update(tasks).set({
      status: 'completed',
      completedAt: new Date(),
      completedBy,
      completionNote: note,
    }).where(eq(tasks.id, taskId)).returning();

    eventBus.emit('task.completed', {
      taskId,
      patientId: task.patientId,
      completedBy,
    });

    logger.info({ taskId, completedBy }, 'Task completed');
    return completed;
  }

  async escalateTask(taskId: string) {
    const task = await this.getTask(taskId);
    const newLevel = (task.escalationLevel || 0) + 1;

    const [escalated] = await db.update(tasks).set({
      status: 'escalated',
      escalationLevel: newLevel,
      escalatedAt: new Date(),
    }).where(eq(tasks.id, taskId)).returning();

    logger.warn({ taskId, escalationLevel: newLevel }, 'Task escalated');
    return escalated;
  }

  async cancelTask(taskId: string, reason?: string) {
    const task = await this.getTask(taskId);
    if (task.status === 'completed') {
      throw new BusinessRuleError('Cannot cancel a completed task');
    }

    const [cancelled] = await db.update(tasks).set({
      status: 'cancelled',
      completionNote: reason ? `Cancelled: ${reason}` : 'Cancelled',
    }).where(eq(tasks.id, taskId)).returning();

    return cancelled;
  }

  /**
   * Check for overdue tasks — called by scheduler.
   */
  async checkOverdueTasks() {
    const overdueTasks = await queryClient`
      SELECT id, patient_id, assigned_to
      FROM tasks
      WHERE status NOT IN ('completed', 'cancelled')
        AND due_at < NOW()
        AND due_at IS NOT NULL
    `;

    for (const task of overdueTasks) {
      eventBus.emit('task.overdue', {
        taskId: task.id,
        patientId: task.patient_id,
        assignedTo: task.assigned_to,
      });
    }

    if (overdueTasks.length > 0) {
      logger.info({ count: overdueTasks.length }, 'Overdue tasks detected');
    }

    return overdueTasks.length;
  }
}

const taskService = new TaskService();
export { taskService };

// ─── Routes ─────────────────────────────────────────────
export const taskRoutes = new Hono();
taskRoutes.use('*', authMiddleware);

// POST /tasks
taskRoutes.post('/', requirePermission('tasks.create'), async (c) => {
  const body = await c.req.json();
  const parsed = createTaskSchema.safeParse(body);
  if (!parsed.success) throw new ValidationError('Validation failed', parsed.error.errors.map(e => ({ field: e.path.join('.'), message: e.message })));

  const user = c.get('user');
  const task = await taskService.createTask(parsed.data, user.userId);
  return c.json(successResponse(task), 201);
});

// GET /tasks
taskRoutes.get('/', async (c) => {
  const user = c.get('user');
  const query = taskQuerySchema.parse({
    page: c.req.query('page'),
    limit: c.req.query('limit'),
    patientId: c.req.query('patient_id'),
    assignee: c.req.query('assignee'),
    status: c.req.query('status'),
    priority: c.req.query('priority'),
    category: c.req.query('category'),
  });

  const { data, total } = await taskService.listTasks(user.userId, query);
  return c.json(paginatedResponse(data, query.page, query.limit, total));
});

// GET /tasks/:id
taskRoutes.get('/:id', async (c) => {
  const task = await taskService.getTask(c.req.param('id'));
  return c.json(successResponse(task));
});

// POST /tasks/:id/assign
taskRoutes.post('/:id/assign', requirePermission('tasks.assign'), async (c) => {
  const body = await c.req.json();
  if (!body.assignedTo) throw new ValidationError('assignedTo is required');
  const task = await taskService.assignTask(c.req.param('id')!, body.assignedTo);
  return c.json(successResponse(task));
});

// POST /tasks/:id/complete
taskRoutes.post('/:id/complete', requirePermission('tasks.complete'), async (c) => {
  const body = await c.req.json().catch(() => ({}));
  const parsed = completeTaskSchema.safeParse(body);
  const user = c.get('user');
  const task = await taskService.completeTask(c.req.param('id')!, user.userId, parsed.data?.completionNote);
  return c.json(successResponse(task));
});

// POST /tasks/:id/escalate
taskRoutes.post('/:id/escalate', async (c) => {
  const task = await taskService.escalateTask(c.req.param('id'));
  return c.json(successResponse(task));
});

// POST /tasks/:id/cancel
taskRoutes.post('/:id/cancel', async (c) => {
  const body = await c.req.json().catch(() => ({}));
  const task = await taskService.cancelTask(c.req.param('id'), body.reason);
  return c.json(successResponse(task));
});
