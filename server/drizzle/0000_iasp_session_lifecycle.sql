-- IAS-P assessment lifecycle and report payments.
--
-- Assessment status mapping (the column never stored payment state):
--   in_progress -> in_progress
--   completed   -> completed
-- New values, unused by existing rows: abandoned, superseded, expired.
--
-- Payment state moves to iasp_report_payments. Existing session order ids are
-- copied once. A row with both razorpay_payment_id and detailed_report_unlocked_at
-- is backfilled as paid because the previous server set those only after a
-- signature check. The amount is the server price passed by the migration
-- runner (__AMOUNT_PAISE__), which is what that server charged.
-- Unlock timestamps with no payment id are left untouched and listed for review.
--
-- Retention (documented only; this migration deletes nothing):
--   in_progress sessions past expires_at become expired lazily on access.
--   completed, abandoned, superseded, expired, and all payment rows are kept.
--   Health answers plus name, phone, and email need an owner decision on
--   retention window and consent basis before any cleanup job is added.

ALTER TABLE iasp_guest_sessions DROP CONSTRAINT IF EXISTS iasp_guest_sessions_status_check;
--> statement-breakpoint
ALTER TABLE iasp_guest_sessions ADD CONSTRAINT iasp_guest_sessions_status_check
  CHECK (status IN ('in_progress', 'completed', 'abandoned', 'superseded', 'expired'));
--> statement-breakpoint
ALTER TABLE iasp_guest_sessions ADD COLUMN IF NOT EXISTS idempotency_key varchar(64);
--> statement-breakpoint
ALTER TABLE iasp_guest_sessions ADD COLUMN IF NOT EXISTS access_token_hash varchar(64);
--> statement-breakpoint
ALTER TABLE iasp_guest_sessions ADD COLUMN IF NOT EXISTS full_name varchar(255);
--> statement-breakpoint
ALTER TABLE iasp_guest_sessions ADD COLUMN IF NOT EXISTS phone_number varchar(32);
--> statement-breakpoint
ALTER TABLE iasp_guest_sessions ADD COLUMN IF NOT EXISTS email varchar(255);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS iasp_guest_sessions_idempotency_key_unique
  ON iasp_guest_sessions (idempotency_key);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS iasp_guest_sessions_access_token_hash_unique
  ON iasp_guest_sessions (access_token_hash);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS iasp_report_payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL REFERENCES iasp_guest_sessions(id) ON DELETE RESTRICT,
  razorpay_order_id varchar(100) NOT NULL,
  razorpay_payment_id varchar(100),
  status varchar(20) NOT NULL DEFAULT 'created',
  amount_paise integer NOT NULL,
  currency varchar(3) NOT NULL,
  product varchar(64) NOT NULL DEFAULT 'iasp_detailed_report',
  payment_attempts jsonb NOT NULL DEFAULT '[]'::jsonb,
  verified_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT iasp_report_payments_status_check
    CHECK (status IN ('created', 'pending', 'paid', 'failed', 'cancelled'))
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS iasp_report_payments_order_id_unique
  ON iasp_report_payments (razorpay_order_id);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS iasp_report_payments_payment_id_unique
  ON iasp_report_payments (razorpay_payment_id);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS iasp_report_payments_one_open_idx
  ON iasp_report_payments (session_id)
  WHERE status IN ('created', 'pending');
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS iasp_report_payments_one_paid_idx
  ON iasp_report_payments (session_id)
  WHERE status = 'paid';
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS iasp_report_payments_session_id_idx
  ON iasp_report_payments (session_id);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS iasp_payment_webhook_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id varchar(255) NOT NULL,
  event_type varchar(64) NOT NULL,
  razorpay_order_id varchar(100),
  razorpay_payment_id varchar(100),
  received_at timestamptz NOT NULL DEFAULT now()
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS iasp_payment_webhook_events_event_id_unique
  ON iasp_payment_webhook_events (event_id);
--> statement-breakpoint
INSERT INTO iasp_report_payments (
  session_id,
  razorpay_order_id,
  razorpay_payment_id,
  status,
  amount_paise,
  currency,
  product,
  payment_attempts,
  verified_at,
  created_at,
  updated_at
)
SELECT
  s.id,
  s.razorpay_order_id,
  s.razorpay_payment_id,
  CASE
    WHEN s.razorpay_payment_id IS NOT NULL AND s.detailed_report_unlocked_at IS NOT NULL THEN 'paid'
    ELSE 'created'
  END,
  __AMOUNT_PAISE__,
  'INR',
  'iasp_detailed_report',
  CASE
    WHEN s.razorpay_payment_id IS NOT NULL AND s.detailed_report_unlocked_at IS NOT NULL THEN
      jsonb_build_array(jsonb_build_object(
        'paymentId', s.razorpay_payment_id,
        'outcome', 'paid',
        'at', to_char(s.detailed_report_unlocked_at AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"')
      ))
    ELSE '[]'::jsonb
  END,
  CASE
    WHEN s.razorpay_payment_id IS NOT NULL AND s.detailed_report_unlocked_at IS NOT NULL
      THEN s.detailed_report_unlocked_at
    ELSE NULL
  END,
  s.created_at,
  s.updated_at
FROM iasp_guest_sessions s
WHERE s.razorpay_order_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM iasp_report_payments p WHERE p.razorpay_order_id = s.razorpay_order_id
  );
