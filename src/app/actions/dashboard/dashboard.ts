'use server';

import { createClient } from "@/utils/supabase/server";

export async function getStatistics(companyId: string) {

    if (!companyId || companyId === 'null' || companyId === 'undefined') {
        throw new Error('Invalid company ID provided');
    }

    const supabase = await createClient();

    // Fetch total jobs

    const { data: totalJobsData, count: totalJobs, error: totalJobsError } = await supabase
        .from('jobs')
        .select('id', { count: 'exact' })
        .eq('company_id', companyId);

    if (totalJobsError) {
        console.error('Error fetching total jobs:', totalJobsError);
        throw totalJobsError;
    }

    // Fetch active jobs

    const { data: activeJobsData, count: totalActiveJobs, error: activeJobsError } = await supabase
        .from('jobs')
        .select('id', { count: 'exact' })
        .eq('company_id', companyId)
        .eq('status', 'active');

    if (activeJobsError) {
        console.error('Error fetching active jobs:', activeJobsError);
        throw activeJobsError;
    }

    // Fetch total users

    const { data: totalUsersData, count: totalUsers, error: totalUsersError } = await supabase
        .from('company_members')
        .select('id', { count: 'exact' })
        .eq('company_id', companyId);

    if (totalUsersError) {
        console.error('Error fetching total users:', totalUsersError);
        throw totalUsersError;
    }

    // Fetch active users

    const { data: activeUsersData, count: totalActiveUsers, error: activeUsersError } = await supabase
        .from('company_members')
        .select('id', { count: 'exact' })
        .eq('company_id', companyId)
        .eq('is_active', true);

    if (activeUsersError) {
        console.error('Error fetching active users:', activeUsersError);
        throw activeUsersError;
    }

    console.log({ totalJobs, totalActiveJobs, totalUsers, totalActiveUsers });

    return {
        totalJobs: totalJobs || 0,
        totalActiveJobs: totalActiveJobs || 0,
        totalUsers: totalUsers || 0,
        totalActiveUsers: totalActiveUsers || 0,
    };
}

export async function getJobTypesDistribution(companyId: string) {

    if (!companyId || companyId === 'null' || companyId === 'undefined') {
        throw new Error('Invalid company ID provided');
    }

    const supabase = await createClient();

    // Fetch all jobs with their job types
    const { data, error } = await supabase
        .from('jobs')
        .select('job_type')
        .eq('company_id', companyId);

    if (error) {
        console.error('Error fetching job types distribution:', error);
        throw error;
    }

    // Count each job type
    const jobTypeCounts = {
        full_time: data?.filter(j => j.job_type === 'full_time').length || 0,
        part_time: data?.filter(j => j.job_type === 'part_time').length || 0,
        remote: data?.filter(j => j.job_type === 'remote').length || 0,
        hybrid: data?.filter(j => j.job_type === 'hybrid').length || 0,
    };

    const jobTypes = [
        { label: 'Full Time', count: jobTypeCounts.full_time },
        { label: 'Part Time', count: jobTypeCounts.part_time },
        { label: 'Remote', count: jobTypeCounts.remote },
        { label: 'Hybrid', count: jobTypeCounts.hybrid },
    ];

    return jobTypes;
}
