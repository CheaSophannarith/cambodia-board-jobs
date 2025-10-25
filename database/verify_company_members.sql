-- Verification Script: Check company_members setup
-- Run this to verify everything is configured correctly

-- 1. Check if company_members table exists
SELECT EXISTS (
    SELECT FROM information_schema.tables
    WHERE table_name = 'company_members'
) as table_exists;

-- 2. Check if company_member_role enum exists
SELECT EXISTS (
    SELECT FROM pg_type
    WHERE typname = 'company_member_role'
) as enum_exists;

-- 3. List all company members with their details
SELECT
    cm.id,
    cm.company_id,
    c.company_name,
    cm.profile_id,
    p.full_name,
    p.user_id,
    cm.role,
    cm.is_active,
    cm.joined_at
FROM company_members cm
JOIN companies c ON cm.company_id = c.id
JOIN profiles p ON cm.profile_id = p.id
ORDER BY cm.created_at DESC;

-- 4. Check if profile_id column still exists in companies (should NOT exist)
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'companies'
  AND column_name = 'profile_id';
-- This should return 0 rows

-- 5. Count companies without any admin
SELECT
    c.id,
    c.company_name,
    COUNT(cm.id) as admin_count
FROM companies c
LEFT JOIN company_members cm ON c.id = cm.company_id AND cm.role = 'admin' AND cm.is_active = true
GROUP BY c.id, c.company_name
HAVING COUNT(cm.id) = 0;
-- This should return 0 rows (all companies should have at least one admin)

-- 6. Show summary
SELECT
    'Total Companies' as metric,
    COUNT(*) as count
FROM companies
UNION ALL
SELECT
    'Total Company Members' as metric,
    COUNT(*) as count
FROM company_members
UNION ALL
SELECT
    'Active Admins' as metric,
    COUNT(*) as count
FROM company_members
WHERE role = 'admin' AND is_active = true;
