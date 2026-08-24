import { Hono } from 'hono';
import { authMiddleware } from '../../middleware/auth.js';
import { successResponse, paginatedResponse } from '../../shared/response.js';
import { notificationService } from './notification.service.js';

export const notificationRoutes = new Hono();
notificationRoutes.use('*', authMiddleware);

notificationRoutes.get('/', async (c) => {
  const user = c.get('user');
  const page = parseInt(c.req.query('page') || '1');
  const limit = parseInt(c.req.query('limit') || '20');
  const { data, total } = await notificationService.listNotifications(user.userId, page, limit);
  return c.json(paginatedResponse(data, page, limit, total));
});

notificationRoutes.put('/:id/read', async (c) => {
  const user = c.get('user');
  await notificationService.markAsRead(c.req.param('id'), user.userId);
  return c.json(successResponse({ message: 'Marked as read' }));
});

notificationRoutes.put('/read-all', async (c) => {
  const user = c.get('user');
  await notificationService.markAllAsRead(user.userId);
  return c.json(successResponse({ message: 'All notifications marked as read' }));
});
