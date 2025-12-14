'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/utils/supabase/server'

export async function getAllJobs(companyId: string, jobTitleFilter?: string) {

    const supabase = await createClient()

    const { data: jobs, error } = await supabase
        .from('jobs')
        .select('*')
        .eq('company_id', companyId)
        .ilike('title', `%${jobTitleFilter || ''}%`)
        .order('created_at', { ascending: false })

    if (error) {
        console.error('Error fetching jobs:', error)
        return []
    }

    return jobs || []
}