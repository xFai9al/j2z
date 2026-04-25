import { createClient } from '@/lib/supabase/server'
import { generateSlug, isValidUrl, ensureHttps } from '@/lib/utils'
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

  const supabase = createClient()
  const { data: sessionData } = await supabase.auth.getUser()
  if (!sessionData?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const slug = `qr-${generateSlug(4)}`

  const { data, error } = await supabase
    .from('qr_codes')
    .insert({ slug, destination_url: originalUrl, user_id: sessionData.user.id })
    .select()
    .single()

  if (error) {
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
