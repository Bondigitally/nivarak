import { createHmac, timingSafeEqual } from 'node:crypto';

function safeEqualHex(expectedHex: string, providedHex: string): boolean {
  const expected = Buffer.from(expectedHex, 'utf8');
  const provided = Buffer.from(providedHex, 'utf8');
  if (expected.length !== provided.length) return false;
  return timingSafeEqual(expected, provided);
}

/** HMAC-SHA256 of `orderId|paymentId` using the Razorpay key secret. */
export function signRazorpayPayment(
  keySecret: string,
  orderId: string,
  paymentId: string,
): string {
  return createHmac('sha256', keySecret).update(`${orderId}|${paymentId}`).digest('hex');
}

/**
 * Verify a Checkout callback. Callers must pass the order id stored for this
 * assessment, never the order id from the browser.
 */
export function verifyRazorpayPaymentSignature(
  keySecret: string,
  storedOrderId: string,
  paymentId: string,
  signature: string,
): boolean {
  if (!keySecret || !storedOrderId || !paymentId || !signature) return false;
  const expected = signRazorpayPayment(keySecret, storedOrderId, paymentId);
  return safeEqualHex(expected, signature);
}

/** HMAC-SHA256 of the raw webhook body using the webhook secret. */
export function signRazorpayWebhook(webhookSecret: string, rawBody: string): string {
  return createHmac('sha256', webhookSecret).update(rawBody).digest('hex');
}

export function verifyRazorpayWebhookSignature(
  webhookSecret: string,
  rawBody: string,
  signature: string,
): boolean {
  if (!webhookSecret || !signature) return false;
  const expected = signRazorpayWebhook(webhookSecret, rawBody);
  return safeEqualHex(expected, signature);
}
