-- Update payments table to support KHQR flow
-- Make subscription_id nullable since payment happens before subscription activation

-- 1. Make subscription_id nullable (payment can exist without subscription initially)
ALTER TABLE payments
ALTER COLUMN subscription_id DROP NOT NULL;

-- 2. Add plan_type to track which subscription plan user is paying for
ALTER TABLE payments
ADD COLUMN IF NOT EXISTS plan_type TEXT;

-- 3. Add company_id to link payment to company directly
ALTER TABLE payments
ADD COLUMN IF NOT EXISTS company_id BIGINT REFERENCES companies(id) ON DELETE CASCADE;

-- 4. Create index for faster company payment lookups
CREATE INDEX IF NOT EXISTS idx_payments_company_id ON payments(company_id);

-- 5. Create index for pending payments (NULL subscription_id + pending status)
CREATE INDEX IF NOT EXISTS idx_payments_pending
ON payments(payment_status, subscription_id)
WHERE payment_status = 'pending' AND subscription_id IS NULL;

-- 6. Add comments for documentation
COMMENT ON COLUMN payments.subscription_id IS 'NULL until subscription is created after successful payment';
COMMENT ON COLUMN payments.plan_type IS 'Subscription plan type user is purchasing (weekly, monthly, yearly)';
COMMENT ON COLUMN payments.company_id IS 'Company making the payment (set immediately when payment initiated)';

-- 7. Add constraint to ensure plan_type is valid
ALTER TABLE payments
ADD CONSTRAINT valid_plan_type
CHECK (plan_type IN ('free', 'weekly', 'monthly', 'yearly') OR plan_type IS NULL);
