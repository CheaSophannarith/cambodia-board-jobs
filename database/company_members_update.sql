-- Schema Update: Support Multiple Users Per Company
-- This allows companies to have multiple team members with one admin

-- Step 1: Create company member role enum
CREATE TYPE company_member_role AS ENUM ('admin', 'recruiter', 'member', 'viewer');

-- Step 2: Create company_members table (many-to-many relationship)
CREATE TABLE company_members (
    id BIGSERIAL PRIMARY KEY,
    company_id BIGINT NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    role company_member_role NOT NULL DEFAULT 'member',
    is_active BOOLEAN DEFAULT true,
    invited_by UUID REFERENCES profiles(id),
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    -- One user can only be in a company once
    UNIQUE(company_id, profile_id)
);

-- Step 3: Update companies table to track who created it (but allow multiple users)
-- First, add a new column for the creator/owner
ALTER TABLE companies ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES profiles(id);

-- Optional: If you want to keep track of the primary admin separately
ALTER TABLE companies ADD COLUMN IF NOT EXISTS primary_admin_id UUID REFERENCES profiles(id);

-- Step 4: Create indexes for better performance
CREATE INDEX idx_company_members_company_id ON company_members(company_id);
CREATE INDEX idx_company_members_profile_id ON company_members(profile_id);
CREATE INDEX idx_company_members_role ON company_members(role);
CREATE INDEX idx_company_members_is_active ON company_members(is_active);

-- Step 5: Add constraint to ensure at least one admin per company
-- This is a function that prevents removing the last admin
CREATE OR REPLACE FUNCTION ensure_company_has_admin()
RETURNS TRIGGER AS $$
DECLARE
    admin_count INTEGER;
BEGIN
    -- Check if we're removing an admin or deactivating an admin
    IF (TG_OP = 'DELETE' AND OLD.role = 'admin') OR
       (TG_OP = 'UPDATE' AND OLD.role = 'admin' AND (NEW.role != 'admin' OR NEW.is_active = false)) THEN

        -- Count remaining active admins for this company
        SELECT COUNT(*) INTO admin_count
        FROM company_members
        WHERE company_id = OLD.company_id
          AND role = 'admin'
          AND is_active = true
          AND id != OLD.id;

        -- Prevent if this is the last admin
        IF admin_count = 0 THEN
            RAISE EXCEPTION 'Cannot remove the last admin from the company. Please assign another admin first.';
        END IF;
    END IF;

    IF TG_OP = 'DELETE' THEN
        RETURN OLD;
    ELSE
        RETURN NEW;
    END IF;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER prevent_last_admin_removal
    BEFORE UPDATE OR DELETE ON company_members
    FOR EACH ROW
    EXECUTE FUNCTION ensure_company_has_admin();

-- Step 6: Add trigger for updated_at
CREATE TRIGGER update_company_members_updated_at
    BEFORE UPDATE ON company_members
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Step 7: Migration helper - Add existing company owners to company_members
-- This should be run after the table is created to migrate existing data
-- Uncomment and run this after deploying the new tables:

/*
INSERT INTO company_members (company_id, profile_id, role, is_active, joined_at)
SELECT
    c.id as company_id,
    c.profile_id,
    'admin'::company_member_role as role,
    true as is_active,
    c.created_at as joined_at
FROM companies c
WHERE c.profile_id IS NOT NULL
ON CONFLICT (company_id, profile_id) DO NOTHING;

-- Update companies to set created_by
UPDATE companies c
SET created_by = c.profile_id,
    primary_admin_id = c.profile_id
WHERE c.profile_id IS NOT NULL;
*/

-- Step 8: Optional - Remove the UNIQUE constraint from companies.profile_id
-- This allows the same user to be in multiple companies or removes the 1:1 relationship
-- Only uncomment this if you want users to potentially be in multiple companies

/*
ALTER TABLE companies DROP CONSTRAINT IF EXISTS companies_profile_id_key;
*/

-- Step 9: Create view for easy querying of company members with profile info
CREATE OR REPLACE VIEW company_members_with_profiles AS
SELECT
    cm.id,
    cm.company_id,
    cm.profile_id,
    cm.role,
    cm.is_active,
    cm.invited_by,
    cm.joined_at,
    cm.created_at,
    cm.updated_at,
    p.full_name,
    p.avatar_url,
    p.email,
    p.phone,
    c.company_name
FROM company_members cm
JOIN profiles p ON cm.profile_id = p.id
JOIN companies c ON cm.company_id = c.id;

-- Step 10: Create helper function to check if user is admin of a company
CREATE OR REPLACE FUNCTION is_company_admin(user_profile_id UUID, company_id_param BIGINT)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1
        FROM company_members
        WHERE profile_id = user_profile_id
          AND company_id = company_id_param
          AND role = 'admin'
          AND is_active = true
    );
END;
$$ LANGUAGE plpgsql;

-- Step 11: Create helper function to get user's role in a company
CREATE OR REPLACE FUNCTION get_company_member_role(user_profile_id UUID, company_id_param BIGINT)
RETURNS company_member_role AS $$
DECLARE
    user_role company_member_role;
BEGIN
    SELECT role INTO user_role
    FROM company_members
    WHERE profile_id = user_profile_id
      AND company_id = company_id_param
      AND is_active = true;

    RETURN user_role;
END;
$$ LANGUAGE plpgsql;

-- Notes:
-- 1. When a user creates a company, they should automatically be added as 'admin' in company_members
-- 2. Admins can invite other users and assign roles
-- 3. Permissions by role (suggested):
--    - admin: Full access - manage company, jobs, members, billing
--    - recruiter: Manage jobs, view applications, respond to candidates
--    - member: Create jobs, view applications assigned to them
--    - viewer: Read-only access to company jobs and stats
-- 4. You'll need to update your application code to:
--    a. Check company_members table instead of companies.profile_id
--    b. Verify user has appropriate role before allowing actions
--    c. Add invitation/member management features
