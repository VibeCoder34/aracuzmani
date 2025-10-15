import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

/**
 * Auth Callback Route
 * Handles OAuth and Magic Link redirects from Supabase
 */
export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const next = requestUrl.searchParams.get('next') || '/profile'

  if (code) {
    const supabase = await createClient()
    
    // Exchange code for session
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (error) {
      console.error('Auth callback error:', error)
      // Redirect to login with error message
      return NextResponse.redirect(
        new URL(`/login?error=${encodeURIComponent('Doğrulama başarısız oldu. Lütfen tekrar deneyin.')}`, requestUrl.origin)
      )
    }
  }

  // Successful authentication - redirect to intended page
  return NextResponse.redirect(new URL(next, requestUrl.origin))
}

