'use server';

import { createClient, createServiceClient } from '@/utils/supabase/server'

export async function getDetailUser(userId: string) {
    try {
        console.log('[getDetailUser] Starting fetch for userId:', userId);

        const supabase = await createClient();

        // First, get the current user's email from the auth session
        const { data: { user: authUser } } = await supabase.auth.getUser();

        if (!authUser) {
            console.error('[getDetailUser] No authenticated user found');
            throw new Error('Not authenticated');
        }

        const { data: userData, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('user_id', userId)
            .single();

        console.log('[getDetailUser] Profile query result - userData:', userData);
        console.log('[getDetailUser] Profile query result - error:', error);

        if (error) {
            console.error('[getDetailUser] Error fetching user details:', error);
            console.error('[getDetailUser] Error code:', error.code);
            console.error('[getDetailUser] Error message:', error.message);
            console.error('[getDetailUser] Error details:', error.details);

            // If no profile exists, return basic user info from auth
            if (error.code === 'PGRST116') {
                console.log('[getDetailUser] No profile found, returning auth user data');
                return {
                    user_id: authUser.id,
                    email: authUser.email,
                    full_name: authUser.user_metadata?.full_name || '',
                    phone: '',
                    location: '',
                    linkedin_url: ''
                };
            }

            throw error;
        }

        if (!userData) {
            console.error('[getDetailUser] No profile found for user:', userId);
            // Return basic user info from auth
            return {
                user_id: authUser.id,
                email: authUser.email,
                full_name: authUser.user_metadata?.full_name || '',
                phone: '',
                location: '',
                linkedin_url: ''
            };
        }

        // Try to use admin client for email, but fall back to auth user if it fails
        let userEmail = authUser.email;

        try {
            if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
                console.log('[getDetailUser] Creating service client for admin access');
                const supabaseAdmin = createServiceClient();

                const { data: userAuthData, error: authError } = await supabaseAdmin.auth.admin.getUserById(userId);

                console.log('[getDetailUser] Auth query result - userAuthData:', userAuthData);
                console.log('[getDetailUser] Auth query result - authError:', authError);

                if (!authError && userAuthData?.user?.email) {
                    userEmail = userAuthData.user.email;
                }
            } else {
                console.warn('[getDetailUser] SUPABASE_SERVICE_ROLE_KEY not set, using auth session email');
            }
        } catch (adminError) {
            console.warn('[getDetailUser] Admin client error, using auth session email:', adminError);
        }

        // Merge user data with email
        const mergedData = {
            ...userData,
            email: userEmail
        };

        console.log('[getDetailUser] Successfully merged user data:', mergedData);
        return mergedData;
    } catch (error) {
        console.error('[getDetailUser] Unexpected error:', error);
        throw error;
    }
}