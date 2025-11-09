'use server';

import { createClient, createServiceClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

export async function createUser(formData: FormData) {

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

    if (company.role !== 'admin'){
        return { success: false, message: 'You do not have permission to create users. Contact your company admin.' }
    }

    const fullName = formData.get('name') as string;
    const email = formData.get('email') as string;
    const location = formData.get('location') as string;
    const avatarFile = formData.get('avatar') as File;
    const password = formData.get('password') as string;
    const phone = formData.get('phone') as string;

    let avatarUrl = null;

    // Create a new user in Supabase Auth using service role client
    const serviceClient = createServiceClient();

    const { data: newUserData, error: newUserError } = await serviceClient.auth.admin.createUser({
        email,
        email_confirm: true,
        password: password,
        user_metadata: {
            display_name: fullName,
            user_type: 'company',
        },
    });

    if (newUserError || !newUserData.user) {
        console.error('Error creating new user:', newUserError);

        // Check if email already exists
        if (newUserError?.message?.includes('already been registered') ||
            newUserError?.message?.includes('already registered') ||
            newUserError?.message?.includes('User already registered')) {
            return { success: false, message: 'Email already exist' };
        }

        return { success: false, message: `Error creating new user: ${newUserError?.message || 'Unknown error'}` };
    }

    if (newUserData) {

        if (avatarFile && avatarFile.size > 0) {
            const fileExt = avatarFile.name.split('.').pop();
            const fileName = `${newUserData.user.id}/avatar.${fileExt}`;
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
    } 

    const newUserId = newUserData.user.id;

    // Create profile for the new user using service client
    const { data: newProfileData, error: newProfileError } = await serviceClient.from('profiles').insert({
        user_id: newUserId,
        location,
        full_name: fullName,
        avatar_url: avatarUrl,
        phone,
        role: 'company'
    }).select().single();

    if (newProfileError || !newProfileData) {
        console.error('Error creating profile for new user:', newProfileError);
        return { success: false, message: 'Error creating profile for new user.' };
    }

    // Add new user as a company member using service client
    const { data: newCompanyMemberData, error: newCompanyMemberError } = await serviceClient.from('company_members').insert({
        company_id: company.company_id,
        profile_id: newProfileData.id,
        role: 'recruiter',
        is_active: true
    }).select().single();

    if (newCompanyMemberError || !newCompanyMemberData) {
        return { success: false, message: 'Error adding new user as company member.' };
    }

    revalidatePath('/company-users');

    return { success: true, message: 'User created successfully.' };

}



