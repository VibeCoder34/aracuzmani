import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

/**
 * POST /api/auth/refresh
 * Refreshes the user's session
 */
export async function POST() {
  const supabase = await createClient()

  // Get current session
  const { data: { session }, error: sessionError } = await supabase.auth.getSession()

  if (sessionError || !session) {
    return NextResponse.json(
      { error: 'Oturum bulunamadı' },
      { status: 401 }
    )
  }

  // Refresh the session
  const { data, error } = await supabase.auth.refreshSession()

  if (error) {
    console.error('Session refresh error:', error)
    return NextResponse.json(
      { error: 'Oturum yenilenemedi' },
      { status: 500 }
    )
  }

  return NextResponse.json({
    session: data.session,
    user: data.user,
  })
}

