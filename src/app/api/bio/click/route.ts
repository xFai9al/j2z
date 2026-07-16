import { createAdminClient } from '@/lib/supabase/admin'
import { claimRateLimit } from '@/lib/rate-limit'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null)
  const id = body?.id
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })

  const service = createAdminClient()
  const allowed = await claimRateLimit(req, service, `bio_click:${id}`, 30, 60).catch(() => false)
  if (!allowed) return NextResponse.json({ ok: true })
  const { data: link } = await service
    .from('bio_links')
    .select('id, is_active, bio_pages!inner(is_published)')
    .eq('id', id)
    .eq('bio_pages.is_published', true)
    .maybeSingle()
  if (!link?.is_active) return NextResponse.json({ ok: true })

  const country = req.headers.get('cf-ipcountry') ?? req.headers.get('x-vercel-ip-country') ?? null
  const ua = req.headers.get('user-agent') ?? ''
  const deviceType = /ipad/i.test(ua) ? 'tablet' : /mobile|android|iphone|ipod/i.test(ua) ? 'mobile' : 'desktop'

  const [{ error: insertError }, { error: incrementError }] = await Promise.all([
    service.from('clicks').insert({ resource_type: 'bio_link', resource_id: id, country, device_type: deviceType, user_agent: ua.slice(0, 300) }),
    service.rpc('increment_bio_link_clicks', { p_id: id }),
  ])

  if (insertError || incrementError) {
    return NextResponse.json({ error: 'Tracking failed' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
