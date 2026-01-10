-- Update subscription_plan enum to add weekly, monthly, yearly plans
-- This keeps existing values (free, basic, premium, enterprise) for backwards compatibility

-- Add new subscription plan types
ALTER TYPE subscription_plan ADD VALUE IF NOT EXISTS 'weekly';
ALTER TYPE subscription_plan ADD VALUE IF NOT EXISTS 'monthly';
ALTER TYPE subscription_plan ADD VALUE IF NOT EXISTS 'yearly';

-- Note: PostgreSQL doesn't support removing enum values directly
-- If you need to remove old values (basic, premium, enterprise), you'll need to:
-- 1. Create a new enum type
-- 2. Migrate the data
-- 3. Drop the old enum
-- For now, we'll keep both old and new values
