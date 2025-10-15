import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

/**
 * GET /api/auth/user
 * Returns the current authenticated user and their profile
 */
export async function GET() {
  const supabase = await createClient()

  // Get current user
  const { data: { user }, error: userError } = await supabase.auth.getUser()

  if (userError || !user) {
    return NextResponse.json(
      { error: 'Kimlik doğrulaması gerekli' },
      { status: 401 }
    )
  }

  // Get user profile
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (profileError) {
    console.error('Profile fetch error:', profileError)
    // Return user without profile if profile doesn't exist
    return NextResponse.json({
      user,
      profile: null,
    })
  }

  return NextResponse.json({
    user,
    profile,
  })
}

