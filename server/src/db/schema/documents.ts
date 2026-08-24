import {
  pgTable,
  uuid,
  varchar,
  text,
  boolean,
  timestamp,
  date,
  bigint,
  index,
} from 'drizzle-orm/pg-core';
import { users } from './users.js';
import { patients } from './patients.js';
import { encounters } from './encounters.js';

export const documents = pgTable(
  'documents',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    patientId: uuid('patient_id')
      .notNull()
      .references(() => patients.id),
    title: varchar('title', { length: 255 }).notNull(),
    category: varchar('category', { length: 50 }).notNull(),
    reportDate: date('report_date'),
    storagePath: text('storage_path').notNull(),
    fileSizeBytes: bigint('file_size_bytes', { mode: 'number' }),
    mimeType: varchar('mime_type', { length: 100 }),
    scanStatus: varchar('scan_status', { length: 20 }).default('pending'),
    uploadedBy: uuid('uploaded_by')
      .notNull()
      .references(() => users.id),
    encounterId: uuid('encounter_id').references(() => encounters.id),
    isDeleted: boolean('is_deleted').default(false),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index('documents_patient_category_idx').on(table.patientId, table.category),
    index('documents_patient_date_idx').on(table.patientId, table.reportDate),
  ]
);
