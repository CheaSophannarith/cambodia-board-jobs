-- Replace subscription_plan enum with new values
-- WARNING: This will fail if you have existing data using basic/premium/enterprise
-- Only run this on a fresh database or after migrating existing data

BEGIN;

-- Step 1: Create new enum type with desired values
CREATE TYPE subscription_plan_new AS ENUM ('free', 'weekly', 'monthly', 'yearly');

-- Step 2: Alter the subscriptions table to use the new enum
-- First, change column to text temporarily
ALTER TABLE subscriptions
    ALTER COLUMN plan_type TYPE TEXT;

-- Step 3: Drop old enum
DROP TYPE subscription_plan;

-- Step 4: Rename new enum to original name
ALTER TYPE subscription_plan_new RENAME TO subscription_plan;

-- Step 5: Convert column back to enum
ALTER TABLE subscriptions
    ALTER COLUMN plan_type TYPE subscription_plan USING plan_type::subscription_plan;

-- Step 6: Set default value
ALTER TABLE subscriptions
    ALTER COLUMN plan_type SET DEFAULT 'free';

COMMIT;
