import { createServerClient } from '@supabase/ssr'
import { NextRequest, NextResponse } from 'next/server'

const RESERVED = new Set([
  'auth', 'dashboard', 'admin', 'terms', 'privacy', 'api', 'u',
  'not-found', 'error', 'sitemap', 'robots', 'favicon', 'sw', 'manifest',
  '_next', 'static', 'images',
])

function parseDevice(ua: string): string {
  if (/ipad/i.test(ua)) return 'tablet'
  if (/mobile|android|iphone|ipod/i.test(ua)) return 'mobile'
  return 'desktop'
}

function makeServiceClient() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key',
    { cookies: { getAll: () => [], setAll: () => {} } }
  )
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const segments = pathname.split('/').filter(Boolean)

  // /u/[username] → permanent redirect to /[username]
  if (segments.length === 2 && segments[0] === 'u') {
    return NextResponse.redirect(new URL(`/${segments[1]}`, request.url), 301)
  }

  // Single-segment paths: resolve in order — bio page wins, then short links
  if (segments.length === 1 && !RESERVED.has(segments[0])) {
    const slug = segments[0]
    const sb = makeServiceClient()

    // 1. Bio page check — if found, let Next.js render [username]/page.tsx
    const { data: bio } = await sb
      .from('bio_pages')
      .select('id')
      .eq('username', slug)
      .eq('is_published', true)
      .maybeSingle()

    if (bio) {
      // Track bio page view fire-and-forget
      sb.rpc('track_click', {
        p_resource_type: 'bio',
        p_resource_id: bio.id,
        p_country: request.headers.get('cf-ipcountry') ?? request.headers.get('x-vercel-ip-country') ?? null,
        p_device_type: parseDevice(request.headers.get('user-agent') ?? ''),
        p_referrer: request.headers.get('referer')?.slice(0, 500) ?? null,
        p_user_agent: (request.headers.get('user-agent') ?? '').slice(0, 300),
      }).then(() => {})
      return NextResponse.next()
    }

    // 2. Short link check
    const ua = request.headers.get('user-agent') ?? ''
    const country =
      request.headers.get('cf-ipcountry') ??
      request.headers.get('x-vercel-ip-country') ??
      null
    const deviceType = parseDevice(ua)
    const referrer = request.headers.get('referer')?.slice(0, 500) ?? null
    const userAgent = ua.slice(0, 300)

    const { data: link } = await sb
      .from('links')
      .select('id, destination_url')
      .eq('slug', slug)
      .eq('is_active', true)
      .maybeSingle()

    if (link) {
      sb.rpc('track_click', {
        p_resource_type: 'link',
        p_resource_id: link.id,
        p_country: country,
        p_device_type: deviceType,
        p_referrer: referrer,
        p_user_agent: userAgent,
      }).then(({ error }) => {
        if (error) {
          sb.from('clicks').insert({
            resource_type: 'link',
            resource_id: link.id,
            country,
            device_type: deviceType,
            referrer,
            user_agent: userAgent,
          })
        }
      })
      return NextResponse.redirect(link.destination_url)
    }

    // 3. QR code check
    const { data: qr } = await sb
      .from('qr_codes')
      .select('id, destination_url')
      .eq('slug', slug)
      .eq('is_active', true)
      .maybeSingle()

    if (qr) {
      sb.rpc('track_click', {
        p_resource_type: 'qr',
        p_resource_id: qr.id,
        p_country: country,
        p_device_type: deviceType,
        p_referrer: referrer,
        p_user_agent: userAgent,
      }).then(({ error }) => {
        if (error) {
          sb.from('clicks').insert({
            resource_type: 'qr',
            resource_id: qr.id,
            country,
            device_type: deviceType,
            referrer,
            user_agent: userAgent,
          })
        }
      })
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
