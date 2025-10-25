'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/utils/supabase/server'

export async function createJob(formData: FormData) {
    const supabase = await createClient()

    // Get the authenticated user
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { success: false, message: 'User not authenticated' }
    }

    // First, get the profile for this user
    const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .single()

    if (profileError || !profileData) {
        console.error('Error fetching profile:', profileError)
        return { success: false, message: 'Profile not found. Please create your profile first.' }
    }

    // Get the company ID for the current user through company_members
    // Use profile.id (not user.id) because company_members.profile_id references profiles.id
    const { data: memberData, error: memberError } = await supabase
        .from('company_members')
        .select('company_id, role, is_active')
        .eq('profile_id', profileData.id)
        .eq('is_active', true)
        .single()

    console.log('Member Data:', memberData);

    if (memberError || !memberData) {
        console.error('Error fetching company membership:', memberError)
        return { success: false, message: 'You are not a member of any company. Please create a company profile first.' }
    }

    // Check if user has permission to create jobs (admin or recruiter)
    if (memberData.role !== 'admin' && memberData.role !== 'recruiter') {
        return { success: false, message: 'You do not have permission to create jobs. Contact your company admin.' }
    }

    const companyId = memberData.company_id

    // Extract form data
    const title = formData.get('title') as string
    const categoryId = formData.get('category_id') as string
    const description = formData.get('description') as string
    const location = formData.get('location') as string
    const isRemote = formData.get('is_remote') === 'true'
    const jobType = formData.get('job_type') as string
    const experienceLevel = formData.get('experience_level') as string
    const salaryMin = formData.get('salary_min') as string
    const salaryMax = formData.get('salary_max') as string
    const salaryCurrency = formData.get('salary_currency') as string
    const applicationDeadline = formData.get('application_deadline') as string
    const requirementsJson = formData.get('requirements') as string
    const benefitsJson = formData.get('benefits') as string
    const tagsJson = formData.get('tags') as string

    // Parse JSON fields
    let requirements: string[] = []
    let benefits: string[] = []
    let tags: string[] | null = null

    try {
        requirements = JSON.parse(requirementsJson)
        benefits = JSON.parse(benefitsJson)
        if (tagsJson) {
            tags = JSON.parse(tagsJson)
        }
    } catch (error) {
        console.error('Error parsing JSON fields:', error)
        return { success: false, message: 'Invalid data format' }
    }

    // Prepare job data
    const jobData: any = {
        company_id: companyId,
        category_id: categoryId ? parseInt(categoryId) : null,
        title,
        description,
        location,
        is_remote: isRemote,
        job_type: jobType,
        experience_level: experienceLevel,
        requirements,
        benefits,
        salary_currency: salaryCurrency,
        status: 'active'
    }

    // Add optional fields
    if (salaryMin) {
        jobData.salary_min = parseInt(salaryMin)
    }
    if (salaryMax) {
        jobData.salary_max = parseInt(salaryMax)
    }
    if (applicationDeadline) {
        jobData.application_deadline = applicationDeadline
    }
    if (tags && tags.length > 0) {
        jobData.tags = tags
    }

    // Insert job into database
    const { data: job, error: jobError } = await supabase
        .from('jobs')
        .insert(jobData)
        .select()
        .single()

    if (jobError) {
        console.error('Error creating job:', jobError)
        return { success: false, message: `Error creating job: ${jobError.message}` }
    }

    // Revalidate the job list page to show the new job
    revalidatePath('/job-list')

    // Return success response
    return { success: true, jobId: job.id }
}
