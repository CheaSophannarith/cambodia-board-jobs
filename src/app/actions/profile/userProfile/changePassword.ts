'use server'

import { createClient, createServiceClient } from '@/utils/supabase/server'  

export async function changeUserPassword(formData: FormData) {

    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { success: false, message: 'User not authenticated' }
    }

    const currentPassword = formData.get('currentPassword') as string;
    const newPassword = formData.get('newPassword') as string;
    const confirmNewPassword = formData.get('confirmNewPassword') as string;

    if (newPassword !== confirmNewPassword) {
        return { success: false, message: 'New passwords do not match' }
    }

    // Re-authenticate user by signing in with current password
    const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email!,
        password: currentPassword
    });

    if (signInError) {
        return { success: false, message: 'Current password is incorrect' }
    }

    // Update to new password
    const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword
    });

    if (updateError) {
        return { success: false, message: 'Failed to update password' }
    }

    return { success: true, message: 'Password updated successfully' }
}