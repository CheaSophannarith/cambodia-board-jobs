'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'

// Action functions for authentication
export async function login(formData: FormData) {
  const supabase = await createClient()
  // type-casting here for convenience
  // in practice, you should validate your inputs
  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  const { data:user, error } = await supabase.auth.signInWithPassword(data)

  if (error) {
    return { success: false, message: 'Invalid login credentials!' }
  } else if (user.user?.user_metadata?.user_type != formData.get('userType')) {
    return { success: false, message: 'Your credential does not match our record' }
  }

  const profile = await supabase.from('profiles').select('*').eq('user_id', user.user?.id).single();

  if ((profile.error || !profile.data) && user.user?.user_metadata?.user_type === 'jobseeker') {
    return redirect('/profile-application');
  }

  if ((profile.error || !profile.data) && user.user?.user_metadata?.user_type === 'company') {
    return redirect('/company-application');
  }

  // Revalidate the layout to ensure fresh data on redirect
  revalidatePath('/', 'layout')

  // Redirect to home page - the AuthContext will handle state updates
  redirect('/')
}

// Action function for signing up a new user
export async function signup(formData: FormData) {
  
  const supabase = await createClient();

  // type-casting here for convenience
  // in practice, you should validate your inputs
  const firstName = formData.get('firstName') as string
  const lastName = formData.get('lastName') as string
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const userType = formData.get('userType') as string

  const name  = `${firstName} ${lastName}`;

  const { data ,error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/confirm`,
      data: {
        display_name: name,
        user_type: userType
      }
    }
  })

  console.log(data);


  if (error) {
    redirect('/error')
  }

  redirect('/confirm-email');
}

// Action function for logging out the current user
export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
  redirect('/login')
}