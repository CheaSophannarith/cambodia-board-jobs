'use server';

import { createClient } from '@/utils/supabase/server'

/**
 * Fetches all companies with their logos.
 *
 * @returns [Array] An array of companies.
 */

export async function getCompanies() {
    const supabase = await createClient()

    const { data: companies, error } = await supabase
        .from('companies')
        .select('*')
        .order('company_name', { ascending: true })

    if (error) {
        console.error('Error fetching companies:', error)
        return []
    }

    // Convert logo_url paths to public URLs
    const companiesWithPublicUrls = companies?.map(company => {
        if (company.logo_url) {
            const { data } = supabase.storage
                .from('company-logos')
                .getPublicUrl(company.logo_url);
            return {
                ...company,
                logo_url: data.publicUrl
            };
        }
        return company;
    }) || [];

    return companiesWithPublicUrls;
}
