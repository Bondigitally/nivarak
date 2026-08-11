import { z } from 'zod';

/** Indian phone number format: +91XXXXXXXXXX */
const indianPhoneRegex = /^\+91[6-9]\d{9}$/;

const passwordSchema = z.string().superRefine((value, ctx) => {
  if (!value) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Please enter your password' });
    return;
  }

  const failed: string[] = [];
  if (value.length < 8) failed.push('Password must be at least 8 characters.');
  if (!/[A-Z]/.test(value)) failed.push('Password must contain an uppercase letter.');
  if (!/[0-9]/.test(value)) failed.push('Password must contain a number.');
  if (!/[^A-Za-z0-9]/.test(value)) failed.push('Password must contain a special character.');

  for (const message of failed) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message });
  }
});

export const requestOtpSchema = z.object({
  phone: z.string().regex(indianPhoneRegex, 'Must be a valid Indian mobile number (+91XXXXXXXXXX)'),
});

export const verifyOtpSchema = z.object({
  phone: z.string().regex(indianPhoneRegex, 'Must be a valid Indian mobile number'),
  otp: z.string().length(6, 'OTP must be 6 digits'),
});

export const loginSchema = z.object({
  phone: z.string().regex(indianPhoneRegex, 'Must be a valid Indian mobile number'),
  password: z.string().min(8, 'Password must be at least 8 characters.'),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: passwordSchema,
});

export const registerSchema = z.object({
  phone: z.string().regex(indianPhoneRegex, 'Must be a valid Indian mobile number'),
  fullName: z.string().min(2).max(255),
  password: passwordSchema,
  email: z.string().email().optional(),
  preferredLanguage: z.string().max(10).default('en'),
});

export const inviteSchema = z.object({
  phone: z.string().regex(indianPhoneRegex, 'Must be a valid Indian mobile number'),
  fullName: z.string().min(2).max(255),
  role: z.enum(['patient', 'caregiver', 'nurse', 'doctor', 'coordinator', 'admin']),
});

// ─── Password Reset (email-based) ─────────────────────────

/** Step 1 — user submits their email to initiate a reset */
export const forgotPasswordSchema = z.object({
  email: z.string().email('Must be a valid email address'),
});

/** Step 2 — user submits email + the 6-digit code they received */
export const verifyResetCodeSchema = z.object({
  email: z.string().email('Must be a valid email address'),
  code: z.string().length(6, 'Reset code must be 6 digits'),
});

/**
 * Step 3 — user submits email + code + new password.
 * We re-verify the code here so the flow is stateless (no reset-token cookie needed).
 */
export const resetPasswordSchema = z.object({
  email: z.string().email('Must be a valid email address'),
  code: z.string().length(6, 'Reset code must be 6 digits'),
  newPassword: passwordSchema,
});
