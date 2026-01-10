-- Triggers to automatically manage job_posts_used counter in subscriptions
-- This ensures the counter stays accurate when jobs are created or deleted

-- Function to decrement job_posts_used when a job is deleted
CREATE OR REPLACE FUNCTION decrement_subscription_job_count()
RETURNS TRIGGER AS $$
DECLARE
    active_subscription_id BIGINT;
BEGIN
    -- Find the active subscription for this company
    SELECT id INTO active_subscription_id
    FROM subscriptions
    WHERE company_id = OLD.company_id
      AND is_active = true
    ORDER BY created_at DESC
    LIMIT 1;

    -- Decrement job_posts_used if there's an active subscription
    -- Make sure it doesn't go below 0
    IF active_subscription_id IS NOT NULL THEN
        UPDATE subscriptions
        SET job_posts_used = GREATEST(0, job_posts_used - 1)
        WHERE id = active_subscription_id;

        RAISE NOTICE 'Decremented job_posts_used for subscription % (company %)', active_subscription_id, OLD.company_id;
    END IF;

    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- Drop trigger if exists and recreate
DROP TRIGGER IF EXISTS decrement_subscription_on_job_delete ON jobs;

-- Create trigger that fires AFTER a job is deleted
CREATE TRIGGER decrement_subscription_on_job_delete
    AFTER DELETE ON jobs
    FOR EACH ROW
    EXECUTE FUNCTION decrement_subscription_job_count();

COMMENT ON TRIGGER decrement_subscription_on_job_delete ON jobs IS
    'Automatically decrements job_posts_used when a job is deleted, allowing companies to post again';

-- Optional: Function to increment job_posts_used when a job is created
-- This is a backup in case the application code fails to increment
CREATE OR REPLACE FUNCTION increment_subscription_job_count()
RETURNS TRIGGER AS $$
DECLARE
    active_subscription_id BIGINT;
BEGIN
    -- Find the active subscription for this company
    SELECT id INTO active_subscription_id
    FROM subscriptions
    WHERE company_id = NEW.company_id
      AND is_active = true
    ORDER BY created_at DESC
    LIMIT 1;

    -- Increment job_posts_used if there's an active subscription
    IF active_subscription_id IS NOT NULL THEN
        UPDATE subscriptions
        SET job_posts_used = job_posts_used + 1
        WHERE id = active_subscription_id;

        RAISE NOTICE 'Incremented job_posts_used for subscription % (company %)', active_subscription_id, NEW.company_id;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop trigger if exists and recreate
DROP TRIGGER IF EXISTS increment_subscription_on_job_create ON jobs;

-- Create trigger that fires AFTER a job is created
-- This is a backup - the application code (createJob.ts) already does this
CREATE TRIGGER increment_subscription_on_job_create
    AFTER INSERT ON jobs
    FOR EACH ROW
    EXECUTE FUNCTION increment_subscription_job_count();

COMMENT ON TRIGGER increment_subscription_on_job_create ON jobs IS
    'Backup trigger to increment job_posts_used when a job is created (primary increment is in application code)';
