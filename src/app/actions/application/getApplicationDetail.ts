'use server'

import { createClient, createServiceClient } from '@/utils/supabase/server'

export type ApplicationDetail = {
    id: string
    job_id: number
    job_seeker_id: string
    cover_letter: string
    resume_url: string | null
    status: 'pending' | 'accepted' | 'rejected' | 'reviewing'
    applied_at: string
    job: {
        id: number
        title: string
        description: string
        location: string
        job_type: string
        salary_min: number | null
        salary_max: number | null
        currency: string | null
        experience_level: string
        company_id: number
    }
    job_seeker: {
        id: string
        full_name: string
        email: string
        phone: string | null
        location: string | null
        linkedin_url: string | null
        avatar_url: string | null
    }
}

type GetApplicationDetailResult = {
    success: boolean
    data?: ApplicationDetail
    error?: string
}

export async function getApplicationDetail(applicationId: string, isRead?: boolean): Promise<GetApplicationDetailResult> {
    const supabase = await createClient()

    try {

        if (isRead) {
            // Mark notification as read if isRead is true
            const { error: markReadError } = await supabase
                .from('notifications')
                .update({ is_read: true, read_at: new Date().toISOString() })
                .eq('related_application_id', applicationId)
            
            if (markReadError) {
                console.error('Error marking notification as read:', markReadError)
            }
        }

        // Fetch application with full job and job seeker details
        const { data: application, error: applicationError } = await supabase
            .from('applications')
            .select(`
                id,
                job_id,
                job_seeker_id,
                cover_letter,
                resume_url,
                status,
                applied_at,
                jobs (
                    id,
                    title,
                    description,
                    location,
                    job_type,
                    salary_min,
                    salary_max,
                    salary_currency,
                    experience_level,
                    company_id
                )
            `)
            .eq('id', applicationId)
            .single()

        if (applicationError || !application) {
            console.error('Error fetching application:', applicationError)
            return {
                success: false,
                error: 'Application not found'
            }
        }

        // Check if job data exists
        const jobData = (application as any).jobs;
        if (!jobData) {
            console.error('Job data not found for application')
            return {
                success: false,
                error: 'Job data not found'
            }
        }

        // Fetch job seeker profile
        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('id, user_id, full_name, phone, location, linkedin_url, avatar_url')
            .eq('id', application.job_seeker_id)
            .single()

        if (profileError || !profile) {
            console.error('Error fetching profile:', profileError)
            return {
                success: false,
                error: 'Profile not found'
            }
        }

        // Fetch user email from auth.users using service role client
        const serviceSupabase = createServiceClient()
        const { data: { user: authUser }, error: authError } = await serviceSupabase.auth.admin.getUserById(profile.user_id)
        
        if (authError) {
            console.error('Error fetching auth user:', authError)
        }
        
        const userEmail = authUser?.email || ''
        console.log('Fetched user email:', userEmail, 'for user_id:', profile.user_id)

        const result: ApplicationDetail = {
            id: application.id,
            job_id: application.job_id,
            job_seeker_id: application.job_seeker_id,
            cover_letter: application.cover_letter,
            resume_url: application.resume_url,
            status: application.status,
            applied_at: application.applied_at,
            job: {
                id: jobData.id,
                title: jobData.title,
                description: jobData.description,
                location: jobData.location,
                job_type: jobData.job_type,
                salary_min: jobData.salary_min,
                salary_max: jobData.salary_max,
                currency: jobData.salary_currency,
                experience_level: jobData.experience_level,
                company_id: jobData.company_id
            },
            job_seeker: {
                id: profile.id,
                full_name: profile.full_name || 'Unknown',
                email: userEmail,
                phone: profile.phone,
                location: profile.location,
                linkedin_url: profile.linkedin_url,
                avatar_url: profile.avatar_url
            }
        }

        return {
            success: true,
            data: result
        }
    } catch (error) {
        console.error('Unexpected error fetching application detail:', error)
        return {
            success: false,
            error: 'An unexpected error occurred'
        }
    }
}

export default async function updateStatus(applicationId: string, status: 'pending' | 'accepted' | 'rejected' | 'reviewing'): Promise<GetApplicationDetailResult> {

    const supabase = await createClient()

    try {
        const { error: updateError } = await supabase
            .from('applications')
            .update({ status })
            .eq('id', applicationId)

        if (updateError) {
            console.error('Error updating application status:', updateError)
            return {
                success: false,
                error: 'Failed to update application status'
            }
        }

        return await getApplicationDetail(applicationId)
    }

    catch (error) {
        console.error('Unexpected error updating application status:', error)
        return {
            success: false,
            error: 'An unexpected error occurred'
        }
    }

}
