import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase-server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')

  if (!code) {
    return NextResponse.redirect('/dashboard/admin?error=google_auth_failed')
  }

  try {
    // Echanger le code contre un token
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        redirect_uri: process.env.GOOGLE_REDIRECT_URI!,
        grant_type: 'authorization_code',
      }),
    })

    const tokens = await tokenRes.json()

    if (!tokens.refresh_token) {
      return NextResponse.redirect('/dashboard/admin?error=no_refresh_token')
    }

    // Stocker le refresh_token dans Supabase
    const supabase = await createSupabaseServerClient()
    await supabase.from('settings').upsert({
      key: 'google_refresh_token',
      value: tokens.refresh_token,
    })

    return NextResponse.redirect('/dashboard/admin?success=google_connected')
  } catch (err) {
    console.error('Google OAuth error:', err)
    return NextResponse.redirect('/dashboard/admin?error=google_auth_failed')
  }
}
