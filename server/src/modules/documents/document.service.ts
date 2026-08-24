import { eq, and, desc, count } from 'drizzle-orm';
import fs from 'fs';
import path from 'path';
import { db } from '../../db/connection.js';
import { documents } from '../../db/schema/index.js';
import { eventBus } from '../../shared/event-bus.js';
import { logger } from '../../shared/logger.js';
import { config } from '../../config/index.js';
import { NotFoundError } from '../../shared/errors.js';
import type { CreateDocumentInput } from './document.schema.js';

class DocumentService {
  async getUploadUrl(patientId: string, filename: string) {
    const docId = crypto.randomUUID();
    const safeName = filename.replace(/[^a-zA-Z0-9._-]/g, '_');
    const storagePath = `${patientId}/${docId}/${safeName}`;

    if (config.storage.provider === 'local') {
      const fullPath = path.join(config.storage.localPath, storagePath);
      const dir = path.dirname(fullPath);
      fs.mkdirSync(dir, { recursive: true });

      return {
        uploadUrl: `/upload/${storagePath}`,
        storagePath,
        documentId: docId,
      };
    }

    return { uploadUrl: '', storagePath, documentId: docId };
  }

  async createDocument(patientId: string, data: CreateDocumentInput, uploadedBy: string) {
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
      return { url: `/download/${doc.storagePath}`, expiresIn: 900 };
    }

    return { url: '', expiresIn: 900 };
  }

  async softDeleteDocument(patientId: string, docId: string) {
    await this.getDocument(patientId, docId);
    await db.update(documents).set({ isDeleted: true }).where(eq(documents.id, docId));
    logger.info({ documentId: docId, patientId }, 'Document soft-deleted');
  }
}

export const documentService = new DocumentService();
