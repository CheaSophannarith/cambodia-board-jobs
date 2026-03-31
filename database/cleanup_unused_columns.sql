-- Clean up unused and redundant columns from subscriptions and payments tables
-- Safe to run - removes columns that are not being used

-- ═══════════════════════════════════════════════════════════
-- SUBSCRIPTIONS TABLE CLEANUP
-- ═══════════════════════════════════════════════════════════

-- 1. Drop featured jobs columns (feature not implemented)
ALTER TABLE subscriptions DROP COLUMN IF EXISTS featured_jobs_limit;
ALTER TABLE subscriptions DROP COLUMN IF EXISTS featured_jobs_used;

-- 2. Drop price_paid (redundant - amount is in payments table)
ALTER TABLE subscriptions DROP COLUMN IF EXISTS price_paid;

-- 3. Drop payment_status (belongs in payments table, not subscriptions)
ALTER TABLE subscriptions DROP COLUMN IF EXISTS payment_status;

-- 4. Drop Stripe-specific column (using KHQR instead)
ALTER TABLE subscriptions DROP COLUMN IF EXISTS stripe_subscription_id;

-- 5. Update constraint to remove featured_jobs check
ALTER TABLE subscriptions DROP CONSTRAINT IF EXISTS valid_usage_limits;

-- 6. Add back simplified constraint (only job_posts check)
ALTER TABLE subscriptions
ADD CONSTRAINT valid_usage_limits
CHECK (job_posts_used <= job_posts_limit);

-- ═══════════════════════════════════════════════════════════
-- PAYMENTS TABLE CLEANUP
-- ═══════════════════════════════════════════════════════════

-- 1. Drop Stripe-specific columns (using KHQR instead)
ALTER TABLE payments DROP COLUMN IF EXISTS stripe_payment_intent_id;
ALTER TABLE payments DROP COLUMN IF EXISTS stripe_charge_id;

-- Note: Keeping receipt_url as it can be used for KHQR receipts too

-- ═══════════════════════════════════════════════════════════
-- VERIFICATION
-- ═══════════════════════════════════════════════════════════

-- Check remaining columns in subscriptions
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'subscriptions'
ORDER BY ordinal_position;

-- Check remaining columns in payments
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'payments'
ORDER BY ordinal_position;
