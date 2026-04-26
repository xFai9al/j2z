import { createServerClient } from '@supabase/ssr'
import { NextRequest, NextResponse } from 'next/server'

const RESERVED = new Set(['auth', 'dashboard', 'terms', 'privacy', 'api', 'u', 'not-found'])

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

  // Handle short-link redirects: single-segment paths that are not reserved
  if (segments.length === 1 && !RESERVED.has(segments[0])) {
    const slug = segments[0]
    const sb = makeServiceClient()

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
      // Try track_click (handles INSERT + counter atomically); fallback to direct INSERT
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
