'use server'

import { createClient, createServiceClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache';

export async function getUserProfile() {

    const supabase = await createClient();

    const { data } = await supabase.auth.getUser();

    const { data: userData, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', data.user?.id)
        .single();

        if (error) {
                console.error('Error fetching user details:', error);
                return null;
            }
        
            // Create admin client to fetch user emails
        const supabaseAdmin = createServiceClient();
        
        const { data: userAuthData, error: authError } = await supabaseAdmin.auth.admin.getUserById(data.user?.id!);
        
        
        if (authError) {
            console.error('Error fetching user auth data:', authError);
            return null;
        }
        
        // Merge all of userData and userAuthData.email
        if (userData && userAuthData?.user) {
            const mergedData = {
                ...userData,
                email: userAuthData.user.email
            };
            console.log('Merged user data:', mergedData);
            return mergedData;
        }
        
        return null;

}

export async function updateUserProfile(userId: string, formData: FormData) {

    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { success: false, message: 'User not authenticated' }
    }

    const fullName = formData.get('name') as string;
    const email = formData.get('email') as string;
    const location = formData.get('location') as string;
    const phone = formData.get('phone') as string;
    const avatarFile = formData.get('avatar') as File | null;
    const password = formData.get('password') as string;

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

    // Update email, full name, and/or password if changed
    if (email || fullName || password) {
        const updateData: any = {
            user_metadata: {
                display_name: fullName,
            },
        };

        // Only update email if it's provided and different
        if (email) {
            updateData.email = email;
        }

        // Only update password if it's provided
        if (password) {
            updateData.password = password;
        }

        const { error: emailError } = await serviceClient.auth.admin.updateUserById(userId, updateData);

        if (emailError) {
            console.error('Error updating user auth data:', emailError);
            return { success: false, message: `Error updating user auth data: ${emailError.message}` };
        }

        // If password was updated, we need to refresh the session
        if (password) {
            // Sign out and require re-login for security
            await supabase.auth.signOut();
            return {
                success: true,
                message: 'Password updated successfully. Please log in again with your new password.',
                requireLogin: true
            };
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
    
        revalidatePath('/user-profile');
    
        console.log('User updated successfully');
        return { success: true, message: 'User updated successfully.' };

}