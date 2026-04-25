import { createServerClient } from '@supabase/ssr'
import { NextRequest, NextResponse } from 'next/server'

const RESERVED = new Set(['auth', 'dashboard', 'terms', 'privacy', 'api', 'u', 'not-found'])

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const segments = pathname.split('/').filter(Boolean)

  // Handle short-link redirects: single-segment paths that are not reserved
  if (segments.length === 1 && !RESERVED.has(segments[0])) {
    const slug = segments[0]

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key',
      { cookies: { getAll: () => [], setAll: () => {} } }
    )

    const { data: link } = await supabase
      .from('links')
      .select('id, destination_url, clicks')
      .eq('slug', slug)
      .eq('is_active', true)
      .maybeSingle()

    if (link) {
      supabase.from('links').update({ clicks: (link.clicks ?? 0) + 1 }).eq('id', link.id)
      return NextResponse.redirect(link.destination_url)
    }

    const { data: qr } = await supabase
      .from('qr_codes')
      .select('id, destination_url, scans')
      .eq('slug', slug)
      .eq('is_active', true)
      .maybeSingle()

    if (qr) {
      supabase.from('qr_codes').update({ scans: (qr.scans ?? 0) + 1 }).eq('id', qr.id)
      return NextResponse.redirect(qr.destination_url)
    }

    return NextResponse.redirect(new URL('/?notfound=1', request.url))
  }

  // Session refresh for all other routes
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key',
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  await supabase.auth.getUser()

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
