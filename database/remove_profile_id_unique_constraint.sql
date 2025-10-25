-- Remove UNIQUE constraint from companies.profile_id
-- This allows:
-- 1. One user to create multiple companies (if needed in future)
-- 2. Keep profile_id as reference to creator, but company_members is source of truth for membership

-- Step 1: Remove the UNIQUE constraint
ALTER TABLE companies DROP CONSTRAINT IF EXISTS companies_profile_id_key;

-- Step 2: Keep the column but it's now just a reference field, not enforcing uniqueness
-- The company_members table is now the source of truth for who belongs to which company

-- Step 3: Optionally rename it to be clearer
-- Uncomment this if you want to rename profile_id to created_by for clarity:
-- ALTER TABLE companies RENAME COLUMN profile_id TO created_by;

-- Note: We keep the column for backward compatibility and to track who created the company
-- But all membership and permission checks should use company_members table
