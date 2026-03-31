'use server'

import { createClient } from '@/utils/supabase/server'
import { generateKHQR, generateTransactionReference } from '@/lib/bakong-client'

interface InitiatePaymentParams {
  planType: 'weekly' | 'monthly' | 'yearly';
  amount: number;
  currency?: 'USD' | 'KHR';
}

export async function initiatePayment(params: InitiatePaymentParams) {
  const supabase = await createClient()

  // Get authenticated user and company
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, message: 'User not authenticated' }
  }

  // Get profile
  const { data: profileData, error: profileError } = await supabase
    .from('profiles')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (profileError || !profileData) {
    return { success: false, message: 'Profile not found' }
  }

  // Get company through company_members
  const { data: memberData, error: memberError } = await supabase
    .from('company_members')
    .select('company_id')
    .eq('profile_id', profileData.id)
    .eq('is_active', true)
    .single()

  if (memberError || !memberData) {
    return { success: false, message: 'Company not found' }
  }

  const companyId = memberData.company_id

  // Generate unique transaction reference
  const transactionRef = generateTransactionReference(companyId)

  // Generate KHQR QR code using Bakong
  const khqrResponse = await generateKHQR({
    amount: params.amount,
    currency: params.currency || 'USD',
    transactionReference: transactionRef
  })

  if (!khqrResponse.success) {
    return { success: false, message: 'Failed to generate QR code' }
  }

  // Create payment record
  const { data: payment, error: paymentError } = await supabase
    .from('payments')
    .insert({
      company_id: companyId,
      plan_type: params.planType,
      amount: params.amount,
      currency: params.currency || 'USD',
      payment_status: 'pending',
      payment_method: 'khqr',
      subscription_id: null, // Will be set after payment succeeds
      transaction_reference: transactionRef,
      qr_code_data: khqrResponse.qrCodeData,
      khqr_transaction_id: khqrResponse.transactionId,
      khqr_md5: khqrResponse.md5, // MD5 hash for payment verification
      qr_expires_at: khqrResponse.expiresAt,
      provider_name: 'BAKONG' // Bakong KHQR
    })
    .select()
    .single()

  if (paymentError || !payment) {
    console.error('Error creating payment:', paymentError)
    return { success: false, message: 'Failed to create payment record' }
  }

  return {
    success: true,
    paymentId: payment.id,
    qrCodeData: payment.qr_code_data,
    transactionReference: payment.transaction_reference,
    expiresAt: payment.qr_expires_at,
    amount: payment.amount,
    currency: payment.currency
  }
}
