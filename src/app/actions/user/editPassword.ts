'use server';

import { createClient, createServiceClient } from '@/utils/supabase/server';

export async function editPassword(userId: string, newPassword: string) {

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

    const { data: company } = await supabase
        .from('company_members')
        .select('*')
        .eq('profile_id', profileData.id)
        .single();
    if (!company) {
        return { success: false, message: 'You are not a member of any company.' }
    }   

    if (company.role !== 'admin') {
        return { success: false, message: 'You do not have permission to edit users. Contact your company admin.' }
    }

    // Use service client for admin operations
    const serviceClient = createServiceClient();

    // Update user password
    const { error: updateError } = await serviceClient.auth.admin.updateUserById(userId, {
        password: newPassword,
    });

    if (updateError) {
        console.error('Error updating password:', updateError);
        return { success: false, message: 'Error updating password.' }
    }

    return { success: true, message: 'Password updated successfully' }

}