-- Atomic patient MRN allocator.
-- Format: NVK-0000001 … NVK-9999999 (7 digits → 9,999,999 ≥ 1M).
-- nextval is concurrency-safe; patients.mrn UNIQUE is the final guard.

CREATE SEQUENCE IF NOT EXISTS patient_mrn_seq
  AS bigint
  START WITH 1
  INCREMENT BY 1
  MINVALUE 1
  MAXVALUE 9999999
  NO CYCLE
  CACHE 1;
--> statement-breakpoint
-- Advance past any existing numeric NVK-* MRNs so new codes never collide.
SELECT setval(
  'patient_mrn_seq',
  GREATEST(
    1,
    COALESCE(
      (
        SELECT MAX((regexp_replace(mrn, '^NVK-', ''))::bigint)
        FROM patients
        WHERE mrn ~ '^NVK-[0-9]{1,7}$'
      ),
      0
    )
  ),
  true
);
