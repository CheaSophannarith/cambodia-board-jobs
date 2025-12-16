'use server';

import { revalidatePath } from 'next/cache'
import { createClient } from '@/utils/supabase/server'

/**
 * Fetches all job listings with company image and company name.
 * @returns [Array] An array of job listings with associated company details.
 */
export async function getAllJobs() {

    const supabase = await createClient()
    const { data: jobs, error } = await supabase
        .from('jobs')
        .select(`
            *,
            companies (
                id,
                company_name,
                logo_url
            )
        `)
        .order('created_at', { ascending: false })

    if (error) {
        console.error('Error fetching jobs:', error)
        return []
    }

    // Convert logo_url paths to public URLs
    const jobsWithPublicUrls = jobs?.map(job => {
        if (job.companies?.logo_url) {
            const { data } = supabase.storage
                .from('company-logos')
                .getPublicUrl(job.companies.logo_url);

            return {
                ...job,
                companies: {
                    ...job.companies,
                    logo_url: data.publicUrl
                }
            };
        }
        return job;
    }) || [];

    return jobsWithPublicUrls;
}