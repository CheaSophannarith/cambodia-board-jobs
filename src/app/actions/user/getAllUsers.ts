'use server'

import { createClient, createServiceClient } from '@/utils/supabase/server'

export async function getAllUsers(companyId: number, fullNameFilter?: string) {
    console.log('getAllUsers called with companyId:', companyId, 'filter:', fullNameFilter);

    const supabase = await createClient();

    // Get the authenticated user
    const { data: { user } } = await supabase.auth.getUser();
    console.log('Auth user:', user?.id);

    if (!user) {
        console.log('No user authenticated');
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

    const { data: companyMember, error: memberError } = await supabase
    .from('company_members')
    .select('*')
    .eq('company_id', companyId)
    .eq('profile_id', profileData.id)
    .maybeSingle();

    if (memberError || !companyMember) {
        console.error('Error fetching company membership:', memberError)
        return { success: false, message: 'You are not a member of this company.' }
    }

    // Check if user has permission to view users (admin or recruiter)
    if (companyMember.role !== 'admin' && companyMember.role !== 'recruiter') {
        return { success: false, message: 'You do not have permission to view users. Contact your company admin.' }
    }

    // Fetch all company members with full_name from profiles, role and is_active from company_members
    let query = supabase
        .from('company_members')
        .select(`
            role,
            is_active,
            profiles!company_members_profile_id_fkey (
                user_id,
                full_name
            )
        `)
        .eq('company_id', companyId)
        .eq('role', 'recruiter'); // Only fetch recruiters

    // Apply full name filter if provided
    if (fullNameFilter && fullNameFilter.trim() !== '') {
        // Filter by full_name using ilike for case-insensitive search
        query = query.ilike('profiles.full_name', `%${fullNameFilter}%`);
    }

    const { data: usersData, error: usersError } = await query;

    if (usersError) {
        console.error('Error fetching users:', usersError)
        return { success: false, message: 'Error fetching users.' }
    }

    // Create admin client to fetch user emails
    const supabaseAdmin = createServiceClient();

    // Helper function to add timeout to promises
    const withTimeout = <T,>(promise: Promise<T>, timeoutMs: number): Promise<T> => {
        return Promise.race([
            promise,
            new Promise<T>((_, reject) =>
                setTimeout(() => reject(new Error('Request timeout')), timeoutMs)
            )
        ]);
    };

    // Get emails from auth.users for each profile with timeout
    try {
        const usersWithEmails = await Promise.all(
            usersData?.filter((member: any) => member.profiles !== null).map(async (member: any) => {
                const profile = member.profiles;

                try {
                    // Fetch user email from auth.users with 5 second timeout
                    const { data: authUser, error: authError } = await withTimeout(
                        supabaseAdmin.auth.admin.getUserById(profile.user_id),
                        5000
                    );

                    if (authError) {
                        console.error('Error fetching user email:', authError);
                    }

                    return {
                        id: profile.user_id,
                        fullName: profile.full_name,
                        email: authUser?.user?.email || 'N/A',
                        role: member.role,
                        isActive: member.is_active,
                    };
                } catch (error) {
                    console.error('Error fetching user details:', error);
                    // Return user data without email if fetching fails or times out
                    return {
                        id: profile.user_id,
                        fullName: profile.full_name,
                        email: 'Service temporarily unavailable',
                        role: member.role,
                        isActive: member.is_active,
                    };
                }
            }) || []
        );

        console.log('Fetched users:', usersWithEmails);

        return usersWithEmails || [];
    } catch (error) {
        console.error('Error fetching user emails:', error);
        // Return users without emails if admin API fails completely
        return usersData?.filter((member: any) => member.profiles !== null).map((member: any) => ({
            id: member.profiles.user_id,
            fullName: member.profiles.full_name,
            email: 'Service temporarily unavailable',
            role: member.role,
            isActive: member.is_active,
        })) || [];
    }
}