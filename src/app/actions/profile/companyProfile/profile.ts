'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/utils/supabase/server'

interface UpdateCompanyProfileData {
    companyName: string;
    companyWebsite: string;
    logo: File | null;
    description: string;
    industry: string;
    foundingYear: string;
    headquarters: string;
    companySize: string;
    linkedinUrl: string;
}

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

    const { data: profileData, error } = await supabase.from('profiles').upsert({
        user_id: user.id,
        location,
        role,
        full_name: fullName,
        phone,
        avatar_url: avatarUrl,
    }, {
        onConflict: 'user_id'
    })
    .select()
    .single();

    if (error || !profileData) {
        console.error('Error creating profile:', error);
        return { success: false, message: 'Error creating profile' };
    }

    // Create company (no profile_id - using company_members for relationships)
    const { data: companyData, error: companyError } = await supabase.from('companies').insert({
        company_name: companyName,
        logo_url: logoUrl,
        industry,
        linkedin_url: linkedinUrl,
        description,
        headquarters,
        founding_year: foundedYear ? parseInt(foundedYear) : null,
        company_size: companySize,
    })
    .select()
    .single();

    if (companyError || !companyData) {
        console.error('Error creating company:', companyError);
        return { success: false, message: 'Error creating company' };
    }

    // CRITICAL: Add the user as admin to company_members table
    // Without this, the user won't be able to create jobs or manage the company
    const { error: memberError } = await supabase.from('company_members').insert({
        company_id: companyData.id,
        profile_id: profileData.id,  // Use profile.id, not user.id (auth user id)
        role: 'admin',
        is_active: true,
    });

    if (memberError) {
        // This is critical - if we can't add to company_members, rollback company creation
        console.error('CRITICAL ERROR: Failed to add user to company_members:', memberError);

        // Delete the company we just created since the user can't be added as admin
        await supabase.from('companies').delete().eq('id', companyData.id);

        return {
            success: false,
            message: 'Failed to set up company membership. Please ensure the company_members table exists. Contact support if this persists.'
        };
    }

    console.log('✅ Successfully created company and added user as admin');

    revalidatePath('/');
    return { success: true };

}

export async function getCompanyProfile() {

    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return null;
    }

    const { data: profileData, error } = await supabase.from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

    if (error) {
        console.error('Error fetching profile:', error);
        return null;
    }

    const { data: memberData, error: memberError } = await supabase.from('company_members')
        .select('company_id, role')
        .eq('profile_id', profileData?.id)
        .eq('is_active', true)
        .maybeSingle();

    if (memberError) {
        console.error('Error fetching company membership:', memberError);
        return null;
    }

    if (memberData?.role === 'admin' && memberData?.company_id) {
        const { data: companyData, error: companyError } = await supabase.from('companies')
            .select('*')
            .eq('id', memberData.company_id)
            .maybeSingle();

        if (companyError) {
            console.error('Error fetching company data:', companyError);
            return null;
        }

        console.log(companyData);

        return companyData;
    }

    return null;

}

export async function getCompanyLogoUrl(logoPath: string) {
    'use server'

    if (!logoPath) {
        return null;
    }

    const supabase = await createClient();

    const { data } = supabase.storage
        .from('company-logos')
        .getPublicUrl(logoPath);

    // Add cache-busting timestamp to prevent browser caching
    const publicUrl = data?.publicUrl;
    if (publicUrl) {
        return `${publicUrl}?t=${Date.now()}`;
    }

    return null;
}

export default async function updateCompanyProfile(formData: UpdateCompanyProfileData) {

    const supabase = await createClient();

    const companyName = formData.companyName;
    const industry = formData.industry;
    const linkedinUrl = formData.linkedinUrl;
    const logoFile = formData.logo;
    const description = formData.description;
    const headquarters = formData.headquarters;
    const foundedYear = formData.foundingYear;
    const companySize = formData.companySize;
    const companyWebsite = formData.companyWebsite;

    console.log(companyWebsite);

    let logoUrl = null;

    if (logoFile && logoFile.size > 0) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            return { success: false, message: 'User not authenticated' };
        }
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

    const updateData: any = {
        company_name: companyName,
        industry,
        linkedin_url: linkedinUrl,
        description,
        headquarters,
        founding_year: foundedYear ? parseInt(foundedYear) : null,
        company_size: companySize,
        company_website: companyWebsite,
    };

    if (logoUrl) {
        updateData.logo_url = logoUrl;
    }

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { success: false, message: 'User not authenticated' };
    }

    // Get profile to find company membership
    const { data: profileData, error: profileError } = await supabase.from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

    if (profileError || !profileData) {
        console.error('Error fetching profile:', profileError);
        return { success: false, message: 'Error fetching profile' };
    }

    const { data: memberData, error: memberError } = await supabase.from('company_members')
        .select('company_id, role')
        .eq('profile_id', profileData.id)
        .eq('is_active', true)
        .maybeSingle();
    if (memberError || !memberData || memberData.role !== 'admin') {
        console.error('Error fetching company membership:', memberError);
        return { success: false, message: 'Error fetching company membership' };
    }

    const { data: companyData, error: companyError } = await supabase.from('companies')
        .update(updateData)
        .eq('id', memberData.company_id)
        .select()
        .single();

    if (companyError || !companyData) {
        console.error('Error updating company profile:', companyError);
        return { success: false, message: 'Error updating company profile' };
    }

    revalidatePath('/');
    return { success: true };

}