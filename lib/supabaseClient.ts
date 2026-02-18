import createClient from '@/lib/supabaseClient'

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export const signInWithGoogle = async () => {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
    }
  })

  if (error) {
    console.error('Login error:', error.message)
  }
}

