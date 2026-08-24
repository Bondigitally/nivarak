import { eq, and, desc, count } from 'drizzle-orm';
import { db, queryClient } from '../../db/connection.js';
import { tasks } from '../../db/schema/index.js';
import { eventBus } from '../../shared/event-bus.js';
import { logger } from '../../shared/logger.js';
import { NotFoundError, BusinessRuleError } from '../../shared/errors.js';
import type { CreateTaskInput, TaskQuery } from './task.schema.js';

class TaskService {
  async createTask(data: CreateTaskInput, createdBy: string) {
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

  async listTasks(userId: string, query: TaskQuery) {
    const offset = (query.page - 1) * query.limit;
    const conditions = [];

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

export const taskService = new TaskService();
