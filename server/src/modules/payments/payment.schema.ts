import { z } from 'zod';

export const createIaspReportOrderSchema = z.object({
  sessionId: z.string().uuid(),
});

export const verifyIaspReportPaymentSchema = z.object({
  sessionId: z.string().uuid(),
  razorpayOrderId: z.string().min(1),
  razorpayPaymentId: z.string().min(1),
  razorpaySignature: z.string().min(1),
});
