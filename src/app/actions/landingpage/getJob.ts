'use server';

import { revalidatePath } from 'next/cache'
import { createClient } from '@/utils/supabase/server'

/**
 * Fetches all job listings with company image and company name.
 * 
 * @returns [Array] An array of job listings with associated company details.
 */

export async function getJobById(jobId: string) {

    const supabase = await createClient()

    const { data: job, error } = await supabase
        .from('jobs')
        .select(`
            *,
            companies (
                id,
                company_name,
                logo_url,
                company_website,
                linkedin_url
            ),
            job_categories (
                id,
                name
            )
        `)
        .eq('id', jobId)
        .single()

    if (error) {
        console.error('Error fetching job by ID:', error)
        return null
    }

    // Convert logo_url path to public URL
    let jobWithPublicUrl = job;

    if (job?.companies?.logo_url) {
        const { data } = supabase.storage
            .from('company-logos')
            .getPublicUrl(job.companies.logo_url);
        jobWithPublicUrl = {
            ...job,
            companies: {
                ...job.companies,
                logo_url: data.publicUrl
            }
        };
    }

    return jobWithPublicUrl;
}

/**
 * Get Job In that company by company id
 * 
 * @returns [Array] An array of job listings in that company.
 */

export async function getJobsByCompanyId(companyId: string, excludeJobId?: string) {

    const supabase = await createClient()

    let query = supabase
        .from('jobs')
        .select(`
            *,
            companies (
            id,
            company_website,
            linkedin_url,
            company_name,
            logo_url
            )
        `)
        .eq('company_id', companyId);

    // Only exclude a specific job if excludeJobId is provided
    if (excludeJobId) {
        query = query.neq('id', excludeJobId);
    }

    const { data: jobs, error } = await query
        .order('created_at', { ascending: false })
        .limit(6);

    if (error) {
        console.error('Error fetching jobs by company ID:', error)
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

