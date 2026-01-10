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

    // Get active subscription to check job posting limit
    const { data: subscriptionData, error: subscriptionError } = await supabase
        .from('subscriptions')
        .select('plan_type, job_posts_limit, job_posts_used, end_date')
        .eq('company_id', memberData.company_id)
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

    if (subscriptionError || !subscriptionData) {
        return { canCreate: false, reason: 'no_subscription' }
    }

    // Check if subscription has expired
    if (subscriptionData.end_date) {
        const now = new Date()
        const endDate = new Date(subscriptionData.end_date)
        if (now > endDate) {
            return {
                canCreate: false,
                reason: 'subscription_expired',
                planType: subscriptionData.plan_type
            }
        }
    }

    // Check if job posting limit has been reached
    const jobsUsed = subscriptionData.job_posts_used ?? 0
    const jobsLimit = subscriptionData.job_posts_limit ?? 0

    if (jobsUsed >= jobsLimit) {
        return {
            canCreate: false,
            reason: 'limit_reached',
            planType: subscriptionData.plan_type,
            jobsUsed,
            jobsLimit
        }
    }

    // All checks passed
    return {
        canCreate: true,
        planType: subscriptionData.plan_type,
        jobsUsed,
        jobsLimit,
        remainingJobs: jobsLimit - jobsUsed
    }
}
