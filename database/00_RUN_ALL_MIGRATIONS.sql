-- ═══════════════════════════════════════════════════════════════════
-- COMPLETE MIGRATION SCRIPT FOR KHQR PAYMENT SYSTEM
-- Run this entire file in Supabase SQL Editor
-- ═══════════════════════════════════════════════════════════════════

-- ═══════════════════════════════════════════════════════════════════
-- STEP 1: Update subscription plan enum
-- ═══════════════════════════════════════════════════════════════════

DO $$
BEGIN
    -- Add new subscription plan types if they don't exist
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'weekly' AND enumtypid = 'subscription_plan'::regtype) THEN
        ALTER TYPE subscription_plan ADD VALUE 'weekly';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'monthly' AND enumtypid = 'subscription_plan'::regtype) THEN
        ALTER TYPE subscription_plan ADD VALUE 'monthly';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'yearly' AND enumtypid = 'subscription_plan'::regtype) THEN
        ALTER TYPE subscription_plan ADD VALUE 'yearly';
    END IF;
END $$;

-- ═══════════════════════════════════════════════════════════════════
-- STEP 2: Clean up unused columns
-- ═══════════════════════════════════════════════════════════════════

-- Remove unused columns from subscriptions
ALTER TABLE subscriptions DROP COLUMN IF EXISTS featured_jobs_limit;
ALTER TABLE subscriptions DROP COLUMN IF EXISTS featured_jobs_used;
ALTER TABLE subscriptions DROP COLUMN IF EXISTS price_paid;
ALTER TABLE subscriptions DROP COLUMN IF EXISTS payment_status;
ALTER TABLE subscriptions DROP COLUMN IF EXISTS stripe_subscription_id;

-- Update constraint
ALTER TABLE subscriptions DROP CONSTRAINT IF EXISTS valid_usage_limits;
ALTER TABLE subscriptions
ADD CONSTRAINT valid_usage_limits
CHECK (job_posts_used <= job_posts_limit);

-- Remove Stripe columns from payments
ALTER TABLE payments DROP COLUMN IF EXISTS stripe_payment_intent_id;
ALTER TABLE payments DROP COLUMN IF EXISTS stripe_charge_id;

-- ═══════════════════════════════════════════════════════════════════
-- STEP 3: Update payments table for KHQR
-- ═══════════════════════════════════════════════════════════════════

-- Make subscription_id nullable (payment exists before subscription)
ALTER TABLE payments
ALTER COLUMN subscription_id DROP NOT NULL;

-- Add KHQR fields
ALTER TABLE payments
ADD COLUMN IF NOT EXISTS plan_type TEXT,
ADD COLUMN IF NOT EXISTS company_id BIGINT REFERENCES companies(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS qr_code_data TEXT,
ADD COLUMN IF NOT EXISTS transaction_reference TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS khqr_transaction_id TEXT,
ADD COLUMN IF NOT EXISTS qr_expires_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS provider_name TEXT;

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_payments_company_id ON payments(company_id);
CREATE INDEX IF NOT EXISTS idx_payments_transaction_reference ON payments(transaction_reference);
CREATE INDEX IF NOT EXISTS idx_payments_khqr_transaction_id ON payments(khqr_transaction_id);
CREATE INDEX IF NOT EXISTS idx_payments_pending
ON payments(payment_status, subscription_id)
WHERE payment_status = 'pending' AND subscription_id IS NULL;

-- Add constraint
ALTER TABLE payments
ADD CONSTRAINT valid_plan_type
CHECK (plan_type IN ('free', 'weekly', 'monthly', 'yearly') OR plan_type IS NULL);

-- Add comments
COMMENT ON COLUMN payments.subscription_id IS 'NULL until subscription is created after successful payment';
COMMENT ON COLUMN payments.plan_type IS 'Subscription plan type user is purchasing (weekly, monthly, yearly)';
COMMENT ON COLUMN payments.company_id IS 'Company making the payment (set immediately when payment initiated)';
COMMENT ON COLUMN payments.qr_code_data IS 'KHQR code string for QR code display';
COMMENT ON COLUMN payments.transaction_reference IS 'Unique reference ID for this payment transaction';
COMMENT ON COLUMN payments.khqr_transaction_id IS 'Transaction ID from KHQR provider after payment confirmation';
COMMENT ON COLUMN payments.qr_expires_at IS 'Expiration timestamp for dynamic QR codes';
COMMENT ON COLUMN payments.provider_name IS 'KHQR provider name (ABA, Wing, Pi Pay, etc.)';

-- ═══════════════════════════════════════════════════════════════════
-- STEP 4: Add default subscriptions
-- ═══════════════════════════════════════════════════════════════════

-- Insert free subscription for companies that don't have one
INSERT INTO subscriptions (company_id, plan_type, job_posts_limit, job_posts_used, is_active)
SELECT
    c.id,
    'free'::subscription_plan,
    3,
    COALESCE(c.total_job, 0),
    true
FROM companies c
WHERE NOT EXISTS (
    SELECT 1 FROM subscriptions s
    WHERE s.company_id = c.id AND s.is_active = true
);

-- Create trigger function
CREATE OR REPLACE FUNCTION create_default_subscription()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO subscriptions (company_id, plan_type, job_posts_limit, job_posts_used, is_active)
    VALUES (NEW.id, 'free', 3, 0, true);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop and recreate trigger
DROP TRIGGER IF EXISTS auto_create_subscription_trigger ON companies;

CREATE TRIGGER auto_create_subscription_trigger
    AFTER INSERT ON companies
    FOR EACH ROW
    EXECUTE FUNCTION create_default_subscription();

-- Add index
CREATE INDEX IF NOT EXISTS idx_subscriptions_company_active
    ON subscriptions(company_id, is_active)
    WHERE is_active = true;

COMMENT ON TRIGGER auto_create_subscription_trigger ON companies IS
    'Automatically creates a free subscription when a new company is registered';

-- ═══════════════════════════════════════════════════════════════════
-- VERIFICATION
-- ═══════════════════════════════════════════════════════════════════

-- Check subscription columns
SELECT 'Subscriptions columns:' as info;
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'subscriptions'
ORDER BY ordinal_position;

-- Check payments columns
SELECT 'Payments columns:' as info;
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'payments'
ORDER BY ordinal_position;

-- Check subscription plan enum values
SELECT 'Subscription plan types:' as info;
SELECT enumlabel as plan_type
FROM pg_enum
WHERE enumtypid = 'subscription_plan'::regtype
ORDER BY enumsortorder;

SELECT '✅ All migrations completed successfully!' as status;
