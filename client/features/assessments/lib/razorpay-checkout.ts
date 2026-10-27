import { apiFetch } from "@/lib/api";
import {
  forgetLegacyIaspAccessToken,
  iaspAccessHeaders,
} from "@/features/assessments/lib/iasp-session-api";

type IaspReportOrder = {
  alreadyPaid?: boolean;
  unlocked?: boolean;
  orderId: string;
  amount: number;
  currency: string;
  keyId: string;
  sessionId: string;
};

type IaspPaymentStatus = {
  paymentStatus: "created" | "pending" | "paid" | "failed" | "cancelled" | null;
  unlocked: boolean;
  problem: "amount_mismatch" | null;
};

export type IaspCheckoutOutcome = "paid" | "failed" | "pending" | "amount_mismatch";

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
 * Opens Razorpay checkout for one IAS-P report order.
 * Closing the modal polls payment status. It does not mark the payment failed.
 */
export type IaspReportCheckoutOptions = {
  /** Run after the order is created and immediately before Razorpay opens. */
  onBeforeOpen?: () => void | Promise<void>;
  /** Checkout closed or confirmation is delayed. Not a failure. */
  onChecking?: () => void;
};

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

/** Single read of the server payment/entitlement state for this session. */
async function fetchIaspReportPaymentStatus(
  sessionId: string,
): Promise<IaspPaymentStatus> {
  const status = await apiFetch<IaspPaymentStatus>(
    `/payments/razorpay/iasp-report-status?sessionId=${encodeURIComponent(sessionId)}`,
    { headers: iaspAccessHeaders(sessionId) },
  );
  forgetLegacyIaspAccessToken(sessionId);
  return status;
}

async function pollIaspPaymentStatus(sessionId: string): Promise<IaspCheckoutOutcome> {
  const delays = [0, 1000, 2000, 4000, 8000];
  for (const delay of delays) {
    if (delay > 0) await sleep(delay);
    const status = await fetchIaspReportPaymentStatus(sessionId);
    if (status.problem === "amount_mismatch") return "amount_mismatch";
    if (status.unlocked || status.paymentStatus === "paid") return "paid";
    if (status.paymentStatus === "failed") return "failed";
  }
  return "pending";
}

/**
 * Opens Razorpay checkout for the IASP detailed report.
 * Dismissing checkout does not fail the payment. The status endpoint is polled
 * because a payment can capture without a browser callback.
 */
export async function openIaspReportCheckout(
  sessionId: string,
  userDetails: IaspReportUserDetails,
  options?: IaspReportCheckoutOptions,
): Promise<IaspCheckoutOutcome> {
  const order = await apiFetch<IaspReportOrder>(
    "/payments/razorpay/iasp-report-order",
    {
      method: "POST",
      headers: iaspAccessHeaders(sessionId),
      body: JSON.stringify({
        sessionId,
        fullName: userDetails.fullName,
        phoneNumber: userDetails.phoneNumber,
        email: userDetails.email,
      }),
    },
  );
  forgetLegacyIaspAccessToken(sessionId);

  if (order.alreadyPaid || order.unlocked) {
    return "paid";
  }

  await loadRazorpayScript();

  if (!window.Razorpay) {
    throw new Error("Razorpay checkout is unavailable");
  }

  return new Promise((resolve, reject) => {
    let paymentStarted = false;

    const checkout = new window.Razorpay!({
      key: order.keyId,
      amount: order.amount,
      currency: order.currency,
      order_id: order.orderId,
      name: "NIVARAK ELDER CARE LLP",
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
          headers: iaspAccessHeaders(sessionId),
          body: JSON.stringify({
            sessionId,
            razorpayOrderId: response.razorpay_order_id,
            razorpayPaymentId: response.razorpay_payment_id,
            razorpaySignature: response.razorpay_signature,
          }),
        })
          .then(async () => {
            forgetLegacyIaspAccessToken(sessionId);
            options?.onChecking?.();
            resolve(await pollIaspPaymentStatus(sessionId));
          })
          .catch(async () => {
            options?.onChecking?.();
            try {
              resolve(await pollIaspPaymentStatus(sessionId));
            } catch (error: unknown) {
              const message =
                error instanceof Error ? error.message : "Could not verify payment";
              reject(new Error(message));
            }
          });
      },
      modal: {
        ondismiss: () => {
          if (paymentStarted) return;
          paymentStarted = true;
          options?.onChecking?.();
          void pollIaspPaymentStatus(sessionId)
            .then(resolve)
            .catch((error: unknown) => {
              const message =
                error instanceof Error
                  ? error.message
                  : "Could not check payment status";
              reject(new Error(message));
            });
        },
      },
    });

    void Promise.resolve(options?.onBeforeOpen?.()).then(() => {
      checkout.open();
    });
  });
}
