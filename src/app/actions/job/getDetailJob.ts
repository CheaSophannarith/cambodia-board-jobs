'use server';

import { revalidatePath } from 'next/cache'
import { createClient } from '@/utils/supabase/server'

export async function getDetailJob(jobId: number) {

    const supabase = await createClient()

    const { data: job, error } = await supabase
        .from('jobs')
        .select('*')
        .eq('id', jobId)
        .single()
    
    if (error) {
        console.error('Error fetching job details:', error)
        return null
    }

    return job;

}