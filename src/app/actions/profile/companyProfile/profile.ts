'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/utils/supabase/server'

export async function createCompanyProfile(formData: FormData) {
    const supabase = await createClient()

    const companyName = formData.get('companyName') as string;
    const fullName = formData.get('name') as string;
    const role = formData.get('role') as string;
    const location = formData.get('location') as string;
    const phone = formData.get('phone') as string;
    const avatarFile = formData.get('avatar') as File;
    const industry = formData.get('industry') as string;
    const linkedinUrl = formData.get('linkedinUrl') as string;
    const logoFile = formData.get('logo') as File;
    const description = formData.get('description') as string;
    const headquarters = formData.get('headquarters') as string;
    const foundedYear = formData.get('foundingYear') as string;
    const companySize = formData.get('companySize') as string;
    const isSuperAdmin = 1;

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

    let logoUrl = null;
    
    if (logoFile && logoFile.size > 0) {
        const fileExt = logoFile.name.split('.').pop();
        const fileName = `${user.id}/company-logo.${fileExt}`;
        const filePath = `${fileName}`;

        const { error: uploadError } = await supabase.storage
            .from('company-logos')
            .upload(filePath, logoFile, {
                upsert: true,
                contentType: logoFile.type
            });

        if (uploadError) {
            console.error('Error uploading company logo:', uploadError);
            return { success: false, message: `Error uploading company logo: ${uploadError.message}` };
        }
    
        logoUrl = filePath;
    }

    const { error } = await supabase.from('profiles').upsert({
        user_id: user.id,
        location,
        role,
        full_name: fullName,
        phone,
        avatar_url: avatarUrl,
        is_super_admin: isSuperAdmin,
    }, {
        onConflict: 'user_id'
    });

    if (error) {
        console.error('Error creating profile:', error);
        return { success: false, message: 'Error creating profile' };
    }

    const { error: companyError } = await supabase.from('companies').upsert({
        profile_id: user.id,
        company_name: companyName,
        logo_url: logoUrl,
        industry,
        linkedin_url: linkedinUrl,
        description,
        headquarters,
        founding_year: foundedYear ? parseInt(foundedYear) : null,
        company_size: companySize,
    });

    if (companyError) {
        console.error('Error creating company:', companyError);
        return { success: false, message: 'Error creating company' };
    }

    revalidatePath('/');
    return { success: true };

}