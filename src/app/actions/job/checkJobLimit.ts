'use server'

import { createClient } from '@/utils/supabase/server'

export async function checkJobLimit() {
    const supabase = await createClient()

    // Get the authenticated user
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { canCreate: false, reason: 'not_authenticated' }
    }

    // Get the profile for this user
    const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .single()

    if (profileError || !profileData) {
        return { canCreate: false, reason: 'no_profile' }
    }

    // Get the company ID through company_members
    const { data: memberData, error: memberError } = await supabase
        .from('company_members')
        .select('company_id, role')
        .eq('profile_id', profileData.id)
        .eq('is_active', true)
        .single()

    if (memberError || !memberData) {
        return { canCreate: false, reason: 'no_company' }
    }

    // Get company data to check total_job count
    const { data: companyData, error: companyError } = await supabase
        .from('companies')
        .select('total_job')
        .eq('id', memberData.company_id)
        .single()

    if (companyError || !companyData) {
        return { canCreate: false, reason: 'company_not_found' }
    }

    // Check if company has reached the free job limit (3 jobs)
    const totalJobs = companyData.total_job ?? 0
    if (totalJobs >= 3) {
        return { canCreate: false, reason: 'limit_reached', totalJobs }
    }

    // All checks passed
    return { canCreate: true, totalJobs }
}
