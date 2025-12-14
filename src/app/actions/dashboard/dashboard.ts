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

/**
 * Job Posted Last 6 Months
 */

export async function getPostedJobsLastSixMonths(companyId: string) {

    if (!companyId || companyId === 'null' || companyId === 'undefined') {
        throw new Error('Invalid company ID provided');
    }

    const supabase = await createClient();

    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);
    sixMonthsAgo.setHours(0, 0, 0, 0);

    const { data, error } = await supabase
        .from('jobs')
        .select('created_at')
        .eq('company_id', companyId)
        .gte('created_at', sixMonthsAgo.toISOString());

    if (error) {
        console.error('Error fetching posted jobs for last six months:', error);
        throw error;
    }

    const monthlyCounts: { [key: string]: number } = {};

    for (let i = 0; i < 6; i++) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        const monthKey = date.toLocaleString('default', { year: 'numeric', month: 'long' });
        monthlyCounts[monthKey] = 0;
    }

    data?.forEach((job) => {
        const createdAt = new Date(job.created_at);
        const monthKey = createdAt.toLocaleString('default', { year: 'numeric', month: 'long' });
        if (monthlyCounts.hasOwnProperty(monthKey)) {
            monthlyCounts[monthKey]++;
        }
    });

    const result = Object.keys(monthlyCounts)
        .map((month) => ({ month, count: monthlyCounts[month] }))
        .sort((a, b) => {
            const dateA = new Date(a.month);
            const dateB = new Date(b.month);
            return dateA.getTime() - dateB.getTime();
        });

    return result;

}

/**
 * Get all count of each experience level from jobs table
 */
export async function getJobExperienceLevelsDistribution(companyId: string) {

    if (!companyId || companyId === 'null' || companyId === 'undefined') {
        throw new Error('Invalid company ID provided');
    }

    const supabase = await createClient();

    // Fetch all jobs with their job levels
    const { data, error } = await supabase
        .from('jobs')
        .select('experience_level')
        .eq('company_id', companyId);

    if (error) {
        console.error('Error fetching experience levels distribution:', error);
        throw error;
    }

    // Count each experience job level
    const jobExperienceLevelCounts = {
        entryLevel: data?.filter(j => j.experience_level === 'Entry Level').length || 0,
        midLevel: data?.filter(j => j.experience_level === 'Mid Level').length || 0,
        seniorLevel: data?.filter(j => j.experience_level === 'Senior Level').length || 0,
        lead: data?.filter(j => j.experience_level === 'Lead').length || 0,
        manager: data?.filter(j => j.experience_level === 'Manager').length || 0,
        director: data?.filter(j => j.experience_level === 'Director').length || 0,
        executive: data?.filter(j => j.experience_level === 'Executive').length || 0,
    };

    const experienceJobLevels = [
        { label: 'Entry Level', count: jobExperienceLevelCounts.entryLevel },
        { label: 'Mid Level', count: jobExperienceLevelCounts.midLevel },
        { label: 'Senior Level', count: jobExperienceLevelCounts.seniorLevel },
        { label: 'Lead', count: jobExperienceLevelCounts.lead },
        { label: 'Manager', count: jobExperienceLevelCounts.manager },
        { label: 'Director', count: jobExperienceLevelCounts.director },
        { label: 'Executive', count: jobExperienceLevelCounts.executive },
    ];
    
    return experienceJobLevels;

}

/**
 * Get remote or onsite job distribution
 */

export async function getIsRemoteJobDistribution(companyId: string){

    if (!companyId || companyId === 'null' || companyId === 'undefined') {
        throw new Error('Invalid company ID provided');
    }

    const supabase = await createClient();

    // Fetch all jobs with their locations
    const { data, error } = await supabase
        .from('jobs')
        .select('is_remote')
        .eq('company_id', companyId);

    if (error) {
        console.error('Error fetching job location distribution:', error);
        throw error;
    }

    // Count remote and onsite jobs
    const isRemoteCounts = {
        remote: data?.filter(j => j.is_remote === true).length || 0,
        onsite: data?.filter(j => j.is_remote === false).length || 0,
    };

    const isRemoteCountsData = [
        { label: 'Remote', count: isRemoteCounts.remote },
        { label: 'Onsite', count: isRemoteCounts.onsite },
    ];

    return isRemoteCountsData;
}

/**
 * Get Active, expired, draft and close 
 */

export async function getJobStatusDistribution(companyId: string) {

    if (!companyId || companyId === 'null' || companyId === 'undefined') {
        throw new Error('Invalid company ID provided');
    }

    const supabase = await createClient();

    // Fetch all jobs with their status
    const { data, error } = await supabase
        .from('jobs')
        .select('status')
        .eq('company_id', companyId);

    if (error) {
        console.error('Error fetching job status distribution:', error);
        throw error;
    }

    // Count each job status
    const jobStatusCounts = {
        active: data?.filter(j => j.status === 'active').length || 0,
        expired: data?.filter(j => j.status === 'expired').length || 0,
        draft: data?.filter(j => j.status === 'draft').length || 0,
        closed: data?.filter(j => j.status === 'closed').length || 0,
    };

    const jobStatuses = [
        { label: 'Active', count: jobStatusCounts.active },
        { label: 'Expired', count: jobStatusCounts.expired },
        { label: 'Draft', count: jobStatusCounts.draft },
        { label: 'Closed', count: jobStatusCounts.closed },
    ];

    console.log('Job Statuses:', jobStatuses);

    return jobStatuses;

}

/**
 * Get 5 latest jobs that were created
 */

export async function getLatestJobs(companyId: string) {

    if (!companyId || companyId === 'null' || companyId === 'undefined') {
        throw new Error('Invalid company ID provided');
    }

    const supabase = await createClient();

    const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .eq('company_id', companyId)
        .order('created_at', { ascending: false })
        .limit(5);

    if (error) {
        console.error('Error fetching latest jobs:', error);
        throw error;
    }

    return data || [];

}