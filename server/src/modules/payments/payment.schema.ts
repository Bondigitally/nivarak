import { z } from 'zod';

export const createIaspReportOrderSchema = z.object({
  sessionId: z.string().uuid(),
  fullName: z.string().trim().min(2).max(255),
  phoneNumber: z.string().trim().min(8).max(32),
  email: z.string().trim().email().max(255),
});

export const verifyIaspReportPaymentSchema = z.object({
  sessionId: z.string().uuid(),
  razorpayOrderId: z.string().min(1),
  razorpayPaymentId: z.string().min(1),
  razorpaySignature: z.string().min(1),
});

export const iaspPaymentStatusQuerySchema = z.object({
  sessionId: z.string().uuid(),
});

export type CreateIaspReportOrderInput = z.infer<typeof createIaspReportOrderSchema>;
export type VerifyIaspReportPaymentInput = z.infer<typeof verifyIaspReportPaymentSchema>;
