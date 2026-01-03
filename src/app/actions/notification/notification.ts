'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/utils/supabase/server'

export async function getUnreadNotificationsCount(companyId: number) {
    const supabase = await createClient()

    // Calculate date 1 month ago
    const oneMonthAgo = new Date()
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1)

    const { count, error } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('company_id', companyId)
        .gte('created_at', oneMonthAgo.toISOString())

    if (error) {
        console.error('Error fetching notification count:', error)
        return 0
    }

    return count || 0
}

export async function getAllNotifications(companyId: number) {
    const supabase = await createClient()

    // Calculate date 1 month ago
    const oneMonthAgo = new Date()
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1)

    const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('company_id', companyId)
        .gte('created_at', oneMonthAgo.toISOString())
        .order('created_at', { ascending: false })

    if (error) {
        console.error('Error fetching notifications:', error)
        return []
    }

    return data || []
}

export async function markNotificationAsRead(notificationId: number) {
    const supabase = await createClient()

    const { error } = await supabase
        .from('notifications')
        .update({ is_read: true, read_at: new Date().toISOString() })
        .eq('id', notificationId)

    if (error) {
        console.error('Error marking notification as read:', error)
        return { success: false, error: error.message }
    }

    revalidatePath('/notifications')
    return { success: true }
}

export async function markAllNotificationsAsRead(companyId: number) {
    const supabase = await createClient()

    const { error } = await supabase
        .from('notifications')
        .update({ is_read: true, read_at: new Date().toISOString() })
        .eq('company_id', companyId)
        .eq('is_read', false)

    if (error) {
        console.error('Error marking all notifications as read:', error)
        return { success: false, error: error.message }
    }

    revalidatePath('/notifications')
    return { success: true }
}