import { createServerClient } from '@supabase/ssr'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { RESERVED } from '@/lib/constants'

function parseDevice(ua: string): string {
  if (/ipad/i.test(ua)) return 'tablet'
  if (/mobile|android|iphone|ipod/i.test(ua)) return 'mobile'
  return 'desktop'
}

function makeServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error('Missing required Supabase server environment variables')
  return createSupabaseClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } })
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const segments = pathname.split('/').filter(Boolean)

  // /u/[username] → permanent redirect to /[username]
  if (segments.length === 2 && segments[0] === 'u') {
    return NextResponse.redirect(new URL(`/${segments[1]}`, request.url), 301)
  }

  // Single-segment paths: resolve bio / link / QR in PARALLEL for speed
  if (segments.length === 1 && !RESERVED.has(segments[0])) {
    const slug = segments[0]
    const sb = makeServiceClient()

    const ua      = request.headers.get('user-agent') ?? ''
    const country = request.headers.get('cf-ipcountry') ?? request.headers.get('x-vercel-ip-country') ?? null
    const deviceType = parseDevice(ua)
    const referrer   = request.headers.get('referer')?.slice(0, 500) ?? null
    const userAgent  = ua.slice(0, 300)

    // Run all 3 DB lookups in parallel instead of sequentially
    const [{ data: bio }, { data: link }, { data: qr }] = await Promise.all([
      sb.from('bio_pages').select('id').eq('username', slug).eq('is_published', true).maybeSingle(),
      sb.from('links').select('id, destination_url').eq('slug', slug).eq('is_active', true).maybeSingle(),
      sb.from('qr_codes').select('id, destination_url').eq('slug', slug).eq('is_active', true).maybeSingle(),
    ])

    // 1. Bio page wins — let Next.js render [username]/page.tsx
    if (bio) {
      sb.rpc('track_click', {
        p_resource_type: 'bio',
        p_resource_id: bio.id,
        p_country: country,
        p_device_type: deviceType,
        p_referrer: referrer,
        p_user_agent: userAgent,
      }).then(() => {})
      return NextResponse.next()
    }

    // 2. Short link redirect
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
          // .then() forces the PostgREST builder to actually execute
          sb.from('clicks').insert({
            resource_type: 'link',
            resource_id: link.id,
            country,
            device_type: deviceType,
            referrer,
            user_agent: userAgent,
          }).then(() => {})
        }
      })
      // 302 not 301: destinations are editable, browsers cache 301 forever
      const res = NextResponse.redirect(link.destination_url, 302)
      res.headers.set('Cache-Control', 'public, max-age=300, stale-while-revalidate=3600')
      return res
    }

    // 3. QR code redirect
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
          }).then(() => {})
        }
      })
      const res = NextResponse.redirect(qr.destination_url, 302)
      res.headers.set('Cache-Control', 'public, max-age=300, stale-while-revalidate=3600')
      return res
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
