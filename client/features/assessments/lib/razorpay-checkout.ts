import { apiFetch } from "@/lib/api";

type IaspReportOrder = {
  orderId: string;
  amount: number;
  currency: string;
  keyId: string;
};

type RazorpayCheckoutInstance = {
  open: () => void;
};

type RazorpayCheckoutOptions = {
  key: string;
  amount: number;
  currency: string;
  order_id: string;
  name: string;
  description: string;
  handler: () => void;
  modal: {
    ondismiss: () => void;
  };
};

declare global {
  interface Window {
    Razorpay?: new (options: RazorpayCheckoutOptions) => RazorpayCheckoutInstance;
  }
}

const RAZORPAY_SCRIPT_SRC = "https://checkout.razorpay.com/v1/checkout.js";

/**
 * Lazily injects the Razorpay SDK script and resolves when it is ready.
 *
 * Deduplication strategy:
 * - If `window.Razorpay` already exists, resolve immediately (already loaded).
 * - If a `<script>` tag for the same URL exists but hasn't fired yet, attach
 *   listeners instead of injecting a second tag — avoids a double-load race.
 * - Otherwise inject a new async script tag.
 */
function loadRazorpayScript(): Promise<void> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("Payment is only available in the browser"));
  }

  if (window.Razorpay) {
    return Promise.resolve();
  }

  const existing = document.querySelector<HTMLScriptElement>(
    `script[src="${RAZORPAY_SCRIPT_SRC}"]`,
  );
  if (existing) {
    return new Promise((resolve, reject) => {
      existing.addEventListener("load", () => resolve(), { once: true });
      existing.addEventListener(
        "error",
        () => reject(new Error("Failed to load Razorpay checkout")),
        { once: true },
      );
    });
  }

  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = RAZORPAY_SCRIPT_SRC;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load Razorpay checkout"));
    document.body.appendChild(script);
  });
}

/**
 * Opens the Razorpay checkout modal for the IASP detailed report.
 *
 * Flow:
 *  1. Load the Razorpay SDK (cached after first call).
 *  2. POST to the backend to create an order — amount, currency, and keyId
 *     come from the server so they are never hardcoded client-side.
 *  3. Open the checkout modal. Resolves on payment success; rejects on dismiss.
 *
 * Callers should swallow "Payment cancelled" rejections (expected user action)
 * and surface all other errors as toast messages.
 */
export async function openIaspReportCheckout(): Promise<void> {
  await loadRazorpayScript();

  if (!window.Razorpay) {
    throw new Error("Razorpay checkout is unavailable");
  }

  const order = await apiFetch<IaspReportOrder>(
    "/payments/razorpay/iasp-report-order",
    { method: "POST" },
  );

  return new Promise((resolve, reject) => {
    const checkout = new window.Razorpay!({
      key: order.keyId,
      amount: order.amount,
      currency: order.currency,
      order_id: order.orderId,
      name: "Nivarak",
      description: "IAS Detailed Report",
      handler: () => resolve(),
      modal: {
        ondismiss: () => reject(new Error("Payment cancelled")),
      },
    });

    checkout.open();
  });
}
