'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'

//create application

type ApplicationResult = {
    success: boolean;
    message: string;
    alreadyApplied?: boolean;
}

export async function createApplication(formData: FormData): Promise<ApplicationResult> {

    const supabase = await createClient();

    const coverLetter = formData.get('coverLetter') as string;
    const resumeFile = formData.get('resumeFile') as File;
    const jobIdString = formData.get('jobId') as string;
    const jobId = parseInt(jobIdString, 10);
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/login');
    }

    const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id, full_name')
        .eq('user_id', user.id)
        .single();

    if (profileError || !profile) {
        throw new Error('Profile not found. Please complete your profile before applying.');
    }

    // Use UUID from profile
    const jobseekerId = profile.id;

    // Check if user has already applied for this job
    const { data: existingApplication } = await supabase
        .from('applications')
        .select('id')
        .eq('job_id', jobId)
        .eq('job_seeker_id', jobseekerId)
        .single();

    if (existingApplication) {
        return {
            success: false,
            message: 'You have already applied for this job. Please check your applications page.',
            alreadyApplied: true
        };
    }

    // Upload resume file to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
        .from('resumes')
        .upload(`${user.id}/${resumeFile.name}`, resumeFile, {
            cacheControl: '3600',
            upsert: true
        });

    if (uploadError) {
        throw new Error('Failed to upload resume. Please try again.');
    }

    const resumeUrl = uploadData.path;

    // Insert application record into database
    const { data: applicationData, error: insertError } = await supabase
        .from('applications')
        .insert({
            job_id: jobId,
            job_seeker_id: jobseekerId,
            cover_letter: coverLetter,
            resume_url: resumeUrl,
            status: 'pending'
        })
        .select('id')
        .single();

    if (insertError || !applicationData) {
        console.error('Application insert error:', insertError);

        // Check if it's a duplicate application error
        if (insertError?.code === '23505') {
            return {
                success: false,
                message: 'You have already applied for this job. Please check your applications page.',
                alreadyApplied: true
            };
        }

        return {
            success: false,
            message: insertError?.message || 'Failed to submit application. Please try again.'
        };
    }

    const applicationId = applicationData.id;

    const { data: jobData, error: jobError } = await supabase
        .from('jobs')
        .select('company_id')
        .eq('id', jobId)
        .single();

    if (jobError || !jobData) {
        console.error('Job fetch error:', jobError);
        return {
            success: false,
            message: 'Failed to find job details. Please try again.'
        };
    }

    const { error: notificationError } = await supabase
        .from('notifications')
        .insert({
            company_id: jobData.company_id,
            title: 'New Job Application',
            type: 'application_received',
            message: `New application received from ${profile.full_name}`,
            is_read: false,
            related_job_id: jobId,
            related_application_id: applicationId
        });

    if (notificationError) {
        console.error('Notification insert error:', notificationError);
    }

    revalidatePath('/profile/applications');

    return {
        success: true,
        message: 'Application submitted successfully!'
    };
}
