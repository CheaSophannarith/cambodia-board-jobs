-- SAFE CLEANUP: Remove unused columns from subscriptions and payments
-- This migration only removes columns that are NOT used in your application code
-- Safe to run on production database

-- ═══════════════════════════════════════════════════════════
-- SUBSCRIPTIONS TABLE - Remove 5 unused columns
-- ═══════════════════════════════════════════════════════════

-- 1. Remove featured jobs tracking (feature not implemented)
ALTER TABLE subscriptions DROP COLUMN IF EXISTS featured_jobs_limit;
ALTER TABLE subscriptions DROP COLUMN IF EXISTS featured_jobs_used;

-- 2. Remove redundant price_paid (amount is in payments table)
ALTER TABLE subscriptions DROP COLUMN IF EXISTS price_paid;

-- 3. Remove confusing payment_status (belongs in payments table only)
ALTER TABLE subscriptions DROP COLUMN IF EXISTS payment_status;

-- 4. Remove Stripe-specific column (using KHQR)
ALTER TABLE subscriptions DROP COLUMN IF EXISTS stripe_subscription_id;

-- 5. Update constraint - remove featured_jobs check
ALTER TABLE subscriptions DROP CONSTRAINT IF EXISTS valid_usage_limits;

-- 6. Add back simplified constraint (only job_posts)
ALTER TABLE subscriptions
ADD CONSTRAINT valid_usage_limits
CHECK (job_posts_used <= job_posts_limit);

-- ═══════════════════════════════════════════════════════════
-- PAYMENTS TABLE - Remove 2 Stripe columns
-- ═══════════════════════════════════════════════════════════

-- Remove Stripe-specific columns (using KHQR instead)
ALTER TABLE payments DROP COLUMN IF EXISTS stripe_payment_intent_id;
ALTER TABLE payments DROP COLUMN IF EXISTS stripe_charge_id;

-- Note: Keeping receipt_url - can be used for KHQR receipts

-- ═══════════════════════════════════════════════════════════
-- VERIFICATION QUERIES (optional - just for checking)
-- ═══════════════════════════════════════════════════════════

-- Uncomment to verify remaining columns:

-- SELECT column_name, data_type, is_nullable
-- FROM information_schema.columns
-- WHERE table_name = 'subscriptions'
-- ORDER BY ordinal_position;

-- SELECT column_name, data_type, is_nullable
-- FROM information_schema.columns
-- WHERE table_name = 'payments'
-- ORDER BY ordinal_position;
