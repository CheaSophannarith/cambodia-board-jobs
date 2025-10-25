-- Simple Company Members Table Addition
-- Run this to add multi-user support to companies

-- 1. Drop is_company_admin column from profiles if it exists (we're replacing it with company_members)
ALTER TABLE profiles DROP COLUMN IF EXISTS is_company_admin;

-- 1b. Remove UNIQUE constraint from companies.profile_id
-- (profile_id is now just a reference to creator, company_members is source of truth)
ALTER TABLE companies DROP CONSTRAINT IF EXISTS companies_profile_id_key;

-- 2. Create role enum (only if it doesn't exist)
DO $$ BEGIN
    CREATE TYPE company_member_role AS ENUM ('admin', 'recruiter', 'member', 'viewer');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 3. Create company_members table (only if it doesn't exist)
CREATE TABLE IF NOT EXISTS company_members (
    id BIGSERIAL PRIMARY KEY,
    company_id BIGINT NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    role company_member_role NOT NULL DEFAULT 'member',
    is_active BOOLEAN DEFAULT true,
    invited_by UUID REFERENCES profiles(id),
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(company_id, profile_id)
);

-- 4. Create indexes
CREATE INDEX idx_company_members_company_id ON company_members(company_id);
CREATE INDEX idx_company_members_profile_id ON company_members(profile_id);
CREATE INDEX idx_company_members_role ON company_members(role);

-- 5. Migrate existing company owners to company_members as admins
-- Only migrate if the profile actually exists (to avoid FK constraint errors)
INSERT INTO company_members (company_id, profile_id, role, is_active, joined_at)
SELECT
    c.id as company_id,
    c.profile_id,
    'admin'::company_member_role as role,
    true as is_active,
    c.created_at as joined_at
FROM companies c
INNER JOIN profiles p ON c.profile_id = p.id  -- Only include if profile exists
WHERE c.profile_id IS NOT NULL
ON CONFLICT (company_id, profile_id) DO NOTHING;
