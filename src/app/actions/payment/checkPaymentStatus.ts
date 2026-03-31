'use server'

import { createClient } from '@/utils/supabase/server'
import { checkBakongPaymentStatus } from '@/lib/bakong-client'
import { activateSubscription } from './activateSubscription'

export async function checkPaymentStatus(paymentId: number) {
  const supabase = await createClient()

  // Get payment record
  const { data: payment, error } = await supabase
    .from('payments')
    .select('payment_status, qr_expires_at, subscription_id, amount, currency, plan_type, transaction_reference, khqr_md5')
    .eq('id', paymentId)
    .single()

  if (error || !payment) {
    return { success: false, status: 'not_found' }
  }

  // Check with Bakong API if payment is still pending
  if (payment.payment_status === 'pending' && payment.khqr_md5) {
    try {
      const bakongStatus = await checkBakongPaymentStatus(payment.khqr_md5)

      if (bakongStatus.isPaid) {
        // Update payment to completed
        await supabase
          .from('payments')
          .update({ payment_status: 'completed' })
          .eq('id', paymentId)

        // Activate subscription
        const activationResult = await activateSubscription(paymentId)

        if (!activationResult.success) {
          console.error('Failed to activate subscription:', activationResult.message)
        }

        return {
          success: true,
          status: 'completed',
          subscriptionId: activationResult.subscriptionId,
          transactionReference: payment.transaction_reference,
          amount: payment.amount,
          currency: payment.currency,
          planType: payment.plan_type
        }
      }
    } catch (error) {
      console.error('Bakong API check failed:', error)
      // Continue with normal flow if API check fails
    }
  }

  // Check if QR code has expired
  if (payment.qr_expires_at) {
    const now = new Date()
    const expiryDate = new Date(payment.qr_expires_at)

    if (payment.payment_status === 'pending' && now > expiryDate) {
      // Update to expired
      await supabase
        .from('payments')
        .update({ payment_status: 'expired' })
        .eq('id', paymentId)

      return {
        success: true,
        status: 'expired',
        message: 'QR code has expired. Please try again.'
      }
    }
  }

  return {
    success: true,
    status: payment.payment_status,
    subscriptionId: payment.subscription_id,
    amount: payment.amount,
    currency: payment.currency,
    planType: payment.plan_type
  }
}
