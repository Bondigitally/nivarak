import { z } from 'zod';

/** Indian phone number format: +91XXXXXXXXXX */
const indianPhoneRegex = /^\+91[6-9]\d{9}$/;

export const requestOtpSchema = z.object({
  phone: z.string().regex(indianPhoneRegex, 'Must be a valid Indian mobile number (+91XXXXXXXXXX)'),
});

export const verifyOtpSchema = z.object({
  phone: z.string().regex(indianPhoneRegex, 'Must be a valid Indian mobile number'),
  otp: z.string().length(6, 'OTP must be 6 digits'),
});

export const loginSchema = z.object({
  phone: z.string().regex(indianPhoneRegex, 'Must be a valid Indian mobile number'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8, 'Password must be at least 8 characters'),
});

export const registerSchema = z.object({
  phone: z.string().regex(indianPhoneRegex, 'Must be a valid Indian mobile number'),
  fullName: z.string().min(2).max(255),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  email: z.string().email().optional(),
  preferredLanguage: z.string().max(10).default('en'),
});

export const inviteSchema = z.object({
  phone: z.string().regex(indianPhoneRegex, 'Must be a valid Indian mobile number'),
  fullName: z.string().min(2).max(255),
  role: z.enum(['patient', 'caregiver', 'nurse', 'doctor', 'coordinator', 'admin']),
});
