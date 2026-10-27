import { describe, expect, it } from 'vitest';
import {
  signRazorpayPayment,
  signRazorpayWebhook,
  verifyRazorpayPaymentSignature,
  verifyRazorpayWebhookSignature,
} from '../../modules/payments/razorpay-signature.js';

const SECRET = 'test_key_secret';
const WEBHOOK_SECRET = 'test_webhook_secret';

describe('Razorpay signature verification', () => {
  it('accepts a signature over the stored order id and payment id', () => {
    const signature = signRazorpayPayment(SECRET, 'order_stored', 'pay_1');
    expect(verifyRazorpayPaymentSignature(SECRET, 'order_stored', 'pay_1', signature)).toBe(true);
  });

  it('rejects a signature built for a different order id', () => {
    const signature = signRazorpayPayment(SECRET, 'order_other', 'pay_1');
    expect(verifyRazorpayPaymentSignature(SECRET, 'order_stored', 'pay_1', signature)).toBe(false);
  });

  it('rejects a tampered signature and a length mismatch without throwing', () => {
    const signature = signRazorpayPayment(SECRET, 'order_stored', 'pay_1');
    expect(verifyRazorpayPaymentSignature(SECRET, 'order_stored', 'pay_1', `${signature}aa`)).toBe(
      false,
    );
    expect(verifyRazorpayPaymentSignature(SECRET, 'order_stored', 'pay_1', 'ab')).toBe(false);
    expect(verifyRazorpayPaymentSignature('', 'order_stored', 'pay_1', signature)).toBe(false);
  });

  it('verifies webhook signatures against the raw body and a separate secret', () => {
    const raw = '{"event":"payment.captured"}';
    const signature = signRazorpayWebhook(WEBHOOK_SECRET, raw);
    expect(verifyRazorpayWebhookSignature(WEBHOOK_SECRET, raw, signature)).toBe(true);
    expect(verifyRazorpayWebhookSignature(SECRET, raw, signature)).toBe(false);
    expect(verifyRazorpayWebhookSignature(WEBHOOK_SECRET, `${raw} `, signature)).toBe(false);
    expect(verifyRazorpayWebhookSignature(WEBHOOK_SECRET, raw, '')).toBe(false);
  });
});
