'use server'

import { createClient } from '@/utils/supabase/server'

export type CompanyApplicationWithDetails = {
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
    }
    job_seeker: {
        id: string
        full_name: string
        email: string
        phone: string | null
        location: string | null
        linkedin_url: string | null
    }
}

type GetCompanyApplicationsResult = {
    success: boolean
    data?: CompanyApplicationWithDetails[]
    error?: string
}

export async function getCompanyApplications(companyId: number): Promise<GetCompanyApplicationsResult> {
    const supabase = await createClient()

    try {
        // First, get all job IDs for this company
        const { data: companyJobs, error: jobsError } = await supabase
            .from('jobs')
            .select('id')
            .eq('company_id', companyId)

        if (jobsError) {
            console.error('Error fetching company jobs:', jobsError)
            return {
                success: false,
                error: 'Failed to fetch company jobs'
            }
        }

        if (!companyJobs || companyJobs.length === 0) {
            return {
                success: true,
                data: []
            }
        }

        const jobIds = companyJobs.map(job => job.id)

        // Fetch all applications for these jobs
        const { data: applications, error: applicationsError } = await supabase
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
                    title
                )
            `)
            .in('job_id', jobIds)
            .order('applied_at', { ascending: false })

        if (applicationsError) {
            console.error('Error fetching applications:', {
                message: applicationsError.message,
                details: applicationsError.details,
                hint: applicationsError.hint,
                code: applicationsError.code
            })
            return {
                success: false,
                error: applicationsError.message || 'Failed to fetch applications'
            }
        }

        // Fetch profiles separately for all job seeker IDs
        const jobSeekerIds = applications.map(app => app.job_seeker_id)
        const { data: profiles, error: profilesError } = await supabase
            .from('profiles')
            .select('id, user_id, full_name, phone, location, linkedin_url')
            .in('id', jobSeekerIds)

        if (profilesError) {
            console.error('Error fetching profiles:', {
                message: profilesError.message,
                details: profilesError.details,
                hint: profilesError.hint,
                code: profilesError.code
            })
            return {
                success: false,
                error: profilesError.message || 'Failed to fetch profiles'
            }
        }

        // Fetch user emails from auth.users
        const userIds = profiles.map(p => p.user_id)
        const { data: authUsers } = await supabase.auth.admin.listUsers()
        const emailMap = new Map(
            authUsers.users
                .filter(u => userIds.includes(u.id))
                .map(u => [u.id, u.email])
        )

        // Create a map of profiles by ID for easy lookup
        const profileMap = new Map(profiles.map(p => [p.id, { ...p, email: emailMap.get(p.user_id) || '' }]))

        // Transform application data
        const transformedData: CompanyApplicationWithDetails[] = applications.map((app: any) => {
            const profile = profileMap.get(app.job_seeker_id)

            return {
                id: app.id,
                job_id: app.job_id,
                job_seeker_id: app.job_seeker_id,
                cover_letter: app.cover_letter,
                resume_url: app.resume_url,
                status: app.status,
                applied_at: app.applied_at,
                job: {
                    id: app.jobs.id,
                    title: app.jobs.title
                },
                job_seeker: {
                    id: profile?.id || app.job_seeker_id,
                    full_name: profile?.full_name || 'Unknown',
                    email: profile?.email || '',
                    phone: profile?.phone || null,
                    location: profile?.location || null,
                    linkedin_url: profile?.linkedin_url || null
                }
            }
        })

        console.log('Transformed application data:', transformedData);

        return {
            success: true,
            data: transformedData
        }
    } catch (error) {
        console.error('Unexpected error fetching company applications:', error)
        return {
            success: false,
            error: 'An unexpected error occurred'
        }
    }
}
