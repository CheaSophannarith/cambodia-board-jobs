'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'

//create application

export async function createApplication(formData: FormData) {

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
        throw new Error(insertError?.message || 'Failed to submit application. Please try again.');
    }

    const applicationId = applicationData.id;

    const companyId = await supabase
        .from('jobs')
        .select('company_id')
        .eq('id', jobId)
        .single()
        .then(({ data, error }) => {
            if (error || !data) {
                throw new Error('Job not found.');
            }
            return data.company_id;
        });

    const { error: notificationError } = await supabase
        .from('notifications')
        .insert({
            company_id: companyId,
            type: 'application_received',
            message: `New application received from ${profile.full_name}`,
            is_read: false,
            related_job_id: jobId,
            related_application_id: applicationId
        });

}
