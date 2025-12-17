'use server';


import { createClient } from '@/utils/supabase/server'

/**
 * Fetches company details by company ID.
 *
 * @param {string} comId - The ID of the company to fetch.
 * @returns {Object|null} The company details or null if not found.
 */

export async function getCompanyById(comId: string) {

    const supabase = await createClient()

    const { data: company, error } = await supabase
        .from('companies')
        .select('*')
        .eq('id', comId)
        .single()

    const totalJobs = await supabase
        .from('jobs')
        .select('id', { count: 'exact' })
        .eq('company_id', comId);

    console.log('Total jobs for company:', totalJobs.count);

    if (error) {
        console.error('Error fetching company by ID:', error)
        return null
    }

    // Convert logo_url path to public URL

    let companyWithPublicUrl = company;

    if (company?.logo_url) {
        const { data } = supabase.storage
            .from('company-logos')
            .getPublicUrl(company.logo_url);
        companyWithPublicUrl = {
            ...company,
            logo_url: data.publicUrl
        };
    }

    return { ...companyWithPublicUrl, total_jobs: totalJobs.count || 0 };
}