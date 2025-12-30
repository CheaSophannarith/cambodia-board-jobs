'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/utils/supabase/server'

export async function updateProfile(formData: FormData) {
    const supabase = await createClient();

    const fullName = formData.get('fullName') as string;
    const phone = formData.get('phone') as string;
    const location = formData.get('location') as string;
    const linkedinUrl = formData.get('linkedinUrl') as string;
    const avatar = formData.get('avatar') as File | null;

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        throw new Error('User not authenticated');
    }

    let avatarUrl: string | undefined;

    // Handle avatar upload if a new file was provided
    if (avatar && avatar.size > 0) {
        try {
            // Validate file type
            const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
            if (!validTypes.includes(avatar.type)) {
                throw new Error('Invalid file type. Only JPEG, PNG, and WebP are allowed.');
            }

            // Validate file size (5MB max)
            if (avatar.size > 5 * 1024 * 1024) {
                throw new Error('File size must be less than 5MB');
            }

            // Create unique filename
            const fileExt = avatar.name.split('.').pop();
            const fileName = `${user.id}-${Date.now()}.${fileExt}`;
            const filePath = `avatars/${fileName}`;

            // Upload to Supabase Storage
            const { error: uploadError } = await supabase.storage
                .from('profiles')
                .upload(filePath, avatar, {
                    cacheControl: '3600',
                    upsert: true
                });

            if (uploadError) {
                console.error('Avatar upload error:', uploadError);
                throw new Error('Failed to upload avatar. Please try again.');
            }

            // Get public URL
            const { data: { publicUrl } } = supabase.storage
                .from('profiles')
                .getPublicUrl(filePath);

            avatarUrl = publicUrl;
        } catch (error: any) {
            console.error('Avatar processing error:', error);
            throw new Error(error.message || 'Failed to process avatar');
        }
    }

    // Update profile data
    const updateData: any = {
        full_name: fullName,
        phone: phone,
        location: location,
        linkedin_url: linkedinUrl,
        updated_at: new Date().toISOString()
    };

    // Only include avatar_url if a new one was uploaded
    if (avatarUrl) {
        updateData.avatar_url = avatarUrl;
    }

    const { error } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('user_id', user.id);

    if (error) {
        console.error('Profile update error:', error);
        throw new Error(error.message || 'Failed to update profile. Please try again.');
    }

    revalidatePath('/profile');
    return { success: true };
}
