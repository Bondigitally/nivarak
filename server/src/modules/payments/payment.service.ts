import Razorpay from 'razorpay';

import { config } from '../../config/index.js';
import { AppError } from '../../shared/errors.js';

function getRazorpayClient() {
  if (!config.razorpay.keyId || !config.razorpay.keySecret) {
    throw new AppError(
      503,
      'PAYMENT_NOT_CONFIGURED',
      'Razorpay is not configured on the server',
    );
  }

  return new Razorpay({
    key_id: config.razorpay.keyId,
    key_secret: config.razorpay.keySecret,
  });
}

export async function createIaspReportOrder() {
  const razorpay = getRazorpayClient();

  const order = await razorpay.orders.create({
    amount: config.razorpay.iaspReportAmountPaise,
    currency: 'INR',
    receipt: `iasp_report_${Date.now()}`,
    notes: {
      product: 'iasp_detailed_report',
    },
  });

  return {
    orderId: order.id,
    amount: Number(order.amount),
    currency: order.currency,
    keyId: config.razorpay.keyId,
  };
}
