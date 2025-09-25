import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const error = searchParams.get('error')
  const error_description = searchParams.get('error_description')
  const next = searchParams.get('next') ?? '/'

  console.log('Auth callback received:', { code: !!code, error, error_description })

  // Handle OAuth errors
  if (error) {
    console.error('OAuth error:', error, error_description)
    return NextResponse.redirect(`${origin}/?error=${encodeURIComponent(error_description || error)}`)
  }

  if (code) {
    try {
      const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          cookies: {
            get(name: string) {
              return request.cookies.get(name)?.value
            },
            set(name: string, value: string, options) {
              const response = NextResponse.next()
              response.cookies.set({
                name,
                value,
                ...options,
              })
            },
            remove(name: string, options) {
              const response = NextResponse.next()
              response.cookies.set({
                name,
                value: '',
                ...options,
              })
            },
          },
        }
      )

      const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)
      
      if (exchangeError) {
        console.error('Session exchange error:', exchangeError)
        return NextResponse.redirect(`${origin}/?error=${encodeURIComponent(exchangeError.message)}`)
      }

      console.log('Auth successful, redirecting to:', `${origin}${next}`)
      return NextResponse.redirect(`${origin}${next}`)
    } catch (err) {
      console.error('Callback processing error:', err)
      return NextResponse.redirect(`${origin}/?error=${encodeURIComponent('Authentication failed')}`)
    }
  }

  // No code provided
  console.error('No auth code provided')
  return NextResponse.redirect(`${origin}/?error=${encodeURIComponent('No authorization code received')}`)
}