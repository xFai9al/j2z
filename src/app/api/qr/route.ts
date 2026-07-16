import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { generateSlug, isValidUrl, ensureHttps } from '@/lib/utils'
import { isUrlBlocked } from '@/lib/blocklist'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null)
  if (!body?.url) {
    return NextResponse.json({ error: 'URL is required' }, { status: 400 })
  }

  const originalUrl = ensureHttps(body.url.trim())
  if (!isValidUrl(originalUrl)) {
    return NextResponse.json({ error: 'Invalid URL' }, { status: 400 })
  }

  const anonClient = await createClient()
  const { data: sessionData } = await anonClient.auth.getUser()
  if (!sessionData?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const service = createAdminClient()

  if (await isUrlBlocked(originalUrl, service)) {
    return NextResponse.json({ error: 'This URL is not allowed' }, { status: 403 })
  }

  // Retry once on slug collision (4-char slugs can collide)
  let result = await service
    .from('qr_codes')
    .insert({ slug: `qr-${generateSlug(4)}`, destination_url: originalUrl, user_id: sessionData.user.id })
    .select()
    .single()

  if (result.error?.code === '23505') {
    result = await service
      .from('qr_codes')
      .insert({ slug: `qr-${generateSlug(4)}`, destination_url: originalUrl, user_id: sessionData.user.id })
      .select()
      .single()
  }

  const { data, error } = result
  if (error || !data) {
    return NextResponse.json({ error: 'Failed to create QR code' }, { status: 500 })
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

  return NextResponse.json({
    id: data.id,
    slug: data.slug,
    destination_url: data.destination_url,
    short_url: `${siteUrl}/${data.slug}`,
    scans: data.scans,
    created_at: data.created_at,
  })
}
