import { Hono } from 'hono';
import { ValidationError } from '../../shared/errors.js';
import { requirePermission } from '../../middleware/auth.js';
import { successResponse, paginatedResponse } from '../../shared/response.js';
import { PERMISSIONS } from '../../shared/permissions.js';
import { createDocumentSchema } from './document.schema.js';
import { documentService } from './document.service.js';

export const documentRoutes = new Hono();

documentRoutes.post('/upload-url', requirePermission(PERMISSIONS.DOCUMENTS_UPLOAD), async (c) => {
  const body = await c.req.json();
  if (!body.filename) throw new ValidationError('filename is required');
  const result = await documentService.getUploadUrl(c.req.param('id')!, body.filename);
  return c.json(successResponse(result));
});

documentRoutes.post('/', requirePermission(PERMISSIONS.DOCUMENTS_UPLOAD), async (c) => {
  const body = await c.req.json();
  const parsed = createDocumentSchema.safeParse(body);
  if (!parsed.success) {
    throw new ValidationError('Validation failed', parsed.error.errors.map((e) => ({
      field: e.path.join('.'),
      message: e.message,
    })));
  }

  const user = c.get('user');
  const doc = await documentService.createDocument(c.req.param('id')!, parsed.data, user.userId);
  return c.json(successResponse(doc), 201);
});

documentRoutes.get('/', async (c) => {
  const page = parseInt(c.req.query('page') || '1');
  const limit = parseInt(c.req.query('limit') || '20');
  const { data, total } = await documentService.listDocuments(c.req.param('id')!, page, limit);
  return c.json(paginatedResponse(data, page, limit, total));
});

documentRoutes.get('/:docId', async (c) => {
  const doc = await documentService.getDocument(c.req.param('id')!, c.req.param('docId')!);
  return c.json(successResponse(doc));
});

documentRoutes.get('/:docId/url', async (c) => {
  const url = await documentService.getDownloadUrl(c.req.param('id')!, c.req.param('docId')!);
  return c.json(successResponse(url));
});

documentRoutes.delete('/:docId', requirePermission(PERMISSIONS.DOCUMENTS_UPLOAD), async (c) => {
  await documentService.softDeleteDocument(c.req.param('id')!, c.req.param('docId')!);
  return c.json(successResponse({ message: 'Document deleted' }));
});
