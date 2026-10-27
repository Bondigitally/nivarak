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

/** E.164-ish: + and 7–15 digits after the leading country digit. */
const phoneSchema = z
  .string()
  .trim()
  .regex(/^\+[1-9]\d{6,14}$/, 'Please enter a valid phone number');

const subjectSchema = z
  .string()
  .trim()
  .max(120, 'Subject is too long')
  .transform((value) => (value.length > 0 ? value : undefined));

const messageSchema = z
  .string()
  .trim()
  .min(10, 'Please add a short message (at least 10 characters)')
  .max(1000, 'Message is too long');

export const createContactInquirySchema = z.object({
  name: personNameSchema,
  email: emailSchema,
  phone: phoneSchema,
  subject: subjectSchema,
  message: messageSchema,
});

export type CreateContactInquiryInput = z.infer<typeof createContactInquirySchema>;
