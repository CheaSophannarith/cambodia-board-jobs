'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation';

export async function deleteJob( formData: FormData) {

    const supabase = await createClient();

    // Get the authenticated user
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { success: false, message: 'User not authenticated' }
    }

    // First, get the profile for this user
    const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .single()

    if (profileError || !profileData) {
        console.error('Error fetching profile:', profileError)
        return { success: false, message: 'Profile not found. Please create your profile first.' }
    }

    // Get the company ID for the current user through company_members
    // Use profile.id (not user.id) because company_members.profile_id references profiles.id
    const { data: memberData, error: memberError } = await supabase
        .from('company_members')
        .select('company_id, role, is_active')
        .eq('profile_id', profileData.id)
        .eq('is_active', true)
        .single()
    if (memberError || !memberData) {
        console.error('Error fetching company membership:', memberError)
        return { success: false, message: 'You are not a member of any company. Please create a company profile first.' }
    }

    // Check if user has permission to delete jobs (admin or recruiter)
    if (memberData.role !== 'admin' && memberData.role !== 'recruiter') {
        return { success: false, message: 'You do not have permission to delete jobs. Contact your company admin.' }
    }

    const companyId = memberData.company_id;

    // Extract job ID from form data
    const jobId = formData.get('id') as string;

    // Delete the job if it belongs to the user's company
    const { error: deleteError } = await supabase
        .from('jobs')
        .delete()
        .eq('id', jobId)
        .eq('company_id', companyId);

    if (deleteError) {
        console.error('Error deleting job:', deleteError)
        return { success: false, message: 'Error deleting job. Please try again later.' }
    }

    // Revalidate the job list page to reflect the deletion
    revalidatePath('/job-list');

    // Redirect will throw, so no code after this will execute
    redirect('/job-list');
}
