'use server';

import { createClient, createServiceClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

export async function editUser(userId: string, formData: FormData) {
    console.log('editUser called with userId:', userId);

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

    const fullName = formData.get('name') as string;
    const email = formData.get('email') as string;
    const location = formData.get('location') as string;
    const phone = formData.get('phone') as string;
    const avatarFile = formData.get('avatar') as File | null;

    // Use service client for admin operations
    const serviceClient = createServiceClient();

    // Fetch the current user's profile to get the old avatar URL
    const { data: currentProfile } = await serviceClient
        .from('profiles')
        .select('avatar_url')
        .eq('user_id', userId)
        .single();

    let avatarUrl: string | undefined = undefined;

    console.log('Current profile data:', currentProfile);

    // Handle avatar upload if a new file is provided
    if (avatarFile && avatarFile.size > 0) {
        // Delete the old avatar if it exists
        if (currentProfile?.avatar_url) {
            console.log('Deleting old avatar:', currentProfile.avatar_url);
            const { error: deleteError } = await supabase.storage
                .from('avatars')
                .remove([currentProfile.avatar_url]);

            if (deleteError) {
                console.error('Error deleting old avatar:', deleteError);
                // Continue with upload even if delete fails
            }
        }

        const fileExt = avatarFile.name.split('.').pop();
        const fileName = `${userId}/avatar.${fileExt}`;
        const filePath = `${fileName}`;

        // Upload the new avatar
        const { error: uploadError } = await supabase.storage
            .from('avatars')
            .upload(filePath, avatarFile, {
                upsert: true,
                contentType: avatarFile.type
            });

        if (uploadError) {
            console.error('Error uploading avatar:', uploadError);
            return { success: false, message: `Error uploading avatar: ${uploadError.message}` };
        }

        avatarUrl = filePath;
    }

    // Update email if changed
    if (email || fullName) {
        const { error: emailError } = await serviceClient.auth.admin.updateUserById(userId, {
            email,
            user_metadata: {
                display_name: fullName,
            },
        });

        if (emailError) {
            console.error('Error updating email:', emailError);
            return { success: false, message: `Error updating email: ${emailError.message}` };
        }
    }

    // Update profile data
    const updateData: any = {
        full_name: fullName,
        location,
        phone,
    };

    if (avatarUrl) {
        updateData.avatar_url = avatarUrl;
    }

    const { error: updateError } = await serviceClient
        .from('profiles')
        .update(updateData)
        .eq('user_id', userId);

    if (updateError) {
        console.error('Error updating profile:', updateError);
        return { success: false, message: `Error updating profile: ${updateError.message}` };
    }

    revalidatePath('/company-users');
    revalidatePath(`/company-users/user-detail/${userId}`);

    console.log('User updated successfully');
    return { success: true, message: 'User updated successfully.' };
}
