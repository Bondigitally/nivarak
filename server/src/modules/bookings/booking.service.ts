import { bookingInquiries } from '../../db/schema/booking_inquiries.js';
import { db } from '../../db/connection.js';
import type { CreateBookingInquiryInput } from './booking.schema.js';

export type BookingInquiryCreated = {
  id: string;
  createdAt: string;
};

export async function createBookingInquiry(
  input: CreateBookingInquiryInput,
): Promise<BookingInquiryCreated> {
  const [row] = await db
    .insert(bookingInquiries)
    .values({
      name: input.name,
      email: input.email,
      phone: input.phone,
      message: input.message,
      preferredSlotStart: input.preferredSlotStart
        ? new Date(input.preferredSlotStart)
        : null,
      preferredSlotEnd: input.preferredSlotEnd
        ? new Date(input.preferredSlotEnd)
        : null,
    })
    .returning({
      id: bookingInquiries.id,
      createdAt: bookingInquiries.createdAt,
    });

  if (!row) {
    throw new Error('Failed to create booking inquiry');
  }

  return {
    id: row.id,
    createdAt: row.createdAt.toISOString(),
  };
}
