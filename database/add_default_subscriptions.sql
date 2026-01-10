-- Add default free subscriptions for all existing companies
-- This migration ensures every company has an active subscription record

-- Insert free subscription for companies that don't have one
INSERT INTO subscriptions (company_id, plan_type, job_posts_limit, job_posts_used, is_active)
SELECT
    c.id,
    'free'::subscription_plan,
    3, -- Free tier gets 3 job posts
    COALESCE(c.total_job, 0), -- Migrate existing total_job count
    true
FROM companies c
WHERE NOT EXISTS (
    SELECT 1 FROM subscriptions s
    WHERE s.company_id = c.id AND s.is_active = true
);

-- Create a trigger to auto-create free subscription when new company is created
CREATE OR REPLACE FUNCTION create_default_subscription()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO subscriptions (company_id, plan_type, job_posts_limit, job_posts_used, is_active)
    VALUES (NEW.id, 'free', 3, 0, true);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop trigger if exists and recreate
DROP TRIGGER IF EXISTS auto_create_subscription_trigger ON companies;

CREATE TRIGGER auto_create_subscription_trigger
    AFTER INSERT ON companies
    FOR EACH ROW
    EXECUTE FUNCTION create_default_subscription();

-- Add index for faster subscription lookups
CREATE INDEX IF NOT EXISTS idx_subscriptions_company_active
    ON subscriptions(company_id, is_active)
    WHERE is_active = true;

COMMENT ON TRIGGER auto_create_subscription_trigger ON companies IS
    'Automatically creates a free subscription when a new company is registered';
