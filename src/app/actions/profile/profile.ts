'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/utils/supabase/server'

export async function createProfile(formData: FormData) {
    const supabase = await createClient()

    const fullName = formData.get('name') as string;
    const role = formData.get('role') as string;
    const location = formData.get('location') as string;
    const phone = formData.get('phone') as string;
    const avatarFile = formData.get('avatar') as File;
    const bio = formData.get('bio') as string;
    const experienceLevel = formData.get('experience') as string;
    const linkedinUrl = formData.get('linkedinUrl') as string;

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { success: false, message: 'User not authenticated' };
    }

    let avatarUrl = null;

    if (avatarFile && avatarFile.size > 0) {
        const fileExt = avatarFile.name.split('.').pop();
        const fileName = `${user.id}/avatar.${fileExt}`;
        const filePath = `${fileName}`;

        // Upload with upsert to automatically replace existing file
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

    const { error } = await supabase.from('profiles').upsert({
        user_id: user.id,
        full_name: fullName,
        role,
        location,
        phone,
        avatar_url: avatarUrl,
        bio,
        experience_level: experienceLevel,
        linkedin_url: linkedinUrl,
    });

    if (error) {
        console.error('Error creating profile:', error);
        return { success: false, message: 'Error creating profile' };
    }

    revalidatePath('/');
    return { success: true };
}