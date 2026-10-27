import { z } from 'zod';

const personNameSchema = z
  .string()
  .trim()
  .min(2, 'Please enter your name')
  .max(80, 'Name is too long')
  .regex(/^[\p{L}][\p{L}\s'.-]*$/u, 'Please enter a valid name');

const emailSchema = z
  .string()
  .trim()
  .min(1, 'Please enter a valid email address')
  .email('Please enter a valid email address')
  .max(254, 'Email is too long');

const phoneSchema = z
  .string()
  .trim()
  .regex(/^\+[1-9]\d{6,14}$/, 'Please enter a valid phone number');

const messageSchema = z
  .string()
  .trim()
  .min(10, 'Please add a short message (at least 10 characters)')
  .max(1000, 'Message is too long');

/**
 * Lead capture for consultation interest. Slot fields are optional until the
 * confirmed-slot booking flow is wired up.
 */
export const createBookingInquirySchema = z.object({
  name: personNameSchema,
  email: emailSchema,
  phone: phoneSchema,
  message: messageSchema,
  preferredSlotStart: z.string().datetime().optional(),
  preferredSlotEnd: z.string().datetime().optional(),
});

export type CreateBookingInquiryInput = z.infer<typeof createBookingInquirySchema>;
