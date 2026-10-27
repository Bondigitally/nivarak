import { contactInquiries } from '../../db/schema/contact_inquiries.js';
import { db } from '../../db/connection.js';
import type { CreateContactInquiryInput } from './contact.schema.js';

export type ContactInquiryCreated = {
  id: string;
  createdAt: string;
};

export async function createContactInquiry(
  input: CreateContactInquiryInput,
): Promise<ContactInquiryCreated> {
  const [row] = await db
    .insert(contactInquiries)
    .values({
      name: input.name,
      email: input.email,
      phone: input.phone,
      subject: input.subject ?? null,
      message: input.message,
    })
    .returning({
      id: contactInquiries.id,
      createdAt: contactInquiries.createdAt,
    });

  if (!row) {
    throw new Error('Failed to create contact inquiry');
  }

  return {
    id: row.id,
    createdAt: row.createdAt.toISOString(),
  };
}
