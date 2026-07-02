import { createServerClient } from '@supabase/ssr'
import { NextRequest, NextResponse } from 'next/server'

function makeServiceClient() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key',
    { cookies: { getAll: () => [], setAll: () => {} } }
  )
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null)
  const id = body?.id
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })

  const service = makeServiceClient()
  const { data: link } = await service.from('bio_links').select('id, is_active').eq('id', id).maybeSingle()
  if (!link?.is_active) return NextResponse.json({ ok: true })

  const country = req.headers.get('cf-ipcountry') ?? req.headers.get('x-vercel-ip-country') ?? null
  const ua = req.headers.get('user-agent') ?? ''
  const deviceType = /ipad/i.test(ua) ? 'tablet' : /mobile|android|iphone|ipod/i.test(ua) ? 'mobile' : 'desktop'

  await Promise.all([
    service.from('clicks').insert({ resource_type: 'bio_link', resource_id: id, country, device_type: deviceType, user_agent: ua.slice(0, 300) }),
    service.rpc('increment_bio_link_clicks', { p_id: id }),
  ])

  return NextResponse.json({ ok: true })
}
