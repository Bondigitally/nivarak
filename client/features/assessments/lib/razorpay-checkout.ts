import { apiFetch } from "@/lib/api";

type IaspReportOrder = {
  orderId: string;
  amount: number;
  currency: string;
  keyId: string;
  sessionId: string;
};

type RazorpayPaymentSuccess = {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
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
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  handler: (response: RazorpayPaymentSuccess) => void;
  modal: {
    ondismiss: () => void;
  };
};

export type IaspReportUserDetails = {
  fullName: string;
  phoneNumber: string;
  email: string;
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
 *  2. POST to the backend to create an order for this guest session.
 *  3. Open checkout; on success, verify the payment signature on the server.
 *  4. Resolve only after the session is unlocked server-side.
 *
 * Callers should swallow "Payment cancelled" rejections (expected user action)
 * and surface all other errors as toast messages.
 */
export type IaspReportCheckoutOptions = {
  /** Run after the order is created and immediately before Razorpay opens. */
  onBeforeOpen?: () => void | Promise<void>;
};

export async function openIaspReportCheckout(
  sessionId: string,
  userDetails: IaspReportUserDetails,
  options?: IaspReportCheckoutOptions,
): Promise<void> {
  await loadRazorpayScript();

  if (!window.Razorpay) {
    throw new Error("Razorpay checkout is unavailable");
  }

  const order = await apiFetch<IaspReportOrder>(
    "/payments/razorpay/iasp-report-order",
    {
      method: "POST",
      body: JSON.stringify({
        sessionId,
        fullName: userDetails.fullName,
        phoneNumber: userDetails.phoneNumber,
        email: userDetails.email,
      }),
    },
  );

  return new Promise((resolve, reject) => {
    // Razorpay often fires `ondismiss` after a successful payment when the
    // checkout modal closes. Ignore dismiss once payment handling has started.
    let paymentStarted = false;

    const checkout = new window.Razorpay!({
      key: order.keyId,
      amount: order.amount,
      currency: order.currency,
      order_id: order.orderId,
      name: "Nivarak",
      description: "IAS Detailed Report",
      prefill: {
        name: userDetails.fullName,
        email: userDetails.email,
        contact: userDetails.phoneNumber,
      },
      handler: (response) => {
        paymentStarted = true;
        void apiFetch("/payments/razorpay/iasp-report-verify", {
          method: "POST",
          body: JSON.stringify({
            sessionId,
            razorpayOrderId: response.razorpay_order_id,
            razorpayPaymentId: response.razorpay_payment_id,
            razorpaySignature: response.razorpay_signature,
          }),
        })
          .then(() => resolve())
          .catch((error: unknown) => {
            const message =
              error instanceof Error
                ? error.message
                : "Could not verify payment";
            reject(new Error(message));
          });
      },
      modal: {
        ondismiss: () => {
          if (paymentStarted) return;
          reject(new Error("Payment cancelled"));
        },
      },
    });

    void Promise.resolve(options?.onBeforeOpen?.()).then(() => {
      checkout.open();
    });
  });
}
