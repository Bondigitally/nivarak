/**
 * DocumentModule — Service + Routes
 * Document upload metadata, local file storage (dev), signed URL pattern ready.
 */

import { Hono } from 'hono';
import { z } from 'zod';
import { eq, and, desc, count } from 'drizzle-orm';
import fs from 'fs';
import path from 'path';
import { db } from '../../db/connection.js';
import { documents } from '../../db/schema/index.js';
import { eventBus } from '../../shared/event-bus.js';
import { logger } from '../../shared/logger.js';
import { config } from '../../config/index.js';
import { NotFoundError, ValidationError } from '../../shared/errors.js';
import { authMiddleware, requirePermission } from '../../middleware/auth.js';
import { successResponse, paginatedResponse } from '../../shared/response.js';

const ALLOWED_MIMES = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];

// ─── Schemas ────────────────────────────────────────────
const createDocumentSchema = z.object({
  title: z.string().min(1).max(255),
  category: z.enum(['lab', 'imaging', 'prescription', 'discharge', 'other']),
  reportDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  storagePath: z.string().min(1),
  fileSizeBytes: z.number().int().positive().max(50 * 1024 * 1024), // 50MB max
  mimeType: z.string().refine((v) => ALLOWED_MIMES.includes(v), 'Unsupported file type'),
  encounterId: z.string().uuid().optional(),
});

// ─── Service ────────────────────────────────────────────
class DocumentService {
  /**
   * Generate an upload URL. In local dev, returns a local path.
   * In production, this would generate an S3 pre-signed URL.
   */
  async getUploadUrl(patientId: string, filename: string) {
    const docId = crypto.randomUUID();
    const safeName = filename.replace(/[^a-zA-Z0-9._-]/g, '_');
    const storagePath = `${patientId}/${docId}/${safeName}`;

    if (config.storage.provider === 'local') {
      const fullPath = path.join(config.storage.localPath, storagePath);
      const dir = path.dirname(fullPath);
      fs.mkdirSync(dir, { recursive: true });

      return {
        uploadUrl: `/upload/${storagePath}`, // Local dev endpoint
        storagePath,
        documentId: docId,
      };
    }

    // TODO: AWS S3 pre-signed URL generation
    return { uploadUrl: '', storagePath, documentId: docId };
  }

  async createDocument(
    patientId: string,
    data: z.infer<typeof createDocumentSchema>,
    uploadedBy: string
  ) {
    const [doc] = await db.insert(documents).values({
      patientId,
      title: data.title,
      category: data.category,
      reportDate: data.reportDate,
      storagePath: data.storagePath,
      fileSizeBytes: data.fileSizeBytes,
      mimeType: data.mimeType,
      uploadedBy,
      encounterId: data.encounterId,
      scanStatus: 'pending',
    }).returning();

    eventBus.emit('document.uploaded', { documentId: doc.id, patientId, uploadedBy });
    logger.info({ documentId: doc.id, patientId, category: data.category }, 'Document record created');
    return doc;
  }

  async listDocuments(patientId: string, page: number, limit: number) {
    const offset = (page - 1) * limit;
    const [totalResult] = await db.select({ count: count() }).from(documents)
      .where(and(eq(documents.patientId, patientId), eq(documents.isDeleted, false)));
    const data = await db.select().from(documents)
      .where(and(eq(documents.patientId, patientId), eq(documents.isDeleted, false)))
      .orderBy(desc(documents.createdAt)).limit(limit).offset(offset);
    return { data, total: totalResult.count };
  }

  async getDocument(patientId: string, docId: string) {
    const [doc] = await db.select().from(documents)
      .where(and(eq(documents.id, docId), eq(documents.patientId, patientId)))
      .limit(1);
    if (!doc) throw new NotFoundError('Document', docId);
    return doc;
  }

  async getDownloadUrl(patientId: string, docId: string) {
    const doc = await this.getDocument(patientId, docId);

    if (config.storage.provider === 'local') {
      // In dev, return the local file path
      return { url: `/download/${doc.storagePath}`, expiresIn: 900 };
    }

    // TODO: S3 pre-signed download URL (15 min expiry)
    return { url: '', expiresIn: 900 };
  }

  async softDeleteDocument(patientId: string, docId: string) {
    const doc = await this.getDocument(patientId, docId);
    await db.update(documents).set({ isDeleted: true }).where(eq(documents.id, docId));
    logger.info({ documentId: docId, patientId }, 'Document soft-deleted');
  }
}

const documentService = new DocumentService();

// ─── Routes ─────────────────────────────────────────────
export const documentRoutes = new Hono();
documentRoutes.use('*', authMiddleware);

// POST /patients/:id/documents/upload-url
documentRoutes.post('/upload-url', requirePermission('documents.upload'), async (c) => {
  const body = await c.req.json();
  if (!body.filename) throw new ValidationError('filename is required');
  const result = await documentService.getUploadUrl(c.req.param('id')!, body.filename);
  return c.json(successResponse(result));
});

// POST /patients/:id/documents
documentRoutes.post('/', requirePermission('documents.upload'), async (c) => {
  const body = await c.req.json();
  const parsed = createDocumentSchema.safeParse(body);
  if (!parsed.success) throw new ValidationError('Validation failed', parsed.error.errors.map(e => ({ field: e.path.join('.'), message: e.message })));

  const user = c.get('user');
  const doc = await documentService.createDocument(c.req.param('id')!, parsed.data, user.userId);
  return c.json(successResponse(doc), 201);
});

// GET /patients/:id/documents
documentRoutes.get('/', async (c) => {
  const page = parseInt(c.req.query('page') || '1');
  const limit = parseInt(c.req.query('limit') || '20');
  const { data, total } = await documentService.listDocuments(c.req.param('id')!, page, limit);
  return c.json(paginatedResponse(data, page, limit, total));
});

// GET /patients/:id/documents/:docId
documentRoutes.get('/:docId', async (c) => {
  const doc = await documentService.getDocument(c.req.param('id')!, c.req.param('docId')!);
  return c.json(successResponse(doc));
});

// GET /patients/:id/documents/:docId/url
documentRoutes.get('/:docId/url', async (c) => {
  const url = await documentService.getDownloadUrl(c.req.param('id')!, c.req.param('docId')!);
  return c.json(successResponse(url));
});

// DELETE /patients/:id/documents/:docId
documentRoutes.delete('/:docId', requirePermission('documents.upload'), async (c) => {
  await documentService.softDeleteDocument(c.req.param('id')!, c.req.param('docId')!);
  return c.json(successResponse({ message: 'Document deleted' }));
});
