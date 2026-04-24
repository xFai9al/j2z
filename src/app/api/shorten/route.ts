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

  const rawSlug = (body.slug ?? body.customSlug ?? '').trim().replace(/[^a-zA-Z0-9-_]/g, '')
  const supabase = createClient()

  if (rawSlug) {
    const { data: existing } = await supabase
      .from('links')
      .select('id')
      .eq('slug', rawSlug)
      .maybeSingle()

    if (existing) {
      return NextResponse.json({ error: 'This alias is already taken' }, { status: 409 })
    }
  }

  const slug = rawSlug || generateSlug()

  const { data: sessionData } = await supabase.auth.getUser()
  const userId = sessionData?.user?.id ?? null

  const { data, error } = await supabase
    .from('links')
    .insert({ slug, destination_url: originalUrl, user_id: userId })
    .select()
    .single()

  if (error) {
    if (error.code === '23505') {
      return NextResponse.json({ error: 'Slug collision, please try again' }, { status: 409 })
    }
    return NextResponse.json({ error: 'Failed to create link' }, { status: 500 })
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

  return NextResponse.json({
    id: data.id,
    slug: data.slug,
    destination_url: data.destination_url,
    short_url: `${siteUrl}/${data.slug}`,
    clicks: data.clicks,
    created_at: data.created_at,
  })
}
