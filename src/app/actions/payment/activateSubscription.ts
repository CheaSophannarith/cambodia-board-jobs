'use server'

import { createClient } from '@/utils/supabase/server'
import { calculateEndDate } from '@/lib/bakong-client'
import { revalidatePath } from 'next/cache'

export async function activateSubscription(paymentId: number) {
  const supabase = await createClient()

  // Get payment details
  const { data: payment, error: paymentError } = await supabase
    .from('payments')
    .select('*')
    .eq('id', paymentId)
    .single()

  if (paymentError || !payment) {
    console.error('Payment not found:', paymentError)
    return { success: false, message: 'Payment not found' }
  }

  // Check if payment is completed
  if (payment.payment_status !== 'completed') {
    return { success: false, message: 'Payment not completed yet' }
  }

  // Check if subscription already created (idempotency)
  if (payment.subscription_id) {
    console.log('Subscription already activated for this payment')
    return { success: true, subscriptionId: payment.subscription_id, message: 'Already activated' }
  }

  // Deactivate old subscriptions for this company
  await supabase
    .from('subscriptions')
    .update({ is_active: false })
    .eq('company_id', payment.company_id)
    .eq('is_active', true)

  // Calculate end date based on plan type
  const endDate = calculateEndDate(payment.plan_type as 'weekly' | 'monthly' | 'yearly')

  // Create new subscription
  const { data: newSubscription, error: subscriptionError } = await supabase
    .from('subscriptions')
    .insert({
      company_id: payment.company_id,
      plan_type: payment.plan_type,
      start_date: new Date(),
      end_date: endDate,
      is_active: true,
      job_posts_limit: 9999, // Unlimited for paid plans
      job_posts_used: 0 // Reset counter
    })
    .select()
    .single()

  if (subscriptionError || !newSubscription) {
    console.error('Error creating subscription:', subscriptionError)
    return { success: false, message: 'Failed to create subscription' }
  }

  // Link payment to subscription
  await supabase
    .from('payments')
    .update({ subscription_id: newSubscription.id })
    .eq('id', paymentId)

  // Revalidate paths so user sees updated subscription
  revalidatePath('/subscription')
  revalidatePath('/create-job')

  return {
    success: true,
    subscriptionId: newSubscription.id,
    planType: newSubscription.plan_type,
    endDate: newSubscription.end_date,
    message: 'Subscription activated successfully'
  }
}
