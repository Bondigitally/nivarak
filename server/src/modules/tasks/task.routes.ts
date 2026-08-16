import { Hono } from 'hono';
import { ValidationError } from '../../shared/errors.js';
import { authMiddleware, requirePermission } from '../../middleware/auth.js';
import { successResponse, paginatedResponse } from '../../shared/response.js';
import { PERMISSIONS } from '../../shared/permissions.js';
import { createTaskSchema, completeTaskSchema, taskQuerySchema } from './task.schema.js';
import { taskService } from './task.service.js';

export const taskRoutes = new Hono();
taskRoutes.use('*', authMiddleware);

taskRoutes.post('/', requirePermission(PERMISSIONS.TASKS_CREATE), async (c) => {
  const body = await c.req.json();
  const parsed = createTaskSchema.safeParse(body);
  if (!parsed.success) {
    throw new ValidationError('Validation failed', parsed.error.errors.map((e) => ({
      field: e.path.join('.'),
      message: e.message,
    })));
  }

  const user = c.get('user');
  const task = await taskService.createTask(parsed.data, user.userId);
  return c.json(successResponse(task), 201);
});

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

taskRoutes.get('/:id', async (c) => {
  const task = await taskService.getTask(c.req.param('id'));
  return c.json(successResponse(task));
});

taskRoutes.post('/:id/assign', requirePermission(PERMISSIONS.TASKS_ASSIGN), async (c) => {
  const body = await c.req.json();
  if (!body.assignedTo) throw new ValidationError('assignedTo is required');
  const task = await taskService.assignTask(c.req.param('id')!, body.assignedTo);
  return c.json(successResponse(task));
});

taskRoutes.post('/:id/complete', requirePermission(PERMISSIONS.TASKS_COMPLETE), async (c) => {
  const body = await c.req.json().catch(() => ({}));
  const parsed = completeTaskSchema.safeParse(body);
  const user = c.get('user');
  const task = await taskService.completeTask(c.req.param('id')!, user.userId, parsed.data?.completionNote);
  return c.json(successResponse(task));
});

taskRoutes.post('/:id/escalate', async (c) => {
  const task = await taskService.escalateTask(c.req.param('id'));
  return c.json(successResponse(task));
});

taskRoutes.post('/:id/cancel', async (c) => {
  const body = await c.req.json().catch(() => ({}));
  const task = await taskService.cancelTask(c.req.param('id'), body.reason);
  return c.json(successResponse(task));
});
