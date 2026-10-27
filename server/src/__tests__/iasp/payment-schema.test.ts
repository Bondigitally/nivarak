import { describe, expect, it } from 'vitest';
import { createIaspReportOrderSchema } from '../../modules/payments/payment.schema.js';
import { readWebhookAction } from '../../modules/payments/payment.service.js';

describe('IAS-P order schema', () => {
  it('does not accept a client-supplied amount or order id', () => {
    const parsed = createIaspReportOrderSchema.parse({
      sessionId: '11111111-1111-4111-8111-111111111111',
      fullName: 'Asha Rao',
      phoneNumber: '+919876543210',
      email: 'asha@example.com',
      amount: 1,
      orderId: 'order_from_browser',
    });
    expect(parsed).not.toHaveProperty('amount');
    expect(parsed).not.toHaveProperty('orderId');
    expect(parsed.sessionId).toBe('11111111-1111-4111-8111-111111111111');
  });
});

describe('Razorpay webhook action parser', () => {
  it('reads captured, failed, and order.paid payments and ignores anything else', () => {
    expect(
      readWebhookAction({
        event: 'payment.captured',
        payload: {
          payment: {
            entity: { id: 'pay_1', order_id: 'order_1', amount: 49900, currency: 'INR', email: 'hidden@example.com' },
          },
        },
      }),
    ).toEqual({
      type: 'captured',
      orderId: 'order_1',
      paymentId: 'pay_1',
      amount: 49900,
      currency: 'INR',
    });

    expect(
      readWebhookAction({
        event: 'payment.failed',
        payload: { payment: { entity: { id: 'pay_2', order_id: 'order_1', amount: 49900, currency: 'INR' } } },
      }).type,
    ).toBe('failed');

    expect(
      readWebhookAction({
        event: 'order.paid',
        payload: {
          order: { entity: { id: 'order_9' } },
          payment: { entity: { id: 'pay_9', order_id: 'order_9', status: 'captured', amount: 49900, currency: 'INR' } },
        },
      }).type,
    ).toBe('captured');

    expect(readWebhookAction({ event: 'refund.created', payload: {} })).toEqual({ type: 'ignore' });
  });
});
