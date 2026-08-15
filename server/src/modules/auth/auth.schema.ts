import { z } from 'zod';

/** Indian phone number format: +91XXXXXXXXXX */
const indianPhoneRegex = /^\+91[6-9]\d{9}$/;

export const inviteSchema = z.object({
  phone: z.string().regex(indianPhoneRegex, 'Must be a valid Indian mobile number'),
  fullName: z.string().min(2).max(255),
  role: z.enum(['patient', 'caregiver', 'nurse', 'doctor', 'coordinator', 'admin']),
});
