import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

/**
 * Logout Route
 * Signs out the user and redirects to login page
 */
export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const supabase = await createClient()

  // Sign out
  await supabase.auth.signOut()

  // Redirect to login page
  return NextResponse.redirect(new URL('/login', requestUrl.origin))
}

export async function POST() {
  const supabase = await createClient()

  // Sign out
  await supabase.auth.signOut()

  // Return success response
  return NextResponse.json({ success: true })
}

