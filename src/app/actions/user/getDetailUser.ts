'use server';

import { createClient, createServiceClient } from '@/utils/supabase/server'

export async function getDetailUser(userId: string) {
    console.log('getDetailUser called with userId:', userId);

    const supabase = await createClient();

    const { data: userData, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

    console.log('userData:', userData);
    console.log('error:', error);

    if (error) {
        console.error('Error fetching user details:', error);
        return null;
    }

    // Create admin client to fetch user emails
    const supabaseAdmin = createServiceClient();

    const { data: userAuthData, error: authError } = await supabaseAdmin.auth.admin.getUserById(userId);

    console.log('userAuthData:', userAuthData);
    console.log('authError:', authError);

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

    console.log('No data to return, returning null');
    return null;

}